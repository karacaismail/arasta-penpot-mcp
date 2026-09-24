// End-to-end: the REAL mcp-plus fork server (built dist/index.js) + a fake Penpot plugin, driven by pp.mjs.
//
//   npm run test:e2e        (needs ../server-fork/mcp/packages/server/dist/index.js; override with PP_FORK_SERVER_DIR)
//
// Ports: HTTP 4501, plugin WebSocket 4502, (dev REPL) 4503 -- nothing else. The server is started here and
// always stopped. The fake plugin speaks the same WebSocket protocol as the fake plugin of the server's own
// scripts/plus-smoke-test.mjs ({id, task, params} in; {id, success, data:{result, log}} | {id, success:false, error}
// out; {type:"heartbeat"} every 500 ms; //SLEEP n, //BLOCK n, //FAIL directives), but it really executes the code
// in a vm context with a persistent `storage`, so pp's task wrapper, probes and module loader work.
// Every scenario runs twice: enhanced path (submit_code/job_status/batch_execute/server_stats) and forced
// fallback (--no-enhanced -> plain execute_code).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import net from "node:net";
import vm from "node:vm";

const HERE = import.meta.dirname;
const PP = resolve(HERE, "../../pp.mjs");
const SERVER_DIR = resolve(process.env.PP_FORK_SERVER_DIR ?? resolve(HERE, "../../../server-fork/mcp/packages/server"));
const DIST = join(SERVER_DIR, "dist/index.js");
const HOST = "127.0.0.1", HTTP_PORT = 4501, WS_PORT = 4502, REPL_PORT = 4503;
const TOKEN = "e2e.PPCLIENTTOKEN.x.y.z";
const URL_ = `http://${HOST}:${HTTP_PORT}/mcp?userToken=${encodeURIComponent(TOKEN)}`;
const TOOL_TIMEOUT_S = 4;
for (const p of [HTTP_PORT, WS_PORT, REPL_PORT]) if ([9001, 1080, 4400, 4401, 4402, 4403].includes(p)) throw new Error("reserved port");

const skip = existsSync(DIST) ? false : `fork server not built: ${DIST}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dir = mkdtempSync(join(tmpdir(), "pp-e2e-"));
let server, serverOut = "", plugin;

function portFree(port) {
  return new Promise((res) => {
    const s = net.connect({ host: HOST, port }, () => { s.destroy(); res(false); });
    s.on("error", () => res(true));
  });
}

// ------------------------------------------------------------------ fake plugin (Node's built-in WebSocket)
function fakePlugin() {
  const ctx = vm.createContext({ setTimeout, clearTimeout });
  const storage = vm.runInContext("({})", ctx);
  const penpot = { currentPage: { name: "E2E Page" }, root: { children: [] } };
  const st = { received: [], active: 0, maxActive: 0, blockedUntil: 0, closed: null };
  const ws = new WebSocket(`ws://${HOST}:${WS_PORT}/?userToken=${encodeURIComponent(TOKEN)}`);
  const hb = setInterval(() => { if (ws.readyState === 1 && Date.now() >= st.blockedUntil) ws.send(JSON.stringify({ type: "heartbeat" })); }, 500);
  ws.addEventListener("close", (e) => { clearInterval(hb); st.closed = { code: e.code, reason: e.reason }; });
  ws.addEventListener("message", async (ev) => {
    const req = JSON.parse(String(ev.data));
    if (!req.id) return;
    const code = req.params?.code ?? "";
    st.received.push(code);
    st.active++; st.maxActive = Math.max(st.maxActive, st.active);
    const m = /^\/\/(SLEEP|BLOCK|FAIL)\s*(\d+)?/.exec(code);
    const ms = m?.[2] ? Number(m[2]) : 0;
    if (m?.[1] === "BLOCK") st.blockedUntil = Date.now() + ms;
    let reply;
    try {
      if (ms) await sleep(ms);
      if (m?.[1] === "FAIL") throw new Error("fake failure");
      const logs = [];
      const cons = { log: (...a) => logs.push(a.join(" ")), warn: (...a) => logs.push(a.join(" ")), error: (...a) => logs.push(a.join(" ")) };
      const fn = vm.runInContext(`(async function (penpot, penpotUtils, storage, console) {\n${code}\n})`, ctx);
      const result = await fn(penpot, {}, storage, cons);
      reply = { id: req.id, success: true, data: { result, log: logs.join("\n") } };
    } catch (e) {
      reply = { id: req.id, success: false, error: String(e?.message ?? e) };
    } finally { st.active--; }
    if (ws.readyState === 1) ws.send(JSON.stringify(reply));
  });
  st.ws = ws;
  st.ready = new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
  st.count = (needle) => st.received.filter((c) => c.includes(needle)).length;
  return st;
}

// ------------------------------------------------------------------ pp CLI
const FAST_WAIT = { baseMs: 300, factor: 2, capMs: 2000, maxWaitMs: 60_000, graceMs: 100 };
function pp(mode, ...args) {
  const log = join(dir, `log-${mode}-${Date.now()}-${Math.random().toString(36).slice(2)}.jsonl`);
  const env = { ...process.env, PP_ALLOW_PORTS: "4501-4503", PP_STATE_DIR: join(dir, `state-${mode}`), PP_WAIT: JSON.stringify(FAST_WAIT) };
  delete env.PENPOT_MCP_URL; delete env.PP_NO_ENHANCED; delete env.PP_SOCKET;
  const extra = ["--no-daemon", "--url", URL_, "--log", log, ...(mode === "fallback" ? ["--no-enhanced"] : [])];
  return new Promise((res) => {
    const ch = spawn(process.execPath, [PP, ...args, ...extra], { env, cwd: dir });
    let stdout = "", stderr = "";
    ch.stdout.on("data", (d) => (stdout += d)); ch.stderr.on("data", (d) => (stderr += d));
    ch.on("exit", (status) => {
      const events = existsSync(log) ? readFileSync(log, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
      const tools = events.filter((e) => e.type === "call").map((e) => e.tool);
      res({ status, stdout, stderr, events, tools });
    });
  });
}
const json = (s) => JSON.parse(s.slice(s.indexOf("{")));

// ------------------------------------------------------------------ lifecycle
before(async () => {
  if (skip) return;
  for (const p of [HTTP_PORT, WS_PORT, REPL_PORT]) assert.ok(await portFree(p), `port ${p} is in use`);
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("PENPOT_MCP_")));
  Object.assign(env, {
    PENPOT_MCP_SERVER_HOST: HOST, PENPOT_MCP_SERVER_PORT: String(HTTP_PORT), PENPOT_MCP_WEBSOCKET_PORT: String(WS_PORT),
    PENPOT_MCP_REPL_PORT: String(REPL_PORT), PENPOT_MCP_LOG_LEVEL: "warn",
    PENPOT_MCP_TOOL_TIMEOUT_S: String(TOOL_TIMEOUT_S), PENPOT_MCP_HEARTBEAT_GRACE_S: "3", PENPOT_MCP_TASK_QUEUE_MAX: "8",
    PENPOT_MCP_ORPHAN_TASK_GRACE_S: "30", PENPOT_MCP_CONNECTION_POLICY: "takeover-stale",
    PENPOT_MCP_ENABLE_JOBS: "true", PENPOT_MCP_JOB_TIMEOUT_S: "60", PENPOT_MCP_ENABLE_BATCH: "true", PENPOT_MCP_ENABLE_STATS: "true",
  });
  server = spawn(process.execPath, [DIST, "--multi-user"], { cwd: SERVER_DIR, env, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", (d) => (serverOut += d)); server.stderr.on("data", (d) => (serverOut += d));
  for (let i = 0; ; i++) {
    try { await (await fetch(`http://${HOST}:${HTTP_PORT}/stats`)).json(); break; }
    catch { if (i > 150 || server.exitCode !== null) throw new Error("fork server did not start:\n" + serverOut.slice(-3000)); await sleep(100); }
  }
  plugin = fakePlugin();
  await plugin.ready;
  await sleep(300);
});

after(async () => {
  try { plugin?.ws.close(); } catch {}
  if (server && server.exitCode === null) {
    const exited = new Promise((r) => server.once("exit", r));
    server.kill("SIGTERM");
    await Promise.race([exited, sleep(5000)]);
    if (server.exitCode === null && server.signalCode === null) { server.kill("SIGKILL"); await exited; }
  }
  if (!skip) for (const p of [HTTP_PORT, WS_PORT, REPL_PORT]) assert.ok(await portFree(p), `port ${p} still in use after stop`);
});

// ------------------------------------------------------------------ scenarios
test("tools: enhanced caps detected from the real schemas; --no-enhanced disables them", { skip }, async () => {
  const e = await pp("enhanced", "tools");
  assert.equal(e.status, 0, e.stderr);
  const je = json(e.stdout);
  for (const t of ["execute_code", "submit_code", "job_status", "cancel_job", "batch_execute", "server_stats"]) assert.ok(je.tools.includes(t), t);
  assert.deepEqual([je.jobs, je.batch, je.stats, je.cancel], [true, true, true, true]);
  assert.deepEqual(je.incompatible, [], "the adapter must accept every real tool schema");
  const f = await pp("fallback", "tools");
  const jf = json(f.stdout);
  assert.deepEqual([jf.jobs, jf.batch, jf.stats, jf.cancel], [false, false, false, false]);
});

test("eval: enhanced goes through submit_code/job_status, fallback through execute_code; same output", { skip }, async () => {
  for (const mode of ["enhanced", "fallback"]) {
    const r = await pp(mode, "eval", `console.log("hello ${mode}"); return { answer: 6 * 7, s: "7" }`);
    assert.equal(r.status, 0, r.stderr);
    const out = json(r.stdout);
    assert.deepEqual(out.result, { answer: 42, s: "7" }, mode);
    assert.equal(out.log, `hello ${mode}`);
    if (mode === "enhanced") { assert.ok(r.tools.includes("submit_code") && r.tools.includes("job_status"), r.tools.join()); assert.ok(!r.tools.includes("execute_code")); }
    else { assert.deepEqual(r.tools, ["execute_code"]); }
  }
});

test(`long task (6 s > PENPOT_MCP_TOOL_TIMEOUT_S=${TOOL_TIMEOUT_S}): enhanced job succeeds directly; fallback times out and recovers; each runs once`, { skip }, async () => {
  for (const mode of ["enhanced", "fallback"]) {
    const marker = `LONG_${mode.toUpperCase()}`;
    const f = join(dir, `long-${mode}.js`);
    writeFileSync(f, `await new Promise((r) => setTimeout(r, 6000)); return "${marker} done";`);
    const t0 = Date.now();
    const r = await pp(mode, "exec", f, "--label", marker);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(json(r.stdout).result, `${marker} done`);
    if (mode === "enhanced") {
      assert.doesNotMatch(r.stderr, /recovered/, "no timeout/recovery on the job path");
      assert.ok(r.events.some((e) => e.type === "job_submitted"));
    } else {
      assert.match(r.stderr, /result recovered from plugin after timeout/);
      assert.ok(r.events.some((e) => e.type === "call" && e.tool === "execute_code" && e.kind === "timeout"));
    }
    assert.equal(plugin.count(`"${marker} done"`), 1, `${mode}: task body executed exactly once`);
    assert.ok(Date.now() - t0 < 45_000);
  }
});

test("boot: enhanced loads small modules with ONE batch_execute; fallback uses execute_code only", { skip }, async () => {
  for (const mode of ["enhanced", "fallback"]) {
    const files = [1, 2, 3].map((i) => {
      const f = join(dir, `${mode}_m${i}.js`);
      writeFileSync(f, `function ${mode}_fn${i}() { return ${i}; }\nconst ${mode}_tbl${i} = ${JSON.stringify("x".repeat(2000))};\n`);
      return f;
    });
    const r = await pp(mode, "boot", ...files);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, new RegExp(`boot ok: loaded=\\[${mode}_m1.js, ${mode}_m2.js, ${mode}_m3.js\\]`));
    const n = r.tools.filter((t) => t === "batch_execute").length;
    if (mode === "enhanced") assert.equal(n, 1, r.tools.join());
    else { assert.equal(n, 0); assert.ok(r.tools.every((t) => t === "execute_code"), r.tools.join()); }
    const again = await pp(mode, "boot", ...files);
    assert.match(again.stdout, /skipped=\[.*m3\.js\] calls=1/, "hash-skip: one check call");
    const use = await pp(mode, "eval", `return ${mode}_fn1() + ${mode}_fn2() + ${mode}_fn3()`);
    assert.equal(json(use.stdout).result, 6);
  }
});

test("errors: BOOT_REQUIRED -> exit 3, ordinary error -> exit 1 (both paths)", { skip }, async () => {
  for (const mode of ["enhanced", "fallback"]) {
    const b = await pp(mode, "eval", `throw new Error("BOOT_REQUIRED: global RUN")`);
    assert.equal(b.status, 3, `${mode}: ${b.stderr}`);
    assert.match(b.stderr, /BOOT_REQUIRED/);
    const e = await pp(mode, "eval", `throw new Error("plain failure ${mode}")`);
    assert.equal(e.status, 1, `${mode}: ${e.stderr}`);
    assert.match(e.stderr, new RegExp(`plain failure ${mode}`));
  }
});

test("run: pp run drop-in with auto-boot works on both paths", { skip }, async () => {
  for (const mode of ["enhanced", "fallback"]) {
    const core = join(dir, `core-${mode}.js`);
    writeFileSync(core, `async function RUN(page, key, ids) { return ids.map((i) => i + " ok ${mode}"); }\n`);
    const r = await pp(mode, "run", "10 · Home", `home${mode}`, "P320,P360", "D1920", "--modules", core);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /2\/2 done/);
    if (mode === "enhanced") assert.ok(r.tools.includes("submit_code"));
    else assert.ok(!r.tools.some((t) => ["submit_code", "job_status", "batch_execute"].includes(t)));
  }
});

test("stats: server_stats (real shape) on the enhanced path, none on fallback; no token leak; sessions cleaned up", { skip }, async () => {
  const e = await pp("enhanced", "stats");
  assert.equal(e.status, 0, e.stderr);
  const s = json(e.stdout).server;
  assert.equal(s.server.flavour, "mcp-plus");
  assert.equal(s.plugins.connectedPlugins, 1);
  assert.ok(s.plugins.recentTasks.length > 0);
  assert.ok(s.jobs.counts.succeeded >= 1);
  assert.ok(!e.stdout.includes(TOKEN), "token leaked");
  const f = await pp("fallback", "stats");
  assert.equal(json(f.stdout).server, null);
  // one-shot CLI calls terminate their MCP sessions
  await sleep(300);
  const g = await (await fetch(`http://${HOST}:${HTTP_PORT}/stats`)).json();
  assert.equal(g.sessions.streamable, 0, JSON.stringify(g.sessions));
  assert.equal(plugin.maxActive, 1, "server lane serialised all plugin tasks");
  assert.equal(plugin.closed, null, "plugin connection stayed up");
});
