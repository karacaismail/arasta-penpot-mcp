import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { startMock, connect } from "./helpers.mjs";
import { KIND } from "../lib/util.mjs";

let mock, c;
afterEach(async () => { await c?.close(); await mock?.stop(); c = mock = null; });

test("timeout: plugin keeps running; client waits with backoff and recovers the result without re-running", async () => {
  mock = await startMock({ taskTimeoutMs: 400 });
  c = await connect(mock);
  const r = await c.exec("await new Promise(r => setTimeout(r, 1500)); return 'heavy-done'", { label: "heavy" });
  assert.equal(r.ok, true); assert.equal(r.recovered, true); assert.equal(r.originalKind, KIND.TIMEOUT);
  assert.equal(r.result, "heavy-done");
  assert.equal(mock.countExecuted("heavy-done"), 1, "task executed exactly once");
  assert.equal(c.possiblyRunning, null);
  const waits = c.events.filter((e) => e.type === "wait").map((e) => e.sleepMs);
  assert.ok(waits.length >= 2, `expected several backoff sleeps, got ${waits}`);
});

test("backoff: probe intervals grow exponentially (until cap)", async () => {
  mock = await startMock({ taskTimeoutMs: 300 });
  c = await connect(mock, { wait: { baseMs: 100, factor: 2, capMs: 1600, maxWaitMs: 20_000, graceMs: 0, jitter: 0 } });
  await c.exec("await new Promise(r => setTimeout(r, 4000)); return 1", { label: "long" });
  const waits = c.events.filter((e) => e.type === "wait").map((e) => e.sleepMs);
  assert.ok(waits.length >= 3, String(waits));
  assert.deepEqual(waits.slice(0, 4), [100, 200, 400, 800].slice(0, Math.min(4, waits.length)));
});

test("never sends a new heavy task while the previous may still be running", async () => {
  mock = await startMock({ taskTimeoutMs: 300 });
  c = await connect(mock);
  const first = c.exec("await new Promise(r => setTimeout(r, 1200)); return 'first'", { label: "first", recover: false });
  const r1 = await first;
  assert.equal(r1.kind, KIND.TIMEOUT);
  assert.ok(c.possiblyRunning, "marked possibly running");
  const r2 = await c.exec("return 'second'", { label: "second" });
  assert.equal(r2.result, "second");
  const tl = mock.stats.timeline;
  const firstEnd = tl.find((e) => e.ev === "end" && e.code.includes("'first'")).t;
  const secondRecv = tl.find((e) => e.ev === "recv" && e.code.includes("'second'")).t;
  assert.ok(secondRecv >= firstEnd, `second sent at ${secondRecv} before first ended at ${firstEnd}`);
});

test("suspended (no heartbeat while busy): probes back off until the plugin is free, then the task runs", async () => {
  mock = await startMock({ taskTimeoutMs: 300, suspendAfterMs: 200 });
  c = await connect(mock);
  const r = await c.exec("await new Promise(r => setTimeout(r, 1500)); return 'busy-done'", { label: "busy" });
  assert.equal(r.ok, true); assert.equal(r.recovered, true);
  assert.ok(mock.stats.suspended >= 1, "probes saw 'suspended' errors");
  const kinds = c.events.filter((e) => e.type === "wait").map((e) => e.probeKind);
  assert.ok(kinds.includes(KIND.SUSPENDED), String(kinds));
  const r2 = await c.exec("return 42", { label: "after" });
  assert.equal(r2.result, 42);
});

test("an injected 'suspended' reply marks the plugin suspect; next heavy call probes first", async () => {
  mock = await startMock();
  c = await connect(mock);
  mock.rules = [{ match: "'victim'", action: "suspended", times: 1 }];
  const r = await c.exec("return 'victim'", { label: "victim" });
  assert.equal(r.kind, KIND.SUSPENDED);
  assert.ok(c.possiblyRunning);
  mock.resetStats();
  const r2 = await c.exec("return 'victim'", { label: "victim2" });
  assert.equal(r2.result, "victim");
  assert.ok(c.events.some((e) => e.type === "idle"), "waited for idle first");
});

test("possiblyRunning persists across processes (one-shot CLI mode) via statePath", async () => {
  const { tmp } = await import("./helpers.mjs");
  const { join } = await import("node:path");
  const statePath = join(tmp(), "client-state.json");
  mock = await startMock({ taskTimeoutMs: 300 });
  c = await connect(mock, { statePath });
  await c.exec("await new Promise(r => setTimeout(r, 900)); return 'x'", { label: "x", recover: false });
  await c.close();
  const c2 = await connect(mock, { statePath });
  assert.ok(c2.possiblyRunning, "loaded from state file");
  const r = await c2.exec("return 'y'", { label: "y" });
  assert.equal(r.result, "y");
  const tl = mock.stats.timeline;
  assert.ok(tl.find((e) => e.ev === "recv" && e.code.includes("'y'")).t >= tl.find((e) => e.ev === "end" && e.code.includes("'x'")).t);
  await c2.close();
});
