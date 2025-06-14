import { Adapter, newPluginRef, QueryProvider } from "~lib/adapters";
import { GrafanaController } from "./background/controller";

const adapter: Adapter = {
    ref: newPluginRef('grafana_browser'),
    name: "Grafana Browser",
    description: "Adapter for Grafana Browser",
    version: "0.1.0",
    params: [
        {
            name: "grafanaUrl",
            description: "Grafana URL",
            type: "string",
        },
        {
            name: "uid",
            description: "Grafana UID",
            type: "string",
        },
        {
            name: "filter",
            description: "Grafana filter",
            type: "array",
            defaultValue: [],
        },
        {
            name: "querySuffix",
            description: "Grafana filter extension",
            type: "array",
            defaultValue: [],
        }
    ],
    factory: ({params}): QueryProvider => {
        const { grafanaUrl, uid, filter, querySuffix } = params;
        if (!grafanaUrl || !uid) {
            throw new Error("Grafana URL and UID are required parameters.");
        }

        return new GrafanaController(grafanaUrl as string, uid as string, filter as any, querySuffix as any);
    },
}

export {
    adapter,
}