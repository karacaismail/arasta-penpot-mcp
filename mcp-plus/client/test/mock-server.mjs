#!/usr/bin/env node
// Mock Penpot MCP server for tests. Simulates the behaviour that makes the real one hard to drive:
//  - single-threaded plugin: tasks run one after another (queue), in a vm context with `storage`
//  - server-side task timeout: the tool call fails with "Task <id> timed out after N seconds" while the
//    plugin KEEPS RUNNING the code
//  - "tab appears suspended (no heartbeat for Ns)" while the plugin has been busy for > suspendAfterMs
//  - plugin reconnect: globals + storage lost (reset)
//  - 100 KB request body cap (413 PayloadTooLargeError)
//  - optional "enhanced" tools with the REAL mcp-plus fork interface (PlusTools.ts / JobManager.ts):
//    submit_code{code|chunks,stop_on_error?,timeout_s?} job_status{job_id,wait_s?} cancel_job{job_id}
//    batch_execute{chunks,stop_on_error?} server_stats{}
// Usage: node test/mock-server.mjs --port 4601 [--enhanced] [--timeout-ms 120000]
import http from "node:http";
import vm from "node:vm";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import * as z from "zod";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ALLOWED_PORTS = [4601, 4602, 4603];

class FakePlugin {
  constructor(mock) { this.mock = mock; this.reset(); }
  reset() {
    this.ctx = vm.createContext({ setTimeout, clearTimeout, __mockHost: {} });
    this.storage = vm.runInContext("({})", this.ctx);
    this.penpot = { currentPage: { name: "Mock Page" }, flags: {}, root: { children: [] } };
    this.tail = Promise.resolve();
    this.busy = 0;
    this.busySince = 0;
    this.generation = (this.generation ?? 0) + 1;
  }
  /**
   * Enqueue code; resolves {ok, result, log} | {ok:false, error}. Runs even if nobody waits for it.
   * `ticket` (optional) mirrors the real server's per-user FIFO lane: ticket.cancelled set while the task is
   * still queued drops it before it reaches the plugin; ticket.started tells whether it was dispatched.
   */
  enqueue(code, extraDelayMs = 0, ticket = null) {
    const gen = this.generation;
    const run = async () => {
      if (gen !== this.generation) return { ok: false, error: "plugin reconnected" };
      if (ticket?.cancelled) return { ok: false, error: "cancelled while queued", dropped: true };
      if (ticket) ticket.started = true;
      this.busy++; this.busySince = Date.now(); this.mock.stats.started.push(code); this.mock.stats.timeline.push({ t: Date.now(), ev: "start", code });
      const logs = [];
      const cons = { log: (...a) => logs.push(a.join(" ")), warn: (...a) => logs.push(a.join(" ")), error: (...a) => logs.push(a.join(" ")) };
      try {
        if (extraDelayMs) await sleep(extraDelayMs);
        const fn = vm.runInContext(`(async function (penpot, penpotUtils, storage, console) {\n${code}\n})`, this.ctx);
        const result = await fn(this.penpot, {}, this.storage, cons);
        this.mock.stats.executed.push(code);
        return { ok: true, result, log: logs.join("\n") };
      } catch (e) {
        this.mock.stats.executed.push(code);
        return { ok: false, error: String(e?.message ?? e) };
      } finally { this.busy--; this.mock.stats.timeline.push({ t: Date.now(), ev: "end", code }); }
    };
    const p = this.tail.then(run, run);
    this.tail = p.catch(() => {});
    return p;
  }
}

export class MockPenpotMcp {
  constructor({ port = 4601, enhanced = false, taskTimeoutMs = 120_000, suspendAfterMs = null, maxBodyBytes = 100_000, jobTimeoutS = 1800, jobMaxWaitS = 50, batchMaxChunks = 100, jobRetentionS = 3600 } = {}) {
    if (!ALLOWED_PORTS.includes(port)) throw new Error(`mock only runs on ${ALLOWED_PORTS.join("/")}`);
    Object.assign(this, { port, enhanced, taskTimeoutMs, suspendAfterMs, maxBodyBytes, jobTimeoutS, jobMaxWaitS, batchMaxChunks, jobRetentionS });
    this.startedAt = Date.now();
    this.rules = []; // { match: RegExp|string, action: "error"|"reset"|"suspended"|"delay", text?, ms?, times? }
    this.plugin = new FakePlugin(this);
    this.jobs = new Map();
    this.transports = new Map();
    this.resetStats();
  }
  resetStats() {
    this.stats = { calls: {}, executed: [], started: [], timeline: [], sessionsCreated: 0, sessionsTerminated: 0, rejected413: 0, maxBodySeen: 0, timeouts: 0, suspended: 0 };
  }
  get url() { return `http://127.0.0.1:${this.port}/mcp/stream?userToken=mock`; }
  countExecuted(re) { return this.stats.executed.filter((c) => (typeof re === "string" ? c.includes(re) : re.test(c))).length; }

  #applyRules(code) {
    let delay = 0;
    for (const r of this.rules) {
      if (r.times === 0) continue;
      const m = typeof r.match === "string" ? code.includes(r.match) : r.match.test(code);
      if (!m) continue;
      if (r.times) r.times--;
      if (r.action === "reset") this.plugin.reset();
      else if (r.action === "error") return { text: `Tool execution failed: Error: ${r.text ?? "injected failure"}` };
      else if (r.action === "suspended") { this.stats.suspended++; return { text: `Tool execution failed: Error: The Penpot plugin tab appears to be suspended by the browser (no heartbeat for ${r.secs ?? 121}s). Please click/focus the Penpot tab to wake it, then retry.` }; }
      else if (r.action === "delay") delay += r.ms ?? 0;
    }
    return { delay };
  }

  #suspendedCheck() {
    const p = this.plugin;
    if (this.suspendAfterMs != null && p.busy > 0 && Date.now() - p.busySince > this.suspendAfterMs) {
      this.stats.suspended++;
      const s = Math.round((Date.now() - p.busySince) / 1000);
      return `Tool execution failed: Error: The Penpot plugin tab appears to be suspended by the browser (no heartbeat for ${s}s). Please click/focus the Penpot tab to wake it, then retry.`;
    }
    return null;
  }

  /**
   * One plugin task as PluginBridge.executePluginTask sees it: resolves {ok:true, result, log} or
   * {ok:false, error} where `error` is the Error message the real server would produce (the tool layer
   * then prefixes "Tool execution failed: Error: "). The plugin keeps running after a timeout.
   */
  async runTask(code, timeoutMs = this.taskTimeoutMs, ticket = null) {
    this.stats.timeline.push({ t: Date.now(), ev: "recv", code });
    const strip = (t) => t.replace(/^Tool execution failed: Error: /, "");
    const s = this.#suspendedCheck();
    if (s) return { ok: false, error: strip(s) };
    const rule = this.#applyRules(code);
    if (rule.text) return { ok: false, error: strip(rule.text) };
    const task = this.plugin.enqueue(code, rule.delay, ticket);
    const TO = Symbol("timeout");
    let timer;
    const r = await Promise.race([task, new Promise((res) => (timer = setTimeout(() => res(TO), timeoutMs)))]);
    clearTimeout(timer);
    if (r === TO) { this.stats.timeouts++; return { ok: false, timeout: true, error: `Task ${randomUUID()} timed out after ${Math.max(1, Math.round(timeoutMs / 1000))} seconds` }; }
    if (!r.ok) return { ok: false, dropped: r.dropped, error: r.dropped ? r.error : `Error handling task: ${r.error}` };
    return r;
  }

  async executeCode(code) {
    const r = await this.runTask(code);
    if (!r.ok) return `Tool execution failed: Error: ${r.error}`;
    return r.result === undefined ? "Code executed successfully with no return value." : JSON.stringify({ result: r.result, log: r.log }, null, 2);
  }

  // ---------------------------------------------------------------- mcp-plus job API (mirrors JobManager.ts)
  /** runChunks(): sequential chunks, optional absolute deadline, stop on error. Throws {jobTimeout} at the deadline. */
  async #runChunks(chunks, stopOnError, results, { deadline, shouldStop, onTask } = {}) {
    for (let i = 0; i < chunks.length; i++) {
      if (shouldStop?.()) return;
      let timeoutMs = this.taskTimeoutMs;
      if (deadline !== undefined) {
        if (deadline <= Date.now()) throw Object.assign(new Error(`Job deadline reached before chunk ${i}`), { jobTimeout: true });
        timeoutMs = Math.max(1000, Math.ceil((deadline - Date.now()) / 1000) * 1000);
      }
      const ticket = { cancelled: false, started: false };
      onTask?.(ticket, i);
      const t0 = Date.now();
      const r = await this.runTask(chunks[i], timeoutMs, ticket);
      if (r.ok) { results.push({ index: i, ok: true, durationMs: Date.now() - t0, result: r.result, log: r.log ? r.log : undefined }); continue; }
      results.push({ index: i, ok: false, durationMs: Date.now() - t0, error: r.error });
      if (deadline !== undefined && Date.now() >= deadline - 250) throw Object.assign(new Error(r.error), { jobTimeout: true });
      if (stopOnError) return;
    }
  }

  #describeJob(job, includeResults = true) {
    const lastOk = [...job.results].reverse().find((r) => r.ok);
    const single = job.chunks.length === 1 && job.results.length === 1 ? job.results[0] : null;
    return {
      jobId: job.id, state: job.state,
      elapsedS: Math.round(((job.finishedAt ?? Date.now()) - job.createdAt) / 100) / 10,
      timeoutS: job.timeoutSecs, chunks: job.chunks.length, completedChunks: job.results.length,
      currentChunk: job.state === "running" ? job.currentChunk : undefined,
      currentTaskState: job.state === "running" && job.ticket ? (job.ticket.started ? "in_flight" : "queued") : undefined,
      error: job.error,
      ...(includeResults && single?.ok ? { result: single.result, log: single.log } : {}),
      ...(includeResults && job.chunks.length > 1 ? { results: job.results } : {}),
      ...(job.chunks.length > 1 && lastOk ? { lastSuccessfulChunk: lastOk.index } : {}),
      note: job.state === "cancelled" || job.state === "timed_out" ? "Code already dispatched to the plugin cannot be interrupted server-side; it may still complete in the browser." : undefined,
    };
  }

  #submitJob(chunks, stopOnError, timeoutS) {
    const timeoutSecs = Math.min(this.jobTimeoutS, timeoutS && timeoutS > 0 ? timeoutS : this.jobTimeoutS);
    const job = { id: randomUUID(), state: "running", createdAt: Date.now(), timeoutSecs, chunks, stopOnError, results: [], currentChunk: -1, cancelRequested: false, ticket: null };
    this.jobs.set(job.id, job);
    job.done = (async () => {
      try {
        await this.#runChunks(chunks, stopOnError, job.results, { deadline: job.createdAt + timeoutSecs * 1000, shouldStop: () => job.cancelRequested, onTask: (t, i) => { job.ticket = t; job.currentChunk = i; } });
        if (job.cancelRequested) job.state = "cancelled";
        else { const failed = job.results.find((r) => !r.ok); job.state = failed ? "failed" : "succeeded"; if (failed) job.error = failed.error; }
      } catch (e) {
        job.state = job.cancelRequested ? "cancelled" : e.jobTimeout ? "timed_out" : "failed";
        job.error = String(e?.message ?? e);
      } finally { job.finishedAt = Date.now(); job.ticket = null; }
    })();
    return job;
  }

  #getJob(id) {
    const job = this.jobs.get(id);
    if (!job) throw new Error(`Unknown job id: ${id} (jobs are kept for ${this.jobRetentionS}s after finishing)`);
    return job;
  }

  async #waitJob(job, waitS) {
    const s = Math.min(Math.max(0, waitS), this.jobMaxWaitS);
    if (s <= 0 || job.state !== "running") return;
    let t; await Promise.race([job.done, new Promise((r) => (t = setTimeout(r, s * 1000)))]); clearTimeout(t);
  }

  #count(name) { this.stats.calls[name] = (this.stats.calls[name] ?? 0) + 1; }

  buildServer() {
    const server = new McpServer({ name: "mock-penpot-mcp", version: "0.0.1" });
    const text = (t) => ({ content: [{ type: "text", text: t }] });
    server.registerTool("execute_code", { description: "Executes JavaScript code in the (mock) Penpot plugin context.", inputSchema: { code: z.string().min(1) } },
      async ({ code }) => { this.#count("execute_code"); return text(await this.executeCode(code)); });
    server.registerTool("high_level_overview", { description: "overview", inputSchema: {} }, async () => { this.#count("high_level_overview"); return text("mock overview"); });
    if (this.enhanced) {
      // Same names, argument schemas and result shapes as server-fork .../src/tools/PlusTools.ts.
      // Errors: the real Tool base class turns a thrown Error into the text "Tool execution failed: <Error>".
      const J = (v) => text(JSON.stringify(v, null, 2));
      const guard = (name, fn) => async (args) => {
        this.#count(name);
        try { return await fn(args); } catch (e) { return text(`Tool execution failed: ${String(e)}`); }
      };
      const chunksSchema = () => z.array(z.string().min(1, "Chunk cannot be empty")).min(1).max(this.batchMaxChunks);
      server.registerTool("submit_code", {
        description: "Starts executing JavaScript code in the BACKGROUND and immediately returns a `jobId` (mock).",
        inputSchema: { code: z.string().min(1).optional(), chunks: chunksSchema().optional(), stop_on_error: z.boolean().optional(), timeout_s: z.number().int().positive().optional() },
      }, guard("submit_code", async ({ code, chunks, stop_on_error, timeout_s }) => {
        const hasCode = typeof code === "string" && code.length > 0, hasChunks = Array.isArray(chunks) && chunks.length > 0;
        if (hasCode === hasChunks) throw new Error("Provide exactly one of `code` or `chunks`.");
        const job = this.#submitJob(hasCode ? [code] : chunks, stop_on_error ?? true, timeout_s);
        return J({ jobId: job.id, state: job.state, timeoutS: job.timeoutSecs, hint: "Poll with job_status({ job_id, wait_s: 30 })." });
      }));
      server.registerTool("job_status", {
        description: "Returns the state of a background job started with submit_code (mock).",
        inputSchema: { job_id: z.string().min(1), wait_s: z.number().min(0).optional() },
      }, guard("job_status", async ({ job_id, wait_s }) => {
        const job = this.#getJob(job_id);
        await this.#waitJob(job, wait_s ?? 0);
        return J(this.#describeJob(job));
      }));
      server.registerTool("cancel_job", {
        description: "Cancels a running background job (mock).",
        inputSchema: { job_id: z.string().min(1) },
      }, guard("cancel_job", async ({ job_id }) => {
        const job = this.#getJob(job_id);
        const wasState = job.state;
        let taskState = null;
        if (job.state === "running") {
          job.cancelRequested = true;
          if (job.ticket) { taskState = job.ticket.started ? "in_flight" : "queued"; job.ticket.cancelled = true; }
        }
        await this.#waitJob(job, 2);
        return J({ jobId: job.id, previousState: wasState, cancelledTaskWas: taskState, ...this.#describeJob(job, false) });
      }));
      server.registerTool("batch_execute", {
        description: "Executes several JavaScript code chunks sequentially in ONE tool call (mock).",
        inputSchema: { chunks: chunksSchema(), stop_on_error: z.boolean().optional() },
      }, guard("batch_execute", async ({ chunks, stop_on_error }) => {
        const results = [], t0 = Date.now();
        await this.#runChunks(chunks, stop_on_error ?? true, results);
        return J({ ok: results.length === chunks.length && results.every((r) => r.ok), executed: results.length, total: chunks.length, totalMs: Date.now() - t0, results });
      }));
      server.registerTool("server_stats", { description: "Returns diagnostic statistics of the (mock) Penpot MCP server.", inputSchema: {} }, guard("server_stats", async () => {
        const counts = {}, running = [];
        for (const j of this.jobs.values()) {
          counts[j.state] = (counts[j.state] ?? 0) + 1;
          if (j.state === "running") running.push({ jobId: j.id, userFp: "mockfp00", elapsedS: Math.round((Date.now() - j.createdAt) / 1000), chunk: `${j.currentChunk + 1}/${j.chunks.length}`, taskState: j.ticket ? (j.ticket.started ? "in_flight" : "queued") : null });
        }
        const busy = this.plugin.busy > 0;
        return J({
          server: { flavour: "mcp-plus", uptimeS: Math.round((Date.now() - this.startedAt) / 1000), multiUser: true, redis: false, config: { maxBody: `${Math.round(this.maxBodyBytes / 1000)}kb`, toolTimeoutSecs: Math.round(this.taskTimeoutMs / 1000), jobTimeoutSecs: this.jobTimeoutS, jobMaxWaitSecs: this.jobMaxWaitS, batchMaxChunks: this.batchMaxChunks } },
          sessions: { streamable: this.transports.size, sse: 0, activeRequests: 0 },
          plugins: {
            connectedPlugins: 1,
            connections: [{ id: "mock-plugin", userFp: "mockfp00", ownsToken: true, connectedForS: Math.round((Date.now() - this.startedAt) / 1000), lastHeartbeatAgeS: 0, frozen: false, busy, healthy: true }],
            lanes: [], recentTasks: [], recentRunMs: null,
          },
          jobs: { counts, running },
        });
      }));
    }
    return server;
  }

  async start() {
    this.http = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url, "http://x");
        if (u.pathname === "/control") return this.#control(req, res);
        if (!u.pathname.startsWith("/mcp")) { res.writeHead(404).end(); return; }
        let body;
        if (req.method === "POST") {
          const chunks = []; let size = 0;
          for await (const c of req) { size += c.length; chunks.push(c); }
          this.stats.maxBodySeen = Math.max(this.stats.maxBodySeen, size);
          if (size > this.maxBodyBytes) {
            this.stats.rejected413++;
            res.writeHead(413, { "content-type": "text/plain" }).end("PayloadTooLargeError: request entity too large");
            return;
          }
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        }
        const sid = req.headers["mcp-session-id"];
        let transport = sid ? this.transports.get(sid) : undefined;
        if (!transport) {
          if (req.method === "POST" && !sid && isInitializeRequest(body)) {
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (id) => { this.transports.set(id, transport); this.stats.sessionsCreated++; },
            });
            transport.onclose = () => { if (transport.sessionId && this.transports.delete(transport.sessionId)) this.stats.sessionsTerminated++; };
            await this.buildServer().connect(transport);
          } else {
            res.writeHead(404, { "content-type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32001, message: "Session not found" }, id: null }));
            return;
          }
        }
        await transport.handleRequest(req, res, body);
      } catch (e) {
        if (!res.headersSent) res.writeHead(500).end(String(e));
      }
    });
    await new Promise((r, j) => this.http.once("error", j).listen(this.port, "127.0.0.1", r));
    return this;
  }

  async #control(req, res) {
    if (req.method === "POST") {
      let s = ""; for await (const c of req) s += c;
      const cmd = JSON.parse(s || "{}");
      if (cmd.reset) this.plugin.reset();
      if (cmd.rules) this.rules = cmd.rules.map((r) => ({ ...r, match: r.regex ? new RegExp(r.regex) : r.match }));
      for (const k of ["taskTimeoutMs", "suspendAfterMs", "jobTimeoutS", "jobMaxWaitS", "batchMaxChunks"]) if (k in cmd) this[k] = cmd[k];
    }
    const { executed, started, timeline, ...rest } = this.stats;
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ...rest, executed: executed.length, sessionsOpen: this.transports.size }));
  }

  async stop() {
    for (const t of this.transports.values()) { try { await t.close(); } catch {} }
    this.transports.clear();
    const closed = new Promise((r) => (this.http ? this.http.close(() => r()) : r()));
    this.http?.closeAllConnections?.();
    await closed;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = process.argv.slice(2);
  const opt = (k, d) => { const i = a.indexOf(k); return i === -1 ? d : a[i + 1]; };
  const m = new MockPenpotMcp({ port: Number(opt("--port", 4601)), enhanced: a.includes("--enhanced"), taskTimeoutMs: Number(opt("--timeout-ms", 120000)), suspendAfterMs: opt("--suspend-after-ms", null) == null ? null : Number(opt("--suspend-after-ms")) });
  await m.start();
  console.log(`mock penpot MCP on ${m.url}${m.enhanced ? " (enhanced)" : ""}; control: http://127.0.0.1:${m.port}/control`);
  const stop = async () => { await m.stop(); process.exit(0); };
  process.on("SIGINT", stop); process.on("SIGTERM", stop);
}
