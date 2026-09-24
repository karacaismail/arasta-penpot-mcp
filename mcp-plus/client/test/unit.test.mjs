import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, KIND, stats, jsonBytes, backoff } from "../lib/util.mjs";
import { splitByJsonBytes, parseExports, planModule } from "../lib/modules.mjs";
import { render, expandTasks, normalizeManifest, parsePagesFile } from "../lib/runner.mjs";
import { detectCaps } from "../lib/client.mjs";

test("classify: real Penpot MCP error strings", () => {
  assert.equal(classify("Tool execution failed: Error: Task 1b2841db-e4e8-4ee1-9777-c9a140292a57 timed out after 120 seconds"), KIND.TIMEOUT);
  assert.equal(classify("Tool execution failed: Error: The Penpot plugin tab appears to be suspended by the browser (no heartbeat for 121s). Please click/focus the Penpot tab to wake it, then retry."), KIND.SUSPENDED);
  assert.equal(classify("Tool execution failed: Error: Error handling task: BOOT_REQUIRED"), KIND.BOOT_REQUIRED);
  assert.equal(classify("Error POSTing to endpoint (HTTP 413): PayloadTooLargeError: request entity too large", { thrown: true }), KIND.PAYLOAD_TOO_LARGE);
  assert.equal(classify("MCP error -32001: Request timed out", { thrown: true }), KIND.CLIENT_TIMEOUT);
  assert.equal(classify("fetch failed", { thrown: true }), KIND.TRANSPORT);
  assert.equal(classify("Tool execution failed: Error: Error handling task: sleep is not a function"), KIND.ERROR);
  assert.equal(classify('{"result": 1, "log": ""}'), KIND.OK);
});

test("splitByJsonBytes keeps every piece under the limit and round-trips", () => {
  const text = Array.from({ length: 3000 }, (_, i) => `line ${i} "q" \\ ünï ${"x".repeat(i % 97)}\n`).join("") + "y".repeat(50_000) + "😀".repeat(3000);
  const pieces = splitByJsonBytes(text, 20_000);
  assert.ok(pieces.length > 5);
  for (const p of pieces) assert.ok(jsonBytes(p) - 2 <= 20_000);
  assert.equal(pieces.join(""), text);
});

test("parseExports mirrors boot.sh convention (skips __private) and honours @pp-exports", () => {
  assert.deepEqual(parseExports("const A = 1;\nasync function RUN() {}\nlet __x = 2;\nfunction f() {}\n  const inner = 3;\nclass K {}"), ["A", "K", "RUN", "f"]);
  assert.deepEqual(parseExports("// @pp-exports X, Y\nconst A=1;"), ["X", "Y"]);
});

test("planModule: small module = 1 call, large module = staged chunks each < 90 KB", () => {
  const small = { kind: "js", name: "s.js", source: "function a(){}", exports: ["a"], hash: "h1" };
  assert.equal(planModule(small).length, 1);
  const big = { kind: "js", name: "b.js", source: "const T = [\n" + '  "abc\\"def",\n'.repeat(30_000) + "];\nfunction b(){return T.length}", exports: ["T", "b"], hash: "h2" };
  const plan = planModule(big);
  assert.ok(plan.length >= 5, `expected staged plan, got ${plan.length}`);
  for (const c of plan) assert.ok(jsonBytes({ code: c.code }) < 90_000, `${c.label} too big`);
});

test("stats: p50/p95", () => {
  const s = stats([5, 1, 3, 2, 4, 6, 7, 8, 9, 10]);
  assert.equal(s.p50, 5); assert.equal(s.p95, 10); assert.equal(s.min, 1); assert.equal(s.n, 10);
});

test("backoff grows exponentially and is capped", () => {
  const v = [0, 1, 2, 3, 4, 5, 6].map((a) => backoff(a, { baseMs: 1000, factor: 2, capMs: 20_000, jitter: 0 }));
  assert.deepEqual(v, [1000, 2000, 4000, 8000, 16000, 20000, 20000]);
});

test("manifest: pages.txt parsing, templates, stable task ids", () => {
  const pages = parsePagesFile("10 · Ana Sayfa|home\n# c\n13 · Ürün Detayı|pdp\n");
  const m = normalizeManifest({ name: "t", pages, batches: "P320,P360 D1920", templates: { batch: "return await RUN({{page}}, {{key}}, {{ids}});", after: "return await ARRANGE({{page}}, {{title}});" } });
  const t = expandTasks(m);
  assert.deepEqual(t.map((x) => x.id), ["home:P320,P360", "home:D1920", "home:after", "pdp:P320,P360", "pdp:D1920", "pdp:after"]);
  assert.equal(t[0].body, 'return await RUN("10 · Ana Sayfa", "home", ["P320","P360"]);');
  assert.equal(t[2].body, 'return await ARRANGE("10 · Ana Sayfa", "Ana Sayfa");');
  assert.equal(expandTasks(m, { only: ["pdp"] }).length, 3);
  assert.throws(() => render("{{nope}}", {}), /not defined/);
});

test("detectCaps: plain vs real mcp-plus tool lists; unknown interfaces are not guessed", () => {
  const plain = detectCaps([{ name: "execute_code", inputSchema: { properties: { code: {} } } }]);
  assert.equal(plain.jobs, null); assert.equal(plain.batch, null); assert.deepEqual(plain.incompatible, []);
  // input schemas as the fork's zod shapes serialise them (PlusTools.ts)
  const enh = detectCaps([
    { name: "execute_code", inputSchema: { properties: { code: {} } } },
    { name: "submit_code", inputSchema: { properties: { code: { type: "string" }, chunks: { type: "array", items: { type: "string" } }, stop_on_error: {}, timeout_s: { type: "integer" } } } },
    { name: "job_status", inputSchema: { properties: { job_id: { type: "string" }, wait_s: { type: "number" } } } },
    { name: "cancel_job", inputSchema: { properties: { job_id: { type: "string" } } } },
    { name: "batch_execute", inputSchema: { properties: { chunks: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 100 }, stop_on_error: { type: "boolean" } } } },
    { name: "server_stats", inputSchema: { properties: {} } },
  ]);
  assert.deepEqual(enh.jobs, { submit: "submit_code", status: "job_status", timeoutKey: "timeout_s", waitKey: "wait_s" });
  assert.deepEqual(enh.cancel, { name: "cancel_job" });
  assert.deepEqual(enh.batch, { name: "batch_execute", maxChunks: 100, stopKey: "stop_on_error" });
  assert.ok(enh.stats); assert.deepEqual(enh.incompatible, []);
  // the previously ASSUMED interface (jobId/waitMs, items[{code}]) is not a real server -> not used
  const old = detectCaps([
    { name: "submit_code", inputSchema: { properties: { code: {}, label: {} } } },
    { name: "job_status", inputSchema: { properties: { jobId: {}, waitMs: {} } } },
    { name: "cancel_job", inputSchema: { properties: { jobId: {} } } },
    { name: "batch_execute", inputSchema: { properties: { items: { type: "array", items: { type: "object", properties: { code: {} } } } } } },
  ]);
  assert.equal(old.jobs, null); assert.equal(old.cancel, null); assert.equal(old.batch, null);
  assert.deepEqual(old.incompatible.sort(), ["batch_execute", "cancel_job", "job_status", "submit_code"]);
  assert.equal(detectCaps([{ name: "submit_code" }, { name: "job_status" }], { noEnhanced: true }).jobs, null);
});
