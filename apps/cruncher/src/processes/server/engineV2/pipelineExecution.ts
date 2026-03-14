import * as fs from "node:fs";
import * as path from "node:path";
import EventEmitter from "node:events";
import { Mutex } from "async-mutex";
import {
  asDisplayString,
  ProcessedData,
} from "@cruncher/adapter-utils/logTypes";
import { DisplayResults } from "~lib/displayTypes";
import { processEval } from "~lib/pipelineEngine/eval";
import { processRegex } from "~lib/pipelineEngine/regex";
import {
  PipelineItemProcessor,
  processPipelineV2,
} from "~lib/pipelineEngine/root";
import { processSort } from "~lib/pipelineEngine/sort";
import { processStats } from "~lib/pipelineEngine/stats";
import { processTable } from "~lib/pipelineEngine/table";
import { processTimeChart } from "~lib/pipelineEngine/timechart";
import { processWhere } from "~lib/pipelineEngine/where";
import { processUnpack } from "~lib/pipelineEngine/unpack";
import { ParsedQuery } from "@cruncher/qql";
import { createSignal } from "@cruncher/utils";
import { deserializeRows, serializeBatch } from "./duckdb/serialization";
import { QueryTask, QueryTaskState, SerializableParams, TaskRef } from "./types";
import { EngineCtx } from "./engineCtx";

export const PIPELINE_PROCESSOR: PipelineItemProcessor = {
  eval: (_context, currentData, options) =>
    processEval(currentData, options.variableName, options.expression),
  regex: (_context, currentData, options) =>
    processRegex(
      currentData,
      new RegExp(options.pattern.pattern),
      options.columnSelected,
    ),
  sort: (_context, currentData, options) =>
    processSort(
      currentData,
      options.columns.map((c) => ({ name: c.column, order: c.order })),
    ),
  stats: (_context, currentData, options) =>
    processStats(currentData, options.aggregationFunctions, options.groupby),
  table: (_context, currentData, options) =>
    processTable(currentData, options.columns),
  timechart: (context, currentData, options) =>
    processTimeChart(
      currentData,
      options.aggregationFunctions,
      options.groupby,
      context.startTime,
      context.endTime,
      options.params,
    ),
  where: (_context, currentData, options) =>
    processWhere(currentData, options.expression),
  unpack: (_context, currentData, options) =>
    processUnpack(currentData, [options.field]),
};

export function collectColumns(data: ProcessedData[]): Set<string> {
  const columns = new Set<string>();
  for (const dataPoint of data) {
    for (const key in dataPoint.object) columns.add(key);
  }
  return columns;
}

export function getTableColumnLengths(
  columns: string[],
  data: ProcessedData[],
): Record<string, number> {
  return Object.fromEntries(
    columns.map((col) => [
      col,
      Math.min(
        100,
        Math.max(
          3,
          col.length,
          ...data.map((row) => asDisplayString(row.object[col]).length + 3),
        ),
      ),
    ]),
  );
}

export function createQueryTaskState(task: QueryTask): QueryTaskState {
  return {
    task,
    mutex: new Mutex(),
    finishedQuerying: createSignal(),
    uniqueIds: new Set(),
    isLive: false,
    subtaskByInstance: new Map(),
    chunkPaths: [],
    eventsResultPath: null,
    eventsResultRowCount: 0,
    tableResultPath: null,
    tableResultRowCount: 0,
    tableResultColumns: null,
    viewResultPath: null,
    lastBatchStatus: null,
    batchHistory: [],
    abortController: new AbortController(),
    subTasks: [],
    ee: new EventEmitter(),
    lastActivityAt: Date.now(),
    eventsCache: null,
    tableCache: null,
    cachedBytesSnapshot: 0,
  };
}

export async function runPipelineAndSave(
  ctx: EngineCtx,
  taskId: TaskRef,
  parsedTree: ParsedQuery,
  queryOptions: SerializableParams,
): Promise<{ displayResults: DisplayResults; rawEventCount: number; autoCompleteKeys: string[] }> {
  const taskState: QueryTaskState | undefined = ctx.taskStore.get(taskId);
  if (!taskState) {
    const empty: DisplayResults = { events: { type: "events", data: [] }, table: undefined, view: undefined };
    return { displayResults: empty, rawEventCount: 0, autoCompleteKeys: [] };
  }

  const context = {
    startTime: new Date(queryOptions.fromTime),
    endTime: new Date(queryOptions.toTime),
  };
  const resultsDir = path.join(ctx.sessionsDir, "task-results");
  await fs.promises.mkdir(resultsDir, { recursive: true });

  // 1. Read raw chunks (time-range filter only)
  const rows = await ctx.backend.readChunks(
    taskState.chunkPaths,
    queryOptions.fromTime,
    queryOptions.toTime,
  );
  const rawEvents = deserializeRows(rows);
  const rawEventCount = rawEvents.length;

  // 2. Run full JS pipeline
  const initial: DisplayResults = {
    events: { type: "events", data: rawEvents },
    table: undefined,
    view: undefined,
  };
  const displayResults =
    parsedTree.pipeline.length === 0
      ? initial
      : processPipelineV2(PIPELINE_PROCESSOR, initial, parsedTree.pipeline, context);

  // Populate in-memory caches (Opt A)
  const CACHE_ROW_LIMIT = 50_000;
  taskState.eventsCache = displayResults.events.data.length <= CACHE_ROW_LIMIT
    ? displayResults.events.data
    : null;
  taskState.tableCache = displayResults.table && displayResults.table.dataPoints.length <= CACHE_ROW_LIMIT
    ? { data: displayResults.table.dataPoints, columns: displayResults.table.columns }
    : null;
  // 3a. Save events result — defer serialization off critical path (eventsCache serves reads)
  taskState.eventsResultPath = null;
  // Set synchronously so callers can read row count before the async write completes
  taskState.eventsResultRowCount = displayResults.events.data.length;
  taskState.cachedBytesSnapshot = 0;

  // 3b. Save table result — columns/count set synchronously for _buildBatchStatus
  taskState.tableResultPath = null;
  taskState.tableResultRowCount = 0;
  taskState.tableResultColumns = null;
  if (displayResults.table) {
    taskState.tableResultColumns = displayResults.table.columns;
    taskState.tableResultRowCount = displayResults.table.dataPoints.length;
  }

  // 3c. Save view result as JSON — keep synchronous (no DuckDB, cheap)
  taskState.viewResultPath = null;
  if (displayResults.view) {
    const viewPath = path.join(resultsDir, `${taskId}-view.json`);
    await fs.promises.writeFile(viewPath, JSON.stringify(displayResults.view));
    taskState.viewResultPath = viewPath;
  }

  // 4. Defer serialization + writes off the critical path via setImmediate
  const deferredWrites = new Promise<void>((resolve) => {
    setImmediate(() => {
      if (ctx.isShuttingDown()) {
        resolve();
        return;
      }

      const asyncWrites: Promise<void>[] = [];
      let cachedBytes = 0;

      if (displayResults.events.data.length > 0) {
        const eventsPath = path.join(resultsDir, `${taskId}-events.parquet`);
        const eventsBytes = serializeBatch(displayResults.events.data);
        if (taskState.eventsCache != null) cachedBytes += eventsBytes.byteLength;
        const p = ctx.backend.writeTaskResult(eventsBytes, eventsPath)
          .then(({ rowCount }) => {
            taskState.eventsResultPath = eventsPath;
            taskState.eventsResultRowCount = rowCount;
          })
          .catch((err) => console.warn(`[engine] async events write failed for ${taskId}:`, err));
        asyncWrites.push(p);
      }

      if (displayResults.table) {
        const tablePath = path.join(resultsDir, `${taskId}-table.parquet`);
        const tableBytes = serializeBatch(displayResults.table.dataPoints);
        if (taskState.tableCache != null) cachedBytes += tableBytes.byteLength;
        const p = ctx.backend.writeTaskResult(tableBytes, tablePath)
          .then(({ rowCount }) => {
            taskState.tableResultPath = tablePath;
            taskState.tableResultRowCount = rowCount;
          })
          .catch((err) => console.warn(`[engine] async table write failed for ${taskId}:`, err));
        asyncWrites.push(p);
      }

      taskState.cachedBytesSnapshot = cachedBytes;

      // Persist result file paths to SQLite once async writes complete
      Promise.all(asyncWrites).then(() => {
        if (ctx.isShuttingDown()) return;
        ctx.stateDB.saveTaskResults(taskId as string, {
          eventsPath: taskState.eventsResultPath,
          tablePath: taskState.tableResultPath,
          tableColumns: taskState.tableResultColumns,
          viewPath: taskState.viewResultPath,
        });
      }).catch((err) => console.warn("[engine] async saveTaskResults failed:", err)).finally(resolve);
    });
  });
  ctx.trackAsyncWork(deferredWrites);

  const autoCompleteKeys = [
    ...new Set([
      ...collectColumns(rawEvents),
      ...collectColumns(displayResults.events.data),
      ...(displayResults.table?.columns ?? []),
    ]),
  ];

  return { displayResults, rawEventCount, autoCompleteKeys };
}
