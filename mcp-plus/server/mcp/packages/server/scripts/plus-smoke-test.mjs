#!/usr/bin/env node
/**
 * [mcp-plus] smoke test: starts dist/index.js (multi-user) on 127.0.0.1:4501 (HTTP) / 4502 (plugin WS),
 * connects a FAKE plugin over WebSocket and a real MCP SDK client over Streamable HTTP, exercises the
 * new features, then stops the server.
 *
 * Usage (from packages/server, after `pnpm run build`):  node scripts/plus-smoke-test.mjs
 *
 * Fake plugin directives (first line of the code):  //SLEEP <ms>  (async wait, heartbeats continue)
 *                                                    //BLOCK <ms>  (no heartbeats while "blocked")
 *                                                    //FAIL        (plugin reports an error)
 */
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { WebSocket } from "ws";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const HTTP_PORT = Number(process.env.SMOKE_HTTP_PORT ?? 4501);
const WS_PORT = Number(process.env.SMOKE_WS_PORT ?? 4502);
const HOST = "127.0.0.1";
const TOKEN = "smoke.TESTTOKEN123.x.y.z";
const RESERVED = [9001, 1080, 4400, 4401, 4402, 4403];
if (RESERVED.includes(HTTP_PORT) || RESERVED.includes(WS_PORT)) throw new Error("refusing to use a reserved port");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
function ok(name, detail = "") {
    results.push({ name, ok: true });
    console.log(`  PASS  ${name}${detail ? "  -- " + detail : ""}`);
}

// ------------------------------------------------------------------ server
const env = {
    ...process.env,
    PENPOT_MCP_SERVER_HOST: HOST,
    PENPOT_MCP_SERVER_PORT: String(HTTP_PORT),
    PENPOT_MCP_WEBSOCKET_PORT: String(WS_PORT),
    PENPOT_MCP_REPL_PORT: "4503",
    PENPOT_MCP_LOG_LEVEL: process.env.PENPOT_MCP_LOG_LEVEL ?? "warn",
    PENPOT_MCP_MAX_BODY: "5mb",
    PENPOT_MCP_TOOL_TIMEOUT_S: "4",
    PENPOT_MCP_HEARTBEAT_GRACE_S: "2",
    PENPOT_MCP_TASK_QUEUE_MAX: "8",
    PENPOT_MCP_ORPHAN_TASK_GRACE_S: "30",
    PENPOT_MCP_CONNECTION_POLICY: "takeover",
    PENPOT_MCP_SESSION_TTL_S: "10",
    PENPOT_MCP_SESSION_SWEEP_S: "3",
    PENPOT_MCP_ENABLE_JOBS: "true",
    PENPOT_MCP_JOB_TIMEOUT_S: "60",
    PENPOT_MCP_ENABLE_BATCH: "true",
    PENPOT_MCP_ENABLE_STATS: "true",
};
delete env.PENPOT_MCP_REDIS_URI;
const server = spawn(process.execPath, ["dist/index.js", "--multi-user"], { env, stdio: ["ignore", "pipe", "pipe"] });
let serverOut = "";
server.stdout.on("data", (d) => (serverOut += d));
server.stderr.on("data", (d) => (serverOut += d));

async function stats() {
    const r = await fetch(`http://${HOST}:${HTTP_PORT}/stats`);
    return r.json();
}

// ------------------------------------------------------------------ fake plugin
function fakePlugin(name) {
    const ws = new WebSocket(`ws://${HOST}:${WS_PORT}/?userToken=${encodeURIComponent(TOKEN)}`);
    const state = { name, ws, active: 0, maxActive: 0, received: 0, blockedUntil: 0, closed: null };
    const hb = setInterval(() => {
        if (ws.readyState === 1 && Date.now() >= state.blockedUntil) ws.send(JSON.stringify({ type: "heartbeat" }));
    }, 500);
    ws.on("close", (code, reason) => {
        clearInterval(hb);
        state.closed = { code, reason: reason.toString() };
    });
    ws.on("message", async (raw) => {
        const req = JSON.parse(raw.toString());
        state.received++;
        state.active++;
        state.maxActive = Math.max(state.maxActive, state.active);
        const code = req.params?.code ?? "";
        const m = /^\/\/(SLEEP|BLOCK|FAIL)\s*(\d+)?/.exec(code);
        const ms = m?.[2] ? Number(m[2]) : 0;
        if (m?.[1] === "BLOCK") state.blockedUntil = Date.now() + ms;
        if (ms) await sleep(ms);
        state.active--;
        if (ws.readyState !== 1) return;
        if (m?.[1] === "FAIL") {
            ws.send(JSON.stringify({ id: req.id, success: false, error: "fake failure" }));
        } else {
            ws.send(JSON.stringify({ id: req.id, success: true, data: { result: { plugin: name, len: code.length }, log: "" } }));
        }
    });
    state.ready = new Promise((res, rej) => {
        ws.once("open", res);
        ws.once("error", rej);
    });
    return state;
}

// ------------------------------------------------------------------ MCP client
async function mcpClient() {
    const client = new Client({ name: "plus-smoke", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL(`http://${HOST}:${HTTP_PORT}/mcp?userToken=${encodeURIComponent(TOKEN)}`));
    await client.connect(transport);
    return { client, transport };
}
async function call(client, name, args = {}) {
    const r = await client.callTool({ name, arguments: args }, undefined, { timeout: 90_000 });
    return r.content[0].text;
}
const parse = (t) => JSON.parse(t);

// ------------------------------------------------------------------ main
let exitCode = 0;
try {
    // wait for server
    for (let i = 0; ; i++) {
        try {
            await stats();
            break;
        } catch {
            if (i > 100) throw new Error("server did not start:\n" + serverOut);
            await sleep(100);
        }
    }
    ok("server started", `http://${HOST}:${HTTP_PORT}, ws://${HOST}:${WS_PORT}`);

    const p1 = fakePlugin("tab-1");
    await p1.ready;
    await sleep(200);

    const { client, transport } = await mcpClient();

    // 1. tools list
    const tools = (await client.listTools()).tools.map((t) => t.name);
    for (const t of ["execute_code", "submit_code", "job_status", "cancel_job", "batch_execute", "server_stats"]) {
        assert.ok(tools.includes(t), `missing tool ${t}; got ${tools}`);
    }
    ok("tools/list contains new tools", tools.join(", "));

    // 2. body limit: ~300 KB execute_code body (fails upstream with 100kb limit)
    const big = "//" + "x".repeat(300_000);
    const bigRes = parse(await call(client, "execute_code", { code: big }));
    assert.equal(bigRes.result.len, big.length);
    ok("execute_code with 300 KB body (PENPOT_MCP_MAX_BODY=5mb)");

    // 2b. over-limit body -> JSON 413
    const r413 = await fetch(`http://${HOST}:${HTTP_PORT}/mcp?userToken=x`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping", params: { pad: "y".repeat(6 * 1024 * 1024) } }),
    });
    const j413 = await r413.json();
    assert.equal(r413.status, 413);
    assert.match(j413.error.message, /PENPOT_MCP_MAX_BODY/);
    ok("over-limit body answered with JSON-RPC 413", j413.error.message.slice(0, 60) + "...");

    // 3. FIFO queue: concurrent calls are serialized per user
    p1.maxActive = 0;
    const conc = await Promise.all([1, 2, 3].map((i) => call(client, "execute_code", { code: `//SLEEP 600\n${i}` })));
    assert.equal(conc.length, 3);
    assert.equal(p1.maxActive, 1, "plugin saw concurrent tasks");
    ok("3 concurrent execute_code calls serialized (max plugin concurrency 1)");

    // 4. busy-is-alive: while a blocking task runs (no heartbeats > grace), a new call is queued, not rejected
    const job1 = parse(await call(client, "submit_code", { code: "//BLOCK 3500\nheavy" }));
    await sleep(3000); // heartbeat age now > 2 s grace
    const t0 = Date.now();
    const afterBlock = parse(await call(client, "execute_code", { code: "quick" }));
    assert.equal(afterBlock.result.plugin, "tab-1");
    ok("call during blocking task queued instead of 'suspended' error", `waited ${Date.now() - t0} ms`);

    // 5. job lifecycle
    const js1 = parse(await call(client, "job_status", { job_id: job1.jobId, wait_s: 10 }));
    assert.equal(js1.state, "succeeded", JSON.stringify(js1));
    assert.equal(js1.result.len, "//BLOCK 3500\nheavy".length);
    ok("submit_code + job_status(wait_s) -> succeeded with result", `elapsed ${js1.elapsedS}s`);

    // 5b. job longer than the synchronous tool timeout (4 s) succeeds
    const longJob = parse(await call(client, "submit_code", { code: "//SLEEP 6000\nlong", timeout_s: 30 }));
    const ljs = parse(await call(client, "job_status", { job_id: longJob.jobId, wait_s: 20 }));
    assert.equal(ljs.state, "succeeded", JSON.stringify(ljs));
    ok("job running 6 s > PENPOT_MCP_TOOL_TIMEOUT_S=4 succeeds");

    // 5c. chunked job with failure
    const cj = parse(await call(client, "submit_code", { chunks: ["a", "//FAIL", "c"], stop_on_error: true }));
    const cjs = parse(await call(client, "job_status", { job_id: cj.jobId, wait_s: 10 }));
    assert.equal(cjs.state, "failed");
    assert.equal(cjs.results.length, 2);
    ok("chunked job stops on error", `completed ${cjs.completedChunks}/${cjs.chunks}`);

    // 5d. cancel a job whose task is still queued behind another one
    const blocker = parse(await call(client, "submit_code", { code: "//SLEEP 2000\nblocker" }));
    const victim = parse(await call(client, "submit_code", { code: "//SLEEP 100\nvictim" }));
    await sleep(200);
    const cancelled = parse(await call(client, "cancel_job", { job_id: victim.jobId }));
    assert.equal(cancelled.state, "cancelled");
    assert.equal(cancelled.cancelledTaskWas, "queued");
    const bs = parse(await call(client, "job_status", { job_id: blocker.jobId, wait_s: 10 }));
    assert.equal(bs.state, "succeeded");
    ok("cancel_job drops a queued task before it reaches the plugin");

    // 6. timeout -> orphan keeps lane busy -> next call waits for the late response instead of racing
    const timedOut = await call(client, "execute_code", { code: "//SLEEP 5500\nslow" });
    assert.match(timedOut, /timed out after 4 seconds/);
    p1.maxActive = 0;
    const next = parse(await call(client, "execute_code", { code: "after-timeout" }));
    assert.equal(next.result.plugin, "tab-1");
    assert.equal(p1.maxActive, 1);
    ok("timed-out task orphaned; follow-up call dispatched after its late response");

    // 7. batch_execute
    const batch = parse(await call(client, "batch_execute", { chunks: ["one", "//SLEEP 200\ntwo", "three"] }));
    assert.equal(batch.ok, true);
    assert.equal(batch.results.length, 3);
    ok("batch_execute runs 3 chunks in one round trip", `totalMs=${batch.totalMs}`);

    // 8. server_stats tool
    const st = parse(await call(client, "server_stats"));
    assert.equal(st.plugins.connectedPlugins, 1);
    assert.ok(st.plugins.recentTasks.length > 0);
    assert.ok(!JSON.stringify(st).includes(TOKEN), "token leaked in stats");
    ok("server_stats tool", `recentRunMs=${JSON.stringify(st.plugins.recentRunMs)}`);

    // 9. takeover: a second tab for the same token replaces the first
    const p2 = fakePlugin("tab-2");
    await p2.ready;
    await sleep(300);
    assert.equal(p1.closed?.code, 1008, "old tab not closed");
    const afterTakeover = parse(await call(client, "execute_code", { code: "who" }));
    assert.equal(afterTakeover.result.plugin, "tab-2");
    const st2 = await stats();
    assert.equal(st2.plugins.takeovers, 1);
    ok("PENPOT_MCP_CONNECTION_POLICY=takeover routes to newest tab", `old tab closed: ${p1.closed.reason}`);

    // 10. session TTL: an abandoned session is removed
    // (a live SDK client re-opens its GET stream and gets its session re-adopted, so simulate a client that
    // vanished after initialize: raw initialize request, no GET stream, no DELETE)
    const init = await fetch(`http://${HOST}:${HTTP_PORT}/mcp?userToken=${encodeURIComponent(TOKEN)}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "ghost", version: "0" } },
        }),
    });
    await init.text();
    assert.ok(init.headers.get("mcp-session-id"));
    const before = (await stats()).sessions.streamable;
    await sleep(15_000);
    const after = (await stats()).sessions.streamable;
    assert.ok(after < before, `sessions before=${before} after=${after}`);
    ok("idle sessions expire (PENPOT_MCP_SESSION_TTL_S=10)", `streamable sessions ${before} -> ${after}`);

    await client.close().catch(() => {});
    p2.ws.close();
} catch (error) {
    exitCode = 1;
    console.error("FAIL:", error);
    console.error("---- server output ----\n" + serverOut.slice(-4000));
} finally {
    server.kill("SIGTERM");
    await new Promise((r) => server.once("exit", r));
    console.log(`\n${results.length} checks passed; server stopped (exit ${server.exitCode ?? server.signalCode}).`);
    process.exit(exitCode);
}
