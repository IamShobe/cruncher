import { z } from "zod/v4";
import { Adapter, newPluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { K8sController } from "./controller";

const paramsSchema = z.object({
  binaryLocation: z.string().default("kubectl"),
  context: z.string().optional(),
  namespace: z.string().optional(),
  podFilter: z.string().optional(),
  podOverride: z
    .record(
      z.string(),
      z.object({
        messageFieldName: z.string().optional(),
      }),
    )
    .optional(),
  logPatterns: z
    .array(
      z.object({
        name: z.string(),
        pattern: z.string(),
        applyTo: z.array(z.string()).default([]),
        exclude: z.array(z.string()).default([]),
        applyToAll: z.boolean().default(false),
        messageFieldName: z.string().optional(),
      }),
    )
    .default([]),
});

export type K8sParams = z.infer<typeof paramsSchema>;
export type K8sLogPatterns = z.infer<typeof paramsSchema.shape.logPatterns>;

const adapter: Adapter = {
  ref: newPluginRef("k8s"),
  name: "Kubernetes Logs",
  description: "Adapter for Kubernetes pod logs via kubectl",
  version: "0.1.0",
  params: paramsSchema,
  factory: (_context, { params }): QueryProvider => {
    const parsedParams = paramsSchema.parse(params);

    return new K8sController(parsedParams);
  },
};

export default adapter;
