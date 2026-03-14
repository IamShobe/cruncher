import { Mutex } from "async-mutex";
import EventEmitter from "node:events";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { QueryProvider } from "@cruncher/adapter-utils";
import { Signal } from "@cruncher/utils";
import type {
  ClosestPoint,
  EngineStatus,
  ExportResults,
  InstanceRef,
  JobBatchFinished,
  PageResponse,
  PluginInstance,
  QueryExecutionHistory,
  QueryInput,
  QueryTask,
  SearchProfile,
  SearchProfileRef,
  SerializableAdapter,
  SerializableParams,
  SubTask,
  SubTaskRef,
  TableDataResponse,
  TaskRef,
  ActiveTaskInfo,
} from "@cruncher/server-shared";
import { finishedStatuses } from "@cruncher/server-shared";

export type {
  ClosestPoint,
  EngineStatus,
  ExportResults,
  InstanceRef,
  JobBatchFinished,
  PageResponse,
  PluginInstance,
  QueryExecutionHistory,
  QueryInput,
  QueryTask,
  SearchProfile,
  SearchProfileRef,
  SerializableAdapter,
  SerializableParams,
  SubTask,
  SubTaskRef,
  TableDataResponse,
  TaskRef,
  ActiveTaskInfo,
};

export { finishedStatuses };

export type QueryTaskState = {
  task: QueryTask;

  subTasks: SubTask[];
  abortController: AbortController;
  uniqueIds: Set<string>;
  isLive: boolean;
  subtaskByInstance: Map<InstanceRef, string>;
  chunkPaths: string[];
  eventsResultPath: string | null;
  eventsResultRowCount: number;
  tableResultPath: string | null;
  tableResultRowCount: number;
  tableResultColumns: string[] | null;
  viewResultPath: string | null;
  lastBatchStatus: JobBatchFinished | null;
  batchHistory: JobBatchFinished[];
  finishedQuerying: Signal;
  mutex: Mutex;
  ee: EventEmitter;
  lastActivityAt: number;
  eventsCache: ProcessedData[] | null;
  tableCache: { data: ProcessedData[]; columns: string[] } | null;
  cachedBytesSnapshot: number;
};

export type PluginInstanceContainer = {
  instance: PluginInstance;
  provider: QueryProvider;
};
