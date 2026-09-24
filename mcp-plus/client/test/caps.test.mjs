import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { startMock, connect, tmp, writeModule } from "./helpers.mjs";
import { loadModuleSpec, bootModules } from "../lib/modules.mjs";
import { KIND } from "../lib/util.mjs";

let mock, c;
afterEach(async () => { await c?.close(); await mock?.stop(); c = mock = null; });

test("plain server: no enhanced caps, everything through execute_code", async () => {
  mock = await startMock(); c = await connect(mock);
  assert.equal(c.caps.jobs, null); assert.equal(c.caps.batch, null); assert.equal(c.caps.stats, null);
  const r = await c.exec("return 7", { label: "p" });
  assert.equal(r.via, "execute_code"); assert.equal(r.result, 7);
  assert.equal(await c.serverStats(), null);
});

test("enhanced server: heavy tasks use submit_code/job_status (no 120 s tool timeout), batch + stats used", async () => {
  mock = await startMock({ port: 4602, enhanced: true, taskTimeoutMs: 300 }); c = await connect(mock);
  assert.ok(c.caps.jobs); assert.ok(c.caps.batch); assert.ok(c.caps.stats); assert.ok(c.caps.cancel);
  assert.equal(c.caps.jobs.waitKey, "wait_s"); assert.equal(c.caps.batch.maxChunks, 100); assert.deepEqual(c.caps.incompatible, []);
  const r = await c.exec("await new Promise(r => setTimeout(r, 900)); return 'long-job'", { label: "long" });
  assert.equal(r.ok, true); assert.equal(r.via, "jobs"); assert.equal(r.result, "long-job"); assert.ok(r.jobId);
  assert.ok(!r.recovered, "no timeout path needed");
  assert.equal(mock.stats.timeouts, 0);
  assert.ok(mock.stats.calls.submit_code >= 1 && mock.stats.calls.job_status >= 1);
  // job results are raw plugin values: a returned string that looks like JSON stays a string
  const s = await c.exec("return '7'", { label: "str" });
  assert.equal(s.result, "7");
  const o = await c.exec("console.log('hi'); return { a: [1, 2] }", { label: "obj" });
  assert.deepEqual(o.result, { a: [1, 2] }); assert.equal(o.log, "hi");
  const e = await c.exec("throw new Error('BOOT_REQUIRED: global RUN')", { label: "boot?" });
  assert.equal(e.kind, KIND.BOOT_REQUIRED); assert.equal(e.jobState, "failed");
  const f = await c.exec("throw new Error('boom')", { label: "boom" });
  assert.equal(f.ok, false); assert.equal(f.kind, KIND.ERROR); assert.match(f.text, /boom/);
  // loader groups small modules into one batch_execute request
  const dir = tmp();
  const specs = ["m1.js", "m2.js", "m3.js"].map((f, i) => loadModuleSpec(writeModule(dir, f, { kb: 4, exportName: `g${i}` })));
  mock.resetStats();
  const b = await bootModules(c, specs);
  assert.ok(b.ok, b.error); assert.deepEqual(b.loaded, ["m1.js", "m2.js", "m3.js"]);
  assert.equal(mock.stats.calls.batch_execute, 1);
  const x = await c.exec("return [g0(), g1(), g2()]", { label: "use" });
  assert.deepEqual(x.result, [1, 1, 1]);
  const st = await c.serverStats();
  assert.equal(st.server.flavour, "mcp-plus"); assert.equal(st.plugins.connectedPlugins, 1); assert.ok(st.jobs.counts.succeeded >= 1);
});

test("enhanced server: batch_execute stops at the first failure and nothing is re-run", async () => {
  mock = await startMock({ port: 4602, enhanced: true }); c = await connect(mock);
  const res = await c.execBatch(["return 1", "throw new Error('bad chunk')", "return 'third'"], { label: "b" });
  assert.equal(res.length, 2);
  assert.equal(res[0].ok, true); assert.equal(res[0].result, 1); assert.equal(res[0].via, "batch");
  assert.equal(res[1].ok, false); assert.equal(res[1].kind, KIND.ERROR); assert.match(res[1].text, /bad chunk/);
  assert.equal(mock.countExecuted("return 'third'"), 0);
  assert.equal(mock.stats.calls.batch_execute, 1); assert.equal(mock.stats.calls.execute_code ?? 0, 0);
});

test("enhanced server: server-side job timeout (timed_out) -> wait for idle -> recovered result, executed once", async () => {
  mock = await startMock({ port: 4602, enhanced: true, taskTimeoutMs: 300 });
  c = await connect(mock, { jobTimeoutMs: 1000 }); // sent as timeout_s=1
  const r = await c.exec("await new Promise(r => setTimeout(r, 2000)); return 'slow-done'", { label: "slow" });
  assert.equal(r.via, "jobs");
  assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.recovered, true); assert.equal(r.originalKind, KIND.TIMEOUT);
  assert.equal(r.result, "slow-done");
  assert.equal(mock.countExecuted("slow-done"), 1);
});

test("enhanced server: client-side job budget exceeded -> cancel_job -> recovered", async () => {
  mock = await startMock({ port: 4602, enhanced: true, taskTimeoutMs: 300, jobTimeoutS: 30 });
  // no grace: the client gives up (and sends cancel_job) before the server reports its own timed_out
  c = await connect(mock, { jobTimeoutMs: 600, jobGraceMs: 0 });
  const r = await c.exec("await new Promise(r => setTimeout(r, 1800)); return 'late'", { label: "late" });
  assert.equal(mock.stats.calls.cancel_job, 1);
  assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.recovered, true); assert.equal(r.originalKind, KIND.CLIENT_TIMEOUT);
  assert.equal(r.result, "late");
});

test("enhanced server but --no-enhanced (rollback switch): falls back to execute_code", async () => {
  mock = await startMock({ port: 4602, enhanced: true }); c = await connect(mock, { noEnhanced: true });
  assert.equal(c.caps.jobs, null);
  const r = await c.exec("return 1", { label: "x" });
  assert.equal(r.via, "execute_code");
  assert.equal(mock.stats.calls.submit_code ?? 0, 0);
});
