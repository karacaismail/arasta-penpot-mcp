import assert from "node:assert/strict";
import test from "node:test";
import { loadPlusConfig } from "./PlusConfig";

test("[mcp-plus] defaults reproduce upstream behaviour", () => {
    const c = loadPlusConfig({});
    assert.equal(c.maxBody, "100kb");
    assert.equal(c.toolTimeoutSecs, 120);
    assert.equal(c.heartbeatGraceSecs, 30);
    assert.equal(c.taskQueueMax, 0);
    assert.equal(c.busyIsAlive, false);
    assert.equal(c.connectionPolicy, "reject");
    assert.equal(c.sessionTtlSecs, 3600);
    assert.equal(c.sessionSweepSecs, 1800);
    assert.equal(c.maxSessions, 0);
    assert.equal(c.enableJobs, false);
    assert.equal(c.enableBatch, false);
    assert.equal(c.enableStats, false);
    assert.equal(c.progressIntervalSecs, 0);
});

test("[mcp-plus] env overrides are parsed", () => {
    const c = loadPlusConfig({
        PENPOT_MCP_MAX_BODY: "5mb",
        PENPOT_MCP_TOOL_TIMEOUT_S: "300",
        PENPOT_MCP_HEARTBEAT_GRACE_S: "90",
        PENPOT_MCP_TASK_QUEUE_MAX: "8",
        PENPOT_MCP_CONNECTION_POLICY: "takeover-stale",
        PENPOT_MCP_SESSION_TTL_S: "600",
        PENPOT_MCP_ENABLE_JOBS: "true",
        PENPOT_MCP_ENABLE_BATCH: "1",
        PENPOT_MCP_ENABLE_STATS: "yes",
    });
    assert.equal(c.maxBody, "5mb");
    assert.equal(c.toolTimeoutSecs, 300);
    assert.equal(c.heartbeatGraceSecs, 90);
    assert.equal(c.taskQueueMax, 8);
    assert.equal(c.busyIsAlive, true, "queueing implies busy-is-alive unless overridden");
    assert.equal(c.connectionPolicy, "takeover-stale");
    assert.equal(c.sessionTtlSecs, 600);
    assert.equal(c.sessionSweepSecs, 60);
    assert.equal(c.enableJobs && c.enableBatch && c.enableStats, true);
});

test("[mcp-plus] invalid numbers fall back to defaults instead of NaN", () => {
    const c = loadPlusConfig({ PENPOT_MCP_TOOL_TIMEOUT_S: "abc", PENPOT_MCP_CONNECTION_POLICY: "bogus" });
    assert.equal(c.toolTimeoutSecs, 120);
    assert.equal(c.connectionPolicy, "reject");
});

test("[mcp-plus] busy-is-alive can be disabled explicitly with queueing", () => {
    const c = loadPlusConfig({ PENPOT_MCP_TASK_QUEUE_MAX: "4", PENPOT_MCP_BUSY_IS_ALIVE: "false" });
    assert.equal(c.busyIsAlive, false);
});
