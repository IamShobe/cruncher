import { Mutex } from "async-mutex";
import { produce } from "immer";
import merge from "merge-k-sorted-arrays";
import BTree from 'sorted-btree';
import { newBatchDoneMessage, newJobUpdatedMessage } from "src/processes/server/plugins_engine/router";
import { v4 as uuidv4 } from 'uuid';
import { Adapter, AdapterContext, ExternalAuthProvider, PluginRef } from "~lib/adapters";
import { asDateField, asDisplayString, compareProcessedData, ProcessedData } from "~lib/adapters/logTypes";
import { DisplayResults, Events } from "~lib/displayTypes";
import { ResponseHandler } from "~lib/networkTypes";
import { processEval } from "~lib/pipelineEngine/eval";
import { processRegex } from "~lib/pipelineEngine/regex";
import { PipelineContext, PipelineItemProcessor, processPipelineV2 } from '~lib/pipelineEngine/root';
import { processSort } from "~lib/pipelineEngine/sort";
import { processStats } from "~lib/pipelineEngine/stats";
import { processTable } from "~lib/pipelineEngine/table";
import { processTimeChart } from "~lib/pipelineEngine/timechart";
import { processWhere } from "~lib/pipelineEngine/where";
import { parse, ParsedQuery, PipelineItem } from "~lib/qql";
import { createSignal, measureTime } from "~lib/utils";
import { CacheRecord, QueryCacheHolder } from "./cache";
import { ClosestPoint, ExportResults, InstanceRef, JobBatchFinished, PageResponse, PluginInstance, PluginInstanceContainer, QueryExecutionHistory, QueryTask, QueryTaskState, SearchProfile, SearchProfileRef, SerializableAdapter, SerializeableParams, SubTask, SubTaskRef, TableDataResponse, TaskRef } from "./types";
import { calculateBuckets, getScale } from "./utils";
import { generateCsv, mkConfig } from "export-to-csv";
import { zodToJsonSchema } from "zod-to-json-schema";

export class Engine {
    private supportedPlugins: Adapter[] = [];
    private initializedPlugins: PluginInstanceContainer[] = [];
    private queryTasks: Record<TaskRef, QueryTaskState> = {};
    private searchProfiles: Record<SearchProfileRef, SearchProfile> = {};
    private readonly defaultSearchProfile: SearchProfileRef = "default" as SearchProfileRef;

    private queryCache: QueryCacheHolder = new QueryCacheHolder();

    private executedJobs: TaskRef[] = []; // Keep track of executed jobs - to allow for cleanup

    constructor(private messageSender: ResponseHandler, private authProvider: ExternalAuthProvider) { }

    public registerPlugin(plugin: Adapter): void {
        if (this.supportedPlugins.some(p => p.ref === plugin.ref)) {
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
                params: zodToJsonSchema(plugin.params, "Params"),
            };
        });
    }

    public async getControllerParams(instanceId: InstanceRef) {
        const pluginContainer = this.initializedPlugins.find(p => p.instance.name === instanceId);
        if (!pluginContainer) {
            throw new Error(`Plugin instance with id ${instanceId} not found`);
        }

        const { provider } = pluginContainer;
        return await provider.getControllerParams();
    }

    public getInitializedPlugins(): PluginInstance[] {
        return this.initializedPlugins.map(p => p.instance);
    }

    public getSearchProfiles() {
        return Object.values(this.searchProfiles);
    }

    public reset(): void {
        this.initializedPlugins = [];
        this.searchProfiles = {};
    }

    public initializePlugin(pluginRef: PluginRef, name: InstanceRef, params: Record<string, unknown>): PluginInstance {
        const plugin = this.supportedPlugins.find(p => p.ref === pluginRef);
        if (!plugin) {
            throw new Error(`Plugin with ref ${pluginRef} not found`);
        }

        const adapterContext: AdapterContext = {
            externalAuthProvider: this.authProvider,
        }

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

    public initializeSearchProfile(name: SearchProfileRef, instances: InstanceRef[]): SearchProfile {
        // Validate instances
        for (const instance of instances) {
            if (!this.initializedPlugins.some(p => p.instance.name === instance)) {
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

        return task.displayResults
    }

    public getLogsPaginated(taskId: TaskRef, offset: number, limit: number): PageResponse<ProcessedData> {
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

    public getTableDataPaginated(taskId: TaskRef, offset: number, limit: number): TableDataResponse {
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

        const lowerIndex = task.displayResults.events.data.findIndex((item) => {
            const timestamp = asDateField(item.object._time).value;
            return timestamp === lower;
        });
        const upperIndex = task.displayResults.events.data.findIndex((item) => {
            const timestamp = asDateField(item.object._time).value;
            return timestamp === upper;
        });


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

        if ((Math.abs(refDate - lower) < Math.abs(upper - refDate))) {
            // If lower is closer to refDate
            return { closest: lower, index: lowerIndex };
        }

        return { closest: upper, index: upperIndex }; // If upper is closer to refDate
    }

    public async runQuery(searchProfileRef: SearchProfileRef, searchTerm: string, queryOptions: SerializeableParams) {
        const profile = this.searchProfiles[searchProfileRef];
        if (!profile) {
            throw new Error(`Search profile with name ${searchProfileRef} not found`);
        }

        const taskId = uuidv4() as TaskRef;
        const task: QueryTask = {
            id: taskId,
            status: "running",
            createdAt: new Date(),
            input: {
                searchTerm: searchTerm,
                queryOptions: queryOptions,
            },
        };

        const queryTaskState: QueryTaskState = {
            task,
            mutex: new Mutex(),
            finishedQuerying: createSignal(),
            index: new BTree<number, ProcessedData[]>(),
            displayResults: {
                events: {
                    type: "events",
                    data: [],
                },
                table: undefined,
                view: undefined,
            },
            abortController: new AbortController(),
            subTasks: [],
        }
        this.queryTasks[taskId] = queryTaskState;
        this.executedJobs.push(taskId); // Keep track of executed jobs for cleanup
        console.log(`Created query task with id ${taskId}`);

        // parse the search term into params
        const parsedTree = parse(searchTerm);

        const instancesToSearchOn = this._getInstancesToQueryOn(searchProfileRef, parsedTree);
        if (instancesToSearchOn.length === 0) {
            throw new Error(`No instances found for search term: ${searchTerm}`);
        }

        const messageSender = this.messageSender;

        const onTaskDone = async () => {
            const allCachedData = await Promise.all(queryTaskState.subTasks.map((subTask) => {
                return this.queryCache.getFromCacheByKey(subTask.cacheKey)
            }));
            const totalData = merge<ProcessedData>(
                allCachedData.map((record) => record.data),
                compareProcessedData,
            );

            const pipelineData = this.getPipelineItems(queryTaskState, totalData, parsedTree.pipeline);

            await queryTaskState.mutex.runExclusive(async () => {
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

                    const scale = getScale(queryOptions.fromTime, queryOptions.toTime);
                    const buckets = calculateBuckets(scale, pipelineData.events.data);

                    const availableColumns = new Set<string>();
                    queryTaskState.displayResults.events.data.forEach((dataPoint) => {
                        for (const key in dataPoint.object) {
                            availableColumns.add(key);
                        }
                    });


                    await messageSender.sendMessage(
                        newBatchDoneMessage(taskId, {
                            scale: {
                                from: queryOptions.fromTime.getTime(),
                                to: queryOptions.toTime.getTime(),
                            },
                            views: {
                                events: {
                                    total: queryTaskState.displayResults.events.data.length,
                                    buckets: buckets,
                                    autoCompleteKeys: Array.from(availableColumns),
                                },
                                table: queryTaskState.displayResults.table ? {
                                    totalRows: queryTaskState.displayResults.table.dataPoints.length,
                                    columns: queryTaskState.displayResults.table.columns,
                                    columnLengths: getTableColumnLengths(queryTaskState.displayResults.table.columns, queryTaskState.displayResults.table.dataPoints),
                                } : undefined,
                                view: queryTaskState.displayResults.view ? {
                                } : undefined,
                            },
                        } satisfies JobBatchFinished),
                    );
                })
            });
        }

        const onProviderBatchDone = (cacheKey: string, provider: InstanceRef) => async (data: ProcessedData[]): Promise<void> => {
            const cachedResult = await this.queryCache.getFromCacheByKey(cacheKey);

            data.forEach((item) => {
                item.object._source = {
                    type: "string",
                    value: provider,
                }
            });

            cachedResult.data = merge<ProcessedData>(
                [cachedResult.data, data],
                compareProcessedData,
            );

            // Handle batch done - emit event to client
            await onTaskDone();
            console.log(`Batch done for task ${taskId}`);
        }

        for (const instanceHolder of instancesToSearchOn) {
            console.log(`Starting query on instance ${instanceHolder.instance.name} for task ${taskId}`);
            const provider = instanceHolder.provider;
            const uniqueQueryExecution: QueryExecutionHistory = {
                params: parsedTree.controllerParams,
                search: parsedTree.search,
                start: queryOptions.fromTime,
                end: queryOptions.toTime,
                instanceRef: instanceHolder.instance.name,
            };

            if (queryOptions.isForced) {
                await this.queryCache.forceRemoveFromCache(uniqueQueryExecution);
            }

            let cacheRecord: CacheRecord;
            if (!await this.queryCache.inCache(uniqueQueryExecution)) {
                cacheRecord = await this.queryCache.addToCache(uniqueQueryExecution, taskId, (record) => {
                    return new Promise<void>((resolve, reject) => {
                        // Start the query
                        provider.query(parsedTree.controllerParams, parsedTree.search, {
                            fromTime: queryOptions.fromTime,
                            toTime: queryOptions.toTime,
                            limit: queryOptions.limit,
                            cancelToken: queryTaskState.abortController.signal,
                            onBatchDone: onProviderBatchDone(record.key, instanceHolder.instance.name),
                        }).then(async () => {
                            record.status = "completed";
                            console.log(`Query subtask completed for task ${taskId}`);
                            resolve();
                        }).catch((error) => {
                            record.status = "failed";
                            console.error(`Query subtask failed for task ${taskId}:`, error);
                            reject(error);
                        });
                    })
                });
            } else {
                // If the query is already in cache, we just reference it
                cacheRecord = await this.queryCache.referenceCache(uniqueQueryExecution, taskId);
                console.log(`Query subtask referenced from cache for task ${taskId}`);
            }

            const subTask: SubTask = {
                id: uuidv4() as SubTaskRef,
                createdAt: new Date(),
                cacheKey: cacheRecord.key,
                instanceRef: instanceHolder.instance.name,
                isReady: cacheRecord.promise,
            } satisfies SubTask
            queryTaskState.subTasks.push(subTask);
        }

        Promise.allSettled(queryTaskState.subTasks.map(task => task.isReady)).then((statuses) => {
            const allReady = statuses.every(status => status.status === "fulfilled");
            if (!allReady) {
                // get the first error that occurred
                const error = statuses.find(status => status.status === "rejected")?.reason;
                // If any subtask fails, we mark the main task as failed
                task.status = "failed";
                console.error(`Query task ${taskId} failed:`, error);
            } else {
                // All subtasks are ready, we can mark the main task as completed
                task.status = "completed";
                console.log(`Query task ${taskId} completed successfully`);
            }

            onTaskDone().then(() => {
                messageSender.sendMessage(newJobUpdatedMessage(taskId, task.status));
                queryTaskState.finishedQuerying.signal();
            })
        });

        return task;
    }

    public async getViewData(taskId: TaskRef): Promise<NonNullable<DisplayResults["view"]>> {
        const taskState = this.queryTasks[taskId];
        if (!taskState) {
            throw new Error(`Query task with id ${taskId} not found`);
        }

        if (!taskState.displayResults.view) {
            throw new Error(`No view data available for task ${taskId}`);
        }

        return taskState.displayResults.view;
    }

    public async exportTableResults(taskId: TaskRef, format: "csv" | "json"): Promise<ExportResults> {
        const taskState = this.queryTasks[taskId];
        if (!taskState) {
            throw new Error(`Query task with id ${taskId} not found`);
        }

        if (!taskState.displayResults.table) {
            throw new Error(`No table data available for task ${taskId}`);
        }

        const tableData = taskState.displayResults.table.dataPoints;
        const preparedData = dataAsArray(tableData)

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
        }
    }

    public async resetQueries() {
        for (const taskId of this.executedJobs) {
            await this.releaseTaskResources(taskId);
        }
        this.queryTasks = {};
        this.queryCache = new QueryCacheHolder(); // Reset the query cache
        this.executedJobs = []; // Clear the executed jobs
    }

    public async releaseTaskResources(taskId: TaskRef) {
        const taskState = this.queryTasks[taskId];
        if (!taskState) {
            console.warn(`No resources to release for task ${taskId} - task not found`);
            return; // No resources to release if the task does not exist
        }

        for (const subTask of taskState.subTasks) {
            await this.queryCache.removeFromCacheByKey(subTask.cacheKey, taskId);
        }

        // Clean up resources associated with the task
        taskState.abortController.abort(); // Abort the ongoing query
        delete this.queryTasks[taskId]; // Remove the task from the state
        this.executedJobs = this.executedJobs.filter(id => id !== taskId); // Remove from executed jobs
        console.log(`Resources released for query task ${taskId}`);
    }

    private _getInstancesToQueryOn(searchProfileRef: SearchProfileRef, parsedTree: ParsedQuery): PluginInstanceContainer[] {
        const selectedProfile = this.searchProfiles[searchProfileRef];
        let instancesToSearchOn: PluginInstanceContainer[] = [];
        if (parsedTree.dataSources.length === 0) {
            // If no data sources are specified, use all instances in the selected search profile
            instancesToSearchOn = this.initializedPlugins.filter(p => selectedProfile.instances.includes(p.instance.name));
        } else {
            // If data sources are specified, filter instances based on the data sources
            const dataSources = parsedTree.dataSources.map(ds => ds.name);
            instancesToSearchOn = this.initializedPlugins.filter(p => dataSources.includes(p.instance.name) && selectedProfile.instances.includes(p.instance.name));
        }

        return instancesToSearchOn;
    }

    private createProcessor(): PipelineItemProcessor {
        return {
            eval: (_context, currentData, options) => processEval(currentData, options.variableName, options.expression),
            regex: (_context, currentData, options) => processRegex(currentData, new RegExp(options.pattern), options.columnSelected),
            sort: (_context, currentData, options) => processSort(currentData, options.columns),
            stats: (_context, currentData, options) => processStats(currentData, options.columns, options.groupBy),
            table: (_context, currentData, options) => processTable(currentData, options.columns),
            timechart: (context, currentData, options) => processTimeChart(currentData, options.columns, options.groupBy, context.startTime, context.endTime, options.params),
            where: (_context, currentData, options) => processWhere(currentData, options.expression),
        }
    }

    private getPipelineItems(taskState: QueryTaskState, data: ProcessedData[], pipeline: PipelineItem[]) {
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
            startTime: taskState.task.input.queryOptions.fromTime,
            endTime: taskState.task.input.queryOptions.toTime,
        }

        const pipelineStart = new Date();
        console.log("[Pipeline] Start time: ", pipelineStart);
        try {
            const result = produce(allData, (draft) => {
                const res = processPipelineV2(this.createProcessor(), draft, pipeline, context);
                draft.events = res.events;
                draft.table = res.table;
                draft.view = res.view;
            });

            return result;
        } finally {
            const pipelineEnd = new Date();
            console.log("[Pipeline] End time: ", pipelineEnd);
            console.log("[Pipeline] Time taken: ", pipelineEnd.getTime() - pipelineStart.getTime());
        }
    }

    public cancelQuery(taskId: TaskRef): void {
        const taskState = this.queryTasks[taskId];
        if (!taskState) {
            throw new Error(`Query task with id ${taskId} not found`);
        }
        taskState.abortController.abort(); // This will cancel the ongoing query
        taskState.task.status = "canceled"; // or you can set it to "cancelled" if you prefer
        console.log(`Query task ${taskId} cancelled`);
        this.messageSender.sendMessage(newJobUpdatedMessage(taskId, taskState.task.status)); // Notify the client about the cancellation
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
    return columns.reduce((acc, col) => {
        acc[col] = Math.min(
            100,
            Math.max(
                3,
                col.length, // Length of the column name
                ...data.map((row) => {
                    const value = row.object[col];
                    return asDisplayString(value).length + 3; // Length of the value in the column
                })
            )
        );
        return acc;
    }, {} as Record<string, number>);
}