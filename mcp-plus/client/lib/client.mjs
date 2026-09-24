// PPClient: one long-lived MCP session with smart waiting, result recovery and capability detection.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { KIND, POSSIBLY_RUNNING, WAITABLE, classify, sleep, jsonBytes, appendJsonl, writeJsonAtomic, backoff, assertAllowedUrl, Mutex } from "./util.mjs";
import { wrapTask, probeCode } from "./snippets.mjs";

export const DEFAULTS = {
  maxBodyBytes: 100_000, // server (body-parser) hard cap on the whole JSON-RPC body
  chunkBytes: 90_000, // our own cap per code chunk (JSON-escaped), leaves room for the envelope
  clientTimeoutMs: 150_000, // > server's 120 s task timeout so we normally see the server's own message
  probeTimeoutMs: 45_000,
  wait: { baseMs: 3000, factor: 2, capMs: 60_000, maxWaitMs: 20 * 60_000, graceMs: 2000, staleRunningMs: 60 * 60_000 },
  jobPollMs: 1000, // only used if job_status has no wait_s (long-poll) parameter
  jobWaitS: 25, // job_status long-poll per call; server caps at PENPOT_MCP_JOB_MAX_WAIT_S (default 50)
  jobTimeoutMs: 60 * 60_000, // our budget; also sent as submit_code.timeout_s (server caps at PENPOT_MCP_JOB_TIMEOUT_S)
  jobGraceMs: 15_000, // extra time for the server to report its own timed_out before we cancel_job
};

/**
 * Inspect the server's tool list and decide which features we can use.
 *
 * Targets the real "mcp-plus" fork (server-fork/mcp/packages/server/src/tools/PlusTools.ts, JobManager.ts):
 *   submit_code   { code | chunks[], stop_on_error?, timeout_s? }  -> { jobId, state: "running", timeoutS, hint }
 *   job_status    { job_id, wait_s? }                               -> { jobId, state, elapsedS, timeoutS, chunks, completedChunks,
 *                                                                      currentChunk?, currentTaskState?, error?, result?, log?, results?, note? }
 *                 state: running | succeeded | failed | cancelled | timed_out
 *   cancel_job    { job_id }                                        -> { jobId, previousState, cancelledTaskWas, ...job_status fields }
 *   batch_execute { chunks: string[], stop_on_error? }              -> { ok, executed, total, totalMs, results: [{ index, ok, durationMs, result?, log?, error? }] }
 *   server_stats  {}                                                -> { server, sessions, plugins, jobs }
 * Tool errors arrive as a normal text result "Tool execution failed: Error: ...".
 * A tool whose input schema lacks the expected fields is NOT used (plain execute_code fallback) and is
 * listed in caps.incompatible, instead of being called with guessed arguments.
 */
export function detectCaps(tools, { noEnhanced = false } = {}) {
  const by = new Map(tools.map((t) => [t.name, t]));
  const props = (t) => t?.inputSchema?.properties ?? {};
  const has = (t, k) => Object.hasOwn(props(t), k);
  const caps = { tools: [...by.keys()], execute: by.has("execute_code"), jobs: null, cancel: null, batch: null, stats: null, incompatible: [] };
  if (noEnhanced) return caps;
  const bad = (name) => { if (by.has(name)) caps.incompatible.push(name); };
  const submit = by.get("submit_code"), status = by.get("job_status");
  if (submit && status && has(submit, "code") && has(status, "job_id")) {
    caps.jobs = {
      submit: "submit_code", status: "job_status",
      timeoutKey: has(submit, "timeout_s") ? "timeout_s" : null,
      waitKey: has(status, "wait_s") ? "wait_s" : null,
    };
  } else { bad("submit_code"); bad("job_status"); }
  const cancel = by.get("cancel_job");
  if (cancel && caps.jobs && has(cancel, "job_id")) caps.cancel = { name: "cancel_job" };
  else bad("cancel_job");
  const batch = by.get("batch_execute");
  const chunks = props(batch).chunks;
  if (batch && chunks?.type === "array" && (chunks.items?.type ?? "string") === "string") {
    caps.batch = { name: "batch_execute", maxChunks: Number.isInteger(chunks.maxItems) ? chunks.maxItems : Infinity, stopKey: has(batch, "stop_on_error") ? "stop_on_error" : null };
  } else bad("batch_execute");
  if (by.has("server_stats")) caps.stats = { name: "server_stats" };
  return caps;
}

/** Job states of the server's JobManager. */
const JOB_TERMINAL = new Set(["succeeded", "failed", "cancelled", "timed_out"]);

function tryJson(s) { try { return JSON.parse(s); } catch { return undefined; } }

/** Normalise execute_code output text {"result":..,"log":..} into fields. */
export function parseExecText(text) {
  if (/^Code executed successfully with no return value/.test(text)) return { result: undefined, log: "" };
  const j = tryJson(text);
  if (j && typeof j === "object" && "result" in j) return { result: j.result, log: j.log ?? "" };
  return { result: j ?? text, log: "" };
}

export class PPClient {
  constructor(opts = {}) {
    this.url = opts.url;
    this.name = opts.name ?? "pp-plus";
    this.logPath = opts.logPath ?? null;
    this.statePath = opts.statePath ?? null; // persists possiblyRunning across processes (one-shot CLI mode)
    this.onEvent = opts.onEvent ?? (() => {});
    this.cfg = { ...DEFAULTS, ...opts, wait: { ...DEFAULTS.wait, ...(opts.wait ?? {}) } };
    this.noEnhanced = opts.noEnhanced ?? process.env.PP_NO_ENHANCED === "1";
    this.mutex = new Mutex();
    this.possiblyRunning = null;
    this.lastHeavyEnd = 0;
    this.client = null;
    this.transport = null;
    this.caps = null;
    this.metrics = { calls: 0, byTool: {}, byKind: {}, sessions: 0, reconnects: 0, probes: 0, waits: 0, waitedMs: 0, recovered: 0, bytesSent: 0 };
    if (this.statePath && existsSync(this.statePath)) {
      try { this.possiblyRunning = JSON.parse(readFileSync(this.statePath, "utf8")).possiblyRunning ?? null; } catch {}
    }
  }

  #event(type, data = {}) {
    const ev = { ts: new Date().toISOString(), type, ...data };
    appendJsonl(this.logPath, ev);
    this.onEvent(ev);
  }

  #persist() {
    if (this.statePath) writeJsonAtomic(this.statePath, { possiblyRunning: this.possiblyRunning, at: new Date().toISOString() });
  }

  #setPossiblyRunning(v) { this.possiblyRunning = v; this.#persist(); }

  get sessionId() { return this.transport?.sessionId ?? null; }

  async connect({ attempts = 3 } = {}) {
    if (!this.url) throw new Error("No MCP URL configured (use --url, PENPOT_MCP_URL or a .mcp-url file)");
    assertAllowedUrl(this.url);
    for (let i = 1; ; i++) {
      this.client = new Client({ name: this.name, version: "0.1.0" });
      this.transport = new StreamableHTTPClientTransport(new URL(this.url));
      try { await this.client.connect(this.transport); break; }
      catch (e) {
        // stale keep-alive socket after a server restart -> fresh attempt
        if (i >= attempts || !/ECONNRESET|socket hang up|fetch failed|other side closed/i.test(`${e?.message} ${e?.cause?.message}`)) throw e;
        await sleep(200 * i);
      }
    }
    this.metrics.sessions++;
    const { tools } = await this.client.listTools();
    this.caps = detectCaps(tools, { noEnhanced: this.noEnhanced });
    this.#event("connect", { session: this.sessionId, tools: this.caps.tools, jobs: !!this.caps.jobs, batch: !!this.caps.batch, stats: !!this.caps.stats, incompatible: this.caps.incompatible });
    return this;
  }

  async close() {
    if (!this.client) return;
    const sid = this.sessionId;
    try { await this.transport.terminateSession(); } catch {}
    try { await this.client.close(); } catch {}
    this.client = this.transport = null;
    this.#event("close", { session: sid });
  }

  async reconnect(reason) {
    this.metrics.reconnects++;
    this.#event("reconnect", { reason });
    await this.close();
    await this.connect();
  }

  /** Low-level tool call. Never throws; returns { ok, kind, text, content, ms }. */
  async callTool(name, args = {}, { label = "", timeoutMs = this.cfg.clientTimeoutMs, retryTransport = true } = {}) {
    if (!this.client) await this.connect();
    const bytes = jsonBytes(args);
    const t0 = Date.now();
    let res, err;
    try {
      res = await this.client.callTool({ name, arguments: args }, undefined, { timeout: timeoutMs, maxTotalTimeout: timeoutMs });
    } catch (e) { err = e; }
    const ms = Date.now() - t0;
    const text = res ? (res.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("\n") : String(err?.message ?? err);
    const kind = classify(text, { isError: !!res?.isError, thrown: !!err });
    // Session expired / server restarted: request never reached the plugin, safe to reconnect + retry once.
    if (err && retryTransport && /Session not found|No valid session|session.*(expired|invalid)|HTTP 404|ECONNRESET|socket hang up/i.test(text)) {
      await this.reconnect(text.slice(0, 200)).catch(() => {});
      return this.callTool(name, args, { label, timeoutMs, retryTransport: false });
    }
    this.metrics.calls++;
    this.metrics.bytesSent += bytes;
    this.metrics.byTool[name] = (this.metrics.byTool[name] ?? 0) + 1;
    this.metrics.byKind[kind] = (this.metrics.byKind[kind] ?? 0) + 1;
    this.#event("call", { session: this.sessionId, tool: name, label, ms, bytes, kind, ok: kind === KIND.OK, out: text.slice(0, 1500) });
    return { ok: kind === KIND.OK, kind, text, content: res?.content ?? [], ms };
  }

  /** Plain execute_code; result parsed. */
  async #execPlain(code, label, timeoutMs) {
    const r = await this.callTool("execute_code", { code }, { label, timeoutMs });
    if (r.ok) Object.assign(r, parseExecText(r.text));
    return r;
  }

  /** Enhanced server: submit + poll job_status (server keeps the job; no 120 s tool timeout for us). */
  async #execJob(code, label) {
    const j = this.caps.jobs;
    const args = { code };
    if (j.timeoutKey) args[j.timeoutKey] = Math.max(1, Math.ceil(this.cfg.jobTimeoutMs / 1000));
    // The server enforces timeout_s itself and reports "timed_out"; we only give up (and cancel_job) after a grace.
    const budgetMs = this.cfg.jobTimeoutMs + (j.timeoutKey ? this.cfg.jobGraceMs : 0);
    const t0 = Date.now();
    const sub = await this.callTool(j.submit, args, { label });
    const sj = tryJson(sub.text);
    const jobId = sj?.jobId;
    // not JSON: e.g. "Tool execution failed: Error: Too many unfinished jobs ..." -> nothing was dispatched
    if (!jobId) return sub.ok ? { ...sub, ok: false, kind: KIND.ERROR, text: `submit_code returned no jobId: ${sub.text.slice(0, 200)}` } : sub;
    this.#event("job_submitted", { label, jobId, timeoutS: sj.timeoutS });
    let polls = 0;
    while (Date.now() - t0 < budgetMs) {
      const sargs = { job_id: jobId };
      // wait_s may be fractional (server: setTimeout(wait_s * 1000)); never long-poll past our own budget
      const waitS = j.waitKey ? Math.max(0.2, Math.min(this.cfg.jobWaitS, Math.round((budgetMs - (Date.now() - t0)) / 100) / 10)) : 0;
      if (j.waitKey) sargs[j.waitKey] = waitS;
      const st = await this.callTool(j.status, sargs, { label: `${label} status`, timeoutMs: waitS * 1000 + 30_000 });
      polls++;
      const ms = Date.now() - t0;
      // A job_status reply is JSON; callTool's text classifier may have flagged it because the embedded error text
      // mentions e.g. BOOT_REQUIRED / "timed out", so decide on the parsed state, not on st.ok.
      const s = tryJson(st.text);
      const state = typeof s?.state === "string" ? s.state : null;
      if (state === null) {
        // The server lost the job (restart / retention expired): the code may or may not have run in the tab.
        // Report it as possibly-running so #exec waits for idle and recovers the wrapper's stored result.
        if (/Unknown job id/i.test(st.text)) return { ok: false, kind: KIND.CLIENT_TIMEOUT, text: `job ${jobId} lost on the server: ${st.text.slice(0, 300)}`, ms, jobId, polls };
        if (!st.ok && WAITABLE.has(st.kind)) { await sleep(backoff(Math.min(polls, 5), { baseMs: 500, capMs: 10_000 })); continue; }
        return { ...st, ok: false, kind: st.ok ? KIND.ERROR : st.kind, text: st.ok ? `unexpected job_status reply: ${st.text.slice(0, 300)}` : st.text, jobId, polls };
      }
      if (state === "succeeded") {
        // single-chunk job: result/log are the raw plugin values (like execute_code's {"result","log"})
        return { ok: true, kind: KIND.OK, text: st.text, result: s.result, log: s.log ?? "", ms, jobId, polls, elapsedS: s.elapsedS };
      }
      if (JOB_TERMINAL.has(state)) {
        const text = String(s.error ?? `job ${state}`);
        let kind = classify(text);
        if (kind === KIND.OK) kind = KIND.ERROR;
        // timed_out / cancelled: code already dispatched to the tab may still complete there (server "note").
        if (state === "timed_out") kind = KIND.TIMEOUT;
        if (state === "cancelled") kind = KIND.CLIENT_TIMEOUT;
        return { ok: false, kind, text, ms, jobId, polls, jobState: state };
      }
      if (state !== "running") return { ok: false, kind: KIND.ERROR, text: `unexpected job state: ${st.text.slice(0, 300)}`, ms, jobId, polls };
      if (!j.waitKey) await sleep(Math.min(this.cfg.jobPollMs * Math.pow(1.5, Math.min(polls, 6)), 5000));
    }
    if (this.caps.cancel) await this.callTool(this.caps.cancel.name, { job_id: jobId }, { label: `${label} cancel` });
    return { ok: false, kind: KIND.CLIENT_TIMEOUT, text: `job ${jobId} exceeded ${budgetMs} ms (cancel_job sent)`, ms: Date.now() - t0, jobId };
  }

  /** Cheap liveness probe (unwrapped, light). Optionally fetches the stored result of execId. */
  async probe({ resultId = null } = {}) {
    this.metrics.probes++;
    const r = await this.#execPlain(probeCode(resultId), "probe", this.cfg.probeTimeoutMs);
    if (!r.ok) return { ok: false, kind: r.kind, text: r.text };
    const v = r.result ?? {};
    return { ok: true, running: v.running ?? null, last: v.last ?? null, booted: !!v.booted, result: v.result ?? null, ms: r.ms };
  }

  /**
   * Wait until the plugin is alive AND no wrapped task is marked running.
   * Exponential backoff between probes; a successful idle probe is followed by a grace window
   * (the Penpot UI keeps re-rendering for a while after big mutations).
   */
  async #waitIdle({ reason = "", resultId = null } = {}) {
    const w = this.cfg.wait;
    const t0 = Date.now();
    this.metrics.waits++;
    let attempt = 0, last;
    while (true) {
      const p = await this.probe({ resultId });
      last = p;
      const stale = p.ok && p.running && Date.now() - (p.running.t0 ?? 0) > w.staleRunningMs;
      if (p.ok && (!p.running || stale)) {
        if (w.graceMs > 0) await sleep(w.graceMs);
        const waitedMs = Date.now() - t0;
        this.metrics.waitedMs += waitedMs;
        this.#setPossiblyRunning(null);
        this.#event("idle", { reason, waitedMs, probes: attempt + 1, stale });
        return { ok: true, waitedMs, probes: attempt + 1, result: p.result, last: p.last };
      }
      if (!p.ok && !WAITABLE.has(p.kind)) {
        this.#event("wait_abort", { reason, kind: p.kind, text: p.text?.slice(0, 300) });
        return { ok: false, kind: p.kind, text: p.text, waitedMs: Date.now() - t0 };
      }
      const elapsed = Date.now() - t0;
      if (elapsed >= w.maxWaitMs) break;
      const d = Math.min(backoff(attempt++, w), w.maxWaitMs - elapsed);
      this.#event("wait", { reason, attempt, sleepMs: d, probeKind: p.ok ? "busy" : p.kind, running: p.running?.label ?? null });
      await sleep(d);
    }
    this.metrics.waitedMs += Date.now() - t0;
    return { ok: false, kind: "wait_exhausted", waitedMs: Date.now() - t0, last };
  }

  /** Public: wait for idle (serialised with other plugin calls). */
  waitIdle(opts = {}) { return this.mutex.run(() => this.#waitIdle(opts)); }

  async #ensureIdle(label, { grace = true } = {}) {
    if (this.possiblyRunning) return this.#waitIdle({ reason: `before ${label}: previous '${this.possiblyRunning.label}' may still run` });
    const since = Date.now() - this.lastHeavyEnd;
    if (grace && this.lastHeavyEnd && since < this.cfg.wait.graceMs) await sleep(this.cfg.wait.graceMs - since);
    return { ok: true };
  }

  /**
   * Execute code in the plugin.
   *  heavy : document-mutating task: grace window after the previous heavy task, uses async jobs when
   *          the server offers them (default true). Every exec waits while a previous task may still run.
   *  wrap  : record running/result markers inside the plugin (enables result recovery) (default true)
   */
  exec(code, opts = {}) { return this.mutex.run(() => this.#exec(code, opts)); }

  async #exec(code, { label = "", heavy = true, wrap = true, timeoutMs, recover = true, execId: givenId } = {}) {
    if (!this.client) await this.connect();
    const idle = await this.#ensureIdle(label, { grace: heavy });
    if (!idle.ok) return { ok: false, kind: idle.kind === "wait_exhausted" ? KIND.SUSPENDED : idle.kind, text: `plugin not idle: ${idle.kind}`, ms: 0 };
    const execId = givenId ?? randomUUID();
    const body = wrap ? wrapTask(code, execId, label) : code;
    const bytes = jsonBytes({ code: body }) + 200;
    if (bytes > this.cfg.maxBodyBytes) {
      return { ok: false, kind: KIND.PAYLOAD_TOO_LARGE, text: `refusing to send ${bytes} B (> ${this.cfg.maxBodyBytes}); use the module loader (chunked)`, ms: 0, execId };
    }
    const useJobs = !!this.caps.jobs && heavy;
    let r = useJobs ? await this.#execJob(body, label) : await this.#execPlain(body, label, timeoutMs ?? this.cfg.clientTimeoutMs);
    r.execId = execId;
    r.via = useJobs ? "jobs" : "execute_code";
    if (heavy) this.lastHeavyEnd = Date.now();
    if (POSSIBLY_RUNNING.has(r.kind)) {
      this.#setPossiblyRunning({ id: execId, label, since: Date.now() });
      this.#event("possibly_running", { label, execId, kind: r.kind });
      if (recover && wrap) {
        const w = await this.#waitIdle({ reason: `after ${r.kind} of ${label}`, resultId: execId });
        r.waitedMs = w.waitedMs;
        const rec = w.ok ? w.result : null;
        if (rec && rec.ok) {
          this.metrics.recovered++;
          this.#event("recovered", { label, execId });
          return { ...r, ok: true, kind: KIND.OK, recovered: true, originalKind: r.kind, result: rec.result, truncated: !!rec.truncated };
        }
        if (rec && !rec.ok) return { ...r, kind: classify(rec.error) === KIND.OK ? KIND.ERROR : classify(rec.error), text: rec.error, recovered: true, originalKind: r.kind };
      }
    } else if (r.kind === KIND.SUSPENDED) {
      // No heartbeat: the plugin is probably still chewing on something. Next heavy call must wait.
      this.#setPossiblyRunning({ id: null, label: `(suspended during ${label})`, since: Date.now() });
    }
    return r;
  }

  /** Declare that a task (e.g. from a crashed previous process) may still be running in the plugin. */
  adoptPossiblyRunning(v) { this.#setPossiblyRunning(v); }

  /** Result record {ok,result|error} stored by the wrapper for execId (waits for idle first if needed). */
  fetchResult(execId) {
    return this.mutex.run(async () => {
      if (!this.client) await this.connect();
      if (this.possiblyRunning) {
        const w = await this.#waitIdle({ reason: `fetch result ${execId}`, resultId: execId });
        return w.ok ? w.result : null;
      }
      const p = await this.probe({ resultId: execId });
      return p.ok ? p.result : null;
    });
  }

  /** Several light code snippets; one request via batch_execute when available and small enough. */
  execBatch(codes, { label = "batch" } = {}) {
    return this.mutex.run(async () => {
      if (!this.client) await this.connect();
      const idle = await this.#ensureIdle(label, { grace: false });
      if (!idle.ok) return codes.map(() => ({ ok: false, kind: KIND.SUSPENDED, text: `plugin not idle: ${idle.kind}` }));
      const b = this.caps.batch;
      if (b && codes.length > 1 && codes.length <= b.maxChunks && jsonBytes(codes) + 300 <= this.cfg.maxBodyBytes) {
        const args = { chunks: codes };
        if (b.stopKey) args[b.stopKey] = true; // same semantics as the sequential fallback below (stop at first failure)
        const r = await this.callTool(b.name, args, { label });
        const j = tryJson(r.text); // parse even if callTool flagged it: chunk errors inside may mention "timed out"
        if (j && Array.isArray(j.results)) {
          // With stop_on_error the server returns only the executed chunks (results.length === executed <= total);
          // the caller sees a short array ending in the failure, exactly like the fallback path.
          return j.results.map((x) => (x.ok
            ? { ok: true, kind: KIND.OK, result: x.result, log: x.log ?? "", ms: x.durationMs, via: "batch" }
            : { ok: false, kind: classify(x.error) === KIND.OK ? KIND.ERROR : classify(x.error), text: String(x.error), ms: x.durationMs, via: "batch" }));
        }
        // Tool-level failure (validation, no plugin, client timeout, ...) or an unparseable reply: do NOT re-run
        // the chunks through execute_code (some may already have executed); report one failure like the fallback.
        if (r.ok) return [{ ...r, ok: false, kind: KIND.ERROR, text: `unexpected batch_execute reply: ${r.text.slice(0, 300)}`, via: "batch" }];
        return [{ ...r, via: "batch" }];
      }
      const out = [];
      for (const c of codes) {
        const r = await this.#execPlain(c, label, this.cfg.clientTimeoutMs);
        out.push(r);
        if (!r.ok) break;
      }
      return out;
    });
  }

  async serverStats() {
    if (!this.client) await this.connect();
    if (!this.caps.stats) return null;
    const r = await this.callTool(this.caps.stats.name, {}, { label: "stats" });
    return r.ok ? tryJson(r.text) ?? r.text : null;
  }

  status() {
    return { url: this.url?.replace(/(userToken=)[^&]+/, "$1***"), session: this.sessionId, caps: this.caps, possiblyRunning: this.possiblyRunning, metrics: this.metrics };
  }
}
