import { Mutex } from "async-mutex";
import { ScaleLinear, scaleLinear } from "d3-scale";
import { produce } from "immer";
import merge from "merge-k-sorted-arrays";
import hash from "object-hash";
import BTree from 'sorted-btree';
import { newBatchDoneMessage, newJobUpdatedMessage } from "src/plugins_engine/websocket";
import { v4 as uuidv4 } from 'uuid';
import { Adapter, Param, PluginRef, QueryProvider } from "~lib/adapters";
import { asDateField, compareProcessedData, ProcessedData } from "~lib/adapters/logTypes";
import { FullDate } from "~lib/dateUtils";
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
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { createSignal, Signal } from "~lib/utils";

export type TaskRef = string & { _tr: never }; // A unique identifier for a plugin
export type QueryTask = {
    id: TaskRef;
    input: QueryInput;
    status: "running" | "completed" | "failed" | "canceled";
    createdAt: Date;
}

export type QueryInput = {
    searchTerm: string;
    queryOptions: SerializeableParams;
}

export type QueryTaskState = {
    task: QueryTask;

    subTasks: SubTask[];
    abortController: AbortController;
    index: BTree<number, ProcessedData[]>
    displayResults: DisplayResults;
    finishedQuerying: Signal;
    mutex: Mutex;
}

export type QueryExecutionHistory = {
    params: ControllerIndexParam[];
    search: Search;
    start: FullDate;
    end: FullDate;
    instanceRef: InstanceRef;
};


export type InstanceRef = string & { _ir: never }; // A unique identifier for a plugin instance
export type SearchProfileRef = string & { _spr: never }; // A unique identifier for a search profile
export type SearchProfile = {
    name: SearchProfileRef;
    instances: InstanceRef[];
}

// MUST BE SERIALIZABLE
export type PluginInstance = {
    id: string;
    name: InstanceRef;
    description: string;
    pluginRef: PluginRef;
}

// MUST BE SERIALIZABLE
export type SerializableAdapter = {
    ref: PluginRef;
    name: string;
    description: string;
    version: string;
    params: Param[];
}

// MUST BE SERIALIZABLE
export type SerializeableParams = {
    fromTime: Date,
    toTime: Date,
    limit: number,
    isForced: boolean,
}


export type PluginInstanceContainer = {
    instance: PluginInstance;
    provider: QueryProvider;
}

export type MessageSender = {
    batchDone: (jobId: string, data: ProcessedData[]) => void;
    jobUpdated: (job: QueryTask) => void;
    urlNavigate: (url: string) => void;
}

export type PageResponse<T> = {
    data: T[];
    total: number;
    limit: number;
    next: number | null; // Reference to the next page, if any
    prev: number | null; // Reference to the previous page, if any
}

export type ClosestPoint = {
    closest: number | null
    index: number | null // Index of the closest point in the data array
}

export type SubTaskRef = string & { _: never }; // A unique identifier for a subtask
export type SubTask = {
    id: SubTaskRef;
    createdAt: Date;
    instanceRef: InstanceRef;
    cacheKey: string;
    isReady: Promise<void>;
}

export type JobBatchFinished = {
    scale: {
        from: number;
        to: number;
    }
    views: {
        events: {
            total: number;
            buckets: { timestamp: number, count: number }[];
        },
        table?: {
            totalRows: number;
        }
    }
}

export class Engine {
    private supportedPlugins: Adapter[] = [];
    private initializedPlugins: PluginInstanceContainer[] = [];
    private queryTasks: Record<TaskRef, QueryTaskState> = {};
    private searchProfiles: Record<SearchProfileRef, SearchProfile> = {};
    private defaultSearchProfile: SearchProfileRef = "default" as SearchProfileRef;

    private queryCache: QueryCacheHolder = new QueryCacheHolder();

    private executedJobs: TaskRef[] = []; // Keep track of executed jobs - to allow for cleanup

    constructor(private messageSender: ResponseHandler) { }

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
                params: plugin.params,
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

    public reset(): void {
        this.initializedPlugins = [];
    }

    public initializePlugin(pluginRef: PluginRef, name: InstanceRef, params: Record<string, unknown>): PluginInstance {
        const plugin = this.supportedPlugins.find(p => p.ref === pluginRef);
        if (!plugin) {
            throw new Error(`Plugin with ref ${pluginRef} not found`);
        }

        const instance = plugin.factory({ params });
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

    public async runQuery(instanceRef: InstanceRef, searchTerm: string, queryOptions: SerializeableParams) {
        // TODO: Implement search profile handling
        // const profile = this.searchProfiles[searchProfileRef];
        // if (!profile) {
        //     throw new Error(`Search profile with name ${searchProfileRef} not found`);
        // }

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

        const instancesToSearchOn = this._getInstancesToQueryOn(instanceRef, parsedTree);
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

            // update the index with the total data
            queryTaskState.index.clear();
            totalData.forEach((data) => {
                const timestamp = asDateField(data.object._time).value;
                const toAppendTo = queryTaskState.index.get(timestamp) ?? [];
                toAppendTo.push(data);
                queryTaskState.index.set(timestamp, toAppendTo);
            });

            queryTaskState.displayResults = this.getPipelineItems(queryTaskState, totalData, parsedTree.pipeline);

            const scale = getScale(queryOptions.fromTime, queryOptions.toTime);
            const buckets = calculateBuckets(scale, totalData);

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
                        },
                        table: queryTaskState.displayResults.table ? {
                            totalRows: queryTaskState.displayResults.table.dataPoints.length,
                        } : undefined,
                    },
                } satisfies JobBatchFinished),
            );
        }

        const onProviderBatchDone = (cacheKey: string) => async (data: ProcessedData[]): Promise<void> => {
            await queryTaskState.mutex.runExclusive(async () => {
                const cachedResult = await this.queryCache.getFromCacheByKey(cacheKey);

                cachedResult.data = merge<ProcessedData>(
                    [cachedResult.data, data],
                    compareProcessedData,
                );

                // Handle batch done - emit event to client
                console.log(`Batch done for task ${taskId}`);
                await onTaskDone();
            });
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
                            onBatchDone: onProviderBatchDone(record.key),
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

        Promise.all(queryTaskState.subTasks.map(task => task.isReady)).then(() => {
            // All subtasks are ready, we can mark the main task as completed
            task.status = "completed";
            onTaskDone().then(() => {
                messageSender.sendMessage(newJobUpdatedMessage(taskId, task.status));
                console.log(`Query task ${taskId} completed successfully`);
                queryTaskState.finishedQuerying.signal();
            })
        }).catch((error) => {
            // If any subtask fails, we mark the main task as failed
            task.status = "failed";
            console.error(`Query task ${taskId} failed:`, error);
            messageSender.sendMessage(newJobUpdatedMessage(taskId, task.status));
            queryTaskState.finishedQuerying.signal();
        });

        return task;
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

    private _getInstancesToQueryOn(instanceRef: InstanceRef, parsedTree: ParsedQuery): PluginInstanceContainer[] {
        let instancesToSearchOn: PluginInstanceContainer[] = [];
        if (parsedTree.dataSources.length === 0) {
            // If no data sources are specified, use all instances in the default search profile
            // TODO: Implement search profile handling
            // const defaultProfile = this.searchProfiles[this.defaultSearchProfile];
            // if (!defaultProfile) {
            //     throw new Error(`Default search profile ${this.defaultSearchProfile} not found`);
            // }
            // instancesToSearchOn = this.initializedPlugins.filter(p => defaultProfile.instances.includes(p.instance.name));
            const instance = this.initializedPlugins.find(p => p.instance.name === instanceRef);
            if (!instance) {
                throw new Error(`Plugin instance with name ${instanceRef} not found`);
            }

            instancesToSearchOn = [instance];
        } else {
            // If data sources are specified, filter instances based on the search term
            const dataSources = parsedTree.dataSources.map(ds => ds.name);
            instancesToSearchOn = this.initializedPlugins.filter(p => dataSources.includes(p.instance.name));
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
                const res = processPipelineV2(this.createProcessor(), allData, pipeline, context);
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


type CacheRecord = {
    id: string; // Unique identifier for the cache record
    referencingTasks: Set<TaskRef>;
    data: ProcessedData[];
    lastAccessed: Date;
    key: string;
    identifier: QueryExecutionHistory;
    status: "running" | "completed" | "failed" | "canceled";
    promise: Promise<void>;
}

class QueryCacheHolder {
    private cache: Record<string, CacheRecord> = {};
    private cacheMutex = new Mutex();

    public inCache(
        identifier: QueryExecutionHistory
    ): Promise<boolean> {
        return this.cacheMutex.runExclusive(() => {
            const key = hash(identifier);
            return Promise.resolve(!!this.cache[key]);
        });
    }

    public forceRemoveFromCache(
        identifier: QueryExecutionHistory
    ): Promise<void> {
        return this.cacheMutex.runExclusive(() => {
            const key = hash(identifier);
            if (this.cache[key]) {
                delete this.cache[key];
                console.log(`Cache record removed for key: ${key}`);
            } else {
                console.warn(`No cache record found for key: ${key}`);
            }
        });
    }

    public addToCache(
        identifier: QueryExecutionHistory,
        taskId: TaskRef,
        promiseFactory: (cacheRecord: CacheRecord) => Promise<void>,
    ): Promise<CacheRecord> {
        return this.cacheMutex.runExclusive(() => {
            const key = hash(identifier);
            if (this.cache[key]) {
                throw new Error(`Cache already exists for key: ${key}. Use getFromCacheByKey to retrieve it.`);
            }

            const newRecord = {
                id: uuidv4(), // Generate a unique ID for the cache record
                key: key,
                referencingTasks: new Set([taskId]),
                data: [],
                status: "running", // Initial status can be set to running
                lastAccessed: new Date(),
                identifier: identifier,
                promise: Promise.resolve(), // Initialize with a resolved promise
            } as CacheRecord;
            newRecord.promise = promiseFactory(newRecord);

            this.cache[key] = newRecord;
            console.log(`Cache record added for key: ${key}`);

            return this.cache[key];
        });
    }

    public referenceCache(
        identifier: QueryExecutionHistory,
        taskId: TaskRef
    ): Promise<CacheRecord> {
        return this.cacheMutex.runExclusive(() => {
            const key = hash(identifier);
            if (!this.cache[key]) {
                throw new Error(`Cache miss for key: ${key}`);
            }

            // Add the taskId to the referencing tasks
            this.cache[key].referencingTasks.add(taskId);
            this.cache[key].lastAccessed = new Date(); // Update last accessed time
            return Promise.resolve(this.cache[key]);
        });
    }

    public getFromCacheByKey(
        key: string
    ): Promise<CacheRecord> {
        return this.cacheMutex.runExclusive(() => {
            const record = this.cache[key];
            if (!record) {
                throw new Error(`Cache miss for key: ${key}`);
            }

            // Update last accessed time
            record.lastAccessed = new Date();
            return Promise.resolve(record);
        });
    }

    public getFromCache(
        identifier: QueryExecutionHistory
    ): Promise<CacheRecord> {
        const key = hash(identifier);
        return this.getFromCacheByKey(key);
    }

    public removeFromCacheByKey(
        key: string,
        taskId: TaskRef
    ): Promise<void> {
        return this.cacheMutex.runExclusive(() => {
            if (this.cache[key]) {
                this.cache[key].referencingTasks.delete(taskId);
                if (this.cache[key].referencingTasks.size === 0) {
                    delete this.cache[key];
                }
            }
        });
    }
}

const getScale = (selectedStartTime: Date, selectedEndTime: Date) => {
    if (!selectedStartTime || !selectedEndTime) {
        return;
    }

    return scaleLinear().domain([
        selectedStartTime.getTime(),
        selectedEndTime.getTime(),
    ]);
}


const calculateBuckets = (scale: ScaleLinear<number, number, unknown> | undefined, data: ProcessedData[]) => {
    if (!scale) {
        return [];
    }

    const buckets: Record<number, number> = {};
    const ticks = scale.ticks(100);

    data.forEach((object) => {
        // round timestamp to the nearest tick
        const timestamp = ticks.reduce((prev, curr) => {
            const thisTimestamp = asDateField(object.object._time).value;

            return Math.abs(curr - thisTimestamp) < Math.abs(prev - thisTimestamp)
                ? curr
                : prev;
        });
        if (!buckets[timestamp]) {
            buckets[timestamp] = 0;
        }

        buckets[timestamp] += 1;
    });

    return Object.entries(buckets).map(([timestamp, count]) => ({
        timestamp: parseInt(timestamp),
        count,
    }));
}