import hash from "object-hash";
import { v4 as uuidv4 } from "uuid";
import { Mutex } from "async-mutex";
import { ProcessedData } from "~lib/adapters/logTypes";
import { QueryExecutionHistory, TaskRef } from "./types";

export type CacheRecord = {
    id: string; // Unique identifier for the cache record
    referencingTasks: Set<TaskRef>;
    data: ProcessedData[];
    lastAccessed: Date;
    key: string;
    identifier: QueryExecutionHistory;
    status: "running" | "completed" | "failed" | "canceled";
    promise: Promise<void>;
}

export class QueryCacheHolder {
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
