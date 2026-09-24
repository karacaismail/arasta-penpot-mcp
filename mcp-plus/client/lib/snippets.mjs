// JavaScript snippets that run *inside* the Penpot plugin (execute_code bodies).
// Everything the toolkit keeps in the plugin lives under `storage.__pp`:
//   mods    : { [moduleName]: { hash, exports, t } }   -> hash-skip + BOOT_REQUIRED guard
//   stage   : { [moduleName]: { hash, n, parts[] } }    -> chunked module staging
//   running : { id, label, t0 } | null                  -> "possibly running" marker, cleared in finally
//   last    : { id, label, ms, ok }                     -> last finished wrapped task
//   results : { [execId]: { ok, result?, error?, t1 } } -> results of recent tasks (recover after timeout)
//   order   : execId[]                                  -> bounded FIFO for results

export const PP_INIT = `const __pp = (storage.__pp ??= {}); __pp.mods ??= {}; __pp.stage ??= {}; __pp.results ??= {}; __pp.order ??= [];`;

const J = (v) => JSON.stringify(v);

/**
 * Wrap a task body so the plugin records running/last/results markers.
 * The body is used as the body of an async function, exactly like execute_code does.
 */
export function wrapTask(body, id, label = "", { keepResultBytes = 50000, keepResults = 30 } = {}) {
  return `${PP_INIT}
const __id = ${J(id)}, __t0 = Date.now();
__pp.running = { id: __id, label: ${J(label)}, t0: __t0 };
let __ok = false, __res, __err;
try {
  __res = await (async () => {
${body}
  })();
  __ok = true;
  return __res;
} catch (e) { __err = e; throw e; }
finally {
  const t1 = Date.now();
  let rec;
  if (__ok) {
    try { const s = JSON.stringify(__res); rec = (s === undefined || s.length <= ${keepResultBytes}) ? { ok: true, result: __res, t1 } : { ok: true, truncated: true, t1 }; }
    catch { rec = { ok: true, unserializable: true, t1 }; }
  } else rec = { ok: false, error: String((__err && __err.message) || __err), t1 };
  __pp.results[__id] = rec; __pp.order.push(__id);
  while (__pp.order.length > ${keepResults}) delete __pp.results[__pp.order.shift()];
  __pp.last = { id: __id, label: ${J(label)}, ms: t1 - __t0, ok: __ok };
  if (__pp.running && __pp.running.id === __id) __pp.running = null;
}`;
}

/** Cheap liveness probe. Never touches the document. Optionally fetches a stored result. */
export function probeCode(resultId) {
  return `const p = storage.__pp;
return { alive: true, booted: !!(p && p.mods && Object.keys(p.mods).length), running: (p && p.running) || null, last: (p && p.last) || null, result: ${resultId ? `(p && p.results && p.results[${J(resultId)}]) || null` : "undefined"}, now: Date.now() };`;
}

/** Returns which of the given modules are loaded with the expected hash and all exports present as globals. */
export function checkModulesCode(mods) {
  const spec = mods.map((m) => ({ n: m.name, h: m.hash, e: m.exports, k: m.storageKey || null }));
  return `const p = storage.__pp, mods = (p && p.mods) || {};
const out = {};
for (const m of ${J(spec)}) {
  const cur = mods[m.n];
  out[m.n] = !!cur && cur.hash === m.h && m.e.every((x) => typeof globalThis[x] !== "undefined") && (!m.k || storage[m.k] !== undefined);
}
return out;`;
}

/** Guard prepended to runner tasks: throws BOOT_REQUIRED if any module/global/storage key is missing or stale. */
export function guardCode({ mods = [], globals = [], storageKeys = [] } = {}) {
  const spec = mods.map((m) => [m.name, m.hash]);
  return `{ const __m = (storage.__pp && storage.__pp.mods) || {};
  for (const [n, h] of ${J(spec)}) if (!__m[n] || __m[n].hash !== h) throw new Error("BOOT_REQUIRED: module " + n);
  for (const g of ${J(globals)}) if (typeof globalThis[g] === "undefined") throw new Error("BOOT_REQUIRED: global " + g);
  for (const k of ${J(storageKeys)}) if (storage[k] === undefined || storage[k] === null) throw new Error("BOOT_REQUIRED: storage." + k); }`;
}
