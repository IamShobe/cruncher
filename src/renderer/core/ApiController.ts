import { ClosestPoint, ExportResults, InstanceRef, PageResponse, QueryTask, SearchProfileRef, TableDataResponse, TaskRef } from "src/engineV2/types";
import { QueryBatchDoneSchema, QueryJobUpdatedSchema } from "src/plugins_engine/protocolOut";
import z from "zod";
import { ProcessedData } from "~lib/adapters/logTypes";
import { DisplayResults } from "~lib/displayTypes";
import { StreamConnection, SubscribeOptions, UnsubscribeFunction } from "~lib/network";
import { removeJobQueries } from "./api";
import { QueryOptions } from "./common/interface";


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

    listInitializedSearchProfiles = async () => {
        return await this.connection.invoke("getSearchProfiles", {});
    };

    getGeneralSettings = async () => {
        return await this.connection.invoke("getGeneralSettings", {});
    };

    getControllerParams = async (pluginInstanceRef: InstanceRef): Promise<Record<string, string[]>> => {
        return await this.connection.invoke("getControllerParams", { instanceRef: pluginInstanceRef });
    }

    subscribeToMessages = <T extends z.ZodTypeAny>(
        schema: T,
        options: SubscribeOptions<T>,
    ) => {
        const unsub = this.connection.subscribe(schema, options);

        return () => {
            unsub(); // Unsubscribe from the WebSocket messages
        };
    };

    async getLogs(taskId: TaskRef): Promise<DisplayResults> {
        return await this.connection.invoke("getLogs", { jobId: taskId });
    }

    async getViewData(taskId: TaskRef): Promise<NonNullable<DisplayResults["view"]>> {
        return await this.connection.invoke("getViewData", { jobId: taskId });
    }

    async getTableDataPaginated(taskId: TaskRef, offset: number, limit: number): Promise<TableDataResponse> {
        return await this.connection.invoke("getTableDataPaginated", {
            jobId: taskId,
            offset: offset,
            limit: limit,
        });
    }

    async getLogsPaginated(taskId: TaskRef, offset: number, limit: number): Promise<PageResponse<ProcessedData>> {
        const results = await this.connection.invoke("getLogsPaginated", {
            jobId: taskId,
            offset: offset,
            limit: limit,
        });

        return results;
    }

    async getClosestDateEvent(taskId: TaskRef, refDate: number): Promise<ClosestPoint | null> {
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

    async exportTableResults(
        taskId: TaskRef,
        format: "csv" | "json",
    ): Promise<ExportResults> {
        return await this.connection.invoke("exportTableResults", {
            jobId: taskId,
            format: format,
        });
    }

    async releaseResources(taskId: TaskRef): Promise<void> {
        await removeJobQueries(taskId);
        this.connection.invoke("releaseTaskResources", {
            jobId: taskId,
        });
    }

    async query(searchProfileRef: SearchProfileRef, searchTerm: string, queryOptions: QueryOptions) {
        // setup cancel token
        const cancelToken = queryOptions.cancelToken;
        let unsubscribeJobDoneHandler!: UnsubscribeFunction;
        let executedJob: QueryTask | null = null;
        cancelToken.addEventListener("abort", async () => {
            if (!executedJob) {
                console.warn("No job to cancel");
                return;
            }

            console.log(`Query job ${executedJob.id} cancelled`);
            await this.connection.invoke("cancelQuery", {
                taskId: executedJob.id,
            });
            executedJob = null; // Clear the executed job after cancellation
            unsubscribeJobDoneHandler?.();
        });

        const unsubscribeBatchHandler = this.connection.subscribe(QueryBatchDoneSchema, {
            predicate: (batchMessage) => batchMessage.payload.jobId === executedJob?.id,
            callback: (batchMessage) => {
                queryOptions.onBatchDone(batchMessage.payload.data);
            },
        });

        executedJob = await this.connection.invoke("runQueryV2", {
            searchProfileRef: searchProfileRef,
            searchTerm,
            queryOptions: {
                fromTime: queryOptions.fromTime,
                toTime: queryOptions.toTime,
                limit: queryOptions.limit,
                isForced: queryOptions.isForced || false, // Default to false if not provided
            },
        });
        console.log("Query job started:", executedJob);
        return {
            job: executedJob,
            promise: new Promise<void>((resolve, reject) => {
                unsubscribeJobDoneHandler = this.connection.subscribe(QueryJobUpdatedSchema, {
                    predicate: (jobUpdateMessage) => jobUpdateMessage.payload.jobId === executedJob?.id,
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
