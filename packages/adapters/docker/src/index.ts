import { z } from "zod/v4";
import { Adapter, newPluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { DockerController } from "./controller";

const paramsSchema = z.object({
  binaryLocation: z.string().default("docker"),
  dockerHost: z.string().default("unix:///var/run/docker.sock"),
  containerFilter: z.string().optional(),
  streams: z.array(z.enum(["stdout", "stderr"])).default(["stdout", "stderr"]),
  containerOverride: z
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

export type DockerParams = z.infer<typeof paramsSchema>;
export type DockerLogPatterns = z.infer<typeof paramsSchema.shape.logPatterns>;

const adapter: Adapter = {
  ref: newPluginRef("docker"),
  name: "Docker Logs",
  description: "Adapter for Docker container logs",
  version: "0.1.0",
  params: paramsSchema,
  factory: (_context, { params }): QueryProvider => {
    const parsedParams = paramsSchema.parse(params);

    return new DockerController(parsedParams);
  },
};

export default adapter;
