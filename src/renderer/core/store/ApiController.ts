import { QueryBatchDoneSchema, QueryJobUpdatedSchema } from "src/plugins_engine/protocol_out";
import { PluginInstance } from "src/plugins_engine/types";
import z from "zod";
import { StreamConnection, SubscribeOptions, UnsubscribeFunction } from "~lib/network";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { QueryOptions, QueryProvider } from "../common/interface";


export class ApiController {
    constructor(private connection: StreamConnection) {}
    listPlugins = async () => {
        return await this.connection.invoke("getSupportedPlugins", {});
    }

    listInitializedPlugins = async () => {
        return await this.connection.invoke("getInitializedPlugins", {});
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

    public createProvider(plugin: PluginInstance): QueryProvider {
        return new PluginInstanceQueryProvider(plugin, this.connection);
    }
}


class PluginInstanceQueryProvider implements QueryProvider {
    constructor(private pluginInstance: PluginInstance, private connection: StreamConnection) { }

    async waitForReady(): Promise<void> {
        // Implement logic to wait for the provider to be ready
        return Promise.resolve()
    }

    async getControllerParams(): Promise<Record<string, string[]>> {
        return await this.connection.invoke("getControllerParams", { instanceId: this.pluginInstance.id });
    }

    async query(params: ControllerIndexParam[], searchTerm: Search, queryOptions: QueryOptions): Promise<void> {
        const job = await this.connection.invoke("runQuery", {
            instanceId: this.pluginInstance.id,
            controllerParams: params,
            searchTerm,
            queryOptions: {
                fromTime: queryOptions.fromTime,
                toTime: queryOptions.toTime,
                limit: queryOptions.limit,
            },
        });
        console.log("Query job started:", job);

        // TODO: potential miss of job updates if the job is completed before the subscription is set up
        const unsubscribeBatchHandler = this.connection.subscribe(QueryBatchDoneSchema, {
            predicate: (batchMessage) => batchMessage.payload.jobId === job.id,
            callback: (batchMessage) => {
                queryOptions.onBatchDone(batchMessage.payload.data);
            },
        });

        // setup cancel token
        const cancelToken = queryOptions.cancelToken;
        let unsubscribeJobDoneHandler!: UnsubscribeFunction;
        cancelToken.addEventListener("abort", async () => {
            console.log(`Query job ${job.id} cancelled`);
            await this.connection.invoke("cancelQuery", {
                taskId: job.id,
            });
            unsubscribeJobDoneHandler?.();
        });

        return new Promise((resolve, reject) => {
            unsubscribeJobDoneHandler = this.connection.subscribe(QueryJobUpdatedSchema, {
                predicate: (jobUpdateMessage) => jobUpdateMessage.payload.jobId === job.id,
                callback: (jobUpdateMessage) => {
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
                    unsubscribeBatchHandler();
                    unsubscribeJobDoneHandler();
                },
            });
        });
    }
}
