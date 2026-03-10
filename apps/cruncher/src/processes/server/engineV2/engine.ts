import { bisector } from "d3-array";
import { Mutex } from "async-mutex";
import { generateCsv, mkConfig } from "export-to-csv";
import { produce } from "immer";
import merge from "merge-k-sorted-arrays";
import EventEmitter, { on } from "node:events";
import BTree from "sorted-btree";
import { v4 as uuidv4 } from "uuid";
import z from "zod/v4";
import {
  Adapter,
  AdapterContext,
  ExternalAuthProvider,
  PluginRef,
} from "@cruncher/adapter-utils";
import {
  asDateField,
  asDisplayString,
  compareProcessedData,
  ProcessedData,
} from "@cruncher/adapter-utils/logTypes";
import { DisplayResults, Events } from "~lib/displayTypes";
import { processEval } from "~lib/pipelineEngine/eval";
import { processRegex } from "~lib/pipelineEngine/regex";
import {
  PipelineContext,
  PipelineItemProcessor,
  processPipelineV2,
} from "~lib/pipelineEngine/root";
import { processSort } from "~lib/pipelineEngine/sort";
import { processStats } from "~lib/pipelineEngine/stats";
import { processTable } from "~lib/pipelineEngine/table";
import { processTimeChart } from "~lib/pipelineEngine/timechart";
import { processWhere } from "~lib/pipelineEngine/where";
import { parse, ParsedQuery, PipelineItem } from "@cruncher/qql";
import { createSignal, measureTime } from "@cruncher/utils";
import { CacheRecord, QueryCacheHolder } from "./cache";
import {
  ClosestPoint,
  ExportResults,
  finishedStatuses,
  InstanceRef,
  JobBatchFinished,
  PageResponse,
  PluginInstance,
  PluginInstanceContainer,
  QueryExecutionHistory,
  QueryTask,
  QueryTaskState,
  SearchProfile,
  SearchProfileRef,
  SerializableAdapter,
  SerializeableParams,
  SubTask,
  SubTaskRef,
  TableDataResponse,
  TaskRef,
} from "./types";
import { calculateBuckets, getScale } from "./utils";
import { processUnpack } from "~lib/pipelineEngine/unpack";

// Binary search on descending-by-time array using negated accessor
const eventTimeBisector = bisector(
  (d: ProcessedData) => -asDateField(d.object._time).value,
);

export class Engine {
  private supportedPlugins: Adapter[] = [];
  private initializedPlugins: PluginInstanceContainer[] = [];
  private queryTasks: Record<TaskRef, QueryTaskState> = {};
  private searchProfiles: Record<SearchProfileRef, SearchProfile> = {};

  private queryCache: QueryCacheHolder = new QueryCacheHolder();

  private executedJobs: TaskRef[] = []; // Keep track of executed jobs - to allow for cleanup

  constructor(private authProvider: ExternalAuthProvider) {}

  public registerPlugin(plugin: Adapter): void {
    if (this.supportedPlugins.some((p) => p.ref === plugin.ref)) {
      throw new Error(`Plugin with ref ${plugin.ref} is already registered`);
    }
    this.supportedPlugins.push(plugin);
    console.log(`Plugin registered: ${plugin.name} (${plugin.ref})`);
  }

  public getSupportedPlugins(): SerializableAdapter[] {
    return this.supportedPlugins.map((plugin) => {
      return {
        ref: plugin.ref,
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        params: z.toJSONSchema(plugin.params),
      };
    });
  }

  public async getControllerParams(instanceId: InstanceRef) {
    const pluginContainer = this.initializedPlugins.find(
      (p) => p.instance.name === instanceId,
    );
    if (!pluginContainer) {
      throw new Error(`Plugin instance with id ${instanceId} not found`);
    }

    const { provider } = pluginContainer;
    return await provider.getControllerParams();
  }

  public async getParamValueSuggestions(
    instanceId: InstanceRef,
    field: string,
    indexes: string[],
  ): Promise<string[]> {
    const container = this.initializedPlugins.find(
      (p) => p.instance.name === instanceId,
    );
    if (!container?.provider.getDynamicSuggestions) return [];
    return await container.provider.getDynamicSuggestions(field, indexes);
  }

  public getInitializedPlugins(): PluginInstance[] {
    return this.initializedPlugins.map((p) => p.instance);
  }

  public getSearchProfiles() {
    return Object.values(this.searchProfiles);
  }

  public reset(): void {
    this.initializedPlugins = [];
    this.searchProfiles = {};
  }

  public initializePlugin(
    pluginRef: PluginRef,
    name: InstanceRef,
    params: Record<string, unknown>,
  ): PluginInstance {
    const plugin = this.supportedPlugins.find((p) => p.ref === pluginRef);
    if (!plugin) {
      throw new Error(`Plugin with ref ${pluginRef} not found`);
    }

    const adapterContext: AdapterContext = {
      externalAuthProvider: this.authProvider,
    };

    const instance = plugin.factory(adapterContext, { params });
    if (!instance) {
      throw new Error(`Failed to create instance for plugin ${pluginRef}`);
    }

    const pluginInstance: PluginInstance = {
      id: uuidv4(),
      name: name,
      description: plugin.description,
      pluginRef: plugin.ref,
    };

    this.initializedPlugins.push({
      instance: pluginInstance,
      provider: instance,
    });

    return pluginInstance;
  }

  public initializeSearchProfile(
    name: SearchProfileRef,
    instances: InstanceRef[],
  ): SearchProfile {
    // Validate instances
    for (const instance of instances) {
      if (!this.initializedPlugins.some((p) => p.instance.name === instance)) {
        throw new Error(`Plugin instance with name ${instance} not found`);
      }
    }

    const searchProfile: SearchProfile = {
      name: name,
      instances: instances,
    };

    this.searchProfiles[name] = searchProfile;
    return searchProfile;
  }

  public getTaskState(taskId: TaskRef): QueryTaskState {
    const task = this.queryTasks[taskId];
    if (!task) {
      throw new Error(`Query task with id ${taskId} not found`);
    }
    return task;
  }

  public getLogs(taskId: TaskRef) {
    const task = this.queryTasks[taskId];
    if (!task) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    return task.displayResults;
  }

  public getLogsPaginated(
    taskId: TaskRef,
    offset: number,
    limit: number,
  ): PageResponse<ProcessedData> {
    const task = this.queryTasks[taskId];
    if (!task) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    const startIndex = offset;
    const endIndex = startIndex + limit;
    const data = task.displayResults.events.data.slice(startIndex, endIndex);
    const total = task.displayResults.events.data.length;

    return {
      data: data,
      total: total,
      limit: limit,
      next: endIndex < total ? endIndex : null, // If there are more items, return the next index
      prev: startIndex > 0 ? Math.max(0, startIndex - limit) : null, // If there are previous items, return the previous index
    };
  }

  public getTableDataPaginated(
    taskId: TaskRef,
    offset: number,
    limit: number,
  ): TableDataResponse {
    const task = this.queryTasks[taskId];
    if (!task) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    if (!task.displayResults.table) {
      throw new Error(`No table data available for task ${taskId}`);
    }

    const dataPoints = task.displayResults.table.dataPoints;

    const startIndex = offset;
    const endIndex = startIndex + limit;
    const data = dataPoints.slice(startIndex, endIndex);
    const total = dataPoints.length;

    return {
      data: data,
      total: total,
      limit: limit,
      next: endIndex < total ? endIndex : null, // If there are more items, return the next index
      prev: startIndex > 0 ? Math.max(0, startIndex - limit) : null, // If there are previous items, return the previous index
    };
  }

  public getClosestDateEvent(taskId: TaskRef, refDate: number): ClosestPoint {
    const task = this.queryTasks[taskId];
    if (!task) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    const lower = task.index.nextLowerKey(refDate) ?? null;
    const upper = task.index.nextHigherKey(refDate) ?? null;

    const eventsData = task.displayResults.events.data;
    // Binary search on descending array using negated comparator (O(log n))
    const lowerIndex =
      lower !== null ? eventTimeBisector.left(eventsData, -lower) : -1;
    const upperIndex =
      upper !== null ? eventTimeBisector.left(eventsData, -upper) : -1;

    // return the closest event based on the refDate
    if (lower === null && upper === null) {
      return { closest: null, index: null }; // No events found
    }
    if (lower === null) {
      return { closest: upper, index: upperIndex }; // Only upper found
    }
    if (upper === null) {
      return { closest: lower, index: lowerIndex }; // Only lower found
    }

    if (Math.abs(refDate - lower) < Math.abs(upper - refDate)) {
      // If lower is closer to refDate
      return { closest: lower, index: lowerIndex };
    }

    return { closest: upper, index: upperIndex }; // If upper is closer to refDate
  }

  public async runQuery(
    searchProfileRef: SearchProfileRef,
    searchTerm: string,
    queryOptions: SerializeableParams,
  ) {
    const profile = this.searchProfiles[searchProfileRef];
    if (!profile) {
      throw new Error(`Search profile with name ${searchProfileRef} not found`);
    }

    const taskId = uuidv4() as TaskRef;
    const task: QueryTask = {
      id: taskId,
      status: "running",
      createdAt: new Date().getTime(),
      error: null,
      input: {
        searchTerm: searchTerm,
        searchProfileRef: searchProfileRef,
        queryOptions: queryOptions,
      },
    };

    const emitter = new EventEmitter();

    const queryTaskState: QueryTaskState = {
      task,
      mutex: new Mutex(),
      finishedQuerying: createSignal(),
      index: new BTree<number, ProcessedData[]>(),
      rawData: [],
      displayResults: {
        events: {
          type: "events",
          data: [],
        },
        table: undefined,
        view: undefined,
      },
      lastBatchStatus: null,
      abortController: new AbortController(),
      subTasks: [],
      ee: emitter, // Event emitter for task updates
    };
    this.queryTasks[taskId] = queryTaskState;
    this.executedJobs.push(taskId); // Keep track of executed jobs for cleanup
    console.log(`Created query task with id ${taskId}`);

    queryTaskState.finishedQuerying.then(() => {
      emitter.emit("close");
    });

    // parse the search term into params
    const parsedTree = parse(searchTerm);

    const instancesToSearchOn = this._getInstancesToQueryOn(
      searchProfileRef,
      parsedTree,
    );
    if (instancesToSearchOn.length === 0) {
      throw new Error(`No instances found for search term: ${searchTerm}`);
    }

    const onTaskDone = async () => {
      const allCachedData = await Promise.all(
        queryTaskState.subTasks.map((subTask) => {
          return this.queryCache.getFromCacheByKey(subTask.cacheKey);
        }),
      );
      const totalData = merge<ProcessedData>(
        allCachedData.flatMap((record) => record.batches),
        compareProcessedData,
      );

      const pipelineData = this.getPipelineItems(
        queryTaskState,
        totalData,
        parsedTree.pipeline,
      );

      await queryTaskState.mutex.runExclusive(async () => {
        queryTaskState.rawData = totalData;
        queryTaskState.displayResults = pipelineData;

        await measureTime("batch overhead", async () => {
          // update the index with the total data
          queryTaskState.index.clear();
          pipelineData.events.data.forEach((data) => {
            const timestamp = asDateField(data.object._time).value;
            const toAppendTo = queryTaskState.index.get(timestamp) ?? [];
            toAppendTo.push(data);
            queryTaskState.index.set(timestamp, toAppendTo);
          });

          const scale = getScale(
            new Date(queryOptions.fromTime),
            new Date(queryOptions.toTime),
          );
          const buckets = calculateBuckets(scale, pipelineData.events.data);

          const availableColumns = new Set<string>();
          queryTaskState.displayResults.events.data.forEach((dataPoint) => {
            for (const key in dataPoint.object) {
              availableColumns.add(key);
            }
          });

          queryTaskState.lastBatchStatus = {
            scale: {
              from: queryOptions.fromTime,
              to: queryOptions.toTime,
            },
            views: {
              events: {
                total: queryTaskState.displayResults.events.data.length,
                buckets: buckets,
                autoCompleteKeys: Array.from(availableColumns),
              },
              table: queryTaskState.displayResults.table
                ? {
                    totalRows:
                      queryTaskState.displayResults.table.dataPoints.length,
                    columns: queryTaskState.displayResults.table.columns,
                    columnLengths: getTableColumnLengths(
                      queryTaskState.displayResults.table.columns,
                      queryTaskState.displayResults.table.dataPoints,
                    ),
                  }
                : undefined,
              view: queryTaskState.displayResults.view ? {} : undefined,
            },
          };

          emitter.emit("add", queryTaskState.lastBatchStatus);
        });
      });
    };

    const onProviderBatchDone =
      (cacheKey: string, provider: InstanceRef) =>
      async (data: ProcessedData[]): Promise<void> => {
        const cachedResult = await this.queryCache.getFromCacheByKey(cacheKey);

        data.forEach((item) => {
          if (!item.id) {
            item.id = crypto.randomUUID();
          }
          item.object._source = {
            type: "string",
            value: provider,
          };
        });

        cachedResult.batches.push(data);

        // Handle batch done - emit event to client
        try {
          await onTaskDone();
        } catch (error) {
          console.error(
            `Error occurred while processing task ${taskId}:`,
            error,
          );
          // If an error occurs, we can mark the task as failed
          queryTaskState.task.status = "failed";
          queryTaskState.task.error =
            error instanceof Error ? error.message : "Unknown error";
          queryTaskState.finishedQuerying.signal(); // Signal that the task is done
        }
        console.log(`Batch done for task ${taskId}`);
      };

    for (const instanceHolder of instancesToSearchOn) {
      console.log(
        `Starting query on instance ${instanceHolder.instance.name} for task ${taskId}`,
      );
      const provider = instanceHolder.provider;
      const uniqueQueryExecution: QueryExecutionHistory = {
        params: parsedTree.controllerParams,
        search: parsedTree.search,
        start: new Date(queryOptions.fromTime),
        end: new Date(queryOptions.toTime),
        instanceRef: instanceHolder.instance.name,
      };

      if (queryOptions.isForced) {
        await this.queryCache.forceRemoveFromCache(uniqueQueryExecution);
      }

      let cacheRecord: CacheRecord;
      if (!(await this.queryCache.inCache(uniqueQueryExecution))) {
        cacheRecord = await this.queryCache.addToCache(
          uniqueQueryExecution,
          taskId,
          (record) => {
            return new Promise<void>((resolve, reject) => {
              // Start the query
              provider
                .query(parsedTree.controllerParams, parsedTree.search, {
                  fromTime: new Date(queryOptions.fromTime),
                  toTime: new Date(queryOptions.toTime),
                  limit: queryOptions.limit,
                  isLiveQuery: false,
                  cancelToken: queryTaskState.abortController.signal,
                  onBatchDone: onProviderBatchDone(
                    record.key,
                    instanceHolder.instance.name,
                  ),
                })
                .then(async () => {
                  record.status = "completed";
                  console.log(`Query subtask completed for task ${taskId}`);
                  resolve();
                })
                .catch((error: unknown) => {
                  record.status = "failed";
                  console.error(
                    `Query subtask failed for task ${taskId}:`,
                    error,
                  );
                  reject(error);
                });
            });
          },
        );
      } else {
        // If the query is already in cache, we just reference it
        cacheRecord = await this.queryCache.referenceCache(
          uniqueQueryExecution,
          taskId,
        );
        console.log(`Query subtask referenced from cache for task ${taskId}`);
      }

      const subTask: SubTask = {
        id: uuidv4() as SubTaskRef,
        createdAt: new Date(),
        cacheKey: cacheRecord.key,
        instanceRef: instanceHolder.instance.name,
        isReady: cacheRecord.promise,
      } satisfies SubTask;
      queryTaskState.subTasks.push(subTask);
    }

    Promise.allSettled(queryTaskState.subTasks.map((task) => task.isReady))
      .then((statuses) => {
        const allReady = statuses.every(
          (status) => status.status === "fulfilled",
        );
        if (!allReady) {
          // get the first error that occurred
          const error = statuses.find(
            (status) => status.status === "rejected",
          )?.reason;
          // If any subtask fails, we mark the main task as failed
          task.status = "failed";
          queryTaskState.task.error = error?.message ?? null;
          console.error(`Query task ${taskId} failed:`, error);
        } else {
          // All subtasks are ready, we can mark the main task as completed
          task.status = "completed";
          console.log(`Query task ${taskId} completed successfully`);
        }

        return onTaskDone()
          .then(() => {
            queryTaskState.finishedQuerying.signal();
          })
          .catch((error) => {
            console.error(
              `Error occurred while finalizing task ${taskId}:`,
              error,
            );
            // If an error occurs, we can mark the task as failed
            task.status = "failed";
            queryTaskState.task.error = error.message;
            queryTaskState.finishedQuerying.signal(); // Signal that the task is done
          });
      })
      .catch((error) => {
        console.error(
          `Unexpected error in task ${taskId} finalization:`,
          error,
        );
        task.status = "failed";
        queryTaskState.finishedQuerying.signal();
      });

    return task;
  }

  public async getViewData(
    taskId: TaskRef,
  ): Promise<NonNullable<DisplayResults["view"]>> {
    const taskState = this.queryTasks[taskId];
    if (!taskState) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    if (!taskState.displayResults.view) {
      throw new Error(`No view data available for task ${taskId}`);
    }

    return taskState.displayResults.view;
  }

  public async exportTableResults(
    taskId: TaskRef,
    format: "csv" | "json",
  ): Promise<ExportResults> {
    const taskState = this.queryTasks[taskId];
    if (!taskState) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    if (!taskState.displayResults.table) {
      throw new Error(`No table data available for task ${taskId}`);
    }

    const tableData = taskState.displayResults.table.dataPoints;
    const preparedData = dataAsArray(tableData);

    let payload: string;
    if (format === "csv") {
      // @ts-expect-error - generateCsv expects a config object
      payload = generateCsv(csvConfig)(preparedData) as unknown as string;
    } else if (format === "json") {
      // Convert to JSON format
      payload = JSON.stringify(preparedData);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    return {
      payload: payload,
      fileName: `query_results_${taskId}.${format}`,
      contentType: format === "csv" ? "text/csv" : "application/json",
    };
  }

  public resetQueries() {
    // Stop all tasks first, then drop everything at once.
    // Individual cache-entry removal via releaseTaskResources would be redundant:
    // the QueryCacheHolder replacement below frees all cache data in one shot.
    for (const taskId of this.executedJobs) {
      const taskState = this.queryTasks[taskId];
      if (taskState) this._stopTask(taskState);
    }
    this.queryTasks = {};
    this.queryCache = new QueryCacheHolder();
    this.executedJobs = [];
  }

  public async releaseTaskResources(taskId: TaskRef) {
    const taskState = this.queryTasks[taskId];
    if (!taskState) {
      console.warn(
        `No resources to release for task ${taskId} - task not found`,
      );
      return;
    }

    this._stopTask(taskState);

    for (const subTask of taskState.subTasks) {
      await this.queryCache.removeFromCacheByKey(subTask.cacheKey, taskId);
    }

    delete this.queryTasks[taskId];
    this.executedJobs = this.executedJobs.filter((id) => id !== taskId);
    console.log(`Resources released for query task ${taskId}`);
  }

  // Cancels an in-flight task: aborts its network requests, marks it canceled,
  // and unblocks any subscriptions waiting on finishedQuerying.
  // Both abort() and signal() are idempotent — safe to call on already-finished tasks.
  private _stopTask(taskState: QueryTaskState): void {
    if (!finishedStatuses.has(taskState.task.status)) {
      taskState.task.status = "canceled";
    }
    taskState.abortController.abort();
    taskState.finishedQuerying.signal();
  }

  private _getInstancesToQueryOn(
    searchProfileRef: SearchProfileRef,
    parsedTree: ParsedQuery,
  ): PluginInstanceContainer[] {
    const selectedProfile = this.searchProfiles[searchProfileRef];
    let instancesToSearchOn: PluginInstanceContainer[] = [];
    if (parsedTree.dataSources.length === 0) {
      // If no data sources are specified, use all instances in the selected search profile
      instancesToSearchOn = this.initializedPlugins.filter((p) =>
        selectedProfile.instances.includes(p.instance.name),
      );
    } else {
      // If data sources are specified, filter instances based on the data sources
      const dataSources = parsedTree.dataSources.map((ds) => ds.name);
      instancesToSearchOn = this.initializedPlugins.filter(
        (p) =>
          dataSources.includes(p.instance.name) &&
          selectedProfile.instances.includes(p.instance.name),
      );
    }

    return instancesToSearchOn;
  }

  private createProcessor(): PipelineItemProcessor {
    return {
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
        processStats(
          currentData,
          options.aggregationFunctions,
          options.groupby,
        ),
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
  }

  private getPipelineItems(
    taskState: QueryTaskState,
    data: ProcessedData[],
    pipeline: PipelineItem[],
  ) {
    const currentData = {
      type: "events",
      data: data,
    } satisfies Events;

    const allData: DisplayResults = {
      events: currentData,
      table: undefined,
      view: undefined,
    };

    const context: PipelineContext = {
      startTime: new Date(taskState.task.input.queryOptions.fromTime),
      endTime: new Date(taskState.task.input.queryOptions.toTime),
    };

    const pipelineStart = new Date();
    console.log("[Pipeline] Start time: ", pipelineStart);
    try {
      const result = produce(allData, (draft) => {
        const res = processPipelineV2(
          this.createProcessor(),
          draft,
          pipeline,
          context,
        );
        draft.events = res.events;
        draft.table = res.table;
        draft.view = res.view;
      });

      return result;
    } finally {
      const pipelineEnd = new Date();
      console.log("[Pipeline] End time: ", pipelineEnd);
      console.log(
        "[Pipeline] Time taken: ",
        pipelineEnd.getTime() - pipelineStart.getTime(),
      );
    }
  }

  public async appendQuery(
    taskId: TaskRef,
    fromTime: Date,
    toTime: Date,
    maxLogs: number = 100000,
  ): Promise<{ newCount: number; batchStatus: JobBatchFinished }> {
    const queryTaskState = this.queryTasks[taskId];
    if (!queryTaskState) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    const { task } = queryTaskState;
    const parsedTree = parse(task.input.searchTerm);
    const instancesToSearchOn = this._getInstancesToQueryOn(
      task.input.searchProfileRef,
      parsedTree,
    );

    // Query each adapter for the new time range
    const newDataFromAdapters = await Promise.all(
      instancesToSearchOn.map(async (instanceHolder) => {
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
              batch.forEach((item) => {
                if (!item.id) {
                  item.id = crypto.randomUUID();
                }
                item.object._source = {
                  type: "string",
                  value: instanceHolder.instance.name,
                };
              });
              newData.push(...batch);
            },
          },
        );
        return newData;
      }),
    );

    const mergedNewData = merge<ProcessedData>(
      newDataFromAdapters,
      compareProcessedData,
    );

    // Deduplicate new data against existing raw data using _uniqueId
    const existingUniqueIds = new Set<string>();
    for (const item of queryTaskState.rawData) {
      const uid = item.object._uniqueId;
      if (uid && uid.type === "string" && uid.value) {
        existingUniqueIds.add(uid.value as string);
      }
    }
    const dedupedNewData =
      existingUniqueIds.size === 0
        ? mergedNewData
        : mergedNewData.filter((item) => {
            const uid = item.object._uniqueId;
            if (!uid || uid.type !== "string" || !uid.value) return true;
            return !existingUniqueIds.has(uid.value as string);
          });

    // Merge with pre-pipeline raw data and re-run pipeline
    const mergedTotal = merge<ProcessedData>(
      [queryTaskState.rawData, dedupedNewData],
      compareProcessedData,
    );
    // Trim to maxLogs (newest-first order — slice from start)
    const totalData =
      mergedTotal.length > maxLogs
        ? mergedTotal.slice(0, maxLogs)
        : mergedTotal;

    const pipelineData = this.getPipelineItems(
      queryTaskState,
      totalData,
      parsedTree.pipeline,
    );

    await queryTaskState.mutex.runExclusive(async () => {
      queryTaskState.rawData = totalData;
      queryTaskState.displayResults = pipelineData;

      queryTaskState.index.clear();
      pipelineData.events.data.forEach((data) => {
        const timestamp = asDateField(data.object._time).value;
        const toAppendTo = queryTaskState.index.get(timestamp) ?? [];
        toAppendTo.push(data);
        queryTaskState.index.set(timestamp, toAppendTo);
      });

      const scale = getScale(
        new Date(task.input.queryOptions.fromTime),
        toTime,
      );
      const buckets = calculateBuckets(scale, pipelineData.events.data);

      const availableColumns = new Set<string>();
      pipelineData.events.data.forEach((dataPoint) => {
        for (const key in dataPoint.object) {
          availableColumns.add(key);
        }
      });

      queryTaskState.lastBatchStatus = {
        scale: {
          from: task.input.queryOptions.fromTime,
          to: toTime.getTime(),
        },
        views: {
          events: {
            total: pipelineData.events.data.length,
            buckets: buckets,
            autoCompleteKeys: Array.from(availableColumns),
          },
          table: pipelineData.table
            ? {
                totalRows: pipelineData.table.dataPoints.length,
                columns: pipelineData.table.columns,
                columnLengths: getTableColumnLengths(
                  pipelineData.table.columns,
                  pipelineData.table.dataPoints,
                ),
              }
            : undefined,
          view: pipelineData.view ? {} : undefined,
        },
      };

      queryTaskState.ee.emit("add", queryTaskState.lastBatchStatus);
    });

    return {
      newCount: mergedNewData.length,
      batchStatus: queryTaskState.lastBatchStatus!,
    };
  }

  public cancelQuery(taskId: TaskRef): void {
    const taskState = this.queryTasks[taskId];
    if (!taskState) {
      throw new Error(`Query task with id ${taskId} not found`);
    }
    taskState.task.error = "Query was cancelled";
    this._stopTask(taskState);
    console.log(`Query task ${taskId} cancelled`);
  }

  public async *getJobUpdates(
    taskId: TaskRef,
    signal?: AbortSignal,
  ): AsyncGenerator<JobBatchFinished> {
    const taskState = this.queryTasks[taskId];
    if (!taskState) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    if (taskState.lastBatchStatus) {
      yield taskState.lastBatchStatus; // Yield the last batch status if it exists
    }

    if (finishedStatuses.has(taskState.task.status)) {
      return; // No need to listen for further updates
    }

    for await (const [data] of on(taskState.ee, "add", {
      signal: signal,
      close: ["close"],
    })) {
      yield data;
    }
  }

  public async *getJobDoneUpdates(
    taskId: TaskRef,
    signal?: AbortSignal,
  ): AsyncGenerator<QueryTaskState> {
    const taskState = this.queryTasks[taskId];
    if (!taskState) {
      throw new Error(`Query task with id ${taskId} not found`);
    }

    // Wait for the task to finish querying
    await taskState.finishedQuerying.wait({ signal });

    yield taskState;
  }
}

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const dataAsArray = (processedData: ProcessedData[]) => {
  return processedData.map((row) => {
    const result: Record<string, unknown> = {};
    for (const key in row.object) {
      result[key] = row.object[key]?.value;
    }

    return result;
  });
};

const getTableColumnLengths = (columns: string[], data: ProcessedData[]) => {
  return columns.reduce(
    (acc, col) => {
      acc[col] = Math.min(
        100,
        Math.max(
          3,
          col.length, // Length of the column name
          ...data.map((row) => {
            const value = row.object[col];
            return asDisplayString(value).length + 3; // Length of the value in the column
          }),
        ),
      );
      return acc;
    },
    {} as Record<string, number>,
  );
};
