import { JSONSchema } from "zod/v4/core";
import { PluginRef } from "@cruncher/adapter-utils";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { FullDate } from "../dateUtils";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { Brand } from "@cruncher/utils";

export type TaskRef = Brand<string, "TaskRef">;
export type QueryTask = {
  id: TaskRef;
  input: QueryInput;
  status: "running" | "completed" | "failed" | "canceled";
  error: string | null;
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

export type QueryExecutionHistory = {
  params: ControllerIndexParam[];
  search: Search;
  start: FullDate;
  end: FullDate;
  instanceRef: InstanceRef;
};

export type InstanceRef = Brand<string, "InstanceRef">;
export type SearchProfileRef = Brand<string, "SearchProfileRef">;

export type SearchProfile = {
  name: SearchProfileRef;
  instances: InstanceRef[];
};

export type PluginInstance = {
  id: string;
  name: InstanceRef;
  description: string;
  pluginRef: PluginRef;
};

export type SerializableAdapter = {
  ref: PluginRef;
  name: string;
  description: string;
  version: string;
  params: JSONSchema.BaseSchema;
};

export type SerializableParams = {
  fromTime: number;
  toTime: number;
  limit: number;
  isForced: boolean;
};

export type PageResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  next: number | null;
  prev: number | null;
};

export type TableDataResponse = PageResponse<ProcessedData>;

export type ClosestPoint = {
  closest: number | null;
  index: number | null;
};

export type SubTaskRef = Brand<string, "SubTaskRef">;
export type SubTask = {
  id: SubTaskRef;
  subtaskId: string;
  instanceRef: InstanceRef;
  dataDir: string;
  dedupKey: string;
  isReady: Promise<void>;
  fromDedup: boolean;
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
  payload: string;
  fileName: string;
  contentType: string;
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
  cachedRowCount: number;
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
