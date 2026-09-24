import { randomUUID } from "crypto";
import type { PenpotMcpServer } from "./PenpotMcpServer";
import { ExecuteCodePluginTask } from "./tasks/ExecuteCodePluginTask";
import { createLogger } from "./logger";
import { tokenFingerprint, type TaskState } from "./PluginBridge";
import type { PlusConfig } from "./PlusConfig";

/**
 * [mcp-plus] Background execution of execute_code work ("jobs").
 *
 * A job is started by the `submit_code` tool and runs detached from the MCP request that created it,
 * so it survives the client's HTTP request, proxy timeouts (nginx: 300 s) and client-side tool timeouts.
 * Clients poll `job_status` (optionally long-polling via `wait_s`) and may `cancel_job`.
 *
 * Jobs live in memory only (lost on server restart).
 */

export type JobState = "running" | "succeeded" | "failed" | "cancelled" | "timed_out";

export interface ChunkResult {
    index: number;
    ok: boolean;
    durationMs: number;
    result?: unknown;
    log?: string;
    error?: string;
}

interface Job {
    id: string;
    userToken: string | undefined;
    state: JobState;
    createdAt: number;
    finishedAt?: number;
    timeoutSecs: number;
    chunks: string[];
    stopOnError: boolean;
    results: ChunkResult[];
    currentChunk: number;
    currentTaskId?: string;
    error?: string;
    done: Promise<void>;
    cancelRequested: boolean;
}

/**
 * Runs a sequence of code chunks through the plugin bridge (shared by batch_execute and jobs).
 *
 * @param onTaskCreated - invoked with each task id before it is dispatched (for cancellation/status)
 * @param shouldStop - checked before each chunk
 * @param deadline - absolute deadline (ms since epoch) bounding every chunk's timeout; undefined = per-chunk tool timeout
 */
export async function runChunks(
    mcpServer: PenpotMcpServer,
    chunks: string[],
    stopOnError: boolean,
    results: ChunkResult[],
    opts: {
        onTaskCreated?: (taskId: string, index: number) => void;
        shouldStop?: () => boolean;
        deadline?: number;
    } = {}
): Promise<void> {
    for (let i = 0; i < chunks.length; i++) {
        if (opts.shouldStop?.()) {
            return;
        }
        let timeoutSecs: number | undefined;
        if (opts.deadline !== undefined) {
            timeoutSecs = Math.max(1, Math.ceil((opts.deadline - Date.now()) / 1000));
            if (opts.deadline <= Date.now()) {
                throw new JobTimeoutError(`Job deadline reached before chunk ${i}`);
            }
        }
        const task = new ExecuteCodePluginTask({ code: chunks[i] });
        opts.onTaskCreated?.(task.id, i);
        const start = Date.now();
        try {
            const res = await mcpServer.pluginBridge.executePluginTask(task, { timeoutSecs });
            results.push({
                index: i,
                ok: true,
                durationMs: Date.now() - start,
                result: res.data?.result,
                log: res.data?.log ? res.data.log : undefined,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            results.push({ index: i, ok: false, durationMs: Date.now() - start, error: message });
            if (opts.deadline !== undefined && Date.now() >= opts.deadline - 250) {
                throw new JobTimeoutError(message);
            }
            if (stopOnError) {
                return;
            }
        }
    }
}

export class JobTimeoutError extends Error {}

export class JobManager {
    private readonly logger = createLogger("JobManager");
    private readonly jobs: Map<string, Job> = new Map();
    private readonly sweepInterval: NodeJS.Timeout;

    constructor(
        private readonly mcpServer: PenpotMcpServer,
        private readonly cfg: PlusConfig
    ) {
        this.sweepInterval = setInterval(() => this.sweep(), 60_000);
        this.sweepInterval.unref();
    }

    /** Removes finished jobs older than the retention period. */
    private sweep(): void {
        const cutoff = Date.now() - this.cfg.jobRetentionSecs * 1000;
        for (const [id, job] of this.jobs) {
            if (job.finishedAt !== undefined && job.finishedAt < cutoff) {
                this.jobs.delete(id);
            }
        }
    }

    public submit(
        userToken: string | undefined,
        chunks: string[],
        stopOnError: boolean,
        requestedTimeoutSecs?: number
    ): Job {
        this.sweep();
        const active = [...this.jobs.values()].filter((j) => j.state === "running" && j.userToken === userToken);
        if (active.length >= this.cfg.jobMaxActivePerUser) {
            throw new Error(
                `Too many unfinished jobs for this user (${active.length}; PENPOT_MCP_JOB_MAX_ACTIVE=${this.cfg.jobMaxActivePerUser}). ` +
                    `Wait for or cancel existing jobs.`
            );
        }
        const timeoutSecs = Math.min(
            this.cfg.jobTimeoutSecs,
            requestedTimeoutSecs && requestedTimeoutSecs > 0 ? requestedTimeoutSecs : this.cfg.jobTimeoutSecs
        );
        const job: Job = {
            id: randomUUID(),
            userToken,
            state: "running",
            createdAt: Date.now(),
            timeoutSecs,
            chunks,
            stopOnError,
            results: [],
            currentChunk: -1,
            cancelRequested: false,
            done: Promise.resolve(),
        };
        this.jobs.set(job.id, job);
        // run detached from the MCP request, but inside the submitting user's session context
        job.done = this.mcpServer.runWithSessionContext({ userToken }, () => this.run(job));
        this.logger.info(
            `Job ${job.id} submitted (userFp=${tokenFingerprint(userToken)}, chunks=${chunks.length}, timeout=${timeoutSecs}s)`
        );
        return job;
    }

    private async run(job: Job): Promise<void> {
        const deadline = job.createdAt + job.timeoutSecs * 1000;
        try {
            await runChunks(this.mcpServer, job.chunks, job.stopOnError, job.results, {
                deadline,
                shouldStop: () => job.cancelRequested,
                onTaskCreated: (taskId, index) => {
                    job.currentTaskId = taskId;
                    job.currentChunk = index;
                },
            });
            if (job.cancelRequested) {
                job.state = "cancelled";
            } else {
                const failed = job.results.find((r) => !r.ok);
                job.state = failed ? "failed" : "succeeded";
                if (failed) job.error = failed.error;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            job.state = job.cancelRequested ? "cancelled" : error instanceof JobTimeoutError ? "timed_out" : "failed";
            job.error = message;
        } finally {
            job.finishedAt = Date.now();
            job.currentTaskId = undefined;
            this.logger.info(`Job ${job.id} finished: ${job.state} in ${job.finishedAt - job.createdAt}ms`);
        }
    }

    /** Looks up a job, enforcing ownership in multi-user mode. */
    public get(jobId: string, userToken: string | undefined): Job {
        const job = this.jobs.get(jobId);
        if (!job || (this.mcpServer.isMultiUserMode() && job.userToken !== userToken)) {
            throw new Error(`Unknown job id: ${jobId} (jobs are kept for ${this.cfg.jobRetentionSecs}s after finishing)`);
        }
        return job;
    }

    /** Waits up to `waitSecs` for the job to finish. */
    public async wait(job: Job, waitSecs: number): Promise<void> {
        const s = Math.min(Math.max(0, waitSecs), this.cfg.jobMaxWaitSecs);
        if (s <= 0 || job.state !== "running") return;
        let timer: NodeJS.Timeout | undefined;
        await Promise.race([job.done, new Promise<void>((r) => (timer = setTimeout(r, s * 1000)))]);
        if (timer) clearTimeout(timer);
    }

    public cancel(job: Job): { wasState: JobState; taskState: TaskState | null } {
        const wasState = job.state;
        if (job.state !== "running") {
            return { wasState, taskState: null };
        }
        job.cancelRequested = true;
        let taskState: TaskState | null = null;
        if (job.currentTaskId) {
            taskState = this.mcpServer.pluginBridge.cancelTask(job.currentTaskId, `Job ${job.id} cancelled`);
        }
        return { wasState, taskState };
    }

    public describe(job: Job, includeResults: boolean = true): Record<string, unknown> {
        const now = Date.now();
        const lastOk = [...job.results].reverse().find((r) => r.ok);
        return {
            jobId: job.id,
            state: job.state,
            elapsedS: Math.round(((job.finishedAt ?? now) - job.createdAt) / 100) / 10,
            timeoutS: job.timeoutSecs,
            chunks: job.chunks.length,
            completedChunks: job.results.length,
            currentChunk: job.state === "running" ? job.currentChunk : undefined,
            currentTaskState:
                job.state === "running" && job.currentTaskId
                    ? this.mcpServer.pluginBridge.getTaskState(job.currentTaskId)
                    : undefined,
            error: job.error,
            // single-chunk jobs: expose result/log directly (mirrors execute_code)
            ...(includeResults && job.chunks.length === 1 && job.results.length === 1
                ? job.results[0].ok
                    ? { result: job.results[0].result, log: job.results[0].log }
                    : {}
                : {}),
            ...(includeResults && job.chunks.length > 1 ? { results: job.results } : {}),
            ...(job.chunks.length > 1 && lastOk ? { lastSuccessfulChunk: lastOk.index } : {}),
            note:
                job.state === "cancelled" || job.state === "timed_out"
                    ? "Code already dispatched to the plugin cannot be interrupted server-side; it may still complete in the browser."
                    : undefined,
        };
    }

    public getStats(onlyToken?: string): Record<string, unknown> {
        const counts: Record<string, number> = {};
        const running: Record<string, unknown>[] = [];
        for (const job of this.jobs.values()) {
            if (onlyToken !== undefined && job.userToken !== onlyToken) continue;
            counts[job.state] = (counts[job.state] ?? 0) + 1;
            if (job.state === "running") {
                running.push({
                    jobId: job.id,
                    userFp: tokenFingerprint(job.userToken),
                    elapsedS: Math.round((Date.now() - job.createdAt) / 1000),
                    chunk: `${job.currentChunk + 1}/${job.chunks.length}`,
                    taskState: job.currentTaskId ? this.mcpServer.pluginBridge.getTaskState(job.currentTaskId) : null,
                });
            }
        }
        return { counts, running };
    }

    public close(): void {
        clearInterval(this.sweepInterval);
    }
}
