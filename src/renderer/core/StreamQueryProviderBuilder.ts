import { QueryBatchDoneSchema, QueryJobUpdatedSchema } from "src/plugins_engine/protocol_out";
import { PluginInstance, SupportedPlugin } from "src/plugins_engine/types";
import { StreamConnection, UnsubscribeFunction } from "~lib/network";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { QueryOptions, QueryProvider } from "./common/interface";

type QueryProviderHolder = {
    instance: PluginInstance;
    provider: QueryProvider;
}

export class StreamQueryProviderBuilder {
    private supportedPlugins: SupportedPlugin[] = [];
    public initializedControllers: QueryProviderHolder[] = [];


    constructor(private connection: StreamConnection) {
    }

    initialize = async () => {
        this.initializedControllers = [];
        this.supportedPlugins = await this.listPlugins();
        const initializedPlugins = await this.listInitializedPlugins();
        for (const pluginInstance of initializedPlugins) {
            this.createProvider(pluginInstance);
        }
    }

    listPlugins = async () => {
        return await this.connection.invoke("getSupportedPlugins", {});
    }

    listInitializedPlugins = async () => {
        return await this.connection.invoke("getInitializedPlugins", {});
    }

    createProvider(plugin: PluginInstance): Promise<QueryProvider> {
        // Here you would create and return an instance of a QueryProvider
        // based on the plugin. This is a placeholder implementation.
        const provider = new PluginInstanceQueryProvider(plugin, this.connection);
        this.initializedControllers.push({ instance: plugin, provider });
        return Promise.resolve(provider);
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
