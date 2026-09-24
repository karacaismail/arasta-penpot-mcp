import { z } from "zod";
import "reflect-metadata";
import { EmptyToolArgs, Tool } from "../Tool";
import { TextResponse, type ToolResponse } from "../ToolResponse";
import type { PenpotMcpServer } from "../PenpotMcpServer";
import { runChunks, type ChunkResult, type JobManager } from "../JobManager";
import type { PlusConfig } from "../PlusConfig";

/**
 * [mcp-plus] additional tools: submit_code, job_status, cancel_job, batch_execute, server_stats.
 */

function json(value: unknown): TextResponse {
    return new TextResponse(JSON.stringify(value, null, 2));
}

function chunksSchema(max: number) {
    return z
        .array(z.string().min(1, "Chunk cannot be empty"))
        .min(1)
        .max(max)
        .describe(
            `Array of JavaScript code chunks (max ${max}), executed sequentially in the plugin context, each exactly ` +
                "like an execute_code call. `storage` persists across chunks, so later chunks can use results stored " +
                "by earlier ones."
        );
}

// ------------------------------------------------------------------------------------------------
// submit_code
// ------------------------------------------------------------------------------------------------

export class SubmitCodeArgs {
    static schema(cfg: PlusConfig) {
        return {
            code: z
                .string()
                .min(1)
                .optional()
                .describe("JavaScript code to execute in the background (same semantics as execute_code)."),
            chunks: chunksSchema(cfg.batchMaxChunks)
                .optional()
                .describe("Alternative to `code`: several chunks executed sequentially within one job."),
            stop_on_error: z
                .boolean()
                .optional()
                .describe("For `chunks`: stop at the first failing chunk (default true)."),
            timeout_s: z
                .number()
                .int()
                .positive()
                .optional()
                .describe(`Total job runtime budget in seconds (default and maximum: ${cfg.jobTimeoutSecs}).`),
        };
    }

    code?: string;
    chunks?: string[];
    stop_on_error?: boolean;
    timeout_s?: number;
}

export class SubmitCodeTool extends Tool<SubmitCodeArgs> {
    constructor(
        mcpServer: PenpotMcpServer,
        private readonly jobs: JobManager,
        cfg: PlusConfig
    ) {
        super(mcpServer, SubmitCodeArgs.schema(cfg));
    }

    public getToolName(): string {
        return "submit_code";
    }

    public getToolDescription(): string {
        return (
            "Starts executing JavaScript code in the Penpot plugin context in the BACKGROUND and immediately returns a " +
            "`jobId`. Use this instead of execute_code for long-running work (large generations, many shapes) that " +
            "could exceed the synchronous tool timeout. The code has exactly the same semantics as for execute_code " +
            "(`penpot`, `penpotUtils`, `storage`; return a value to get it back). Alternatively pass `chunks` to run " +
            "several code pieces sequentially in one job. Then call `job_status` (with `wait_s` to long-poll) until the " +
            "state is no longer 'running', or `cancel_job` to abort. Jobs survive the client HTTP request."
        );
    }

    protected async executeCore(args: SubmitCodeArgs): Promise<ToolResponse> {
        const hasCode = typeof args.code === "string" && args.code.length > 0;
        const hasChunks = Array.isArray(args.chunks) && args.chunks.length > 0;
        if (hasCode === hasChunks) {
            throw new Error("Provide exactly one of `code` or `chunks`.");
        }
        const chunks = hasCode ? [args.code!] : args.chunks!;
        const userToken = this.getSessionContext()?.userToken;
        const job = this.jobs.submit(userToken, chunks, args.stop_on_error ?? true, args.timeout_s);
        return json({
            jobId: job.id,
            state: job.state,
            timeoutS: job.timeoutSecs,
            hint: "Poll with job_status({ job_id, wait_s: 30 }).",
        });
    }
}

// ------------------------------------------------------------------------------------------------
// job_status
// ------------------------------------------------------------------------------------------------

export class JobStatusArgs {
    static schema(cfg: PlusConfig) {
        return {
            job_id: z.string().min(1).describe("The jobId returned by submit_code."),
            wait_s: z
                .number()
                .min(0)
                .optional()
                .describe(
                    `Long-poll: wait up to this many seconds (max ${cfg.jobMaxWaitSecs}) for the job to finish before ` +
                        "answering. Default 0 (answer immediately)."
                ),
        };
    }

    job_id!: string;
    wait_s?: number;
}

export class JobStatusTool extends Tool<JobStatusArgs> {
    constructor(
        mcpServer: PenpotMcpServer,
        private readonly jobs: JobManager,
        cfg: PlusConfig
    ) {
        super(mcpServer, JobStatusArgs.schema(cfg));
    }

    public getToolName(): string {
        return "job_status";
    }

    public getToolDescription(): string {
        return (
            "Returns the state of a background job started with submit_code: state ('running', 'succeeded', " +
            "'failed', 'cancelled', 'timed_out'), elapsed seconds and, once finished, the result/log (single code) or " +
            "per-chunk results, or the error. Use `wait_s` to long-poll instead of polling rapidly."
        );
    }

    protected async executeCore(args: JobStatusArgs): Promise<ToolResponse> {
        const job = this.jobs.get(args.job_id, this.getSessionContext()?.userToken);
        await this.jobs.wait(job, args.wait_s ?? 0);
        return json(this.jobs.describe(job));
    }
}

// ------------------------------------------------------------------------------------------------
// cancel_job
// ------------------------------------------------------------------------------------------------

export class CancelJobArgs {
    static schema = {
        job_id: z.string().min(1).describe("The jobId returned by submit_code."),
    };

    job_id!: string;
}

export class CancelJobTool extends Tool<CancelJobArgs> {
    constructor(
        mcpServer: PenpotMcpServer,
        private readonly jobs: JobManager
    ) {
        super(mcpServer, CancelJobArgs.schema);
    }

    public getToolName(): string {
        return "cancel_job";
    }

    public getToolDescription(): string {
        return (
            "Cancels a running background job. Chunks not yet sent to the plugin are dropped. NOTE: code that is " +
            "already executing inside the Penpot tab cannot be interrupted and may still complete."
        );
    }

    protected async executeCore(args: CancelJobArgs): Promise<ToolResponse> {
        const job = this.jobs.get(args.job_id, this.getSessionContext()?.userToken);
        const { wasState, taskState } = this.jobs.cancel(job);
        await this.jobs.wait(job, 2);
        return json({
            jobId: job.id,
            previousState: wasState,
            cancelledTaskWas: taskState,
            ...this.jobs.describe(job, false),
        });
    }
}

// ------------------------------------------------------------------------------------------------
// batch_execute
// ------------------------------------------------------------------------------------------------

export class BatchExecuteArgs {
    static schema(cfg: PlusConfig) {
        return {
            chunks: chunksSchema(cfg.batchMaxChunks),
            stop_on_error: z
                .boolean()
                .optional()
                .describe("Stop at the first failing chunk (default true); remaining chunks are skipped."),
        };
    }

    chunks!: string[];
    stop_on_error?: boolean;
}

export class BatchExecuteTool extends Tool<BatchExecuteArgs> {
    constructor(mcpServer: PenpotMcpServer, cfg: PlusConfig) {
        super(mcpServer, BatchExecuteArgs.schema(cfg));
    }

    public getToolName(): string {
        return "batch_execute";
    }

    public getToolDescription(): string {
        return (
            "Executes several JavaScript code chunks sequentially in the Penpot plugin context in ONE tool call, " +
            "returning per-chunk results (result, log, error, durationMs). Each chunk has the same semantics as an " +
            "execute_code call and is subject to the per-task timeout; `storage` persists between chunks. " +
            "For work that may take minutes in total, prefer submit_code with `chunks`."
        );
    }

    protected async executeCore(args: BatchExecuteArgs): Promise<ToolResponse> {
        const results: ChunkResult[] = [];
        const start = Date.now();
        await runChunks(this.mcpServer, args.chunks, args.stop_on_error ?? true, results);
        return json({
            ok: results.length === args.chunks.length && results.every((r) => r.ok),
            executed: results.length,
            total: args.chunks.length,
            totalMs: Date.now() - start,
            results,
        });
    }
}

// ------------------------------------------------------------------------------------------------
// server_stats
// ------------------------------------------------------------------------------------------------

export class ServerStatsTool extends Tool<EmptyToolArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, EmptyToolArgs.schema);
    }

    public getToolName(): string {
        return "server_stats";
    }

    public getToolDescription(): string {
        return (
            "Returns diagnostic statistics of the Penpot MCP server: plugin connection health (heartbeat age, busy, " +
            "frozen), per-user task queue, running background jobs, and recent task durations. Useful to check " +
            "whether the Penpot tab is connected/responsive before starting heavy work. In multi-user mode, only " +
            "your own connection's details are shown."
        );
    }

    protected async executeCore(_args: EmptyToolArgs): Promise<ToolResponse> {
        const token = this.mcpServer.isMultiUserMode() ? this.getSessionContext()?.userToken ?? "" : undefined;
        return json(this.mcpServer.getStats(token));
    }
}
