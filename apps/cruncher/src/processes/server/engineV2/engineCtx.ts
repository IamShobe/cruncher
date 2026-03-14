import { ProcessedData } from "@cruncher/adapter-utils/logTypes";

export const SUBTASK_DATA_VERSION = "v1";
import { IQueryBackend } from "./duckdb/IQueryBackend";
import { LocalStateDB } from "./localstate/LocalStateDB";
import { PluginRegistry } from "./pluginRegistry";
import { TaskStore } from "./taskStore";
import { JobBatchFinished, QueryTaskState, TaskRef } from "./types";

export type BuildBatchStatusOpts = {
  scale: { from: number; to: number };
  total: number;
  buckets: { timestamp: number; count: number }[];
  autoCompleteKeys: string[];
  tableDataPoints?: ProcessedData[];
};

export type BuildBatchStatusFn = (
  taskState: QueryTaskState,
  opts: BuildBatchStatusOpts,
) => JobBatchFinished;

export type EngineCtx = {
  stateDB: LocalStateDB;
  backend: IQueryBackend;
  taskStore: TaskStore;
  pluginRegistry: PluginRegistry;
  sessionsDir: string;
  absPath: (rel: string) => string;
  relPath: (abs: string) => string;
  buildBatchStatus: BuildBatchStatusFn;
  releaseTaskResources: (id: TaskRef) => Promise<void>;
  isShuttingDown: () => boolean;
  trackAsyncWork: (work: Promise<void>) => void;
};
