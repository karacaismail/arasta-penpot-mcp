# Penpot MCP server — "mcp-plus" fork (based on 2.18.0)

Patched copy of the Penpot MCP server (`mcp/packages/server`). The base is tag `2.18.0`
(commit `5baffdc2`), the same revision as the running `penpotapp/mcp:2.18` image. It adds
opt-in fixes for the measured bottlenecks.

**Every new behaviour is behind an environment variable. If no new variable is set, the server
behaves like upstream 2.18.0.** There are two small exceptions: an oversized request body now gets a
JSON-RPC 413 error instead of an HTML page, and an invalid `PENPOT_MCP_TOOL_TIMEOUT_S` now falls back
to 120 s. Before, an invalid value gave `NaN`, so every task timed out immediately.

Nothing has been deployed. The running compose stack was not touched.

## Layout

| Path | What |
|---|---|
| `mcp/packages/server/src/PlusConfig.ts` | new: reads and validates all `PENPOT_MCP_*` plus variables (defaults = upstream) |
| `mcp/packages/server/src/JobManager.ts` | new: background jobs + shared `runChunks()` used by `batch_execute` |
| `mcp/packages/server/src/tools/PlusTools.ts` | new: `submit_code`, `job_status`, `cancel_job`, `batch_execute`, `server_stats` |
| `mcp/packages/server/src/PluginBridge.ts` | per-user FIFO lanes, busy-is-alive, orphan tracking, connection policy, stats |
| `mcp/packages/server/src/PenpotMcpServer.ts` | body limit, session TTL/max, `/stats`, tool registration, session context for jobs |
| `mcp/packages/server/src/Tool.ts` | optional progress notifications |
| `mcp/packages/server/src/*.test.ts` | unit tests (`PlusConfig.test.ts` new, `PluginBridge.test.ts` extended) |
| `mcp/packages/server/scripts/plus-smoke-test.mjs` | end-to-end test: fake plugin (WebSocket) and a real MCP SDK client |
| `mcp/packages/server/scripts/plus-defaults-test.mjs` | checks that the defaults still behave like upstream |
| `Dockerfile.plus` | overlay image: `FROM penpotapp/mcp:2.18`, replaces only `/opt/penpot/mcp/index.js` |
| `docker-compose.mcp-plus.yaml` | sample compose override (not applied) |
| `mcp-plus.patch` | complete diff against 2.18.0 (`git apply` onto a 2.18.0 checkout) |

## What changed (file:line)

### 1. Request body limit: `PENPOT_MCP_MAX_BODY`
- `PenpotMcpServer.ts:590-591`: `express.json({ limit })`. The default `"100kb"` is body-parser's default, as upstream.
- `PenpotMcpServer.ts:602-621`: an oversized body returns HTTP 413 with a JSON-RPC error that names `PENPOT_MCP_MAX_BODY`. Before, it was an HTML `PayloadTooLargeError`.
- `ReplServer.ts:39-40`: the same limit applies to the dev-only REPL server.
- The frontend nginx allows 350 MiB (`client_max_body_size`), so it does not need changing.

### 2. Tool timeout and async job API
- `PlusConfig.ts`: `PENPOT_MCP_TOOL_TIMEOUT_S` is validated, so `NaN` can no longer cause immediate timeouts.
  `PenpotMcpServer.ts:193-197` exposes it as `toolTimeoutSecs`.
- Everywhere the timeout is used:
  - `PluginBridge.sendPluginTask` (`PluginBridge.ts:618`) accepts a per-call override. `executePluginTask(task, { timeoutSecs })` is at `:584`.
  - In Redis multi-instance mode, the requester's timeout is forwarded with the request (`:640-642`) and applied by the instance that holds the plugin (`:994-1001`).
  - The hard-coded 120 s of the dev tool `import_penpot_file` now follows the variable (`tools/ImportPenpotFileTool.ts:40-43`).
- New tools, registered only with `PENPOT_MCP_ENABLE_JOBS=true` (`PenpotMcpServer.ts:356-369`, `tools/PlusTools.ts`):
  - `submit_code { code | chunks[], stop_on_error?, timeout_s? }`: returns `{ jobId }` at once. The job runs detached from the HTTP request, in the submitting user's session context (`PenpotMcpServer.runWithSessionContext`, `:308`; `JobManager.submit`, `JobManager.ts:125`). Its budget is `timeout_s`, capped at `PENPOT_MCP_JOB_TIMEOUT_S`.
  - `job_status { job_id, wait_s? }`: returns state (`running|succeeded|failed|cancelled|timed_out`), elapsed time, current chunk, dispatch state (`queued|in_flight|orphaned`), and the result and log or the error. `wait_s` long-polls, up to `PENPOT_MCP_JOB_MAX_WAIT_S`.
  - `cancel_job { job_id }`: a chunk still in the queue is dropped before it reaches the plugin. A chunk already running in the tab cannot be interrupted (see limitations).
  - Jobs are owned per user token in multi-user mode, kept in memory, and kept `PENPOT_MCP_JOB_RETENTION_S` after they finish.
- Progress notifications: `Tool.ts:39-88`. With `PENPOT_MCP_PROGRESS_INTERVAL_S>0`, and if the client sent a `progressToken`, the server sends `notifications/progress` during long calls. This helps clients that reset their timeout on progress.

### 3. Heartbeat, busy-is-alive, per-user queue
- `assertPluginResponsive(state, now, thresholdMs, busy)` (`PluginBridge.ts:95`): if `busy`, the heartbeat-age check is skipped. A "frozen" report is still rejected.
- `PENPOT_MCP_HEARTBEAT_GRACE_S` replaces the fixed 30 s threshold (`PluginBridge.ts:187-190`).
- `PENPOT_MCP_TASK_QUEUE_MAX>0` turns on per-user FIFO lanes (`PluginBridge.ts:682-697`, `pumpLane` `:761`):
  - At most one task per user is in flight. Further tasks wait in the queue instead of being sent concurrently or rejected as "suspended". A full queue returns a clear error.
  - The task timeout covers queue wait plus execution. The error message says if the timeout fired while the task was still queued.
  - Lanes are keyed by user token, not by socket, so queued work survives a plugin reconnect or takeover.
- Orphans (`markOrphan`, `:805`): when a task times out or is cancelled while the plugin still runs it, the lane stays busy. It is released when the late response arrives (`:442-447`) or after `PENPOT_MCP_ORPHAN_TASK_GRACE_S`. The next task therefore waits for the tab to become free, instead of landing on a blocked tab and failing with "no heartbeat".
- `PENPOT_MCP_BUSY_IS_ALIVE` defaults to on when queueing is enabled, and off otherwise (upstream behaviour).

### 4. Duplicate plugin connection: `PENPOT_MCP_CONNECTION_POLICY`
`PluginBridge.ts:241-261`, `shouldTakeOver` `:322`, `takeOver` `:352`.
- `reject` (default): upstream behaviour. The new connection is closed with 1008.
- `takeover`: the newest connection always wins. The old socket is closed with 1008 "Superseded by a newer connection…". Tasks in flight on the old tab fail immediately instead of waiting for the timeout. The queue carries over to the new tab. The Redis subscription is kept, because it resolves the connection by token at dispatch time.
- `takeover-stale` (**recommended**): take over only if the existing connection is unhealthy (socket not open, frozen, or heartbeat older than the grace period while not busy). Otherwise reject. This avoids ping-pong between two healthy tabs (see limitations).

### 5. Session leak: `PENPOT_MCP_SESSION_TTL_S`, `PENPOT_MCP_SESSION_SWEEP_S`, `PENPOT_MCP_MAX_SESSIONS`
- `startSessionTimeoutChecker` (`PenpotMcpServer.ts:400`): the TTL and sweep interval are configurable. Upstream is fixed at 60 min TTL with a sweep every 30 min. When a TTL is set, the sweep runs every `clamp(TTL/2, 5, 60)` s.
- Sessions with a running (non-GET) request are never expired. The counter is at `:534-541` and resets `lastActiveTime` when the request ends.
- `enforceMaxSessions` (`:441`): with `PENPOT_MCP_MAX_SESSIONS>0`, the least recently active idle sessions are evicted when a new session is initialized.
- Note: upstream "adopts" unknown `mcp-session-id`s (built for multi-instance setups). A live client whose session expired just re-opens its GET stream and gets a fresh session. Only abandoned sessions actually disappear, which is the intended effect.

### 6. `server_stats` tool and `GET /stats`: `PENPOT_MCP_ENABLE_STATS`
- `PenpotMcpServer.getStats` (`:317`), `PluginBridge.getStats` (`:894`), `JobManager.getStats`.
- Contents:
  - effective config, uptime, and session counts (streamable, SSE, active requests)
  - per plugin connection: id, token fingerprint, heartbeat age, frozen, busy, healthy, owns token
  - per-user lanes: queue length, in-flight tasks with run time and orphan flag, queued tasks with wait time
  - takeover and rejected-duplicate counters
  - the last 20 tasks (queued ms, run ms, outcome), average and max run time
  - running jobs
- Tokens only appear as 8-character fingerprints.
- The `server_stats` tool in multi-user mode shows only the caller's own connection, lanes and jobs.
- `GET /stats` has no authentication. Port 4401 is only reachable inside the compose network, and nginx proxies only `/mcp/stream|sse|ws`.

### 7. `batch_execute { chunks[], stop_on_error? }`: `PENPOT_MCP_ENABLE_BATCH`
Runs the chunks one after another in one round trip (`tools/PlusTools.ts:219`, `runChunks` `JobManager.ts:53`). It returns per-chunk `{ ok, durationMs, result, log | error }` plus `totalMs`. `storage` persists across chunks. Each chunk is limited by the tool timeout. For long batches, use `submit_code { chunks }`.

## Environment variables

| Variable | Default (= upstream) | Meaning |
|---|---|---|
| `PENPOT_MCP_MAX_BODY` | `100kb` | JSON body limit, e.g. `5mb` |
| `PENPOT_MCP_TOOL_TIMEOUT_S` | `120` | plugin task timeout for synchronous tools (now validated) |
| `PENPOT_MCP_HEARTBEAT_GRACE_S` | `30` | heartbeat age after which a tab counts as suspended |
| `PENPOT_MCP_TASK_QUEUE_MAX` | `0` (off) | max waiting tasks per user; `>0` turns on the FIFO lanes |
| `PENPOT_MCP_BUSY_IS_ALIVE` | on if queue is on, else off | a tab with a task in flight counts as alive |
| `PENPOT_MCP_ORPHAN_TASK_GRACE_S` | `600` | how long a timed-out or cancelled task keeps its lane busy |
| `PENPOT_MCP_CONNECTION_POLICY` | `reject` | `reject` \| `takeover` \| `takeover-stale` |
| `PENPOT_MCP_SESSION_TTL_S` | `3600` | idle MCP session TTL |
| `PENPOT_MCP_SESSION_SWEEP_S` | `1800`, or `clamp(TTL/2,5,60)` if TTL is set | sweep interval |
| `PENPOT_MCP_MAX_SESSIONS` | `0` (unlimited) | cap on streamable sessions (evicts least recently used idle ones) |
| `PENPOT_MCP_ENABLE_JOBS` | `false` | register `submit_code`, `job_status`, `cancel_job` |
| `PENPOT_MCP_JOB_TIMEOUT_S` | `1800` | default and maximum job budget |
| `PENPOT_MCP_JOB_RETENTION_S` | `3600` | how long finished jobs are kept |
| `PENPOT_MCP_JOB_MAX_ACTIVE` | `20` | max unfinished jobs per user |
| `PENPOT_MCP_JOB_MAX_WAIT_S` | `50` | max `job_status.wait_s` |
| `PENPOT_MCP_ENABLE_BATCH` | `false` | register `batch_execute` |
| `PENPOT_MCP_BATCH_MAX_CHUNKS` | `100` | max chunks per batch or job |
| `PENPOT_MCP_ENABLE_STATS` | `false` | register `server_stats` and serve `GET /stats` |
| `PENPOT_MCP_PROGRESS_INTERVAL_S` | `0` (off) | progress notification interval during long tool calls |

The effective configuration is logged at startup (`[mcp-plus] configuration: {...}`).

## Build and test (what was run)

```sh
cd mcp
nice -n 19 npx -y pnpm@12.5.1 -r --filter '!mcp-plugin' install
cd packages/common && nice -n 19 npx tsc --build
cd ../server
nice -n 19 npx tsc --noEmit                        # OK, no errors
nice -n 19 npx tsx --test src/*.test.ts            # 36/36 pass (upstream + new)
nice -n 19 npx -y pnpm@12.5.1 run build            # esbuild -> dist/index.js (+ data, static)
nice -n 19 node scripts/plus-smoke-test.mjs        # 15/15 checks, ports 4501/4502, server stopped
nice -n 19 node scripts/plus-defaults-test.mjs     # defaults == upstream (4 tools, 100kb limit, reject dup, no /stats)
```

The smoke test starts `dist/index.js --multi-user` on 127.0.0.1:4501 (HTTP) and 4502 (plugin WebSocket), with a fake plugin and an `@modelcontextprotocol/sdk` client. It checks:
- `tools/list` includes all new tools
- a 300 KB `execute_code` body passes, and a 6 MB body gets a JSON 413
- 3 concurrent calls are serialized (plugin sees concurrency 1)
- a call made while the plugin is blocked with no heartbeats beyond the grace period is queued, not rejected as "suspended"
- `submit_code` + `job_status(wait_s)` return the result
- a 6 s job succeeds with a 4 s tool timeout
- a chunked job stops on error
- `cancel_job` drops a queued task
- a timed-out task becomes an orphan and the next call waits for its late response
- `batch_execute` works
- `server_stats` works and leaks no token
- `takeover` routes to the newest tab and closes the old one with 1008
- an abandoned session expires with a 10 s TTL

Docker image (built, not deployed):

```sh
export DOCKER_CONFIG=~/penpot/.dockercfg DOCKER_HOST=unix:///Users/w6x/.colima/factory/docker.sock
nice -n 19 docker build -f Dockerfile.plus -t penpot-mcp-plus:2.18-dev mcp/packages/server/dist
```

A sanity run was done with `--network none` (no host ports, own container, removed afterwards). The new tools registered and `/stats` answered inside the container.

## Swapping into docker-compose (later)

Do this only when no production job is using the MCP server. The swap restarts only the
`penpot-mcp` container. Plugin tabs reconnect on their own (backoff up to 30 s). MCP client sessions
are re-adopted by the server, but in-flight calls and in-memory jobs are lost.

1. Make sure the image exists: `docker image ls penpot-mcp-plus`.
2. Choose one of:
   - **Override file (preferred, easy rollback).** Copy `docker-compose.mcp-plus.yaml` next to
     `~/penpot/docker-compose.yaml` and adjust the variables if needed. Then:
     ```sh
     cd ~/penpot
     docker compose -p penpot -f docker-compose.yaml -f docker-compose.mcp-plus.yaml up -d --no-deps penpot-mcp
     ```
   - **Edit in place.** In `~/penpot/docker-compose.yaml`, service `penpot-mcp`, set
     `image: "penpot-mcp-plus:2.18-dev"` and add an `environment:` block with the variables from the
     override file. Then run `docker compose -p penpot up -d --no-deps penpot-mcp`.
3. Verify:
   - `docker logs penpot-penpot-mcp-1 | grep mcp-plus` shows the configuration line.
   - `docker exec penpot-penpot-mcp-1 node -e "fetch('http://127.0.0.1:4401/stats').then(r=>r.text()).then(console.log)"`
   - From an MCP client: `tools/list` contains `submit_code` and the other new tools.
4. The frontend nginx resolves `penpot-mcp` by DNS for each request (`set $var` + `proxy_pass`), so it does not need a restart.

Recommended values (already in the override file):
- `TOOL_TIMEOUT_S=280`: stays below nginx `proxy_read_timeout 300s`. Use jobs for anything longer.
- `HEARTBEAT_GRACE_S=90`, `TASK_QUEUE_MAX=16`, `CONNECTION_POLICY=takeover-stale`
- `SESSION_TTL_S=900`, `MAX_SESSIONS=100`
- jobs, batch and stats enabled, `PROGRESS_INTERVAL_S=15`

## Rollback

- Override-file variant: `cd ~/penpot && docker compose -p penpot -f docker-compose.yaml up -d --no-deps penpot-mcp`. The service falls back to `penpotapp/mcp:2.18` without the extra environment.
- Edit-in-place variant: restore `image: "penpotapp/mcp:${PENPOT_VERSION:-2.18}"`, remove the `environment:` block, then run the same `up -d --no-deps penpot-mcp`.
- Soft rollback without changing the image: unset all `PENPOT_MCP_*` plus variables. The defaults equal upstream behaviour.
- Remove the image: `docker image rm penpot-mcp-plus:2.18-dev`.

## Limitations: what cannot be fixed server-side

- **Code already running in the tab cannot be interrupted.** The plugin protocol has no cancel message, and the plugin runs tasks on the page's main thread. Timeouts and `cancel_job` only release the server side. The orphan mechanism keeps the lane busy until the tab really finishes, which is the best the server can do. Real cancellation needs plugin changes (a cancel message and cooperative checks in `ExecuteCodeTaskHandler`).
- **Heartbeats stop while the plugin executes synchronous code.** This is inherent to the main-thread plugin. The server only tolerates it (busy-is-alive, grace period). A plugin-side fix would yield during long work or send heartbeats from a Worker.
- **The plugin runs concurrent tasks concurrently.** Serialization exists only server-side, via the queue.
- **Takeover ping-pong.** The plugin UI (`plugin/src/main.ts`, `scheduleReconnect`) reconnects after any close, whatever the close code. With `takeover`, two live tabs of the same user keep displacing each other. `takeover-stale` avoids this. A plugin fix would stop reconnecting on close reason "Superseded".
- **nginx in the frontend image** has `proxy_read_timeout 300s`. This caps synchronous tool calls, and a plugin WebSocket silent for more than 300 s is cut. Changing it is a frontend or nginx change (for example an override conf in `/etc/nginx/overrides/http.d/`). The jobs API avoids the HTTP limit.
- **Plugin response size cap.** In integrated remote mode the plugin caps responses at 15 MB (`MAX_TASK_RESPONSE_SIZE_REMOTE_MCP`, plugin side).
- **MCP client timeouts** (SDK default 60 s, client-specific settings) are client-side. Progress notifications help only if the client resets its timeout on progress. Otherwise use `submit_code` + `job_status(wait_s ≤ 50)`.
- **Jobs are in memory and per instance.** They are lost on restart. With Redis multi-instance setups, `job_status` must reach the instance that accepted `submit_code`. The current deployment is single-instance without Redis.
