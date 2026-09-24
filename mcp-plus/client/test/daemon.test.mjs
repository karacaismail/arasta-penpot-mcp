import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { startMock, tmp, FAST_WAIT } from "./helpers.mjs";
import { DaemonProxy } from "../lib/daemon.mjs";

const PP = resolve(import.meta.dirname, "../pp.mjs");
let mock, dir, env;
before(async () => { mock = await startMock(); dir = tmp("pp-d-"); env = { ...process.env, PP_STATE_DIR: dir, PP_WAIT: JSON.stringify(FAST_WAIT), PP_ALLOW_PORTS: "4601-4603" }; });
after(async () => { await pp("daemon", "stop", "--control-port", "4603"); await mock.stop(); });
const pp = (...a) => new Promise((res) => {
  const ch = spawn(process.execPath, [PP, ...a], { env });
  let stdout = "", stderr = "";
  ch.stdout.on("data", (d) => (stdout += d)); ch.stderr.on("data", (d) => (stderr += d));
  ch.on("exit", (status) => res({ status, stdout, stderr }));
});

test("one-shot mode: each CLI call opens AND terminates its session (no leak)", async () => {
  mock.resetStats();
  for (let i = 0; i < 3; i++) { const r = await pp("eval", `return ${i} * 2`, "--no-daemon", "--url", mock.url); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, new RegExp(`"result": ${i * 2}`)); }
  assert.equal(mock.stats.sessionsCreated, 3); assert.equal(mock.stats.sessionsTerminated, 3);
});

test("daemon mode: one persistent MCP session reused across CLI calls; terminated on stop", async () => {
  mock.resetStats();
  const d = spawn(process.execPath, [PP, "daemon", "start", "--control-port", "4603", "--url", mock.url], { env, stdio: "ignore" });
  const proxy = new DaemonProxy({ port: 4603 });
  for (let i = 0; i < 100 && !(await proxy.ping()); i++) await new Promise((r) => setTimeout(r, 50));
  assert.ok(await proxy.ping(), "daemon up");
  const f = join(dir, "main.js"); writeFileSync(f, "return typeof PRE + ':' + PRE");
  const pre = join(dir, "pre.js"); writeFileSync(pre, "const PRE = 'prelude';");
  for (let i = 0; i < 4; i++) { const r = await pp("exec", f, pre, "--control-port", "4603"); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /string:prelude/); }
  writeFileSync(join(dir, "mod.js"), "function DAEMON_FN() { return 'd'; }\n");
  let r = await pp("boot", join(dir, "mod.js"), "--control-port", "4603"); assert.match(r.stdout, /loaded=\[mod.js\]/);
  r = await pp("boot", join(dir, "mod.js"), "--control-port", "4603"); assert.match(r.stdout, /skipped=\[mod.js\]/);
  r = await pp("probe", "--control-port", "4603"); assert.match(r.stdout, /"ok": true/);
  r = await pp("tools", "--control-port", "4603"); assert.match(r.stdout, /"via": "daemon"/);
  assert.equal(mock.stats.sessionsCreated, 1, "single session for all calls");
  const st = await proxy.status(); assert.ok(st.metrics.calls >= 8);
  r = await pp("daemon", "stop", "--control-port", "4603"); assert.match(r.stdout, /stopped/);
  await new Promise((res) => d.on("exit", res));
  assert.equal(mock.stats.sessionsTerminated, 1, "terminateSession on shutdown");
});

test("run.sh drop-in: pp run <page> <key> <batches> with auto-boot via --modules", async () => {
  const core = join(dir, "core.js");
  writeFileSync(core, "async function RUN(page, key, ids) { return ids.map(i => i + ' ok'); }\n");
  const r = await pp("run", "10 · Ana Sayfa", "home", "P320,P360", "D1920", "--modules", core, "--no-daemon", "--url", mock.url);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /home:P320,P360 ok .*P320 ok/);
  assert.match(r.stdout, /2\/2 done/);
});
