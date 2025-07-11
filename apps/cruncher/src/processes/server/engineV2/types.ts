import { Mutex } from "async-mutex";
import EventEmitter from "node:events";
import BTree from "sorted-btree";
import { JSONSchema } from "zod/v4/core";
import { PluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { FullDate } from "~lib/dateUtils";
import { DisplayResults } from "~lib/displayTypes";
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
  queryOptions: SerializeableParams;
};

export type QueryTaskState = {
  task: QueryTask;

  subTasks: SubTask[];
  abortController: AbortController;
  index: BTree<number, ProcessedData[]>;
  displayResults: DisplayResults;
  lastBatchStatus: JobBatchFinished | null;
  finishedQuerying: Signal;
  mutex: Mutex;
  ee: EventEmitter;
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
export type SerializeableParams = {
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
  createdAt: Date;
  instanceRef: InstanceRef;
  cacheKey: string;
  isReady: Promise<void>;
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
