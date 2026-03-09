import { z } from "zod/v4";
import { Adapter, newPluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { DatadogController } from "./controller";

const DD_SITES = [
  "datadoghq.com",     // US1 — app.datadoghq.com
  "us3.datadoghq.com", // US3
  "us5.datadoghq.com", // US5
  "datadoghq.eu",      // EU1 — app.datadoghq.eu
  "ap1.datadoghq.com", // AP1
] as const;

const paramsSchema = z.object({
  site: z.enum(DD_SITES).default("datadoghq.com"),
  indexes: z.array(z.string()).default([]),   // empty = all indexes ("*")
  query_prefix: z.string().default(""),       // always-applied Lucene filter
});

export type DatadogParams = z.infer<typeof paramsSchema>;

/** Returns the web app base URL for a given Datadog site. */
export function getAppUrl(site: string): string {
  if (site === "datadoghq.com") return "https://app.datadoghq.com";
  if (site === "datadoghq.eu") return "https://app.datadoghq.eu";
  return `https://${site}`;
}

const adapter: Adapter = {
  ref: newPluginRef("datadog"),
  name: "Datadog Adapter",
  description: "Adapter for Datadog Logs",
  version: "0.1.0",
  params: paramsSchema,
  factory: (ctx, { params }): QueryProvider =>
    new DatadogController(ctx, paramsSchema.parse(params)),
};

export default adapter;
