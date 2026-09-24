import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { startMock, connect, tmp, writeModule } from "./helpers.mjs";
import { loadModuleSpec, bootModules } from "../lib/modules.mjs";
import { KIND } from "../lib/util.mjs";

let mock, c, dir;
before(async () => { mock = await startMock(); c = await connect(mock); dir = tmp(); });
after(async () => { await c.close(); await mock.stop(); });

test("chunking: 250 KB module loads via staged chunks, every request < 100 KB, globals usable", async () => {
  const f = writeModule(dir, "big.js", { kb: 250, exportName: "bigFn", value: "big-ok" });
  const spec = loadModuleSpec(f);
  mock.resetStats();
  const r = await bootModules(c, [spec]);
  assert.ok(r.ok, r.error);
  assert.deepEqual(r.loaded, ["big.js"]);
  assert.ok(r.calls >= 5, `expected >=5 calls (check + stages + link), got ${r.calls}`);
  assert.equal(mock.stats.rejected413, 0);
  assert.ok(mock.stats.maxBodySeen < 100_000, `max body ${mock.stats.maxBodySeen}`);
  const x = await c.exec("return [bigFn(), bigFn_tbl.length, Object.keys(storage.__pp.stage).length]", { label: "use" });
  assert.equal(x.result[0], "big-ok");
  assert.ok(x.result[1] > 1000);
  assert.equal(x.result[2], 0, "staging area cleaned up");
});

test("hash-skip: unchanged modules cost exactly one check call; changed module + later ones reload", async () => {
  const a = writeModule(dir, "a.js", { kb: 5, exportName: "fa", value: 1 });
  const b = writeModule(dir, "b.js", { kb: 5, exportName: "fb", value: 2 });
  const d = writeModule(dir, "d.js", { kb: 5, exportName: "fd", value: 3 });
  const specs = () => [a, b, d].map((f) => loadModuleSpec(f));
  let r = await bootModules(c, specs());
  assert.deepEqual(r.loaded, ["a.js", "b.js", "d.js"]);
  mock.resetStats();
  r = await bootModules(c, specs());
  assert.deepEqual(r.loaded, []); assert.deepEqual(r.skipped, ["a.js", "b.js", "d.js"]);
  assert.equal(r.calls, 1); assert.equal(mock.stats.calls.execute_code, 1);
  appendFileSync(b, "\nfunction fb2() { return 22; }\n");
  r = await bootModules(c, specs());
  assert.deepEqual(r.skipped, ["a.js"]); assert.deepEqual(r.loaded, ["b.js", "d.js"], "cascade reloads modules after the changed one");
  r = await bootModules(c, specs(), { cascade: false });
  assert.deepEqual(r.loaded, []);
  const x = await c.exec("return fb2()", { label: "fb2" });
  assert.equal(x.result, 22);
});

test("hash-skip detects lost plugin state (reconnect) and reloads everything", async () => {
  const a = writeModule(dir, "e.js", { kb: 3, exportName: "fe" });
  await bootModules(c, [loadModuleSpec(a)]);
  mock.plugin.reset();
  const r = await bootModules(c, [loadModuleSpec(a)]);
  assert.deepEqual(r.loaded, ["e.js"]);
});

test("data module: 180 KB icon table (icons.js style) is chunked into storage[key]", async () => {
  const PH = { regular: {}, duotone: {} };
  for (let i = 0; i < 900; i++) PH[i % 3 ? "regular" : "duotone"][`icon-${i}`] = [["M" + "1,2 ".repeat(40) + "Z", 1]];
  const f = join(dir, "icons.js");
  writeFileSync(f, `// icons\nconst PH = ${JSON.stringify(PH)};\n`);
  const spec = loadModuleSpec({ file: f, kind: "data", key: "PH" });
  mock.resetStats();
  const r = await bootModules(c, [spec]);
  assert.ok(r.ok, r.error);
  assert.ok(r.calls >= 3);
  assert.ok(mock.stats.maxBodySeen < 100_000);
  const x = await c.exec("return [Object.keys(storage.PH.regular).length, Object.keys(storage.PH.duotone).length, storage.PH.regular['icon-1'][0][1]]", { label: "ph" });
  assert.deepEqual(x.result, [600, 300, 1]);
  mock.resetStats();
  assert.deepEqual((await bootModules(c, [spec])).skipped, ["icons.js"]);
});

test("body cap: client refuses to send > 100 KB code instead of getting a 413; raw 413 is classified", async () => {
  mock.resetStats();
  const r = await c.exec(`return ${JSON.stringify("x".repeat(120_000))}.length`, { label: "huge" });
  assert.equal(r.kind, KIND.PAYLOAD_TOO_LARGE);
  assert.equal(mock.stats.calls.execute_code ?? 0, 0, "nothing sent");
  const raw = await c.callTool("execute_code", { code: "x".repeat(120_000) });
  assert.equal(raw.kind, KIND.PAYLOAD_TOO_LARGE);
  assert.equal(mock.stats.rejected413, 1);
});
