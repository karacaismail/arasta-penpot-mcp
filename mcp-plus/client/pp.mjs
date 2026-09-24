#!/usr/bin/env node
// pp — Penpot MCP client toolkit (library entry + CLI). See README.md.
//
//   pp tools | probe | wait | stats
//   pp call <tool> [json|@file.json]
//   pp exec <main.js> [prelude.js ...]        (call.mjs-compatible: preludes first, main last)
//   pp eval '<code>'
//   pp boot <module.js ...> [--data KEY=file] [--force] [--no-cascade]
//   pp run "<page>" <key> <batch> [<batch> ...] [--modules a.js,b.js] [--require RUN] [--storage PH]
//   pp job <manifest.yaml> [--fresh] [--only k1,k2] [--batches "P320,P360 D1920"] [--no-boot]
//   pp report <manifest.yaml>
//   pp daemon start [--detach] | stop | status
//
// Global options: --url URL | --url-file FILE   (else $PENPOT_MCP_URL, else ./.mcp-url next to pp.mjs)
//                 --socket PATH | --control-port N   daemon control endpoint (default state/pp.sock)
//                 --no-daemon   never route through a running daemon
//                 --no-enhanced ignore submit_code/job_status/... even if the server offers them
//                 --log FILE    JSONL call log (default state/pp-log.jsonl)
import { readFileSync, existsSync, mkdirSync, openSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { PPClient } from "./lib/client.mjs";
import { KIND } from "./lib/util.mjs";
import { loadModuleSpec, bootModules } from "./lib/modules.mjs";
import { loadManifest, normalizeManifest, runJob, expandTasks, summarize, formatSummary } from "./lib/runner.mjs";
import { startDaemon, DaemonProxy } from "./lib/daemon.mjs";

export { PPClient, loadModuleSpec, bootModules, loadManifest, normalizeManifest, runJob, startDaemon, DaemonProxy };

const HERE = dirname(fileURLToPath(import.meta.url));
const STATE = process.env.PP_STATE_DIR ? resolve(process.env.PP_STATE_DIR) : join(HERE, "state");

function parseArgs(argv) {
  const pos = [], o = {};
  const flags = new Set(["--fresh", "--force", "--no-cascade", "--no-daemon", "--no-enhanced", "--detach", "--no-boot", "--light", "--no-wrap", "--json"]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      if (flags.has(a)) o[a.slice(2)] = true;
      else if (a.includes("=")) { const [k, ...v] = a.slice(2).split("="); o[k] = v.join("="); }
      else { const k = a.slice(2); const v = argv[++i]; if (o[k] !== undefined) o[k] = [].concat(o[k], v); else o[k] = v; }
    } else pos.push(a);
  }
  return { pos, o };
}

function resolveUrl(o) {
  if (o.url) return o.url;
  if (process.env.PENPOT_MCP_URL) return process.env.PENPOT_MCP_URL;
  const f = o["url-file"] ?? join(HERE, ".mcp-url");
  if (existsSync(f)) return readFileSync(f, "utf8").trim();
  return null;
}

const controlOpts = (o) => (o["control-port"] ? { port: Number(o["control-port"]) } : { socketPath: resolve(o.socket ?? process.env.PP_SOCKET ?? join(STATE, "pp.sock")) });
const logPath = (o) => resolve(o.log ?? process.env.PP_LOG ?? join(STATE, "pp-log.jsonl"));

function localClient(o, extra = {}) {
  return new PPClient({ url: resolveUrl(o), logPath: logPath(o), statePath: join(STATE, "client-state.json"), wait: process.env.PP_WAIT ? JSON.parse(process.env.PP_WAIT) : undefined, noEnhanced: !!o["no-enhanced"] || undefined, ...extra });
}

async function withBackend(o, fn) {
  if (!o["no-daemon"]) {
    const proxy = new DaemonProxy(controlOpts(o));
    if (await proxy.ping()) return fn({ proxy });
  }
  const client = localClient(o);
  await client.connect();
  const stop = async () => { await client.close(); process.exit(130); };
  process.once("SIGINT", stop); process.once("SIGTERM", stop);
  try { return await fn({ client }); } finally { await client.close(); }
}

function printExec(r) {
  if (r.ok) console.log(JSON.stringify({ result: r.result, log: r.log ?? "" }, null, 2));
  else console.error(r.text);
  if (r.recovered) console.error(`(result recovered from plugin after ${r.originalKind})`);
  process.exitCode = r.ok ? 0 : r.kind === KIND.BOOT_REQUIRED ? 3 : [KIND.ERROR].includes(r.kind) ? 1 : 2;
}

function moduleEntries(o, pos) {
  const entries = [...pos];
  for (const d of [].concat(o.data ?? [])) { const [key, file] = d.split("="); entries.push({ file, kind: "data", key }); }
  return entries;
}

function runManifest(o, page, key, batches) {
  const mods = o.modules ? String(o.modules).split(",") : [];
  const req = { globals: o.require ? String(o.require).split(",") : ["RUN"], storage: o.storage ? String(o.storage).split(",") : [] };
  return normalizeManifest({
    name: `run-${key}`, __dir: process.cwd(), modules: mods, require: req, batches,
    pages: [{ page, key }], templates: { batch: o.template ?? "return await RUN({{page}}, {{key}}, {{ids}});" },
    checkpoint: join(STATE, `run-${key}.checkpoint.json`), report: join(STATE, `run-${key}.report.jsonl`),
    policy: { retries: Number(o.retries ?? 2), failPattern: o["fail-pattern"] ?? null },
  });
}

async function main() {
  const { pos, o } = parseArgs(process.argv.slice(2));
  const cmd = pos.shift();
  mkdirSync(STATE, { recursive: true });
  const log = (s) => console.log(s);

  switch (cmd) {
    case "tools": return withBackend(o, async ({ client, proxy }) => {
      const st = client ? client.status() : await proxy.status();
      console.log(JSON.stringify({ tools: st.caps.tools, jobs: !!st.caps.jobs, batch: !!st.caps.batch, stats: !!st.caps.stats, cancel: !!st.caps.cancel, incompatible: st.caps.incompatible ?? [], via: client ? "direct" : "daemon" }, null, 2));
    });
    case "call": return withBackend(o, async ({ client, proxy }) => {
      const [tool, a] = pos;
      const args = a ? JSON.parse(a.startsWith("@") ? readFileSync(a.slice(1), "utf8") : a) : {};
      const r = client ? await client.mutex.run(() => client.callTool(tool, args, { label: o.label ?? tool })) : await proxy.callTool(tool, args, { label: o.label });
      for (const c of r.content ?? []) {
        if (c.type === "text") console.log(c.text);
        else if (c.type === "image") { console.log(`[image ${c.mimeType}, ${c.data.length} b64 chars]`); if (process.env.IMG_OUT) (await import("node:fs")).writeFileSync(process.env.IMG_OUT, Buffer.from(c.data, "base64")); }
      }
      if (!r.ok) process.exitCode = r.kind === KIND.ERROR ? 1 : 2;
    });
    case "exec": case "eval": return withBackend(o, async ({ client, proxy }) => {
      const code = cmd === "eval" ? pos.join(" ") : [...pos.slice(1), pos[0]].map((f) => readFileSync(f, "utf8")).join("\n;\n");
      const opts = { label: o.label ?? process.env.LABEL ?? pos[0] ?? "eval", heavy: !o.light, wrap: !o["no-wrap"] };
      printExec(client ? await client.exec(code, opts) : await proxy.exec(code, opts));
    });
    case "probe": return withBackend(o, async ({ client, proxy }) => {
      const r = client ? await client.probe() : await proxy.probe();
      console.log(JSON.stringify(r, null, 2)); process.exitCode = r.ok ? 0 : 2;
    });
    case "wait": return withBackend(o, async ({ client, proxy }) => {
      const r = client ? await client.waitIdle({ reason: "cli" }) : await proxy.waitIdle();
      console.log(r.ok ? `alive after ${r.probes} probes, ${Math.round(r.waitedMs / 1000)}s` : `still busy (${r.kind})`); process.exitCode = r.ok ? 0 : 1;
    });
    case "stats": return withBackend(o, async ({ client, proxy }) => {
      console.log(JSON.stringify(client ? { server: await client.serverStats(), client: client.status() } : await proxy.stats(), null, 2));
    });
    case "boot": return withBackend(o, async ({ client, proxy }) => {
      const entries = moduleEntries(o, pos);
      const r = client ? await bootModules(client, entries.map((e) => loadModuleSpec(e, process.cwd())), { force: !!o.force, cascade: !o["no-cascade"], log }) : await proxy.boot(entries, { baseDir: process.cwd(), force: !!o.force, cascade: !o["no-cascade"] });
      console.log(`${r.ok ? "boot ok" : "boot FAILED"}: loaded=[${(r.loaded ?? []).join(", ")}] skipped=[${(r.skipped ?? []).join(", ")}] calls=${r.calls} ${r.ms}ms${r.error ? "\n" + r.error : ""}`);
      process.exitCode = r.ok ? 0 : 2;
    });
    case "run": case "job": return withBackend(o, async ({ client, proxy }) => {
      const only = o.only ? String(o.only).split(",") : null;
      let m, body;
      if (cmd === "run") { const [page, key, ...batches] = pos; m = runManifest(o, page, key, batches); body = { manifest: { ...m }, fresh: true, boot: !!o.modules }; }
      else { m = loadManifest(pos[0]); body = { manifestPath: m.__path, fresh: !!o.fresh, only, boot: !o["no-boot"], batches: o.batches ?? null }; }
      let s;
      if (client) {
        let stopping = false;
        process.removeAllListeners("SIGINT");
        process.once("SIGINT", () => { stopping = true; console.error("SIGINT: finishing current task, then stopping (checkpoint kept)"); });
        s = await runJob(client, m, { fresh: body.fresh, only, boot: body.boot, batches: body.batches ?? null, log, shouldStop: () => stopping });
      } else s = await proxy.job(body, log);
      console.log(formatSummary(s));
      process.exitCode = s.tasks.failed ? 1 : s.tasks.pending ? 4 : 0;
    });
    case "report": {
      const m = loadManifest(pos[0]);
      if (!existsSync(m.checkpoint)) { console.error(`no checkpoint at ${m.checkpoint}`); process.exitCode = 1; return; }
      const s = summarize(JSON.parse(readFileSync(m.checkpoint, "utf8")), expandTasks(m));
      console.log(o.json ? JSON.stringify(s, null, 2) : formatSummary(s));
      return;
    }
    case "daemon": {
      const sub = pos[0] ?? "status";
      const ctl = controlOpts(o);
      const proxy = new DaemonProxy(ctl);
      if (sub === "status") { const s = await proxy.ping(); console.log(s ? JSON.stringify(s, null, 2) : "daemon not running"); process.exitCode = s ? 0 : 1; return; }
      if (sub === "stop") { if (!(await proxy.ping())) { console.log("daemon not running"); return; } await proxy.shutdown(); console.log("daemon stopped (MCP session terminated)"); return; }
      if (sub !== "start") throw new Error(`unknown daemon subcommand ${sub}`);
      if (await proxy.ping()) { console.log("daemon already running"); return; }
      if (o.detach) {
        const args = process.argv.slice(2).filter((a) => a !== "--detach");
        const out = openSync(join(STATE, "daemon.log"), "a");
        spawn(process.execPath, [fileURLToPath(import.meta.url), ...args], { detached: true, stdio: ["ignore", out, out], env: process.env }).unref();
        for (let i = 0; i < 100; i++) { await new Promise((r) => setTimeout(r, 100)); if (await proxy.ping()) { console.log(`daemon started (${ctl.socketPath ?? "127.0.0.1:" + ctl.port}); log: ${join(STATE, "daemon.log")}`); return; } }
        console.error(`daemon did not come up; see ${join(STATE, "daemon.log")}`); process.exitCode = 2; return;
      }
      const client = localClient(o);
      await client.connect();
      const d = await startDaemon(client, { ...ctl, log: (s) => console.log(`[${new Date().toISOString()}] ${s}`) });
      const bye = async (sig) => { await d.shutdown(sig); process.exit(0); };
      process.on("SIGINT", () => bye("SIGINT")); process.on("SIGTERM", () => bye("SIGTERM"));
      process.on("pp-daemon-exit", () => process.exit(0));
      return new Promise(() => {}); // run forever
    }
    default:
      console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).slice(1).map((l) => l.slice(3)).join("\n"));
      process.exitCode = cmd ? 64 : 0;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e?.stack ?? String(e)); process.exit(2); });
}
