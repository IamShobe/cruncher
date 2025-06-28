import { Adapter, newPluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { LokiController } from "./controller";
import { z } from "zod/v4";

const paramsSchema = z.object({
  url: z.url(),
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

export type LokiParams = z.infer<typeof paramsSchema>;

const adapter: Adapter = {
  ref: newPluginRef("loki"),
  name: "Loki",
  description: "Loki log aggregation adapter",
  version: "0.1.0",
  params: paramsSchema,
  factory: (ctx, { params }): QueryProvider => {
    const parsedParams = paramsSchema.parse(params);

    return new LokiController(parsedParams);
  },
};

export default adapter;
