// MUST BE SERIALIZABLE
export type PluginInstance = {
    id: string;
    name: string;
    description: string;
    pluginRef: string;
}

// MUST BE SERIALIZABLE
export type QueryTask = {
    id: string;
    instanceId: string;
    status: "running" | "completed" | "failed" | "canceled";
    createdAt: Date;
}

// MUST BE SERIALIZABLE
export type SerializeableParams = {
    fromTime: Date,
    toTime: Date,
    limit: number,
}