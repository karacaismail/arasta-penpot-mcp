# pp: Penpot MCP client toolkit (mcp-plus/client)

`pp` is a client for driving Penpot through its MCP server. It is meant to replace the scripts in
`~/penpot/mcp-client` (`call.mjs`, `v2/boot.sh`, `v2/run.sh`, `v2/build-all.sh`, `wait-alive.sh`).
**Nothing has been switched over yet.** The production job still runs the old scripts, and this
directory does not touch `~/penpot/mcp-client`: it only reads module files from there when you point
it at them.

Safety by default:
* No `.mcp-url` ships in this directory, so `pp` cannot reach the live server until you adopt it
  (see "Adopting it later").
* `PP_ALLOW_PORTS=4601-4603` (set by `npm test`) makes the client refuse any other port.

Requirements: Node 24, ESM, `@modelcontextprotocol/sdk` v1 (1.30.1), `yaml`, `zod` (zod is used by the mock only).

```
npm install        # already done
npm test           # 36 tests against the in-process mock on ports 4601-4603
npm run test:e2e   # 7 tests: REAL fork server (built dist) + fake plugin on ports 4501-4503, enhanced + --no-enhanced
```

---

## Architecture

```
            CLI (pp.mjs)  ──(no daemon)──►  PPClient ──► MCP session ──► penpot-mcp ──► plugin (single-threaded)
                 │                              ▲
                 └──(daemon running)──► DaemonProxy ──HTTP over unix socket / 127.0.0.1──► daemon ─┘
                                                                           (one PPClient, one session)

 lib/util.mjs      error classification, backoff, stats (p50/p95), atomic writes, mutex, port guard
 lib/snippets.mjs  code that runs INSIDE the plugin: task wrapper, probe, module check, BOOT guard
 lib/client.mjs    PPClient: session lifecycle, smart waiting, result recovery, capability detection
 lib/modules.mjs   module loader: export parsing, content hash, chunking/staging, hash-skip
 lib/runner.mjs    manifest → tasks, retries, auto-reboot, checkpoint/resume, JSONL + summary
 lib/daemon.mjs    control API server + proxy
 test/mock-server.mjs   mock Penpot MCP server (also usable standalone)
 bin/*.sh          drop-in wrappers with the same arguments as the old scripts
 examples/arasta-v2.yaml   manifest equivalent of v2/build-all.sh
```

### Plugin-side state (`storage.__pp`)

| key | purpose |
|---|---|
| `mods[name] = {hash, exports}` | hash-skip; the BOOT guard compares hashes, so a stale or missing module triggers `BOOT_REQUIRED` |
| `stage[name] = {hash, parts[]}` | chunked module staging (removed after linking) |
| `running = {id,label,t0}` | set by the task wrapper and cleared in `finally`. This is the "possibly running" marker the probe reads |
| `last`, `results[execId]` | last finished task and the last 30 results (up to 50 KB each), so a result can be **recovered** after a timeout or a client crash instead of running the task again |

If the plugin reconnects, all of this is lost along with the globals. The next guard then throws
`BOOT_REQUIRED`, and the loader sees missing hashes and reloads everything.

### 1. Persistent session and daemon
* `PPClient` keeps one MCP session and calls `terminateSession()` on `close()`. On "session not found"
  or a connection reset (for example after a server restart) it reconnects once and terminates the
  old session.
* `pp daemon start [--detach]` holds a single session and serves a local HTTP API on
  `state/pp.sock` (or `--control-port N`). Every other `pp` command routes through the daemon
  automatically when one is running (`--no-daemon` turns that off). All plugin-bound requests go
  through a mutex, so two tasks are never in the plugin at the same time.
* One-shot mode (no daemon) still closes its session on every call. Tests check that
  created == terminated, so sessions no longer leak.
* Every call is logged to `state/pp-log.jsonl` with: session, tool, label, ms, bytes, error kind and
  the first 1.5 KB of output. `pp stats` / `GET /status` return counters: calls by tool and by kind,
  probes, waits, waited ms, recovered results and bytes sent.

### 2. Module loader (`pp boot`)
* Exports use the same convention as `boot.sh`: top-level `function|async function|const|let|var|class`
  names, minus `__private`. A `// @pp-exports a,b` comment overrides this.
* Hash = sha256(loader version + exports + source). One *check* call returns which modules are
  already loaded with the right hash **and** have all their exports present as globals. Those modules
  are skipped. Cascade is on by default: every module after the first changed one is reloaded too,
  because later modules may capture values at load time. `--no-cascade` and `--force` change this.
* If a module fits in 90 KB (JSON-escaped, envelope included) it is sent in one call. A larger module
  is sent as `stage` calls that append pieces to `storage.__pp.stage` (sizes account for double JSON
  escaping). A final `link` call then evaluates the joined source through `new Function`, the same
  mechanism the plugin's `execute_code` uses. A lost stage raises `STAGE_INCOMPLETE` and staging restarts.
* **Data modules** (`{file, kind: data, key}`, or `--data PH=js/icons.js`) load a JSON object, or the
  `{…}` literal inside a `.js` file, into `storage[key]`. Oversized sub-trees are split.
  Example: the 117 KB `icons.js` loads in 2 calls.
* The client **refuses** to send any request over 100 KB (the server's body-parser limit) and
  returns `payload_too_large` locally.

Dry run against the mock with the real `v2/*.js` and `js/icons.js`: a cold boot is 11 calls with a
66 KB maximum body; a warm boot is **1 call**.

### 3. Smart waiting
Error kinds come from `classify()`: `timeout` ("Task … timed out after 120 seconds"), `client_timeout`,
`suspended` ("…no heartbeat for Ns…"), `boot_required`, `payload_too_large`, `disconnected`,
`transport` and `error`. The server reports plugin failures as *successful* tool results that start
with "Tool execution failed:", so classification reads the text as well as `isError`.

* After `timeout` or `client_timeout`, the client marks the task **possibly running** (the plugin keeps
  executing it) and waits for the plugin to become idle:
  * It sends a cheap probe (`storage.__pp.running`; it never touches the document) with exponential
    backoff plus jitter (3 s, 6 s, 12 s … capped at 60 s, 20 min maximum).
  * `suspended`, timed-out and transport probe errors count as "still busy", so the false positives
    while the plugin works are simply waited out.
  * Idle means the probe answers **and** `running` is null (a `running` marker older than 1 h counts
    as stale). A 2 s grace window follows.
  * The client then reads `results[execId]`. If the task finished, its result is returned as
    `recovered: true` and the task is not run again.
* No new heavy task is sent while `possiblyRunning` is set. A `suspended` reply also sets it.
  In one-shot CLI mode the flag is saved to `state/client-state.json`, so the next process waits too.
* On servers with `submit_code`/`job_status`, heavy tasks go through jobs and are not subject to the
  120 s tool timeout (see 5).

### 4. Job runner (`pp job manifest.yaml`)
Manifest (YAML or JSON), see `examples/arasta-v2.yaml`:

```yaml
name: arasta-v2
baseDir: /Users/w6x/penpot/mcp-client
modules: [v2/core.js, …, { file: js/icons.js, kind: data, key: PH }]
require: { globals: [RUN, ARRANGE], storage: [PH] }   # plus module hashes -> BOOT guard
pagesFile: v2/pages.txt            # or pages: [{page, key, batches?, title?, after?: false}]
batches: "P320,P360 P390,P430 …"
templates:                         # {{var}} = JSON literal, {{raw:var}} = raw text
  batch: "return await RUN({{page}}, {{key}}, {{ids}});"
  after: "return await ARRANGE({{page}}, {{title}});"
policy: { retries: 2, reboots: 3, retryBackoffMs: 5000, failPattern: "\\bERR\\b", settleMs: { after: 15000 }, continueOnFailure: true }
checkpoint: ../state/arasta-v2.checkpoint.json
report: ../state/arasta-v2.report.jsonl
```

* Tasks run one at a time and have stable ids (`home:P320,P360`, `home:after`). Before a run the
  loader boots the modules (a hash-skip, so usually 1 call). Each task body starts with the BOOT guard.
* `BOOT_REQUIRED` triggers a module reboot and a retry. It does not use up a retry (limit: `reboots`).
  With no modules configured it fails immediately.
* Retries use backoff. `failPattern` matched against the result counts as a failure (like the old
  `grep " ERR "`). `settleMs` pauses after a step and then waits for idle.
* **Checkpoint** (written atomically after every state change): finished tasks are skipped on the next
  run. Before sending, the runner records `inflight {id, execId}`. If the runner crashes, the next run
  first waits for idle and then asks the plugin for `results[execId]`; a task that completed is
  marked done **without re-running it**. `--fresh` ignores the checkpoint. SIGINT finishes the
  current task and stops.
* Reports:
  * `…report.jsonl` holds one line per attempt (kind, ms, waitedMs, recovered, via) plus boot, settle
    and run events.
  * `…report.summary.json` and the console show done/failed/pending, attempts, retries, reboots,
    recovered counts, p50/p95/max per job and per page key, and the failures.
  * `pp report manifest.yaml` rebuilds the summary offline.

### 5. Capability detection (mcp-plus fork interface)
When it connects, `PPClient` reads `listTools()` and checks each enhanced tool's input schema against the
real fork (`server-fork/mcp/packages/server/src/tools/PlusTools.ts`, `JobManager.ts`). The server is the
source of truth.

| server tool | used for | contract |
|---|---|---|
| `submit_code` + `job_status` (+ `cancel_job`) | heavy `exec` | `submit_code{code, timeout_s}` → `{jobId, state:"running", timeoutS, hint}`; `job_status{job_id, wait_s}` → `{jobId, state: running/succeeded/failed/cancelled/timed_out, elapsedS, timeoutS, chunks, completedChunks, currentChunk?, currentTaskState?, error?, result?, log?, note?}`; `cancel_job{job_id}` |
| `batch_execute` | loading several small modules in one request | `{chunks: string[], stop_on_error: true}` → `{ok, executed, total, totalMs, results:[{index, ok, durationMs, result?, log?, error?}]}` |
| `server_stats` | `pp stats` | `{server, sessions, plugins, jobs}` |

How the adapter (`lib/client.mjs`) uses these tools:
* `timeout_s` is `ceil(jobTimeoutMs/1000)`. The default is 3600; the server caps it at `PENPOT_MCP_JOB_TIMEOUT_S` (default 1800).
  The server reports `timed_out` itself. The client sends `cancel_job` only after its own budget plus `jobGraceMs` (15 s).
* `job_status` long-polls with `wait_s` = `jobWaitS` (25 s). The server caps it at `PENPOT_MCP_JOB_MAX_WAIT_S` (default 50).
  The client never polls past its remaining budget.
* `succeeded`: `result` and `log` are the raw plugin values, so a returned string stays a string.
  `failed`: the error is classified like an `execute_code` error (for example `BOOT_REQUIRED`).
* `timed_out` maps to `timeout`. `cancelled`, and "Unknown job id" after a server restart, map to `client_timeout`.
  In all three cases the code may still be running in the tab, or may already have finished. The client waits for idle
  and then recovers the result the wrapper stored.
* `batch_execute` stops at the first failing chunk and returns only the chunks it executed. The client passes that
  short array on. Once a batch call has been sent, the client never re-runs its chunks through `execute_code`.
* The client decides on the parsed JSON `state` / `results`, not on the text classifier. An embedded error message
  (such as "timed out" or `BOOT_REQUIRED`) would otherwise make a normal reply look like a failed call.
* A tool whose schema does not match is not used, for example one with the old assumed `jobId`/`waitMs`/`items[]`
  interface. `pp tools` lists it under `incompatible`, and the client stays on `execute_code`.

The client uses plain `execute_code` when a tool is missing or incompatible, or with `--no-enhanced` /
`PP_NO_ENHANCED=1`. The mock (`--enhanced`) implements the same names, schemas and result shapes as the fork.

---

## CLI

```
pp tools | probe | wait | stats
pp call <tool> [json|@file.json]                      (IMG_OUT=file.png works like call.mjs)
pp exec <main.js> [prelude.js …] [--label L] [--light] [--no-wrap]
pp eval '<code>'
pp boot <module.js …> [--data KEY=file] [--force] [--no-cascade]
pp run "<page>" <key> <batch> … [--modules a.js,b.js] [--require RUN] [--storage PH] [--fail-pattern RE]
pp job <manifest.yaml> [--fresh] [--only k1,k2] [--batches "…"] [--no-boot]
pp report <manifest.yaml> [--json]
pp daemon start [--detach] | stop | status        [--socket PATH | --control-port N]
Global: --url URL | --url-file F | $PENPOT_MCP_URL | ./.mcp-url;  --no-daemon; --no-enhanced; --log F
Env:    PP_STATE_DIR, PP_SOCKET, PP_LOG, PP_WAIT='{"baseMs":3000,"capMs":60000,"maxWaitMs":1200000,"graceMs":2000}'
Exit codes: 0 ok, 1 task error / job with failures, 2 transport/timeout/busy, 3 BOOT_REQUIRED, 4 job has pending tasks
```

`exec` prints `{"result":…,"log":…}` the same way the server does, so `mcp-client/fmt.mjs` still works on its output.

Mock server on its own: `node test/mock-server.mjs --port 4601 [--enhanced] [--timeout-ms 120000] [--suspend-after-ms N]`.
Its control endpoint: `GET/POST http://127.0.0.1:4601/control` with `{"reset":true}` or
`{"rules":[{"match":"…","action":"error|reset|suspended|delay","times":1}]}`.

## Tests (`npm test`)
| file | proves |
|---|---|
| `unit` | error classification against real log strings, chunk splitting (escaping, code points), export parsing, p50/p95, backoff schedule, manifest expansion, capability detection |
| `loader` | **chunking** (250 KB module: 4 stage + 1 link requests, all < 100 KB, globals usable), **hash-skip** (1 call when unchanged, cascade on change, reload after state loss), data module (icons-style), local body-cap refusal and 413 classification |
| `wait` | **timeout → backoff → recovered result, executed once**, exponential intervals, **no overlapping heavy sends**, suspended-while-busy, injected suspended, persisted possiblyRunning across processes |
| `runner` | full run + JSONL/summary, **auto-reboot** after state loss, retry policy + permanent failure, failPattern, timeout recovery inside a job, **resume after SIGKILL** (finished tasks not re-run), **in-flight crash recovery**, settle + `--batches` |
| `caps` | **fallback** on a plain server, jobs/batch/stats on the enhanced mock (real fork interface), raw string results, batch stop-on-error without re-runs, server `timed_out` → recovered, client budget → `cancel_job` → recovered, `--no-enhanced` rollback switch |
| `e2e/fork-e2e` (`npm run test:e2e`) | starts `server-fork/.../dist/index.js --multi-user` on 4501/4502 (REPL 4503) with jobs/batch/stats on and a 4 s tool timeout, connects a fake plugin (same WebSocket protocol as the server's `plus-smoke-test.mjs`, but it really runs the code), then runs `pp tools/eval/exec/boot/run/stats` on the enhanced path and with `--no-enhanced`. A 6 s task succeeds as a job and is recovered after a timeout on the fallback path; each runs exactly once. The server is always stopped. Set `PP_FORK_SERVER_DIR` to point elsewhere; the test skips if `dist` is missing |
| `daemon` | one-shot sessions created == terminated, daemon reuses **one** session across CLI calls and terminates it on stop, `pp run` drop-in with auto-boot |

---

## Adopting it later (only once the current production run has finished)

1. Give `pp` the URL. Do this only after the production run is done; copying earlier is harmless,
   but it enables live calls:
   ```bash
   cp ~/penpot/mcp-client/.mcp-url ~/penpot/mcp-plus/client/.mcp-url && chmod 600 ~/penpot/mcp-plus/client/.mcp-url
   ```
2. Optionally start the daemon, which gives one session for everything:
   ```bash
   cd ~/penpot/mcp-plus/client && node pp.mjs daemon start --detach && node pp.mjs tools
   ```
3. The same commands, run from `~/penpot/mcp-client` (paths are resolved from your current directory):

| old | new |
|---|---|
| `node call.mjs exec main.js pre.js` | `node ~/penpot/mcp-plus/client/pp.mjs exec main.js pre.js` |
| `node call.mjs <tool> '{…}'` | `node ~/penpot/mcp-plus/client/pp.mjs call <tool> '{…}'` |
| `v2/boot.sh v2/core.js … v2/pages-c.js` | `~/penpot/mcp-plus/client/bin/boot.sh v2/core.js v2/ui-base.js v2/ui-nav.js v2/ui-commerce.js v2/shell.js v2/pages-a.js v2/pages-b.js v2/pages-c.js --data PH=js/icons.js` |
| `v2/run.sh "<page>" key P320,P360 …` | `PP_MODULES=v2/core.js,v2/ui-base.js,v2/ui-nav.js,v2/ui-commerce.js,v2/shell.js,v2/pages-a.js,v2/pages-b.js,v2/pages-c.js ~/penpot/mcp-plus/client/bin/run.sh "<page>" key P320,P360 …` |
| `ONLY=home,pdp BATCHES="…" v2/build-all.sh` | `ONLY=home,pdp BATCHES="…" ~/penpot/mcp-plus/client/bin/build-all.sh` (resumable; re-run to continue) |
| `./wait-alive.sh` | `~/penpot/mcp-plus/client/bin/wait-alive.sh` |

4. Suggested order: `pp tools`, then `bin/boot.sh …` (the first boot loads everything; later boots are
   1 call), then `ONLY=<one page> bin/build-all.sh`. Compare its summary (p50/p95) with `build-all.log`,
   and only then run the full job.

Notes:
* `v2/build-all.sh`'s `boot()` does not reload `storage.PH`, but `run.sh`'s guard requires it. After a
  plugin reconnect the old pipeline would keep answering `BOOT_REQUIRED`. The manifest includes
  `js/icons.js` as a data module, so a reboot restores `storage.PH` as well.
* The wrapper keeps the last 30 results (up to 50 KB each) in plugin memory. The probe is an
  `execute_code` call, so it is cheap but still queued behind a busy plugin. Its client timeout is
  45 s, and a timed-out probe just counts as "busy".

## Rollback
Nothing in `~/penpot/mcp-client` changes, so rolling back just means going back to the old commands:

```bash
node ~/penpot/mcp-plus/client/pp.mjs daemon stop   # terminates the MCP session cleanly
rm ~/penpot/mcp-plus/client/.mcp-url               # pp can no longer reach the server
# continue with v2/boot.sh, v2/run.sh, v2/build-all.sh as before
```
* After switching back, re-run `v2/boot.sh` once. The old scripts do not use `storage.__pp`, and it
  is harmless to leave it there.
* If the problem comes from the enhanced-server integration, use `--no-enhanced` or
  `PP_NO_ENHANCED=1` to keep `pp` on plain `execute_code`.
* Deleting `state/` resets checkpoints, logs and the daemon socket.
