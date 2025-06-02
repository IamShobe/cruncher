import { v4 as uuidv4 } from 'uuid';
import { supportedPlugins } from "./supported_plugins"
import { PluginInstance, QueryTask, SerializeableParams } from "./types";
import { QueryProvider } from "~lib/adapters";
import fs from "node:fs";
import YAML from 'yaml'
import { CruncherConfigSchema } from "src/config/types";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { ProcessedData } from "~lib/adapters/logTypes";


const configFilePath = 'cruncher.config.yaml';

// file should be in ~/.config/cruncher/cruncher.config.yaml

const defaultConfigFilePath = `${process.env.HOME}/.config/cruncher/${configFilePath}`;

const initializedPlugins: PluginInstanceContainer[] = [];

type PluginInstanceContainer = {
    instance: PluginInstance;
    provider: QueryProvider;
}

type QueryTaskState = QueryTask & {
    abortController: AbortController;
}

const queryTasks: Record<string, QueryTaskState> = {};

export type MessageSender = {
    batchDone: (jobId: string, data: ProcessedData[]) => void;
    jobUpdated: (job: QueryTask) => void;
    urlNavigate: (url: string) => void;
}

export const controller = {
    initializePlugin: (pluginRef: string, name: string, params: Record<string, unknown>): PluginInstance => {
        const plugin = supportedPlugins.find(p => p.ref === pluginRef);
        if (!plugin) {
            throw new Error(`Plugin with ref ${pluginRef} not found`);
        }

        const instance = plugin.factory({params});
        if (!instance) {
            throw new Error(`Failed to create instance for plugin ${pluginRef}`);
        }

        const pluginInstance: PluginInstance = {
            id: uuidv4(),
            name: name,
            description: plugin.description,
            pluginRef: plugin.ref,
        };


        initializedPlugins.push({
            instance: pluginInstance,
            provider: instance,
        });
        return pluginInstance;
    },
    getSupportedPlugins: () => {
        return supportedPlugins.map((plugin) => {
            return {
                ref: plugin.ref,
                name: plugin.name,
                description: plugin.description,
                version: plugin.version,
                params: plugin.params,
            };
        });
    },
    runQuery: (messageSender: MessageSender, instanceId: string, params: ControllerIndexParam[], searchTerm: Search, queryOptions: SerializeableParams): QueryTask => {
        const pluginContainer = initializedPlugins.find(p => p.instance.id === instanceId);
        if (!pluginContainer) {
            throw new Error(`Plugin instance with id ${instanceId} not found`);
        }

        const { provider } = pluginContainer;

        const taskId = uuidv4();
        const task: QueryTask = {
            id: taskId,
            instanceId: instanceId,
            status: "running",
            createdAt: new Date(),
        };

        const queryTaskState = {
            ...task,
            abortController: new AbortController(),
        }
        queryTasks[taskId] = queryTaskState;

        // Start the query
        provider.query(params, searchTerm, {
            fromTime: queryOptions.fromTime,
            toTime: queryOptions.toTime,
            limit: queryOptions.limit,
            cancelToken: queryTaskState.abortController.signal,
            onBatchDone: (data) => {
                // Handle batch done - emit event to client
                console.log(`Batch done for task ${taskId}`);
                messageSender.batchDone(taskId, data);
            }
        }).then(() => {
            task.status = "completed";
            console.log(`Query completed for task ${taskId}`);
            messageSender.jobUpdated(task);
        }).catch((error) => {
            task.status = "failed";
            console.error(`Query failed for task ${taskId}:`, error);
            messageSender.jobUpdated(task);
        });

        return task;
    },
    cancelQuery: (messageSender: MessageSender, taskId: string) => {
        const task = queryTasks[taskId];
        if (!task) {
            throw new Error(`Query task with id ${taskId} not found`);
        }
        task.abortController.abort(); // This will cancel the ongoing query
        task.status = "canceled"; // or you can set it to "cancelled" if you prefer
        console.log(`Query task ${taskId} cancelled`);
        messageSender.jobUpdated(task); // Notify the client about the cancellation
    },
    getControllerParams: async (instanceId: string) => {
        const pluginContainer = initializedPlugins.find(p => p.instance.id === instanceId);
        if (!pluginContainer) {
            throw new Error(`Plugin instance with id ${instanceId} not found`);
        }

        const { provider } = pluginContainer;
        return await provider.getControllerParams();
    },
    getInitializedPlugins: () => {
        return initializedPlugins.map((plugin) => {
            return plugin.instance;
        });
    },
}


export const setupPluginsFromConfig = () => {
    // load default plugins from cruncher.config.yaml file

    // read file content
    if (!fs.existsSync(defaultConfigFilePath)) {
        console.warn(`Configuration file not found at ${defaultConfigFilePath}`);
        return;
    }

    const fileContent = fs.readFileSync(defaultConfigFilePath, 'utf8');

    // parse YAML content
    const config = YAML.parse(fileContent);

    const validated = CruncherConfigSchema.safeParse(config);
    if (!validated.success) {
        console.error("Invalid configuration file:", validated.error);
        return;
    }

    for (const plugin of validated.data.connectors) {
        try {
            const pluginInstance = controller.initializePlugin(plugin.type, plugin.name, plugin.params);
            console.log(`Plugin initialized: ${pluginInstance.name} of type ${pluginInstance.pluginRef}`);
        } catch (error) {
            console.error(`Error initializing plugin ${plugin.type}:`, error);
        }
    }
}
