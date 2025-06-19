import { Adapter, newPluginRef, QueryProvider } from "~lib/adapters";
import { CoralogixController } from "./controller";
import { z } from "zod/v4";

const paramsSchema = z.object({
  api_url: z.url().default("https://api.coralogix.us/api/v1"),
  dashboard_url: z.url(),
  region: z.string().default("usprod1"),
});

export type CoralogixParams = z.infer<typeof paramsSchema>;

const adapter: Adapter = {
  ref: newPluginRef("coralogix"),
  name: "Coralogix Adapter",
  description: "Adapter for Coralogix",
  version: "0.1.0",
  params: paramsSchema,
  factory: (ctx, { params }): QueryProvider => {
    const parsedParams = paramsSchema.parse(params);
    return new CoralogixController(ctx, parsedParams);
  },
};

export { adapter };
