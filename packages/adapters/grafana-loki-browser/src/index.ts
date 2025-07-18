import { Adapter, newPluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { GrafanaController } from "./controller";
import { z } from "zod/v4";

const paramsSchema = z.object({
  grafanaUrl: z.string(),
  uid: z.string(),
  filter: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        operator: z.enum(["=", "=~", "!=", "!~"]),
      }),
    )
    .default([]),
  querySuffix: z.array(z.string()).default([]),
});

const adapter: Adapter = {
  ref: newPluginRef("grafana_browser"),
  name: "Grafana Browser",
  description: "Adapter for Grafana Browser",
  version: "0.1.0",
  params: paramsSchema,
  factory: (context, { params }): QueryProvider => {
    const parsedParams = paramsSchema.parse(params);

    return new GrafanaController(
      context,
      parsedParams.grafanaUrl,
      parsedParams.uid,
      parsedParams.filter,
      parsedParams.querySuffix,
    );
  },
};

export default adapter;
