import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { startMock, connect, tmp, FAST_WAIT } from "./helpers.mjs";
import { loadManifest, runJob } from "../lib/runner.mjs";

const PP = resolve(import.meta.dirname, "../pp.mjs");
let mock, c;
afterEach(async () => { await c?.close(); await mock?.stop(); c = mock = null; });

function setup({ delayMs = 30, batches = "A B C D", pages = [{ page: "10 · Home", key: "home" }], policy = {}, after = true } = {}) {
  const dir = tmp("pp-run-");
  writeFileSync(join(dir, "core.js"), `const DELAY = ${delayMs};\nasync function RUN(page, key, ids) {\n  const d = (storage.delays && storage.delays[ids[0]]) || DELAY;\n  await new Promise(r => setTimeout(r, d));\n  return ids.map(i => i + " ok " + d + "ms");\n}\nasync function ARRANGE(page, title) { return "arranged " + title; }\n`);
  const manifest = {
    name: "t", modules: ["core.js"], require: { globals: ["RUN", "ARRANGE"] }, batches, pages,
    templates: { batch: "return await RUN({{page}}, {{key}}, {{ids}}); // task {{raw:batch}}", ...(after ? { after: "return await ARRANGE({{page}}, {{title}});" } : {}) },
    policy: { retries: 2, retryBackoffMs: 20, ...policy },
  };
  writeFileSync(join(dir, "job.yaml"), JSON.stringify(manifest)); // JSON is valid YAML
  return { dir, path: join(dir, "job.yaml") };
}
const quiet = () => {};

test("runs all tasks, writes JSONL + summary with p50/p95", async () => {
  mock = await startMock(); c = await connect(mock);
  const { path } = setup();
  const m = loadManifest(path);
  const s = await runJob(c, m, { log: quiet });
  assert.deepEqual(s.tasks, { total: 5, done: 5, failed: 0, pending: 0 });
  assert.equal(s.durationsMs.n, 5); assert.ok(s.durationsMs.p50 > 0); assert.ok(s.durationsMs.p95 >= s.durationsMs.p50);
  assert.ok(existsSync(m.report)); assert.ok(existsSync(m.report.replace(/\.jsonl$/, ".summary.json")));
  const evs = readFileSync(m.report, "utf8").trim().split("\n").map(JSON.parse);
  assert.equal(evs.filter((e) => e.type === "attempt").length, 5);
  assert.ok(evs.some((e) => e.type === "run_end"));
  // second run: everything already done -> nothing executed except the boot check
  mock.resetStats();
  const s2 = await runJob(c, m, { log: quiet });
  assert.equal(s2.tasks.done, 5); assert.equal(s2.runs, 2);
  assert.equal(mock.stats.calls.execute_code, 1);
});

test("auto-reboot: plugin state lost mid-run -> BOOT_REQUIRED -> modules reloaded -> task retried", async () => {
  mock = await startMock(); c = await connect(mock);
  const { path } = setup();
  mock.rules = [{ match: "// task C", action: "reset", times: 1 }];
  const s = await runJob(c, loadManifest(path), { log: quiet });
  assert.equal(s.tasks.done, 5); assert.equal(s.reboots, 1);
  assert.equal(s.retries, 0, "reboot does not consume a retry");
  assert.equal(mock.countExecuted("async function RUN"), 2, "core.js loaded twice (start + reboot)");
});

test("retry policy: transient errors retried with backoff; permanent failure recorded, run continues", async () => {
  mock = await startMock(); c = await connect(mock);
  const { path } = setup();
  mock.rules = [{ match: "// task B", action: "error", text: "transient glitch", times: 2 }, { match: "// task D", action: "error", text: "always broken" }];
  const s = await runJob(c, loadManifest(path), { log: quiet });
  assert.equal(s.tasks.done, 4); assert.equal(s.tasks.failed, 1);
  assert.equal(s.failures[0].id, "home:D"); assert.equal(s.failures[0].attempts, 3);
  assert.match(s.failures[0].error, /always broken/);
  assert.equal(s.retries, 2 + 2);
});

test("failPattern: a result containing ERR is treated as a failed attempt", async () => {
  mock = await startMock(); c = await connect(mock);
  const { path } = setup({ policy: { failPattern: "\\bERR\\b" }, after: false, batches: "A" });
  await c.exec("storage.errOnce = true; return 1", { label: "arm" });
  writeFileSync(path, readFileSync(path, "utf8").replace("return await RUN(", "if (storage.errOnce) { storage.errOnce = false; return ['A ERR boom']; } return await RUN("));
  const s = await runJob(c, loadManifest(path), { log: quiet });
  assert.equal(s.tasks.done, 1); assert.equal(s.retries, 1);
});

test("timeout inside a job: result recovered from the plugin, task not re-executed", async () => {
  mock = await startMock({ taskTimeoutMs: 300 }); c = await connect(mock);
  const { path } = setup({ batches: "A B", after: false });
  await c.exec("storage.delays = { B: 1000 }; return 1", { label: "arm" });
  const s = await runJob(c, loadManifest(path), { log: quiet });
  assert.equal(s.tasks.done, 2); assert.equal(s.recovered, 1); assert.equal(s.retries, 0);
  assert.equal(mock.stats.started.filter((x) => x.includes("// task B")).length, 1);
});

function spawnJob(path, stateDir) {
  return spawn(process.execPath, [PP, "job", path, "--no-daemon", "--url", mock.url], {
    env: { ...process.env, PP_STATE_DIR: stateDir, PP_WAIT: JSON.stringify(FAST_WAIT), PP_ALLOW_PORTS: "4601-4603" }, stdio: ["ignore", "pipe", "pipe"],
  });
}
async function waitFor(pred, ms = 15_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = pred(); if (v) return v; await new Promise((r) => setTimeout(r, 20)); }
  throw new Error("waitFor timed out");
}
const readCp = (m) => { try { return JSON.parse(readFileSync(m.checkpoint, "utf8")); } catch { return null; } };
const exitOf = (ch) => new Promise((r) => ch.on("exit", (code, sig) => r({ code, sig })));

test("resume from checkpoint after SIGKILL: finished tasks are not re-run", async () => {
  mock = await startMock();
  const { path, dir } = setup({ delayMs: 250, batches: "A B C D E F", after: false });
  const m = loadManifest(path);
  const ch = spawnJob(path, join(dir, "state1"));
  await waitFor(() => Object.values(readCp(m)?.tasks ?? {}).filter((t) => t.status === "done").length >= 2);
  ch.kill("SIGKILL");
  await exitOf(ch);
  const doneBefore = Object.entries(readCp(m).tasks).filter(([, t]) => t.status === "done").map(([id]) => id);
  const ch2 = spawnJob(path, join(dir, "state2"));
  let out = ""; ch2.stdout.on("data", (d) => (out += d));
  const { code } = await exitOf(ch2);
  assert.equal(code, 0, out);
  const cp = readCp(m);
  assert.equal(cp.runs, 2);
  assert.equal(Object.values(cp.tasks).filter((t) => t.status === "done").length, 6);
  for (const id of doneBefore) {
    const b = id.split(":")[1];
    assert.equal(mock.stats.started.filter((x) => x.includes(`// task ${b}\n`)).length, 1, `${id} executed once`);
  }
  assert.match(out, /6\/6 done/);
});

test("crash while a task is in flight: resumed runner recovers its result from the plugin instead of re-running", async () => {
  mock = await startMock();
  const { path, dir } = setup({ delayMs: 30, batches: "A B C", after: false });
  const m = loadManifest(path);
  c = await connect(mock);
  await c.exec("storage.delays = { B: 1500 }; return 1", { label: "arm" });
  const ch = spawnJob(path, join(dir, "s1"));
  await waitFor(() => readCp(m)?.inflight?.id === "home:B");
  await new Promise((r) => setTimeout(r, 100));
  ch.kill("SIGKILL");
  await exitOf(ch);
  const ch2 = spawnJob(path, join(dir, "s2"));
  let out = ""; ch2.stdout.on("data", (d) => (out += d));
  const { code } = await exitOf(ch2);
  assert.equal(code, 0, out);
  const cp = readCp(m);
  assert.equal(cp.counters.crashRecovered, 1);
  assert.equal(cp.tasks["home:B"].recoveredAfterCrash, true);
  assert.equal(mock.stats.started.filter((x) => x.includes("// task B\n")).length, 1, "B executed exactly once");
  assert.match(out, /had completed in the plugin/);
  const rep = spawnSync(process.execPath, [PP, "report", path], { encoding: "utf8" }); // report is offline (no MCP)
  assert.match(rep.stdout, /3\/3 done/); assert.match(rep.stdout, /p95=/);
});

test("settle policy: after the 'after' (ARRANGE) step the runner pauses and waits for idle; --batches override", async () => {
  mock = await startMock(); c = await connect(mock);
  const { path } = setup({ policy: { settleMs: { after: 120 } } });
  const m = loadManifest(path);
  const t0 = Date.now();
  const s = await runJob(c, m, { log: quiet, batches: "A,B" });
  assert.deepEqual(s.tasks, { total: 2, done: 2, failed: 0, pending: 0 });
  const evs = readFileSync(m.report, "utf8").trim().split("\n").map(JSON.parse);
  const st = evs.find((e) => e.type === "settle");
  assert.equal(st.taskId, "home:after"); assert.equal(st.ok, true);
  assert.ok(Date.now() - t0 >= 120);
});
