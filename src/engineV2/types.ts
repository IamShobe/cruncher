import { Mutex } from "async-mutex";
import BTree from 'sorted-btree';
import { Param, PluginRef, QueryProvider } from "~lib/adapters";
import { ProcessedData } from "~lib/adapters/logTypes";
import { FullDate } from "~lib/dateUtils";
import { DisplayResults } from "~lib/displayTypes";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { Signal } from "~lib/utils";


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

// MUST BE SERIALIZABLE
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

export type PageResponse<T> = {
    data: T[];
    total: number;
    limit: number;
    next: number | null; // Reference to the next page, if any
    prev: number | null; // Reference to the previous page, if any
}

export type TableDataResponse = PageResponse<ProcessedData>;

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
            autoCompleteKeys: string[];
        },
        table?: {
            totalRows: number;
            columns: string[];
            columnLengths: Record<string, number>;
        },
        view?: {

        }
    }
}

export type ExportResults = {
    payload: string; // The exported data in a string format (e.g., CSV, JSON)
    fileName: string; // The name of the file to be downloaded
    contentType: string; // The type of the file (e.g., "text/csv", "application/json")
}
