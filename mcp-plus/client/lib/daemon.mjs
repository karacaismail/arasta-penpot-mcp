// Daemon: keeps ONE PPClient (one MCP session) alive and exposes it over a local HTTP control API
// (unix socket by default, or 127.0.0.1:<port>). Proxy: the same API from the CLI side.
import http from "node:http";
import { existsSync, unlinkSync } from "node:fs";
import { bootModules, loadModuleSpec } from "./modules.mjs";
import { runJob, loadManifest, normalizeManifest, formatSummary } from "./runner.mjs";

async function readBody(req) {
  let s = "";
  for await (const c of req) s += c;
  return s ? JSON.parse(s) : {};
}

export async function startDaemon(client, { socketPath = null, port = null, log = console.log } = {}) {
  let jobRunning = null;
  let stopJob = false;
  const started = Date.now();
  let server;
  const shutdown = async (why = "shutdown") => {
    log(`daemon: ${why}; terminating MCP session`);
    stopJob = true;
    await client.close();
    await new Promise((r) => server.close(() => r()));
    server.closeAllConnections?.();
    if (socketPath && existsSync(socketPath)) try { unlinkSync(socketPath); } catch {}
  };

  server = http.createServer(async (req, res) => {
    const send = (code, obj) => { if (!res.headersSent) res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
    try {
      const path = new URL(req.url, "http://x").pathname;
      if (req.method === "GET" && path === "/status") return send(200, { pid: process.pid, uptimeMs: Date.now() - started, job: jobRunning, ...client.status() });
      if (req.method !== "POST") return send(404, { error: "not found" });
      const b = await readBody(req);
      switch (path) {
        case "/exec": return send(200, await client.exec(b.code, { label: b.label, heavy: b.heavy ?? true, wrap: b.wrap ?? true, timeoutMs: b.timeoutMs }));
        case "/call": return send(200, await client.mutex.run(() => client.callTool(b.tool, b.args ?? {}, { label: b.label ?? b.tool, timeoutMs: b.timeoutMs })));
        case "/probe": return send(200, await client.mutex.run(() => client.probe({ resultId: b.resultId })));
        case "/wait": return send(200, await client.waitIdle({ reason: "requested" }));
        case "/stats": return send(200, { server: await client.serverStats(), client: client.status() });
        case "/boot": {
          const specs = (b.modules ?? []).map((e) => loadModuleSpec(e, b.baseDir ?? process.cwd()));
          return send(200, await bootModules(client, specs, { force: !!b.force, cascade: b.cascade ?? true, log }));
        }
        case "/job": {
          if (jobRunning) return send(409, { error: `job already running: ${jobRunning}` });
          const m = b.manifestPath ? loadManifest(b.manifestPath) : normalizeManifest(b.manifest);
          jobRunning = m.name; stopJob = false;
          res.writeHead(200, { "content-type": "application/x-ndjson" });
          const line = (o) => res.write(JSON.stringify(o) + "\n");
          try {
            const s = await runJob(client, m, { fresh: !!b.fresh, only: b.only ?? null, boot: b.boot ?? true, batches: b.batches ?? null, log: (msg) => { log(msg); line({ log: msg }); }, shouldStop: () => stopJob });
            line({ summary: s });
          } catch (e) { line({ error: String(e?.stack ?? e) }); }
          finally { jobRunning = null; }
          return res.end();
        }
        case "/stop-job": stopJob = true; return send(200, { ok: true, job: jobRunning });
        case "/shutdown": send(200, { ok: true }); setImmediate(() => shutdown("shutdown requested").then(() => process.emit("pp-daemon-exit"))); return;
        default: return send(404, { error: "not found" });
      }
    } catch (e) { send(500, { error: String(e?.stack ?? e) }); }
  });
  server.requestTimeout = 0; server.headersTimeout = 0; server.timeout = 0; server.keepAliveTimeout = 5000;
  if (socketPath) {
    if (existsSync(socketPath)) {
      const alive = await new DaemonProxy({ socketPath }).ping();
      if (alive) throw new Error(`daemon already running on ${socketPath}`);
      unlinkSync(socketPath);
    }
    await new Promise((r, j) => server.once("error", j).listen(socketPath, r));
  } else {
    await new Promise((r, j) => server.once("error", j).listen(port, "127.0.0.1", r));
  }
  log(`daemon: listening on ${socketPath ?? `127.0.0.1:${port}`} (pid ${process.pid}, session ${client.sessionId})`);
  return { server, shutdown };
}

export class DaemonProxy {
  constructor({ socketPath = null, port = null } = {}) { this.socketPath = socketPath; this.port = port; }

  #request(method, path, body, { onLine } = {}) {
    return new Promise((resolve, reject) => {
      const data = body === undefined ? null : Buffer.from(JSON.stringify(body));
      const req = http.request({ method, path, ...(this.socketPath ? { socketPath: this.socketPath } : { host: "127.0.0.1", port: this.port }), headers: data ? { "content-type": "application/json", "content-length": data.length } : {}, timeout: 0 }, (res) => {
        let buf = "", all = "";
        res.setEncoding("utf8");
        res.on("data", (c) => {
          all += c;
          if (!onLine) return;
          buf += c;
          let i;
          while ((i = buf.indexOf("\n")) !== -1) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) onLine(JSON.parse(l)); }
        });
        res.on("end", () => {
          if (onLine) { if (buf.trim()) onLine(JSON.parse(buf)); return resolve({ status: res.statusCode }); }
          try { resolve({ status: res.statusCode, body: JSON.parse(all) }); } catch { resolve({ status: res.statusCode, body: all }); }
        });
      });
      req.on("error", reject);
      if (data) req.write(data);
      req.end();
    });
  }

  async ping() { try { const r = await this.#request("GET", "/status"); return r.status === 200 ? r.body : null; } catch { return null; } }
  async post(path, body = {}) { const r = await this.#request("POST", path, body); if (r.status >= 400) throw new Error(r.body?.error ?? `HTTP ${r.status}`); return r.body; }
  status() { return this.#request("GET", "/status").then((r) => r.body); }
  exec(code, opts = {}) { return this.post("/exec", { code, ...opts }); }
  callTool(tool, args, opts = {}) { return this.post("/call", { tool, args, ...opts }); }
  probe() { return this.post("/probe"); }
  waitIdle() { return this.post("/wait"); }
  stats() { return this.post("/stats"); }
  boot(modules, opts = {}) { return this.post("/boot", { modules, ...opts }); }
  shutdown() { return this.post("/shutdown"); }
  async job(body, onLine) {
    let summary = null, error = null;
    const r = await this.#request("POST", "/job", body, { onLine: (o) => { if (o.log) onLine?.(o.log); if (o.summary) summary = o.summary; if (o.error) error = o.error; } });
    if (r.status === 409) throw new Error("a job is already running in the daemon");
    if (error) throw new Error(error);
    return summary;
  }
}

export { formatSummary };
