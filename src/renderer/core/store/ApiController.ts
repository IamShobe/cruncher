import { ClosestPoint, InstanceRef, PageResponse, PluginInstance, QueryTask, TableDataResponse, TaskRef } from "src/engineV2/engine";
import { QueryBatchDoneSchema, QueryJobUpdatedSchema } from "src/plugins_engine/protocolOut";
import z from "zod";
import { DisplayResults } from "~lib/displayTypes";
import { StreamConnection, SubscribeOptions, UnsubscribeFunction } from "~lib/network";
import { QueryOptions, QueryProvider } from "../common/interface";
import { ProcessedData } from "~lib/adapters/logTypes";
import { queryClient } from "~core/client";


export class ApiController {
    constructor(private connection: StreamConnection) { }
    reload = async () => {
        return await this.connection.invoke("reloadConfig", {});
    }

    resetQueries = async () => {
        return await this.connection.invoke("resetQueries", {});
    }

    listPlugins = async () => {
        return await this.connection.invoke("getSupportedPlugins", {});
    }

    listInitializedPlugins = async () => {
        return await this.connection.invoke("getInitializedPlugins", {});
    }

    getGeneralSettings = async () => {
        return await this.connection.invoke("getGeneralSettings", {});
    };

    subscribeToMessages = <T extends z.ZodTypeAny>(
        schema: T,
        options: SubscribeOptions<T>,
    ) => {
        const unsub = this.connection.subscribe(schema, options);

        return () => {
            unsub(); // Unsubscribe from the WebSocket messages
        };
    };

    public createProvider(plugin: PluginInstance): QueryProvider {
        return new PluginInstanceQueryProvider(plugin, this.connection);
    }
}


class PluginInstanceQueryProvider implements QueryProvider {
    private executedJob: QueryTask | null = null;

    constructor(private pluginInstance: PluginInstance, private connection: StreamConnection) { }

    async waitForReady(): Promise<void> {
        // Implement logic to wait for the provider to be ready
        return Promise.resolve()
    }

    async getControllerParams(): Promise<Record<string, string[]>> {
        return await this.connection.invoke("getControllerParams", { instanceRef: this.pluginInstance.name });
    }

    async getLogs(): Promise<DisplayResults> {
        if (!this.executedJob) {
            return {
                events: {
                    data: [],
                    type: "events",
                },
                table: undefined,
                view: undefined,
            };
        }

        return await this.connection.invoke("getLogs", { jobId: this.executedJob.id });
    }

    async getTableDataPaginated(taskId: TaskRef, offset: number, limit: number): Promise<TableDataResponse> {
        if (!this.executedJob) {
            console.warn("No executed job to get table data from");
            return {
                data: [],
                total: 0,
                limit: limit,
                next: null,
                prev: null,
                columnLengths: {},
                columns: [],
            };
        }

        return await this.connection.invoke("getTableDataPaginated", {
            jobId: taskId,
            offset: offset,
            limit: limit,
        });
    }

    async getLogsPaginated(taskId: TaskRef, offset: number, limit: number): Promise<PageResponse<ProcessedData>> {
        if (!this.executedJob) {
            console.warn("No executed job to get logs from");
            return {
                data: [],
                total: 0,
                limit: limit,
                next: null,
                prev: null,
            };
        }

        const results = await this.connection.invoke("getLogsPaginated", {
            jobId: taskId,
            offset: offset,
            limit: limit,
        });

        return results;
    }

    async getClosestDateEvent(taskId: TaskRef, refDate: number): Promise<ClosestPoint | null> {
        if (!this.executedJob) {
            console.warn("No executed job to get closest date event from");
            return null;
        }

        const results = await this.connection.invoke("getClosestDateEvent", {
            jobId: taskId,
            refDate: refDate,
        });

        if (results === null) {
            console.warn("No closest date event found");
            return null;
        }

        return results;
    }

    async releaseResources(taskId: TaskRef): Promise<void> {
        await queryClient.removeQueries({
            queryKey: ["logs", taskId],
        });
        await queryClient.removeQueries({
            queryKey: ["tableData", taskId],
        });
        this.connection.invoke("releaseTaskResources", {
            jobId: taskId,
        });
    }

    async query(searchTerm: string, queryOptions: QueryOptions) {
        // setup cancel token
        const cancelToken = queryOptions.cancelToken;
        let unsubscribeJobDoneHandler!: UnsubscribeFunction;
        cancelToken.addEventListener("abort", async () => {
            if (!this.executedJob) {
                console.warn("No job to cancel");
                return;
            }

            console.log(`Query job ${this.executedJob.id} cancelled`);
            await this.connection.invoke("cancelQuery", {
                taskId: this.executedJob.id,
            });
            this.executedJob = null; // Clear the executed job after cancellation
            unsubscribeJobDoneHandler?.();
        });

        const unsubscribeBatchHandler = this.connection.subscribe(QueryBatchDoneSchema, {
            predicate: (batchMessage) => batchMessage.payload.jobId === this.executedJob?.id,
            callback: (batchMessage) => {
                queryOptions.onBatchDone(batchMessage.payload.data);
            },
        });

        const job = await this.connection.invoke("runQueryV2", {
            instanceRef: this.pluginInstance.name as InstanceRef,
            searchTerm,
            queryOptions: {
                fromTime: queryOptions.fromTime,
                toTime: queryOptions.toTime,
                limit: queryOptions.limit,
                isForced: queryOptions.isForced || false, // Default to false if not provided
            },
        });
        this.executedJob = job; // Store the last executed job
        console.log("Query job started:", job);
        return {
            job: job,
            promise: new Promise<void>((resolve, reject) => {
                unsubscribeJobDoneHandler = this.connection.subscribe(QueryJobUpdatedSchema, {
                    predicate: (jobUpdateMessage) => jobUpdateMessage.payload.jobId === this.executedJob?.id,
                    callback: (jobUpdateMessage) => {
                        try {
                            const jobUpdate = jobUpdateMessage.payload;
                            if (jobUpdate.status === "completed") {
                                console.log(`Job ${jobUpdate.jobId} completed`);
                                resolve();
                            } else {
                                console.log(
                                    `Job ${jobUpdate.jobId} updated: ${jobUpdate.status}`
                                );
                                // You can handle other statuses if needed
                                reject(
                                    new Error(
                                        `Query job ${jobUpdate.jobId} failed with status: ${jobUpdate.status}`
                                    )
                                );
                            }
                        } finally {
                            unsubscribeBatchHandler();
                            unsubscribeJobDoneHandler();
                        }
                    },
                });
            })
        };
    }
}
