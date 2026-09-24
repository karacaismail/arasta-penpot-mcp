// Shared helpers: error classification, timing, stats, atomic file writes.
import { createHash } from "node:crypto";
import { writeFileSync, renameSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";

/** Error kinds the rest of the toolkit reasons about. */
export const KIND = {
  OK: "ok",
  TIMEOUT: "timeout", // server-side task timeout: plugin keeps running the code
  CLIENT_TIMEOUT: "client_timeout", // our own request timeout: plugin may still be running
  SUSPENDED: "suspended", // "tab appears suspended (no heartbeat)" -- often just busy
  BOOT_REQUIRED: "boot_required", // plugin globals/storage lost -> modules must be reloaded
  STAGE_INCOMPLETE: "stage_incomplete", // chunked module staging lost mid-way
  PAYLOAD_TOO_LARGE: "payload_too_large",
  DISCONNECTED: "disconnected", // no plugin connected / duplicate connection
  TRANSPORT: "transport", // HTTP/session level failure
  ERROR: "error", // ordinary exception thrown by the code
};

/** Kinds after which the plugin may still be executing our previous code. */
export const POSSIBLY_RUNNING = new Set([KIND.TIMEOUT, KIND.CLIENT_TIMEOUT]);
/** Kinds that mean "plugin busy/unreachable right now; wait, then retry". */
export const WAITABLE = new Set([KIND.TIMEOUT, KIND.CLIENT_TIMEOUT, KIND.SUSPENDED, KIND.DISCONNECTED, KIND.TRANSPORT]);

/**
 * Classify a tool result text / thrown error message.
 * The Penpot MCP server reports plugin failures as *successful* tool results whose text starts with
 * "Tool execution failed:", so we must look at the text, not only at isError.
 */
export function classify(text, { isError = false, thrown = false } = {}) {
  const t = String(text ?? "");
  if (/BOOT_REQUIRED/.test(t)) return KIND.BOOT_REQUIRED;
  if (/STAGE_INCOMPLETE/.test(t)) return KIND.STAGE_INCOMPLETE;
  if (/Task [\w-]+ timed out after \d+ seconds|timed out after \d+ ?s(econds)?\b/i.test(t) && !/Request timed out/i.test(t)) return KIND.TIMEOUT;
  if (/appears to be suspended|no heartbeat for/i.test(t)) return KIND.SUSPENDED;
  if (/PayloadTooLarge|request entity too large|\b413\b/i.test(t)) return KIND.PAYLOAD_TOO_LARGE;
  if (/Request timed out|-32001|AbortError|The operation was aborted/i.test(t)) return KIND.CLIENT_TIMEOUT;
  if (/Duplicate connection|No (Penpot )?plugin (is )?connected|plugin (is )?not connected|no connected plugin/i.test(t)) return KIND.DISCONNECTED;
  if (thrown && /ECONNREFUSED|ECONNRESET|fetch failed|socket hang up|Session not found|Bad Request: No valid session|HTTP [45]\d\d|Error POSTing|terminated/i.test(t)) return KIND.TRANSPORT;
  if (thrown) return KIND.TRANSPORT;
  if (isError || /^Tool execution failed/.test(t)) return KIND.ERROR;
  return KIND.OK;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const sha = (s) => createHash("sha256").update(s).digest("hex");

/** Bytes a string occupies once JSON-encoded inside a request body. */
export const jsonBytes = (s) => Buffer.byteLength(JSON.stringify(s), "utf8");

export function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export function stats(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return { n: 0 };
  const sum = v.reduce((a, b) => a + b, 0);
  return { n: v.length, min: v[0], p50: percentile(v, 50), p95: percentile(v, 95), max: v[v.length - 1], mean: Math.round(sum / v.length), total: sum };
}

export function writeJsonAtomic(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(obj, null, 2));
  renameSync(tmp, path);
}

export function appendJsonl(path, obj) {
  if (!path) return;
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(obj) + "\n");
}

/** Exponential backoff schedule with jitter, capped. */
export function backoff(attempt, { baseMs = 2000, factor = 2, capMs = 60000, jitter = 0.2 } = {}) {
  const raw = Math.min(capMs, baseMs * Math.pow(factor, attempt));
  const j = raw * jitter * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(raw + j));
}

/** Enforce PP_ALLOW_PORTS (e.g. "4601-4603") so tests can never reach a live server. */
export function assertAllowedUrl(url) {
  const spec = process.env.PP_ALLOW_PORTS;
  if (!spec) return;
  const u = new URL(url);
  const port = Number(u.port || (u.protocol === "https:" ? 443 : 80));
  const ok = spec.split(",").some((part) => {
    const [a, b] = part.split("-").map(Number);
    return b ? port >= a && port <= b : port === a;
  });
  if (!ok) throw new Error(`PP_ALLOW_PORTS=${spec} forbids connecting to ${u.host}`);
}

/** Minimal async mutex: guarantees at most one plugin-bound request at a time. */
export class Mutex {
  #tail = Promise.resolve();
  run(fn) {
    const next = this.#tail.then(fn, fn);
    this.#tail = next.catch(() => {});
    return next;
  }
}
