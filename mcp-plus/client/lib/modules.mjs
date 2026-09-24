// Module loader: JS modules -> plugin globals, JSON data -> plugin storage; chunked below the body cap,
// content-hashed so unchanged modules are skipped, hashes kept in storage.__pp.mods.
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { KIND, sha, jsonBytes } from "./util.mjs";
import { PP_INIT, checkModulesCode } from "./snippets.mjs";

export const LOADER_VERSION = "pp-loader-1";
const J = (v) => JSON.stringify(v);
const ENVELOPE = 1500; // bytes reserved for the per-chunk wrapper code + JSON-RPC envelope

/** Top-level declarations exported to globalThis (same convention as mcp-client/v2/boot.sh). */
export function parseExports(src) {
  const m = src.match(/^\s*\/\/\s*@pp-exports\s+(.+)$/m);
  if (m) return m[1].split(/[\s,]+/).filter(Boolean);
  const names = new Set();
  for (const x of src.matchAll(/^(?:async\s+function\*?|function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    if (!x[1].startsWith("__")) names.add(x[1]);
  }
  return [...names].sort();
}

/**
 * Normalise a module entry.
 *   "path/to/mod.js"                                  -> JS module
 *   { file, name?, exports? }                         -> JS module
 *   { file, kind: "data", key, extract?: "braces" }   -> JSON data into storage[key]
 */
export function loadModuleSpec(entry, baseDir = process.cwd()) {
  const e = typeof entry === "string" ? { file: entry } : { ...entry };
  const file = resolve(baseDir, e.file);
  const raw = readFileSync(file, "utf8");
  const kind = e.kind ?? (file.endsWith(".json") ? "data" : "js");
  const name = e.name ?? basename(file);
  if (kind === "data") {
    if (!e.key) throw new Error(`data module ${name} needs a storage 'key'`);
    const extract = e.extract ?? (file.endsWith(".json") ? null : "braces");
    const text = extract === "braces" ? raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1) : raw;
    const data = JSON.parse(text);
    const canon = J(data);
    return { kind, name, file, storageKey: e.key, data, exports: [], hash: sha(`${LOADER_VERSION}|data|${e.key}|${canon}`).slice(0, 16), bytes: Buffer.byteLength(canon) };
  }
  const exports = e.exports ?? parseExports(raw);
  return { kind: "js", name, file, source: raw, exports, hash: sha(`${LOADER_VERSION}|js|${exports.join(",")}|${raw}`).slice(0, 16), bytes: Buffer.byteLength(raw) };
}

/** Bytes of `s` after `depth` rounds of JSON string escaping (a staged piece is a JSON literal inside
 *  code that is itself JSON-encoded in the request body -> depth 2). */
export function escapedBytes(s, depth = 1) {
  let x = s;
  for (let i = 0; i < depth; i++) x = JSON.stringify(x).slice(1, -1);
  return Buffer.byteLength(x, "utf8");
}

/** Split text into pieces whose escaped size is <= limit (never splits a code point). */
export function splitByJsonBytes(text, limit, depth = 1) {
  const pieces = [];
  let cur = "", curB = 0;
  const push = () => { if (cur) pieces.push(cur); cur = ""; curB = 0; };
  for (const line of text.split(/(?<=\n)/)) {
    const lb = escapedBytes(line, depth);
    if (curB + lb <= limit) { cur += line; curB += lb; continue; }
    push();
    if (lb <= limit) { cur = line; curB = lb; continue; }
    for (const ch of line) { // pathological long line: split by code points
      const cb = escapedBytes(ch, depth);
      if (curB + cb > limit) push();
      cur += ch; curB += cb;
    }
  }
  push();
  return pieces;
}

function exportTail(spec) {
  return `{ Object.assign(globalThis, { ${spec.exports.join(", ")} });
${PP_INIT}
__pp.mods[${J(spec.name)}] = { hash: ${J(spec.hash)}, exports: ${J(spec.exports)}, t: Date.now() };
return { module: ${J(spec.name)}, exports: ${spec.exports.length}, hash: ${J(spec.hash)} }; }`;
}

/** Returns the ordered list of execute_code bodies needed to load one module. */
export function planModule(spec, chunkBytes = 90_000) {
  if (spec.kind === "data") return planData(spec, chunkBytes);
  const tail = exportTail(spec);
  const single = `${spec.source}\n;\n${tail}`;
  if (jsonBytes(single) + ENVELOPE <= chunkBytes) return [{ code: single, label: `load ${spec.name}` }];
  const pieces = splitByJsonBytes(spec.source, chunkBytes - ENVELOPE, 2);
  const n = pieces.length;
  const calls = pieces.map((p, i) => ({
    label: `stage ${spec.name} ${i + 1}/${n}`,
    code: `${PP_INIT}
let st = __pp.stage[${J(spec.name)}];
if (!st || st.hash !== ${J(spec.hash)} || ${i === 0}) st = __pp.stage[${J(spec.name)}] = { hash: ${J(spec.hash)}, n: ${n}, parts: [] };
st.parts[${i}] = ${J(p)};
return { staged: ${i}, n: ${n} };`,
  }));
  calls.push({
    label: `link ${spec.name} (${n} chunks)`,
    code: `${PP_INIT}
const st = __pp.stage[${J(spec.name)}];
if (!st || st.hash !== ${J(spec.hash)} || st.parts.length !== ${n}) throw new Error("STAGE_INCOMPLETE: " + ${J(spec.name)});
for (let i = 0; i < ${n}; i++) if (typeof st.parts[i] !== "string") throw new Error("STAGE_INCOMPLETE: " + ${J(spec.name)} + " part " + i);
const src = st.parts.join("");
delete __pp.stage[${J(spec.name)}];
const fn = new Function("penpot", "penpotUtils", "storage", "console", "return (async () => {\\n" + src + "\\n;\\n" + ${J(tail)} + "\\n})();");
return await fn(typeof penpot === "undefined" ? undefined : penpot, typeof penpotUtils === "undefined" ? undefined : penpotUtils, storage, console);`,
  });
  return calls;
}

/** Flatten data into [path, value] entries small enough to ship, containers first. */
function flatten(value, limit, path = [], out = []) {
  const isContainer = value && typeof value === "object";
  if (!isContainer || jsonBytes(value) + jsonBytes(path) <= limit) { out.push([path, value]); return out; }
  out.push([path, Array.isArray(value) ? [] : {}]);
  for (const [k, v] of Object.entries(value)) flatten(v, limit, [...path, Array.isArray(value) ? Number(k) : k], out);
  return out;
}

function planData(spec, chunkBytes) {
  const budget = chunkBytes - ENVELOPE;
  const entries = flatten(spec.data, budget);
  const groups = [];
  let g = [], gb = 0;
  for (const e of entries) {
    const b = jsonBytes(e) + 1;
    if (gb + b > budget && g.length) { groups.push(g); g = []; gb = 0; }
    g.push(e); gb += b;
  }
  if (g.length) groups.push(g);
  const n = groups.length, key = J(spec.storageKey);
  return groups.map((grp, i) => ({
    label: `data ${spec.name} ${i + 1}/${n}`,
    code: `${PP_INIT}
${i === 0 ? `delete __pp.mods[${J(spec.name)}];` : `if (storage[${key}] === undefined) throw new Error("STAGE_INCOMPLETE: " + ${J(spec.name)});`}
for (const [p, v] of ${J(grp)}) {
  if (!p.length) { storage[${key}] = v; continue; }
  let o = storage[${key}];
  for (let i = 0; i < p.length - 1; i++) o = o[p[i]];
  o[p[p.length - 1]] = v;
}
${i === n - 1 ? `__pp.mods[${J(spec.name)}] = { hash: ${J(spec.hash)}, exports: [], key: ${key}, t: Date.now() };` : ""}
return { module: ${J(spec.name)}, chunk: ${i + 1}, of: ${n} };`,
  }));
}

/**
 * Load modules into the plugin, skipping those whose hash (in storage.__pp.mods) matches and whose
 * exports are present. cascade=true reloads every module after the first dirty one (later modules may
 * capture values from earlier ones at load time).
 */
export async function bootModules(client, specs, { force = false, cascade = true, chunkBytes = client.cfg?.chunkBytes ?? 90_000, log = () => {} } = {}) {
  const t0 = Date.now();
  let calls = 0;
  let status = {};
  if (!force) {
    const chk = await client.exec(checkModulesCode(specs), { label: "boot check", wrap: false, heavy: false });
    calls++;
    if (!chk.ok) return { ok: false, kind: chk.kind, error: `boot check failed: ${chk.text}`, calls, ms: Date.now() - t0 };
    status = chk.result ?? {};
  }
  const firstDirty = specs.findIndex((s) => !status[s.name]);
  const dirty = new Set(specs.filter((s, i) => force || !status[s.name] || (cascade && firstDirty !== -1 && i >= firstDirty)).map((s) => s.name));
  const loaded = [], skipped = specs.filter((s) => !dirty.has(s.name)).map((s) => s.name);

  // Group consecutive single-call modules into batches when batch_execute is available.
  const queue = specs.filter((s) => dirty.has(s.name)).map((s) => ({ spec: s, plan: planModule(s, chunkBytes) }));
  for (let qi = 0; qi < queue.length; qi++) {
    const { spec, plan } = queue[qi];
    if (client.caps?.batch && plan.length === 1) {
      const group = [queue[qi]];
      let bytes = jsonBytes(plan[0].code);
      while (qi + 1 < queue.length && queue[qi + 1].plan.length === 1 && bytes + jsonBytes(queue[qi + 1].plan[0].code) + 2000 <= client.cfg.maxBodyBytes) {
        qi++; group.push(queue[qi]); bytes += jsonBytes(queue[qi].plan[0].code);
      }
      if (group.length > 1) {
        const res = await client.execBatch(group.map((g) => g.plan[0].code), { label: `load ${group.map((g) => g.spec.name).join("+")}` });
        calls++;
        const bad = res.findIndex((r) => !r.ok);
        if (bad !== -1 || res.length !== group.length) {
          const r = res[bad] ?? res[res.length - 1];
          return { ok: false, kind: r?.kind, module: group[Math.max(0, bad)].spec.name, error: r?.text, loaded, skipped, calls, ms: Date.now() - t0 };
        }
        for (const g of group) { loaded.push(g.spec.name); log(`loaded ${g.spec.name} (batch)`); }
        continue;
      }
    }
    let attempt = 0;
    for (let ci = 0; ci < plan.length; ci++) {
      const c = plan[ci];
      const r = await client.exec(c.code, { label: c.label, wrap: false, heavy: false });
      calls++;
      if (r.ok) continue;
      if (r.kind === KIND.STAGE_INCOMPLETE && attempt++ < 2) { log(`${spec.name}: staging lost, restarting`); ci = -1; continue; }
      return { ok: false, kind: r.kind, module: spec.name, error: r.text, loaded, skipped, calls, ms: Date.now() - t0 };
    }
    loaded.push(spec.name);
    log(`loaded ${spec.name} (${plan.length} call${plan.length > 1 ? "s" : ""})`);
  }
  return { ok: true, loaded, skipped, calls, ms: Date.now() - t0 };
}
