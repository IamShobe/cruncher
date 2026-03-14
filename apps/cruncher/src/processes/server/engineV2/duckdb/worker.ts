/**
 * DuckDB worker thread.
 *
 * Owns one set of DuckDB instances:
 * - subtasks: in-memory DuckDB instances that act as write buffers; each
 *   writeBatch call flushes the buffer to an immutable Parquet chunk file.
 *
 * Stateless operations (readChunks, writeTaskResult, paginateFile,
 * getClosestEvent) reuse a persistent :memory: DuckDB instance.
 *
 * Operations are serialized through a FIFO promise queue so concurrent callers
 * never interleave SQL on the same connection.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parentPort } from "node:worker_threads";
import { DuckDBInstance, DuckDBConnection } from "@duckdb/node-api";
import { tableFromIPC } from "apache-arrow";
import {
  closestEventSql,
  columnNamesSql,
  COUNT_EVENTS_SQL,
  COUNT_RESULT_EVENTS_SQL,
  histogramSql,
  paginateSql,
  parquetViewSql,
  readChunksSql,
  RESULT_EVENTS_DDL,
  SUBTASK_BUFFER_DDL,
  SUBTASK_STATS_SQL,
  writeChunkSql,
  writeTaskResultSql,
// @ts-ignore - required cuz it's bundled
} from "./workerSql.ts";


type TaskEntry = {
  instance: DuckDBInstance;
  conn: DuckDBConnection;
};

type SubtaskEntry = TaskEntry & {
  dataDir: string;
  chunkCount: number;
};

/** Per-adapter in-memory write-buffer DuckDB instances */
const subtasks = new Map<string, SubtaskEntry>();

// ---------- simple FIFO queue -------------------------------------------

const queue: Array<() => Promise<void>> = [];
let running = false;

function enqueue(fn: () => Promise<void>): void {
  queue.push(fn);
  if (!running) drainQueue();
}

async function drainQueue(): Promise<void> {
  running = true;
  while (queue.length > 0) {
    try {
      await queue.shift()!();
    } catch {
      // errors are handled inside each enqueued fn
    }
  }
  running = false;
}

// ---------- helpers ------------------------------------------------------

let statelessInstance: DuckDBInstance | null = null;
let statelessConn: DuckDBConnection | null = null;

async function getStatelessConn(): Promise<DuckDBConnection> {
  if (!statelessConn) {
    statelessInstance = await DuckDBInstance.create(":memory:");
    statelessConn = await statelessInstance.connect();
  }
  return statelessConn;
}

async function withStatelessConn<T>(fn: (conn: DuckDBConnection) => Promise<T>): Promise<T> {
  const conn = await getStatelessConn();
  try {
    return await fn(conn);
  } finally {
    await conn.run("DROP VIEW IF EXISTS events");
    await conn.run("DROP TABLE IF EXISTS result_events");
  }
}

async function withParquetView<T>(
  filePaths: string | string[],
  fn: (conn: DuckDBConnection) => Promise<T>,
): Promise<T> {
  return withStatelessConn(async (conn) => {
    await conn.run(parquetViewSql(filePaths));
    return fn(conn);
  });
}

async function appendArrowToTable(conn: DuckDBConnection, tableName: string, ipcBytes: Uint8Array): Promise<void> {
  const table = tableFromIPC(ipcBytes);
  if (table.numRows === 0) return;

  const idCol = table.getChild("_id")!;
  const timeCol = table.getChild("_time")!;
  const msgCol = table.getChild("message")!;
  const rawCol = table.getChild("_raw")!;
  const uniqueIdCol = table.getChild("_unique_id");
  const fieldsCol = table.getChild("fields")!;

  const appender = await conn.createAppender(tableName);
  for (let i = 0; i < table.numRows; i++) {
    appender.appendVarchar(String(idCol.get(i) ?? ""));
    appender.appendBigInt(BigInt(timeCol.get(i) ?? 0));
    appender.appendVarchar(String(msgCol.get(i) ?? ""));
    const raw = rawCol.get(i);
    if (raw == null) appender.appendNull();
    else appender.appendVarchar(String(raw));
    const uid = uniqueIdCol?.get(i);
    if (uid == null) appender.appendNull();
    else appender.appendVarchar(String(uid));
    appender.appendVarchar(String(fieldsCol.get(i) ?? "{}"));
    appender.endRow();
  }
  appender.flushSync();
  appender.closeSync();
}

// ---------- message handling ---------------------------------------------

type InMsg =
  | { id: string; type: "openSubtask"; subtaskId: string; dataDir: string }
  | { id: string; type: "closeSubtask"; subtaskId: string }
  | { id: string; type: "writeBatch"; subtaskId: string; batch: Uint8Array }
  | { id: string; type: "readChunks"; chunkPaths: string[]; fromTime: number; toTime: number }
  | { id: string; type: "writeTaskResult"; arrowBytes: Uint8Array; outputPath: string }
  | { id: string; type: "paginateFile"; filePath: string; offset: number; limit: number }
  | { id: string; type: "getClosestEvent"; filePath: string; refTime: number }
  | { id: string; type: "computeHistogram"; chunkPaths: string[]; fromTime: number; toTime: number; numBuckets: number }
  | { id: string; type: "getColumnNames"; chunkPaths: string[]; fromTime: number; toTime: number };

parentPort!.on("message", (msg: InMsg) => {
  enqueue(async () => {
    try {
      const reply = await handle(msg);
      parentPort!.postMessage(reply);
    } catch (err) {
      parentPort!.postMessage({
        id: msg.id,
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });
});

async function handle(msg: InMsg): Promise<unknown> {
  switch (msg.type) {
    case "openSubtask": {
      fs.mkdirSync(msg.dataDir, { recursive: true });
      const instance = await DuckDBInstance.create(":memory:");
      const conn = await instance.connect();
      await conn.run(SUBTASK_BUFFER_DDL);
      subtasks.set(msg.subtaskId, { instance, conn, dataDir: msg.dataDir, chunkCount: 0 });
      return { id: msg.id, type: "ok" };
    }

    case "closeSubtask": {
      const entry = subtasks.get(msg.subtaskId);
      if (entry) {
        entry.conn.closeSync();
        entry.instance.closeSync();
        subtasks.delete(msg.subtaskId);
      }
      return { id: msg.id, type: "ok" };
    }

    case "writeBatch": {
      const entry = getSubtaskEntry(msg.subtaskId);
      await appendArrowToTable(entry.conn, "events", msg.batch);

      const statsRows = await entry.conn.runAndReadAll(SUBTASK_STATS_SQL);
      const { cnt, min_t, max_t } = statsRows.getRowObjectsJS()[0] as { cnt: unknown; min_t: unknown; max_t: unknown };
      const rowCount = Number(cnt ?? 0);
      const minTime = min_t != null ? Number(min_t) : 0;
      const maxTime = max_t != null ? Number(max_t) : 0;

      const chunkName = `chunk-${String(entry.chunkCount).padStart(6, "0")}.parquet`;
      const chunkPath = path.join(entry.dataDir, chunkName);
      entry.chunkCount++;

      await entry.conn.run(writeChunkSql(chunkPath));
      const diskBytes = fs.statSync(chunkPath).size;
      await entry.conn.run("DELETE FROM events");

      return { id: msg.id, type: "chunk", chunkPath, rowCount, diskBytes, minTime, maxTime };
    }

    case "readChunks": {
      if (msg.chunkPaths.length === 0) return { id: msg.id, type: "rows", rows: [] };
      return withParquetView(msg.chunkPaths, async (conn) => {
        const reader = await conn.runAndReadAll(readChunksSql(msg.fromTime, msg.toTime));
        return { id: msg.id, type: "rows", rows: reader.getRowObjectsJS() };
      });
    }

    case "writeTaskResult": {
      return withStatelessConn(async (conn) => {
        await conn.run(RESULT_EVENTS_DDL);
        await appendArrowToTable(conn, "result_events", msg.arrowBytes);
        await conn.run(writeTaskResultSql(msg.outputPath));
        const countResult = await conn.runAndReadAll(COUNT_RESULT_EVENTS_SQL);
        const rowCount = Number((countResult.getRowObjectsJS()[0] as { n: bigint }).n ?? 0);
        const diskBytes = fs.existsSync(msg.outputPath) ? fs.statSync(msg.outputPath).size : 0;
        return { id: msg.id, type: "taskResultWritten", rowCount, diskBytes };
      });
    }

    case "paginateFile": {
      return withParquetView(msg.filePath, async (conn) => {
        const rowsResult = await conn.runAndReadAll(paginateSql(msg.limit, msg.offset));
        const countResult = await conn.runAndReadAll(COUNT_EVENTS_SQL);
        const rows = rowsResult.getRowObjectsJS() as Record<string, unknown>[];
        const total = Number((countResult.getRowObjectsJS()[0] as { cnt: bigint }).cnt ?? 0);
        return { id: msg.id, type: "paginated", rows, total };
      });
    }

    case "getClosestEvent": {
      return withParquetView(msg.filePath, async (conn) => {
        const result = await conn.runAndReadAll(closestEventSql(msg.refTime));
        const rows = result.getRowObjectsJS() as { _time: bigint; row_idx: bigint }[];
        if (rows.length === 0) return { id: msg.id, type: "closestEvent", result: null };
        return {
          id: msg.id,
          type: "closestEvent",
          result: { closest: Number(rows[0]!._time), rowIndex: Number(rows[0]!.row_idx) },
        };
      });
    }

    case "computeHistogram": {
      if (msg.chunkPaths.length === 0) return { id: msg.id, type: "histogram", buckets: [] };
      return withParquetView(msg.chunkPaths, async (conn) => {
        const bucketWidth = msg.toTime > msg.fromTime
          ? Math.floor((msg.toTime - msg.fromTime) / msg.numBuckets)
          : 1;
        const result = await conn.runAndReadAll(histogramSql(msg.fromTime, msg.toTime, bucketWidth));
        const rows = result.getRowObjectsJS() as { timestamp: bigint; count: bigint }[];
        return {
          id: msg.id,
          type: "histogram",
          buckets: rows.map(r => ({ timestamp: Number(r.timestamp), count: Number(r.count) })),
        };
      });
    }

    case "getColumnNames": {
      if (msg.chunkPaths.length === 0) return { id: msg.id, type: "columnNames", columns: ["_time", "message"] };
      return withParquetView(msg.chunkPaths, async (conn) => {
        const result = await conn.runAndReadAll(columnNamesSql(msg.fromTime, msg.toTime));
        const rows = result.getRowObjectsJS() as { col: string }[];
        return {
          id: msg.id,
          type: "columnNames",
          columns: ["_time", "message", "_raw", "_uniqueId", ...rows.map(r => r.col)],
        };
      });
    }

    default:
      throw new Error(`Unknown message type: ${(msg as { type: string }).type}`);
  }
}

function getSubtaskEntry(subtaskId: string): SubtaskEntry {
  const entry = subtasks.get(subtaskId);
  if (!entry) throw new Error(`Subtask ${subtaskId} not found in worker`);
  return entry;
}
