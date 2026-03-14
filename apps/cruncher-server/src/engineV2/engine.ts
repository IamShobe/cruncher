import { on } from "node:events";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { v7 as uuidv7 } from "uuid";
import {
  ExternalAuthProvider,
} from "@cruncher/adapter-utils";
import {
  compareProcessedData,
  ProcessedData,
} from "@cruncher/adapter-utils/logTypes";
import { DisplayResults } from "@cruncher/server-shared";
import { parse } from "@cruncher/qql";
import { measureTime } from "@cruncher/utils";
import merge from "merge-k-sorted-arrays";
import {
  ClosestPoint,
  ExportResults,
  finishedStatuses,
  InstanceRef,
  JobBatchFinished,
  PageResponse,
  QueryTask,
  QueryTaskState,
  SearchProfileRef,
  SerializableAdapter,
  SerializableParams,
  SubTask,
  SubTaskRef,
  TableDataResponse,
  TaskRef,
} from "./types";
import { IQueryBackend } from "./duckdb/IQueryBackend";
import { LocalDuckDBBackend } from "./duckdb/LocalDuckDBBackend";
import {
  serializeBatch,
  deserializeRows,
  deserializeTableRows,
} from "./duckdb/serialization";
import { AdapterLock } from "./duckdb/sessionMeta";
import { ChunkEntry, HistoryEntry, HistoryPage, LocalStateDB } from "./localstate/LocalStateDB";
import { TaskStore, stopTask } from "./taskStore";
import { PluginRegistry } from "./pluginRegistry";
import {
  createQueryTaskState,
  getTableColumnLengths,
  runPipelineAndSave,
} from "./pipelineExecution";
import { computeSubtaskDedupKey, resolveSubtaskDedup } from "./subtaskDedup";
import { exportTableResults } from "./exportHelpers";
import {
  deleteSession,
  listSessions,
  recoverInterruptedSessions,
  restoreSession,
} from "./sessionManager";
import {
  clearQueryHistory,
  deleteHistoryEntry,
  getEngineStatus,
  getLoadedTaskIds,
  getQueryHistory,
  getSubtasksWithChunks,
  pruneHistory,
} from "./historyManager";
import { BuildBatchStatusOpts, EngineCtx } from "./engineCtx";

const SESSIONS_DIR_NAME = "query-sessions";

function safeHomeDir(): string {
  try {
    const home = os.homedir();
    if (home) return home;
  } catch {
    // ignore
  }
  const envHome = process.env.HOME;
  if (envHome) return envHome;
  return "/tmp";
}

function xdgDataDir(name: string): string {
  const home = safeHomeDir();
  if (process.platform === "win32") {
    const local = process.env["LOCALAPPDATA"] ?? path.join(home, "AppData", "Local");
    return path.join(local, name);
  }
  if (process.platform === "darwin") {
    return path.join(home, "Library", "Application Support", name);
  }
  const xdgDataHome = process.env["XDG_DATA_HOME"] ?? path.join(home, ".local", "share");
  return path.join(xdgDataHome, name);
}

export class Engine {
  private pluginRegistry: PluginRegistry;
  private taskStore: TaskStore;

  private backend: IQueryBackend;
  private sessionsDir: string;
  private stateDB: LocalStateDB;
  private ctx: EngineCtx;
  private maxHistoryEntries: number | null = null;
  private isShuttingDown = false;
  private pendingAsyncWork = new Set<Promise<void>>();

  constructor(
    authProvider: ExternalAuthProvider,
    opts: { userDataPath?: string; workerScriptPath?: string } = {},
  ) {
    this.backend = new LocalDuckDBBackend(opts.workerScriptPath);
    const dataDir = opts.userDataPath ?? xdgDataDir("cruncher");
    this.sessionsDir = path.join(dataDir, SESSIONS_DIR_NAME);
    fs.mkdirSync(this.sessionsDir, { recursive: true });
    this.stateDB = new LocalStateDB(path.join(dataDir, "local-state.sqlite"));
    this.pluginRegistry = new PluginRegistry(authProvider);
    this.taskStore = new TaskStore();
    this.ctx = {
      stateDB: this.stateDB,
      backend: this.backend,
      taskStore: this.taskStore,
      pluginRegistry: this.pluginRegistry,
      sessionsDir: this.sessionsDir,
      absPath: (r) => this._absPath(r),
      relPath: (a) => this._relPath(a),
      buildBatchStatus: (...args) => this._buildBatchStatus(...args),
      releaseTaskResources: (id) => this.releaseTaskResources(id),
      isShuttingDown: () => this.isShuttingDown,
      trackAsyncWork: (work) => this._trackAsyncWork(work),
    };
  }

  /** Convert an absolute path to a path relative to sessionsDir for storage. */
  private _relPath(absPath: string): string {
    return path.relative(this.sessionsDir, absPath);
  }

  /** Resolve a relative (sessionsDir-relative) path to absolute. */
  private _absPath(relPath: string): string {
    return path.join(this.sessionsDir, relPath);
  }

  // ---------------------------------------------------------------------------
  // Plugin & profile management — delegates to PluginRegistry
  // ---------------------------------------------------------------------------

  public registerPlugin(plugin: Parameters<PluginRegistry["registerPlugin"]>[0]): void {
    this.pluginRegistry.registerPlugin(plugin);
  }

  public getSupportedPlugins(): SerializableAdapter[] {
    return this.pluginRegistry.getSupportedPlugins();
  }

  public async getControllerParams(instanceId: InstanceRef) {
    return this.pluginRegistry.getControllerParams(instanceId);
  }

  public async getParamValueSuggestions(
    instanceId: InstanceRef,
    field: string,
    indexes: string[],
  ): Promise<string[]> {
    return this.pluginRegistry.getParamValueSuggestions(instanceId, field, indexes);
  }

  public getInitializedPlugins() {
    return this.pluginRegistry.getInitializedPlugins();
  }

  public getSearchProfiles() {
    return this.pluginRegistry.getSearchProfiles();
  }

  public setMaxHistoryEntries(n: number | null): void {
    this.maxHistoryEntries = n;
  }

  public reset(): void {
    this.pluginRegistry.reset();
  }

  public initializePlugin(
    ...args: Parameters<PluginRegistry["initializePlugin"]>
  ) {
    return this.pluginRegistry.initializePlugin(...args);
  }

  public initializeSearchProfile(
    ...args: Parameters<PluginRegistry["initializeSearchProfile"]>
  ) {
    return this.pluginRegistry.initializeSearchProfile(...args);
  }

  public getTaskState(taskId: TaskRef): QueryTaskState {
    const task = this.taskStore.get(taskId);
    if (!task) throw new Error(`Query task with id ${taskId} not found`);
    return task;
  }

  // ---------------------------------------------------------------------------
  // Paginated reads
  // ---------------------------------------------------------------------------

  public async getLogsPaginated(
    taskId: TaskRef,
    offset: number,
    limit: number,
  ): Promise<PageResponse<ProcessedData>> {
    const task = this.taskStore.get(taskId);
    if (!task) throw new Error(`Query task with id ${taskId} not found`);

    // Opt A: serve from in-memory cache (no DuckDB round-trip)
    if (task.eventsCache) {
      const slice = task.eventsCache.slice(offset, offset + limit);
      const total = task.eventsCache.length;
      return {
        data: slice,
        total,
        limit,
        next: offset + limit < total ? offset + limit : null,
        prev: offset > 0 ? Math.max(0, offset - limit) : null,
      };
    }

    if (!task.eventsResultPath) {
      // Pipeline hasn't run yet — return empty
      return { data: [], total: 0, limit, next: null, prev: null };
    }

    const { rows, total } = await this.backend.paginateFile(task.eventsResultPath, offset, limit);
    const data = deserializeRows(rows);
    const endIndex = offset + limit;

    return {
      data,
      total,
      limit,
      next: endIndex < total ? endIndex : null,
      prev: offset > 0 ? Math.max(0, offset - limit) : null,
    };
  }

  public async getTableDataPaginated(
    taskId: TaskRef,
    offset: number,
    limit: number,
  ): Promise<TableDataResponse> {
    const task = this.taskStore.get(taskId);
    if (!task) throw new Error(`Query task with id ${taskId} not found`);

    // Opt A: serve from in-memory cache (no DuckDB round-trip)
    if (task.tableCache) {
      const slice = task.tableCache.data.slice(offset, offset + limit);
      const total = task.tableCache.data.length;
      return {
        data: slice,
        total,
        limit,
        next: offset + limit < total ? offset + limit : null,
        prev: offset > 0 ? Math.max(0, offset - limit) : null,
      };
    }

    if (!task.tableResultPath || !task.tableResultColumns) {
      throw new Error(`No table data available for task ${taskId}`);
    }

    const { rows, total } = await this.backend.paginateFile(task.tableResultPath, offset, limit);
    const data = deserializeTableRows(rows, task.tableResultColumns);
    const endIndex = offset + limit;

    return {
      data,
      total,
      limit,
      next: endIndex < total ? endIndex : null,
      prev: offset > 0 ? Math.max(0, offset - limit) : null,
    };
  }

  public async getClosestDateEvent(
    taskId: TaskRef,
    refDate: number,
  ): Promise<ClosestPoint> {
    const task = this.taskStore.get(taskId);
    if (!task) throw new Error(`Query task with id ${taskId} not found`);

    // Opt A: binary search in-memory cache (no DuckDB round-trip)
    if (task.eventsCache && task.eventsCache.length > 0) {
      const events = task.eventsCache;
      let lo = 0, hi = events.length - 1, best = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const t = (events[mid]!.object["_time"] as { value: number }).value;
        const bestT = (events[best]!.object["_time"] as { value: number }).value;
        if (Math.abs(t - refDate) < Math.abs(bestT - refDate)) best = mid;
        if (t >= refDate) lo = mid + 1; else hi = mid - 1;
      }
      const closestTime = (events[best]!.object["_time"] as { value: number }).value;
      return { closest: closestTime, index: best };
    }

    if (!task.eventsResultPath) return { closest: null, index: null };

    const result = await this.backend.getClosestEvent(task.eventsResultPath, refDate);
    if (!result) return { closest: null, index: null };
    return { closest: result.closest, index: result.rowIndex };
  }

  // ---------------------------------------------------------------------------
  // runQuery
  // ---------------------------------------------------------------------------

  public async runQuery(
    searchProfileRef: SearchProfileRef,
    searchTerm: string,
    queryOptions: SerializableParams,
  ) {
    const profile = this.pluginRegistry.getSearchProfile(searchProfileRef);
    if (!profile) {
      throw new Error(`Search profile with name ${searchProfileRef} not found`);
    }

    const taskId = uuidv7() as TaskRef;

    const task: QueryTask = {
      id: taskId,
      status: "running",
      createdAt: new Date().getTime(),
      error: null,
      input: {
        searchTerm,
        searchProfileRef,
        queryOptions,
      },
    };

    const parsedTree = parse(searchTerm);
    const instancesToSearchOn = this.pluginRegistry.getInstancesToQueryOn(
      searchProfileRef,
      parsedTree,
    );
    if (instancesToSearchOn.length === 0) {
      throw new Error(`No instances found for search term: ${searchTerm}`);
    }

    const adapterLocks: AdapterLock[] = instancesToSearchOn.map((h) => {
      const plugin = this.pluginRegistry.findSupportedPlugin(h.instance.pluginRef);
      return {
        instanceRef: h.instance.name as string,
        pluginRef: h.instance.pluginRef as string,
        version: plugin?.version ?? "unknown",
      };
    });

    const queryTaskState = createQueryTaskState(task);
    this.taskStore.set(taskId, queryTaskState);
    this.taskStore.trackJob(taskId);
    console.log(`Created query task with id ${taskId}`);

    this.stateDB.upsertHistory({
      id: taskId,
      searchTerm,
      searchProfile: searchProfileRef as string,
      createdAt: task.createdAt,
      completedAt: null,
      rowCount: null,
      status: "running",
      error: null,
      subtaskIds: [],
      fromTime: queryOptions.fromTime,
      toTime: queryOptions.toTime,
      diskBytes: null,
    });

    queryTaskState.finishedQuerying.then(() => {
      this._persistTaskCompletion(taskId, queryTaskState);
      queryTaskState.ee.emit("close");
    });

    const onTaskDone = () => this._finalizeTask(taskId, parsedTree, queryOptions);

    // Build subtasks for all instances
    for (const instanceHolder of instancesToSearchOn) {
      const instanceRef = instanceHolder.instance.name;
      const adapterLock = adapterLocks.find(a => a.instanceRef === (instanceRef as string))!;
      const dedupKey = computeSubtaskDedupKey(
        parsedTree,
        searchProfileRef as string,
        queryOptions,
        instanceRef as string,
      );

      const resolution = resolveSubtaskDedup(
        this.ctx,
        dedupKey,
        queryOptions,
        searchTerm,
        searchProfileRef as string,
        adapterLock,
        taskId as string,
      );

      let isReady: Promise<void>;
      if (resolution.needsFetch) {
        const donePromise = this._createSubtaskFetcher(
          resolution.subtaskId,
          dedupKey,
          resolution.subtaskDataDir,
          instanceHolder,
          instanceRef,
          parsedTree,
          queryOptions,
          taskId,
          queryTaskState,
          onTaskDone,
        );
        this.taskStore.setInFlight(dedupKey, {
          subtaskId: resolution.subtaskId,
          done: donePromise,
        });
        isReady = donePromise;
      } else {
        isReady = resolution.isReady;
      }

      const subTask: SubTask = {
        id: uuidv7() as SubTaskRef,
        subtaskId: resolution.subtaskId,
        instanceRef,
        dataDir: resolution.subtaskDataDir,
        dedupKey,
        isReady,
        fromDedup: resolution.fromDedup,
        sourceSubtaskId: resolution.sourceSubtaskId,
      } satisfies SubTask;
      queryTaskState.subTasks.push(subTask);
      queryTaskState.subtaskByInstance.set(instanceRef, resolution.subtaskId);
    }

    Promise.allSettled(queryTaskState.subTasks.map((t) => t.isReady))
      .then(async (statuses) => {
        // Record refs for dedup-reused subtasks and accumulate their chunk paths.
        for (const subTask of queryTaskState.subTasks) {
          if (subTask.fromDedup) {
            const chunks = subTask.sourceSubtaskId
              ? this.stateDB.getChunksBySubtaskId(subTask.sourceSubtaskId)
              : this.stateDB.getChunksByDedupKey(subTask.dedupKey);
            for (const chunk of chunks) {
              this.stateDB.addChunkRef(subTask.subtaskId, chunk.id, true);
              queryTaskState.chunkPaths.push(this._absPath(chunk.chunkPath));
            }
          }
        }

        const allReady = statuses.every((s) => s.status === "fulfilled");
        if (!allReady) {
          const error = statuses.find((s) => s.status === "rejected")?.reason;
          task.status = "failed";
          queryTaskState.task.error = error?.message ?? null;
          console.error(`Query task ${taskId} failed:`, error);
        } else {
          console.log(`Query task ${taskId} completed`);
        }

        return onTaskDone()
          .then(() => {
            if (task.status === "failed") return; // already failed during batch processing
            task.status = "completed";
            queryTaskState.finishedQuerying.signal();
          })
          .catch((error) => {
            console.error(`Error finalizing task ${taskId}:`, error);
            task.status = "failed";
            queryTaskState.task.error = error.message;
            queryTaskState.finishedQuerying.signal();
          });
      })
      .catch((error) => {
        console.error(`Unexpected error in task ${taskId}:`, error);
        task.status = "failed";
        queryTaskState.finishedQuerying.signal();
      });

    return task;
  }

  // ---------------------------------------------------------------------------
  // Subtask fetcher
  // ---------------------------------------------------------------------------

  private async _createSubtaskFetcher(
    subtaskId: string,
    dedupKey: string,
    subtaskDataDir: string,
    instanceHolder: ReturnType<PluginRegistry["getInstancesToQueryOn"]>[number],
    instanceRef: InstanceRef,
    parsedTree: ReturnType<typeof parse>,
    queryOptions: SerializableParams,
    taskId: TaskRef,
    queryTaskState: QueryTaskState,
    onTaskDone: () => Promise<void>,
  ): Promise<void> {
    await this.backend.openSubtask(subtaskId, subtaskDataDir);

    const pendingBatches: Promise<void>[] = [];

    const onBatchDone = async (data: ProcessedData[]): Promise<void> => {
      if (queryTaskState.abortController.signal.aborted) return;
      for (const item of data) {
        if (!item.id) item.id = crypto.randomUUID();
        item.object["_source"] = { type: "string", value: instanceRef };
      }
      const bytes = serializeBatch(data);
      const chunk = await this.backend.writeBatch(subtaskId, bytes);
      const chunkId = uuidv7();
      this.stateDB.insertChunk({
        id: chunkId,
        dedupKey,
        chunkPath: this._relPath(chunk.chunkPath),
        rowCount: chunk.rowCount,
        diskBytes: chunk.diskBytes,
        minTime: chunk.minTime,
        maxTime: chunk.maxTime,
        writtenAt: Date.now(),
      } satisfies ChunkEntry);
      this.stateDB.addChunkRef(subtaskId, chunkId);
      queryTaskState.chunkPaths.push(chunk.chunkPath);
      try {
        await onTaskDone();
      } catch (error) {
        console.error(`Error processing task ${taskId}:`, error);
        queryTaskState.task.status = "failed";
        queryTaskState.task.error =
          error instanceof Error ? error.message : "Unknown error";
        queryTaskState.finishedQuerying.signal();
      }
      queryTaskState.lastActivityAt = Date.now();
      console.log(`Batch done for subtask ${subtaskId} (task ${taskId})`);
    };

    await instanceHolder.provider.query(
      parsedTree.controllerParams,
      parsedTree.search,
      {
        fromTime: new Date(queryOptions.fromTime),
        toTime: new Date(queryOptions.toTime),
        limit: queryOptions.limit,
        isLiveQuery: false,
        cancelToken: queryTaskState.abortController.signal,
        onBatchDone: (data) => {
          const p = onBatchDone(data);
          pendingBatches.push(p);
          return p;
        },
      },
    );

    await Promise.allSettled(pendingBatches);
  }

  // ---------------------------------------------------------------------------
  // View / export helpers
  // ---------------------------------------------------------------------------

  public async getViewData(
    taskId: TaskRef,
  ): Promise<NonNullable<DisplayResults["view"]>> {
    const taskState = this.taskStore.get(taskId);
    if (!taskState) throw new Error(`Query task with id ${taskId} not found`);
    if (!taskState.viewResultPath)
      throw new Error(`No view data available for task ${taskId}`);
    const json = await fs.promises.readFile(taskState.viewResultPath, "utf-8");
    return JSON.parse(json) as NonNullable<DisplayResults["view"]>;
  }

  public async exportTableResults(
    taskId: TaskRef,
    format: "csv" | "json",
  ): Promise<ExportResults> {
    return exportTableResults(this.ctx, taskId, format);
  }

  // ---------------------------------------------------------------------------
  // Live mode
  // ---------------------------------------------------------------------------

  public async appendQuery(
    taskId: TaskRef,
    fromTime: Date,
    toTime: Date,
  ): Promise<{ newCount: number; batchStatus: JobBatchFinished }> {
    const queryTaskState = this.taskStore.get(taskId);
    if (!queryTaskState) throw new Error(`Query task with id ${taskId} not found`);

    queryTaskState.isLive = true;

    const { task } = queryTaskState;
    const parsedTree = parse(task.input.searchTerm);
    const instancesToSearchOn = this.pluginRegistry.getInstancesToQueryOn(
      task.input.searchProfileRef,
      parsedTree,
    );

    const newDataFromAdapters = await Promise.all(
      instancesToSearchOn.map(async (instanceHolder) => {
        const instanceRef = instanceHolder.instance.name;
        const subtaskId = queryTaskState.subtaskByInstance.get(instanceRef);

        const newData: ProcessedData[] = [];
        await instanceHolder.provider.query(
          parsedTree.controllerParams,
          parsedTree.search,
          {
            fromTime,
            toTime,
            limit: task.input.queryOptions.limit,
            isLiveQuery: true,
            cancelToken: queryTaskState.abortController.signal,
            onBatchDone: async (batch) => {
              for (const item of batch) {
                if (!item.id) item.id = crypto.randomUUID();
                item.object["_source"] = {
                  type: "string",
                  value: instanceRef,
                };
              }
              newData.push(...batch);
            },
          },
        );

        if (newData.length > 0 && subtaskId) {
          const dedupedForInstance = newData.filter((item) => {
            const uid = item.object["_uniqueId"];
            if (!uid || uid.type !== "string" || !uid.value) return true;
            const key = uid.value as string;
            if (queryTaskState.uniqueIds.has(key)) return false;
            queryTaskState.uniqueIds.add(key);
            return true;
          });

          if (dedupedForInstance.length > 0) {
            const subTask = queryTaskState.subTasks.find(
              (s) => s.instanceRef === instanceRef,
            );
            const bytes = serializeBatch(dedupedForInstance);
            const chunk = await this.backend.writeBatch(subtaskId, bytes);
            const chunkId = uuidv7();
            this.stateDB.insertChunk({
              id: chunkId,
              dedupKey: subTask?.dedupKey ?? subtaskId,
              chunkPath: this._relPath(chunk.chunkPath),
              rowCount: chunk.rowCount,
              diskBytes: chunk.diskBytes,
              minTime: chunk.minTime,
              maxTime: chunk.maxTime,
              writtenAt: Date.now(),
            } satisfies ChunkEntry);
            this.stateDB.addChunkRef(subtaskId, chunkId);
            queryTaskState.chunkPaths.push(chunk.chunkPath);
          }
        }

        return newData;
      }),
    );

    const mergedNewData = merge<ProcessedData>(
      newDataFromAdapters,
      compareProcessedData,
    );

    const batchStatus = await this._runBatch(
      taskId, parsedTree,
      task.input.queryOptions.fromTime,
      toTime.getTime(),
    );

    return { newCount: mergedNewData.length, batchStatus };
  }

  // ---------------------------------------------------------------------------
  // Task lifecycle
  // ---------------------------------------------------------------------------

  public async terminate(): Promise<void> {
    this.isShuttingDown = true;
    await this._drainAsyncWork();
    this.resetQueries();
    await this.backend.drain();
    this.backend.terminate();
    this.stateDB.close();
  }

  public cancelQuery(taskId: TaskRef): void {
    const taskState = this.taskStore.get(taskId);
    if (!taskState) throw new Error(`Query task with id ${taskId} not found`);
    taskState.task.error = "Query was cancelled";
    stopTask(taskState);
    console.log(`Query task ${taskId} cancelled`);
  }

  public resetQueries() {
    for (const taskId of this.taskStore.listExecutedJobs()) {
      const taskState = this.taskStore.get(taskId);
      if (taskState) stopTask(taskState);
    }
    this.taskStore.clearAll();
  }

  public async releaseTaskResources(taskId: TaskRef) {
    const taskState = this.taskStore.get(taskId);
    if (!taskState) {
      return;
    }

    stopTask(taskState);

    for (const subTask of taskState.subTasks) {
      try {
        await this.backend.closeSubtask(subTask.subtaskId);
      } catch {
        // ignore — subtask may already be closed
      }
    }

    taskState.eventsCache = null;
    taskState.tableCache = null;

    this.taskStore.delete(taskId);
    this.taskStore.untrackJob(taskId);
    console.log(`Resources released for task ${taskId}`);
  }

  private _persistTaskCompletion(taskId: TaskRef, taskState: QueryTaskState): void {
    const s = taskState.task.status;
    const finalStatus: "completed" | "failed" | "canceled" =
      s === "completed" || s === "failed" || s === "canceled" ? s : "failed";
    const completedAt = Date.now();

    let totalRowCount = 0;
    let totalDiskBytes = 0;
    let hasDiskBytes = false;

    for (const subTask of taskState.subTasks) {
      const chunks = this.stateDB.getChunksBySubtaskId(subTask.subtaskId);
      const subtaskRowCount = chunks.reduce((sum, c) => sum + c.rowCount, 0);
      const subtaskDiskBytes = chunks.reduce((sum, c) => sum + (c.diskBytes ?? 0), 0);
      const subtaskHasDisk = chunks.some((c) => c.diskBytes != null);

      totalRowCount += subtaskRowCount;
      if (subtaskHasDisk) {
        totalDiskBytes += subtaskDiskBytes;
        hasDiskBytes = true;
      }

      try {
        this.stateDB.setSubtaskStatus(subTask.subtaskId, finalStatus);
        this.stateDB.updateSubtaskStats(
          subTask.subtaskId,
          subtaskRowCount,
          subtaskHasDisk ? subtaskDiskBytes : null,
        );
      } catch (err) {
        console.error(`Failed to update subtask stats for ${subTask.subtaskId}:`, err);
      }
      if (!subTask.fromDedup) {
        this.taskStore.deleteInFlight(subTask.dedupKey);
      }
    }

    try {
      this.stateDB.upsertHistory({
        id: taskId,
        searchTerm: taskState.task.input.searchTerm,
        searchProfile: taskState.task.input.searchProfileRef,
        createdAt: taskState.task.createdAt,
        completedAt,
        rowCount: taskState.lastBatchStatus?.views.events.total ?? (totalRowCount > 0 ? totalRowCount : null),
        status: finalStatus,
        error: taskState.task.error,
        subtaskIds: taskState.subTasks.map((s) => s.subtaskId),
        fromTime: taskState.task.input.queryOptions.fromTime,
        toTime: taskState.task.input.queryOptions.toTime,
        diskBytes: hasDiskBytes ? totalDiskBytes : null,
      });
    } catch (err) {
      console.error(`Failed to write history for task ${taskId}:`, err);
    }

    const limit = this.maxHistoryEntries;
    if (limit != null && limit > 0) {
      void pruneHistory(this.ctx, limit);
    }
  }

  // ---------------------------------------------------------------------------
  // Session manager — delegates to sessionManager module
  // ---------------------------------------------------------------------------

  public listSessions(): HistoryEntry[] {
    return listSessions(this.ctx);
  }

  public async deleteSession(taskId: TaskRef): Promise<void> {
    return deleteSession(this.ctx, taskId);
  }

  public async restoreSession(taskId: TaskRef): Promise<void> {
    return restoreSession(this.ctx, taskId);
  }

  public async recoverInterruptedSessions(): Promise<void> {
    return recoverInterruptedSessions(this.ctx);
  }

  // ---------------------------------------------------------------------------
  // Engine status & history — delegates to historyManager module
  // ---------------------------------------------------------------------------

  public getLoadedTaskIds(): { id: string; isLive: boolean }[] {
    return getLoadedTaskIds(this.ctx);
  }

  public getEngineStatus() {
    return getEngineStatus(this.ctx);
  }

  public getQueryHistory(
    limit: number,
    offset: number,
    search?: string,
    sortBy?: "createdAt" | "completedAt" | "diskBytes" | "rowCount" | "status",
    sortDir?: "asc" | "desc",
  ): HistoryPage {
    return getQueryHistory(this.ctx, limit, offset, search, sortBy, sortDir);
  }

  public async deleteHistoryEntry(id: string): Promise<void> {
    return deleteHistoryEntry(this.ctx, id);
  }

  public async clearQueryHistory(): Promise<void> {
    return clearQueryHistory(this.ctx);
  }

  public getSubtasksWithChunks(subtaskIds: string[]) {
    return getSubtasksWithChunks(this.ctx, subtaskIds);
  }

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  public async *getJobUpdates(
    taskId: TaskRef,
    signal?: AbortSignal,
  ): AsyncGenerator<JobBatchFinished> {
    const taskState = this.taskStore.get(taskId);
    if (!taskState) throw new Error(`Query task with id ${taskId} not found`);

    const future = on(taskState.ee, "add", { signal, close: ["close"] });

    for (const status of taskState.batchHistory) {
      yield status;
    }

    if (finishedStatuses.has(taskState.task.status)) return;

    for await (const [data] of future) {
      yield data;
    }
  }

  public async *getJobDoneUpdates(
    taskId: TaskRef,
    signal?: AbortSignal,
  ): AsyncGenerator<QueryTaskState> {
    const taskState = this.taskStore.get(taskId);
    if (!taskState) throw new Error(`Query task with id ${taskId} not found`);
    await taskState.finishedQuerying.wait({ signal });
    yield taskState;
  }

  // ---------------------------------------------------------------------------
  // Watchdog
  // ---------------------------------------------------------------------------

  private _watchdogTimer: ReturnType<typeof setInterval> | null = null;

  startWatchdog(thresholdMs = 5 * 60 * 1000, intervalMs = 30_000) {
    this._watchdogTimer = setInterval(() => {
      const now = Date.now();
      for (const state of this.taskStore.list()) {
        if (state.task.status !== "running") continue;
        const idleMs = now - state.lastActivityAt;
        if (idleMs > thresholdMs) {
          const idleSecs = Math.round(idleMs / 1000);
          console.warn(
            `Task ${state.task.id} has been idle for ${idleSecs}s — aborting`,
          );
          state.task.error = `Timed out: no activity for ${idleSecs}s`;
          stopTask(state);
        }
      }
    }, intervalMs);
  }

  stopWatchdog() {
    if (this._watchdogTimer != null) {
      clearInterval(this._watchdogTimer);
      this._watchdogTimer = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async _finalizeTask(
    taskId: TaskRef,
    parsedTree: ReturnType<typeof parse>,
    queryOptions: SerializableParams,
  ): Promise<void> {
    await measureTime("batch overhead", () =>
      this._runBatch(taskId, parsedTree, queryOptions.fromTime, queryOptions.toTime),
    );
  }

  private async _runBatch(
    taskId: TaskRef,
    parsedTree: ReturnType<typeof parse>,
    fromTime: number,
    toTime: number,
  ): Promise<JobBatchFinished> {
    const queryTaskState = this.taskStore.get(taskId)!;
    const [
      { displayResults: pipelineData, rawEventCount, autoCompleteKeys },
      backendBuckets,
    ] = await Promise.all([
      runPipelineAndSave(this.ctx, taskId, parsedTree, { ...queryTaskState.task.input.queryOptions, fromTime, toTime }),
      this.ctx.backend.computeHistogram(queryTaskState.chunkPaths, fromTime, toTime, 100),
    ]);

    await queryTaskState.mutex.runExclusive(async () => {
      queryTaskState.lastBatchStatus = this._buildBatchStatus(queryTaskState, {
        scale: { from: fromTime, to: toTime },
        total: rawEventCount,
        buckets: backendBuckets,
        autoCompleteKeys,
        tableDataPoints: pipelineData.table?.dataPoints,
      });
      queryTaskState.batchHistory.push(queryTaskState.lastBatchStatus!);
      queryTaskState.ee.emit("add", queryTaskState.lastBatchStatus);
    });

    return queryTaskState.lastBatchStatus!;
  }

  private _buildBatchStatus(
    taskState: QueryTaskState,
    { scale, total, buckets, autoCompleteKeys, tableDataPoints }: BuildBatchStatusOpts,
  ): JobBatchFinished {
    return {
      scale,
      views: {
        events: { total, buckets, autoCompleteKeys },
        table: taskState.tableResultColumns && (taskState.tableResultPath || taskState.tableCache)
          ? {
              totalRows: taskState.tableResultRowCount,
              columns: taskState.tableResultColumns,
              columnLengths: tableDataPoints
                ? getTableColumnLengths(taskState.tableResultColumns, tableDataPoints)
                : {},
            }
          : undefined,
        view: taskState.viewResultPath ? {} : undefined,
      },
    };
  }

  private _trackAsyncWork(work: Promise<void>): void {
    this.pendingAsyncWork.add(work);
    work.finally(() => {
      this.pendingAsyncWork.delete(work);
    });
  }

  private async _drainAsyncWork(): Promise<void> {
    if (this.pendingAsyncWork.size === 0) return;
    await Promise.allSettled([...this.pendingAsyncWork]);
  }
}
