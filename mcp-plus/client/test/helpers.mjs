// Test helpers. Tests only ever talk to the in-process mock on ports 4601-4603.
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MockPenpotMcp } from "./mock-server.mjs";
import { PPClient } from "../lib/client.mjs";

process.env.PP_ALLOW_PORTS = "4601-4603"; // hard guard: the client refuses any other port
export const FAST_WAIT = { baseMs: 80, factor: 2, capMs: 400, maxWaitMs: 20_000, graceMs: 20 };

export async function startMock(opts = {}) { return new MockPenpotMcp({ port: 4601, taskTimeoutMs: 1500, ...opts }).start(); }

export async function connect(mock, opts = {}) {
  const events = [];
  const c = new PPClient({ url: mock.url, wait: FAST_WAIT, probeTimeoutMs: 3000, clientTimeoutMs: 10_000, onEvent: (e) => events.push(e), ...opts });
  await c.connect();
  c.events = events;
  return c;
}

export function tmp(prefix = "pp-test-") { return mkdtempSync(join(process.env.PP_TEST_TMP ?? tmpdir(), prefix)); }

/** Writes a synthetic JS module of roughly `kb` KB exporting `name` functions. */
export function writeModule(dir, file, { kb = 10, exportName = "fnA", value = 1 } = {}) {
  let src = `// synthetic module ${file}\nfunction ${exportName}() { return ${JSON.stringify(value)}; }\nconst ${exportName}_tbl = [\n`;
  let i = 0;
  while (src.length < kb * 1024) src += `  "row ${i++} ${"x".repeat(60)} \\"quoted\\" ünïcödé",\n`;
  src += "];\n";
  const p = join(dir, file);
  writeFileSync(p, src);
  return p;
}
