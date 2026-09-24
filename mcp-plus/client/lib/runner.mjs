// Job runner: manifest -> ordered tasks -> sequential execution with retries, auto-reboot, checkpoint/resume,
// per-attempt JSONL and a summary report (p50/p95, failures, retries).
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import YAML from "yaml";
import { randomUUID } from "node:crypto";
import { KIND, WAITABLE, sha, sleep, stats, backoff, writeJsonAtomic, appendJsonl } from "./util.mjs";
import { loadModuleSpec, bootModules } from "./modules.mjs";
import { guardCode } from "./snippets.mjs";

export const DEFAULT_POLICY = { retries: 3, reboots: 3, retryBackoffMs: 5000, failPattern: null, continueOnFailure: true, settleMs: {} };
// settleMs: { <step>: ms } -> after a successful task of that step ("batch" | "after"), sleep then wait for idle
// (e.g. the Penpot UI keeps re-rendering for a while after ARRANGE moves many large boards).

/** Parse `page|key` lines (mcp-client/v2/pages.txt format). */
export function parsePagesFile(text) {
  return text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => {
    const [page, key] = l.split("|");
    return { page, key };
  });
}

export function loadManifest(path) {
  const abs = resolve(path);
  const text = readFileSync(abs, "utf8");
  const m = abs.endsWith(".json") ? JSON.parse(text) : YAML.parse(text);
  m.__path = abs;
  m.__dir = dirname(abs);
  return normalizeManifest(m);
}

export function normalizeManifest(m) {
  const dir = m.__dir ?? process.cwd();
  const base = m.baseDir ? resolve(dir, m.baseDir) : dir;
  const out = { ...m, name: m.name ?? (m.__path ? basename(m.__path).replace(/\.(ya?ml|json)$/, "") : "job"), baseDir: base };
  out.policy = { ...DEFAULT_POLICY, ...(m.policy ?? {}) };
  out.modules = m.modules ?? [];
  out.require = { globals: [], storage: [], ...(m.require ?? {}) };
  out.batches = typeof m.batches === "string" ? m.batches.split(/\s+/).filter(Boolean) : m.batches ?? [];
  let pages = m.pages ?? [];
  if (m.pagesFile) pages = [...pages, ...parsePagesFile(readFileSync(resolve(base, m.pagesFile), "utf8"))];
  out.pages = pages;
  out.templates = m.templates ?? {};
  if (!out.templates.batch) throw new Error("manifest needs templates.batch");
  out.checkpoint = resolve(dir, m.checkpoint ?? `state/${out.name}.checkpoint.json`);
  out.report = resolve(dir, m.report ?? `state/${out.name}.report.jsonl`);
  return out;
}

/** Render a template: {{var}} -> JSON literal, {{raw:var}} -> raw text. */
export function render(tpl, vars) {
  return tpl.replace(/\{\{\s*(raw:)?([\w.]+)\s*\}\}/g, (_, raw, k) => {
    if (!(k in vars)) throw new Error(`template variable '${k}' not defined`);
    return raw ? String(vars[k]) : JSON.stringify(vars[k]);
  });
}

/** Expand manifest into a flat ordered task list with stable ids. */
export function expandTasks(m, { only = null } = {}) {
  const onlySet = only ? new Set(only) : m.only ? new Set(m.only) : null;
  const tasks = [];
  for (const p of m.pages) {
    if (onlySet && !onlySet.has(p.key)) continue;
    const vars = { ...p, title: p.title ?? String(p.page).replace(/^\d+ · /, "") };
    const batches = typeof p.batches === "string" ? p.batches.split(/\s+/) : p.batches ?? m.batches;
    for (const b of batches) {
      const ids = String(b).split(",");
      tasks.push({ id: `${p.key}:${b}`, key: p.key, step: "batch", body: render(m.templates.batch, { ...vars, batch: b, ids }) });
    }
    if (m.templates.after && p.after !== false) tasks.push({ id: `${p.key}:after`, key: p.key, step: "after", body: render(m.templates.after, vars) });
  }
  return tasks;
}

function emptyCheckpoint(m, tasks) {
  return { version: 1, name: m.name, manifestHash: sha(JSON.stringify(tasks.map((t) => [t.id, t.body]))).slice(0, 16), created: new Date().toISOString(), runs: 0, tasks: {}, inflight: null, counters: { reboots: 0, recovered: 0, crashRecovered: 0 } };
}

export function summarize(cp, tasks, extra = {}) {
  const ids = tasks.map((t) => t.id);
  const rec = ids.map((id) => cp.tasks[id]).filter(Boolean);
  const done = rec.filter((r) => r.status === "done");
  const failed = ids.filter((id) => cp.tasks[id]?.status === "failed");
  const byKey = {};
  for (const t of tasks) { const r = cp.tasks[t.id]; if (r?.status === "done") (byKey[t.key] ??= []).push(r.ms); }
  return {
    name: cp.name, runs: cp.runs, updated: new Date().toISOString(),
    tasks: { total: ids.length, done: done.length, failed: failed.length, pending: ids.length - done.length - failed.length },
    attempts: rec.reduce((a, r) => a + (r.attempts ?? 0), 0),
    retries: rec.reduce((a, r) => a + Math.max(0, (r.attempts ?? 1) - 1), 0),
    reboots: cp.counters.reboots, recovered: cp.counters.recovered, crashRecovered: cp.counters.crashRecovered,
    durationsMs: stats(done.map((r) => r.ms)),
    byKey: Object.fromEntries(Object.entries(byKey).map(([k, v]) => [k, stats(v)])),
    failures: failed.map((id) => ({ id, kind: cp.tasks[id].kind, error: String(cp.tasks[id].error ?? "").slice(0, 300), attempts: cp.tasks[id].attempts })),
    ...extra,
  };
}

export function formatSummary(s) {
  const d = s.durationsMs;
  const f = (x) => (x == null ? "-" : `${(x / 1000).toFixed(1)}s`);
  const lines = [
    `job ${s.name}: ${s.tasks.done}/${s.tasks.total} done, ${s.tasks.failed} failed, ${s.tasks.pending} pending  (runs=${s.runs})`,
    `attempts=${s.attempts} retries=${s.retries} reboots=${s.reboots} recovered-after-timeout=${s.recovered} recovered-after-crash=${s.crashRecovered}`,
    `task duration: n=${d.n ?? 0} p50=${f(d.p50)} p95=${f(d.p95)} max=${f(d.max)} total=${f(d.total)}`,
  ];
  for (const [k, v] of Object.entries(s.byKey)) lines.push(`  ${k.padEnd(14)} n=${v.n} p50=${f(v.p50)} p95=${f(v.p95)} max=${f(v.max)}`);
  for (const x of s.failures) lines.push(`  FAILED ${x.id} [${x.kind}] after ${x.attempts} attempts: ${x.error}`);
  return lines.join("\n");
}

/**
 * Run a manifest. `client` is a connected PPClient (or daemon proxy with the same interface).
 * Resumable: tasks already marked done in the checkpoint are skipped; an in-flight task left by a crash
 * is recovered from the plugin's result store if it actually finished.
 */
export async function runJob(client, m, { fresh = false, only = null, boot = true, batches = null, log = console.log, shouldStop = () => false } = {}) {
  if (batches) m = { ...m, batches: typeof batches === "string" ? batches.split(/\s+/).filter(Boolean) : batches };
  const tasks = expandTasks(m, { only });
  const specs = m.modules.map((e) => loadModuleSpec(e, m.baseDir));
  const guard = guardCode({ mods: specs, globals: m.require.globals, storageKeys: m.require.storage });
  let cp = !fresh && existsSync(m.checkpoint) ? JSON.parse(readFileSync(m.checkpoint, "utf8")) : emptyCheckpoint(m, tasks);
  const fresh0 = emptyCheckpoint(m, tasks);
  if (cp.manifestHash !== fresh0.manifestHash) log(`note: manifest changed since checkpoint (${cp.manifestHash} -> ${fresh0.manifestHash}); done tasks are matched by id`);
  cp.manifestHash = fresh0.manifestHash;
  cp.runs++;
  const save = () => { cp.updated = new Date().toISOString(); writeJsonAtomic(m.checkpoint, cp); };
  const ev = (type, data) => appendJsonl(m.report, { ts: new Date().toISOString(), run: cp.runs, type, ...data });
  const policy = m.policy;
  const failRe = policy.failPattern ? new RegExp(policy.failPattern) : null;
  const t0 = Date.now();
  save();
  ev("run_start", { tasks: tasks.length, done: tasks.filter((t) => cp.tasks[t.id]?.status === "done").length });

  const doBoot = async (why) => {
    if (!specs.length) return { ok: true, loaded: [], skipped: [] };
    const b = await bootModules(client, specs, { log: (s) => log(`  boot: ${s}`) });
    ev("boot", { why, ok: b.ok, loaded: b.loaded, skipped: b.skipped, calls: b.calls, ms: b.ms, error: b.error });
    log(`[boot:${why}] ${b.ok ? "ok" : "FAILED"} loaded=${(b.loaded ?? []).length} skipped=${(b.skipped ?? []).length} calls=${b.calls} ${b.ms}ms${b.error ? " " + String(b.error).slice(0, 200) : ""}`);
    return b;
  };

  // Crash recovery: a task was in flight when the previous runner died.
  if (cp.inflight) {
    const inf = cp.inflight;
    log(`resume: task ${inf.id} was in flight (exec ${inf.execId}); checking plugin result store`);
    client.adoptPossiblyRunning({ id: inf.execId, label: inf.id, since: Date.parse(inf.at) || Date.now() });
    const r = await client.fetchResult(inf.execId);
    if (r?.ok && !(failRe && failRe.test(JSON.stringify(r.result ?? null)))) {
      cp.tasks[inf.id] = { status: "done", attempts: inf.attempt, ms: r.ms ?? null, at: new Date().toISOString(), recoveredAfterCrash: true, result: summarizeResult(r.result) };
      cp.counters.crashRecovered++;
      ev("crash_recovered", { taskId: inf.id, execId: inf.execId });
      log(`resume: ${inf.id} had completed in the plugin -> marked done without re-running`);
    }
    cp.inflight = null;
    save();
  }

  if (boot) {
    const b = await doBoot("start");
    if (!b.ok) { ev("run_abort", { reason: "boot failed" }); return finish(); }
  }

  for (const t of tasks) {
    if (shouldStop()) { log("stop requested; checkpoint saved"); break; }
    const prev = cp.tasks[t.id];
    if (prev?.status === "done") continue;
    let attempts = prev?.status === "failed" ? 0 : prev?.attempts ?? 0;
    let reboots = 0;
    const code = `${guard}\n${t.body}`;
    while (true) {
      attempts++;
      const execId = randomUUID();
      cp.inflight = { id: t.id, execId, attempt: attempts, at: new Date().toISOString() };
      save();
      const r = await client.exec(code, { label: t.id, execId });
      let kind = r.kind, ok = r.ok, text = r.text;
      const resStr = ok ? JSON.stringify(r.result ?? null) : "";
      if (ok && failRe && failRe.test(resStr)) { ok = false; kind = "result_fail"; text = resStr; }
      ev("attempt", { taskId: t.id, attempt: attempts, ok, kind, ms: r.ms, waitedMs: r.waitedMs ?? 0, recovered: !!r.recovered, via: r.via, out: (ok ? resStr : String(text ?? "")).slice(0, 500) });
      if (r.recovered && r.ok) cp.counters.recovered++;
      if (ok) {
        cp.tasks[t.id] = { status: "done", attempts, ms: r.ms, at: new Date().toISOString(), recovered: !!r.recovered, result: summarizeResult(r.result) };
        cp.inflight = null; save();
        log(`[${new Date().toTimeString().slice(0, 8)}] ${t.id} ok ${r.ms}ms${r.recovered ? " (recovered after " + r.originalKind + ")" : ""}${attempts > 1 ? ` attempt ${attempts}` : ""} :: ${resStr.slice(0, 200)}`);
        const settle = policy.settleMs?.[t.step];
        if (settle) { await sleep(settle); const w = await client.waitIdle({ reason: `settle after ${t.id}` }); ev("settle", { taskId: t.id, ms: settle, waitedMs: w.waitedMs, ok: w.ok }); }
        break;
      }
      cp.inflight = null;
      if (kind === KIND.BOOT_REQUIRED && !specs.length) {
        cp.tasks[t.id] = { status: "failed", attempts, kind, error: `${String(text).slice(0, 500)} (no modules configured to reboot: set manifest.modules / --modules)`, at: new Date().toISOString() };
        save(); log(`${t.id}: BOOT_REQUIRED but no modules configured -> failed`);
        break;
      }
      if (kind === KIND.BOOT_REQUIRED && reboots < policy.reboots) {
        reboots++; cp.counters.reboots++; attempts--; save();
        log(`${t.id}: BOOT_REQUIRED (${String(text).slice(0, 120)}) -> reboot ${reboots}/${policy.reboots}`);
        const b = await doBoot("BOOT_REQUIRED");
        if (!b.ok) await sleep(backoff(reboots, { baseMs: policy.retryBackoffMs }));
        continue;
      }
      log(`${t.id}: attempt ${attempts} failed [${kind}] ${String(text).slice(0, 200)}`);
      if (attempts > policy.retries) {
        cp.tasks[t.id] = { status: "failed", attempts, kind, error: String(text).slice(0, 2000), at: new Date().toISOString() };
        save();
        break;
      }
      cp.tasks[t.id] = { status: "retrying", attempts, kind };
      save();
      // Waitable kinds: the client already refuses to send until the plugin is idle; add a small backoff.
      await sleep(WAITABLE.has(kind) ? Math.min(2000, policy.retryBackoffMs) : backoff(attempts - 1, { baseMs: policy.retryBackoffMs, capMs: 60_000 }));
    }
    if (cp.tasks[t.id]?.status === "failed" && !policy.continueOnFailure) { log("stopping: continueOnFailure=false"); break; }
  }
  return finish();

  function finish() {
    save();
    const s = summarize(cp, tasks, { wallMs: Date.now() - t0, client: client.metrics ?? null });
    writeJsonAtomic(m.report.replace(/\.jsonl$/, "") + ".summary.json", s);
    ev("run_end", { summary: { ...s, client: undefined } });
    return s;
  }
}

function summarizeResult(r) {
  const s = JSON.stringify(r ?? null);
  return s.length > 400 ? s.slice(0, 400) + "…" : r;
}
