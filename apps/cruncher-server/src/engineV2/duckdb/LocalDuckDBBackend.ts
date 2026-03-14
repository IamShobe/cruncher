import { Worker, Transferable } from "node:worker_threads";
import path from "node:path";
import { IQueryBackend } from "./IQueryBackend";

type PendingEntry = {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
};

type WorkerReply =
  | { id: string; type: "ok" }
  | { id: string; type: "chunk"; chunkPath: string; rowCount: number; diskBytes: number; minTime: number; maxTime: number }
  | { id: string; type: "rows"; rows: Record<string, unknown>[] }
  | { id: string; type: "taskResultWritten"; rowCount: number; diskBytes: number }
  | { id: string; type: "paginated"; rows: Record<string, unknown>[]; total: number }
  | { id: string; type: "closestEvent"; result: { closest: number; rowIndex: number } | null }
  | { id: string; type: "histogram"; buckets: { timestamp: number; count: number }[] }
  | { id: string; type: "columnNames"; columns: string[] }
  | { id: string; type: "error"; message: string };

export class LocalDuckDBBackend implements IQueryBackend {
  private worker: Worker;
  private pending = new Map<string, PendingEntry>();
  private nextId = 0;
  private dead = false;
  private _inflightOps = 0;
  private _totalOpsDispatched = 0;
  private _drainCallbacks: Array<() => void> = [];

  constructor(workerScriptPath?: string) {
    const workerPath = workerScriptPath ?? resolveDefaultWorkerPath();
    const workerOpts = workerPath.endsWith(".ts")
      ? { execArgv: ["--import", "tsx"] }
      : {};
    this.worker = new Worker(workerPath, workerOpts);

    this.worker.on("message", (msg: WorkerReply) => {
      const entry = this.pending.get(msg.id);
      if (!entry) return;
      this.pending.delete(msg.id);
      this._inflightOps--;
      this._notifyDrain();
      if (msg.type === "error") {
        entry.reject(new Error(msg.message));
      } else {
        entry.resolve(msg);
      }
    });

    this.worker.on("error", (err) => {
      this.dead = true;
      this._inflightOps = 0;
      this._notifyDrain();
      for (const entry of this.pending.values()) {
        entry.reject(err);
      }
      this.pending.clear();
    });
  }

  private send<T>(payload: Record<string, unknown>, transfer?: Transferable[]): Promise<T> {
    if (this.dead) return Promise.reject(new Error("DuckDB worker has crashed"));
    this._inflightOps++;
    this._totalOpsDispatched++;
    const id = String(++this.nextId);
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.worker.postMessage({ ...payload, id }, transfer ?? []);
    });
  }

  private _notifyDrain(): void {
    if (this._inflightOps === 0) {
      const callbacks = this._drainCallbacks.splice(0);
      for (const cb of callbacks) cb();
    }
  }

  /** Waits for all in-flight worker operations to complete. */
  drain(): Promise<void> {
    if (this._inflightOps === 0) return Promise.resolve();
    return new Promise<void>((resolve) => this._drainCallbacks.push(resolve));
  }

  async openSubtask(subtaskId: string, dataDir: string): Promise<void> {
    await this.send({ type: "openSubtask", subtaskId, dataDir });
  }

  async closeSubtask(subtaskId: string): Promise<void> {
    await this.send({ type: "closeSubtask", subtaskId });
  }

  async writeBatch(subtaskId: string, batch: Uint8Array): Promise<{ chunkPath: string; rowCount: number; diskBytes: number; minTime: number; maxTime: number }> {
    const reply = await this.send<{ type: "chunk"; chunkPath: string; rowCount: number; diskBytes: number; minTime: number; maxTime: number }>(
      { type: "writeBatch", subtaskId, batch },
      [batch.buffer as ArrayBuffer],
    );
    return { chunkPath: reply.chunkPath, rowCount: reply.rowCount, diskBytes: reply.diskBytes, minTime: reply.minTime, maxTime: reply.maxTime };
  }

  async readChunks(chunkPaths: string[], fromTime: number, toTime: number): Promise<Record<string, unknown>[]> {
    if (chunkPaths.length === 0) return [];
    const reply = await this.send<{ type: "rows"; rows: Record<string, unknown>[] }>({
      type: "readChunks", chunkPaths, fromTime, toTime,
    });
    return reply.rows;
  }

  async writeTaskResult(arrowBytes: Uint8Array, outputPath: string): Promise<{ rowCount: number; diskBytes: number }> {
    const reply = await this.send<{ type: "taskResultWritten"; rowCount: number; diskBytes: number }>(
      { type: "writeTaskResult", arrowBytes, outputPath },
      [arrowBytes.buffer as ArrayBuffer],
    );
    return { rowCount: reply.rowCount, diskBytes: reply.diskBytes };
  }

  async paginateFile(filePath: string, offset: number, limit: number): Promise<{ rows: Record<string, unknown>[]; total: number }> {
    const reply = await this.send<{ type: "paginated"; rows: Record<string, unknown>[]; total: number }>({
      type: "paginateFile", filePath, offset, limit,
    });
    return { rows: reply.rows, total: reply.total };
  }

  async computeHistogram(chunkPaths: string[], fromTime: number, toTime: number, numBuckets: number): Promise<{ timestamp: number; count: number }[]> {
    if (chunkPaths.length === 0) return [];
    const reply = await this.send<{ type: "histogram"; buckets: { timestamp: number; count: number }[] }>({
      type: "computeHistogram", chunkPaths, fromTime, toTime, numBuckets,
    });
    return reply.buckets;
  }

  async getColumnNames(chunkPaths: string[], fromTime: number, toTime: number): Promise<string[]> {
    if (chunkPaths.length === 0) return ["_time", "message"];
    const reply = await this.send<{ type: "columnNames"; columns: string[] }>({
      type: "getColumnNames", chunkPaths, fromTime, toTime,
    });
    return reply.columns;
  }


  async getClosestEvent(filePath: string, refTime: number): Promise<{ closest: number; rowIndex: number } | null> {
    const reply = await this.send<{ type: "closestEvent"; result: { closest: number; rowIndex: number } | null }>({
      type: "getClosestEvent", filePath, refTime,
    });
    return reply.result;
  }

  getStats(): { inflightOps: number; pendingOps: number; isDead: boolean; totalOpsDispatched: number } {
    return { inflightOps: this._inflightOps, pendingOps: this.pending.size, isDead: this.dead, totalOpsDispatched: this._totalOpsDispatched };
  }

  terminate(): void {
    this.dead = true;
    this._inflightOps = 0;
    this._notifyDrain();
    this.worker.terminate();
    for (const entry of this.pending.values()) {
      entry.reject(new Error("DuckDB worker terminated"));
    }
    this.pending.clear();
  }
}

function resolveDefaultWorkerPath(): string {
  // In Electron asar bundles, the worker script is in the unpacked directory.
  if (__dirname.includes(".asar")) {
    return path.join(
      __dirname.replace(/\.asar([/\\])/, ".asar.unpacked$1"),
      "duckdb-worker.js",
    );
  }
  return path.join(__dirname, "duckdb-worker.js");
}
