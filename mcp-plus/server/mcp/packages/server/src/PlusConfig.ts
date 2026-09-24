/**
 * "mcp-plus" configuration: opt-in extensions to the upstream Penpot MCP server.
 *
 * Every setting is read from an environment variable. When a variable is unset, the
 * resulting value reproduces the upstream (2.18.0) behaviour exactly.
 */

export type ConnectionPolicy = "reject" | "takeover" | "takeover-stale";

export interface PlusConfig {
    /** express.json() body limit (e.g. "5mb"); upstream default is body-parser's "100kb". */
    maxBody: string;
    /** timeout for plugin tasks triggered by synchronous tools (execute_code, export_shape, ...). */
    toolTimeoutSecs: number;
    /** max age of the last plugin heartbeat before a tab is considered suspended. */
    heartbeatGraceSecs: number;
    /** whether a connection with a task in flight is treated as alive regardless of heartbeat age. */
    busyIsAlive: boolean;
    /** max number of tasks waiting per user lane; 0 disables queueing (upstream behaviour). */
    taskQueueMax: number;
    /** how long a timed-out (orphaned) task keeps its lane busy while waiting for a late plugin response. */
    orphanGraceSecs: number;
    /** policy for a second plugin connection with an already-connected user token. */
    connectionPolicy: ConnectionPolicy;
    /** idle TTL of MCP (Streamable HTTP / SSE) sessions. */
    sessionTtlSecs: number;
    /** interval of the idle-session sweeper. */
    sessionSweepSecs: number;
    /** max number of concurrent MCP sessions (oldest idle ones are evicted); 0 = unlimited. */
    maxSessions: number;
    /** whether submit_code / job_status / cancel_job are registered. */
    enableJobs: boolean;
    /** default and maximum total runtime of a background job. */
    jobTimeoutSecs: number;
    /** how long finished jobs are retained for job_status. */
    jobRetentionSecs: number;
    /** max number of unfinished jobs per user. */
    jobMaxActivePerUser: number;
    /** max long-poll wait for job_status(wait_s). */
    jobMaxWaitSecs: number;
    /** whether batch_execute is registered. */
    enableBatch: boolean;
    /** max number of chunks accepted by batch_execute / submit_code(chunks). */
    batchMaxChunks: number;
    /** whether server_stats tool and GET /stats are enabled. */
    enableStats: boolean;
    /** interval of MCP progress notifications during long tool calls (requires client progressToken); 0 = off. */
    progressIntervalSecs: number;
}

function envStr(env: Record<string, string | undefined>, name: string): string | undefined {
    const v = env[name];
    return v === undefined || v.trim() === "" ? undefined : v.trim();
}

function envInt(env: Record<string, string | undefined>, name: string, def: number, min: number): number {
    const raw = envStr(env, name);
    if (raw === undefined) return def;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || Number.isNaN(n) || n < min) {
        // invalid values must never produce NaN timers (setTimeout(NaN) fires immediately)
        console.warn(`[mcp-plus] ignoring invalid ${name}=${JSON.stringify(raw)}; using default ${def}`);
        return def;
    }
    return n;
}

function envBool(env: Record<string, string | undefined>, name: string, def: boolean): boolean {
    const raw = envStr(env, name);
    if (raw === undefined) return def;
    return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export function loadPlusConfig(env: Record<string, string | undefined> = process.env): PlusConfig {
    const taskQueueMax = envInt(env, "PENPOT_MCP_TASK_QUEUE_MAX", 0, 0);

    const policyRaw = (envStr(env, "PENPOT_MCP_CONNECTION_POLICY") ?? "reject").toLowerCase();
    let connectionPolicy: ConnectionPolicy = "reject";
    if (policyRaw === "takeover" || policyRaw === "takeover-stale" || policyRaw === "reject") {
        connectionPolicy = policyRaw;
    } else {
        console.warn(`[mcp-plus] ignoring invalid PENPOT_MCP_CONNECTION_POLICY=${policyRaw}; using "reject"`);
    }

    const sessionTtlSet = envStr(env, "PENPOT_MCP_SESSION_TTL_S") !== undefined;
    const sessionTtlSecs = envInt(env, "PENPOT_MCP_SESSION_TTL_S", 3600, 10);
    // upstream: 60 min TTL, swept every 30 min; when a TTL is configured, sweep more often
    const defaultSweep = sessionTtlSet ? Math.max(5, Math.min(60, Math.floor(sessionTtlSecs / 2))) : 1800;

    return {
        maxBody: envStr(env, "PENPOT_MCP_MAX_BODY") ?? "100kb",
        toolTimeoutSecs: envInt(env, "PENPOT_MCP_TOOL_TIMEOUT_S", 120, 1),
        heartbeatGraceSecs: envInt(env, "PENPOT_MCP_HEARTBEAT_GRACE_S", 30, 1),
        busyIsAlive: envBool(env, "PENPOT_MCP_BUSY_IS_ALIVE", taskQueueMax > 0),
        taskQueueMax,
        orphanGraceSecs: envInt(env, "PENPOT_MCP_ORPHAN_TASK_GRACE_S", 600, 0),
        connectionPolicy,
        sessionTtlSecs,
        sessionSweepSecs: envInt(env, "PENPOT_MCP_SESSION_SWEEP_S", defaultSweep, 1),
        maxSessions: envInt(env, "PENPOT_MCP_MAX_SESSIONS", 0, 0),
        enableJobs: envBool(env, "PENPOT_MCP_ENABLE_JOBS", false),
        jobTimeoutSecs: envInt(env, "PENPOT_MCP_JOB_TIMEOUT_S", 1800, 1),
        jobRetentionSecs: envInt(env, "PENPOT_MCP_JOB_RETENTION_S", 3600, 10),
        jobMaxActivePerUser: envInt(env, "PENPOT_MCP_JOB_MAX_ACTIVE", 20, 1),
        jobMaxWaitSecs: envInt(env, "PENPOT_MCP_JOB_MAX_WAIT_S", 50, 0),
        enableBatch: envBool(env, "PENPOT_MCP_ENABLE_BATCH", false),
        batchMaxChunks: envInt(env, "PENPOT_MCP_BATCH_MAX_CHUNKS", 100, 1),
        enableStats: envBool(env, "PENPOT_MCP_ENABLE_STATS", false),
        progressIntervalSecs: envInt(env, "PENPOT_MCP_PROGRESS_INTERVAL_S", 0, 0),
    };
}
