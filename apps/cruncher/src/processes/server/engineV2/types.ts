import { Mutex } from "async-mutex";
import EventEmitter from "node:events";
import { JSONSchema } from "zod/v4/core";
import { PluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { FullDate } from "~lib/dateUtils";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { Brand, Signal } from "@cruncher/utils";

export type TaskRef = Brand<string, "TaskRef">;
export type QueryTask = {
  id: TaskRef;
  input: QueryInput;
  status: "running" | "completed" | "failed" | "canceled";
  error: string | null; // Error message if the task failed
  createdAt: number;
};

export const finishedStatuses = new Set<QueryTask["status"]>([
  "completed",
  "failed",
  "canceled",
]);

export type QueryInput = {
  searchTerm: string;
  searchProfileRef: SearchProfileRef;
  queryOptions: SerializableParams;
};

export type QueryTaskState = {
  task: QueryTask;

  subTasks: SubTask[];
  abortController: AbortController;
  /** Unique IDs seen so far — used by appendQuery() to deduplicate live rows. */
  uniqueIds: Set<string>;
  /** True once appendQuery() has been called at least once on this task. */
  isLive: boolean;
  /** Maps instanceRef → subtaskId for routing live-mode inserts. */
  subtaskByInstance: Map<InstanceRef, string>;
  /** Accumulated raw parquet chunk paths (from subtasks) */
  chunkPaths: string[];
  /** Path to events result Parquet (pipeline output), null until pipeline runs */
  eventsResultPath: string | null;
  eventsResultRowCount: number;
  /** Path to table result Parquet (| stats / | table output), null if not produced */
  tableResultPath: string | null;
  tableResultRowCount: number;
  tableResultColumns: string[] | null;
  /** Path to view result JSON (| timechart output), null if not produced */
  viewResultPath: string | null;
  lastBatchStatus: JobBatchFinished | null;
  batchHistory: JobBatchFinished[];
  finishedQuerying: Signal;
  mutex: Mutex;
  ee: EventEmitter;
  /** Unix timestamp (ms) of the last batch received — updated on every onBatchDone. */
  lastActivityAt: number;
  /** In-memory pipeline output; set after _runPipelineAndSave, cleared when task is released */
  eventsCache: ProcessedData[] | null;
  tableCache: { data: ProcessedData[]; columns: string[] } | null;
  /** Pre-computed byte estimate of eventsCache + tableCache, updated whenever cache is set. */
  cachedBytesSnapshot: number;
};

export type QueryExecutionHistory = {
  params: ControllerIndexParam[];
  search: Search;
  start: FullDate;
  end: FullDate;
  instanceRef: InstanceRef;
};

export type InstanceRef = Brand<string, "InstanceRef">;
export type SearchProfileRef = Brand<string, "SearchProfileRef">;

// MUST BE SERIALIZABLE
export type SearchProfile = {
  name: SearchProfileRef;
  instances: InstanceRef[];
};

// MUST BE SERIALIZABLE
export type PluginInstance = {
  id: string;
  name: InstanceRef;
  description: string;
  pluginRef: PluginRef;
};

// MUST BE SERIALIZABLE
export type SerializableAdapter = {
  ref: PluginRef;
  name: string;
  description: string;
  version: string;
  params: JSONSchema.BaseSchema;
};

// MUST BE SERIALIZABLE
export type SerializableParams = {
  fromTime: number;
  toTime: number;
  limit: number;
  isForced: boolean;
};

export type PluginInstanceContainer = {
  instance: PluginInstance;
  provider: QueryProvider;
};

export type PageResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  next: number | null; // Reference to the next page, if any
  prev: number | null; // Reference to the previous page, if any
};

export type TableDataResponse = PageResponse<ProcessedData>;

export type ClosestPoint = {
  closest: number | null;
  index: number | null; // Index of the closest point in the data array
};

export type SubTaskRef = Brand<string, "SubTaskRef">;
export type SubTask = {
  id: SubTaskRef;
  subtaskId: string;      // references subtask_history.id
  instanceRef: InstanceRef;
  dataDir: string;        // path to subtask Parquet chunk directory
  dedupKey: string;
  isReady: Promise<void>;
  fromDedup: boolean;     // true if reusing an existing subtask
  sourceSubtaskId: string | null;
};

export type JobBatchFinished = {
  scale: {
    from: number;
    to: number;
  };
  views: {
    events: {
      total: number;
      buckets: { timestamp: number; count: number }[];
      autoCompleteKeys: string[];
    };
    table?: {
      totalRows: number;
      columns: string[];
      columnLengths: Record<string, number>;
    };
    view?: {};
  };
};

export type ExportResults = {
  payload: string; // The exported data in a string format (e.g., CSV, JSON)
  fileName: string; // The name of the file to be downloaded
  contentType: string; // The type of the file (e.g., "text/csv", "application/json")
};

export type ActiveTaskInfo = {
  taskId: string;
  status: string;
  searchTerm: string;
  searchProfile: string;
  createdAt: number;
  error: string | null;
  subTaskCount: number;
  subtaskIds: string[];
  lastActivityAt: number;
  /** Row count of results currently held in the in-process memory cache (0 if not cached). */
  cachedRowCount: number;
  /** Estimated byte size of in-process memory cache (0 if not cached). */
  cachedBytes: number;
};

export type EngineStatus = {
  activeTaskCount: number;
  activeTasks: ActiveTaskInfo[];
  initializedPlugins: PluginInstance[];
  searchProfiles: SearchProfile[];
  totalDiskBytes: number | null;
  workerStats: {
    inflightOps: number;
    pendingOps: number;
    isDead: boolean;
    totalOpsDispatched: number;
  };
  historyStats: {
    totalQueryCount: number;
    totalRowCount: number;
  };
};
