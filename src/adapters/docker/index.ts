import { Adapter, PluginRef, QueryProvider } from "~lib/adapters";
import { DockerController, LogPattern } from "./background/controller";

const adapter: Adapter = {
  ref: "docker" as PluginRef,
  name: "Docker Logs",
  description: "Adapter for Docker container logs",
  version: "0.1.0",
  params: [
    {
      name: "dockerHost",
      description:
        "Docker daemon host (e.g., unix:///var/run/docker.sock or tcp://localhost:2376)",
      type: "string",
      defaultValue: "unix:///var/run/docker.sock",
    },
    {
      name: "containerFilter",
      description: "Container name or ID filter (optional)",
      type: "string",
    },
    {
      name: "logPatterns",
      description:
        "Custom regex patterns for log parsing (array of {name: string, regex: RegExp})",
      type: "array",
      defaultValue: [],
    },
  ],
  factory: (_context, { params }): QueryProvider => {
    const { dockerHost, containerFilter, logPatterns } = params;

    return new DockerController(
      (dockerHost as string) || "unix:///var/run/docker.sock",
      (containerFilter as string) || "",
      (logPatterns as LogPattern[]) || []
    );
  },
};

export { adapter };
