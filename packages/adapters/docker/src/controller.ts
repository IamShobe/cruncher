import { QueryOptions, QueryProvider } from "@cruncher/adapter-utils";
import { strip } from "ansicolor";
import { spawn } from "child_process";
import merge from "merge-k-sorted-arrays";

import {
  asStringField,
  compareProcessedData,
  ObjectFields,
  ProcessedData,
  processField,
} from "@cruncher/adapter-utils/logTypes";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import {
  BooleanSearchCallback,
  buildDoesLogMatchCallback,
} from "@cruncher/qql/searchTree";
import { DockerLogPatterns, DockerParams } from ".";

const DEFAULT_DOCKER_HOST = "unix:///var/run/docker.sock";

// Dynamic log parsing utilities
const parseJsonMessage = (message: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(message);
  } catch {
    return null;
  }
};

const intelligentParse = (
  message: string,
  containerName: string,
  logPatterns: DockerLogPatterns = [],
): { parsed: Record<string, unknown>; selectedMessageFieldName: string } => {
  const parsed: Record<string, unknown> = {};
  const jsonParsed = parseJsonMessage(message);
  if (jsonParsed) {
    Object.assign(parsed, jsonParsed);
  }

  let selectedMessageFieldName = "_raw";
  logPatterns.forEach((logPattern) => {
    if (
      (logPattern.applyToAll || logPattern.applyTo.includes(containerName)) &&
      !logPattern.exclude.includes(containerName)
    ) {
      const match = new RegExp(logPattern.pattern).exec(message);
      if (match) {
        Object.assign(parsed, match.groups);
        selectedMessageFieldName = logPattern.messageFieldName ?? "_raw";
      } else {
        console.warn(`Log pattern '${logPattern.name}' failed:`, match);
      }
    }
  });

  return { parsed, selectedMessageFieldName };
};

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  created: string;
}

type Stream = "stdout" | "stderr";

interface DockerLogEntry {
  timestamp: Date;
  message: string;
  container: string;
  containerId: string;
  containerImage: string;
  containerStatus: string;
  parsedFields: Record<string, unknown>;
  selectedMessageFieldName: string;
  ansiFreeLine: string;
  stream: Stream;
}

export type LogPattern = {
  name: string;
  regex: RegExp;
};

export class DockerController implements QueryProvider {
  constructor(private params: DockerParams) {}

  private async getContainers(): Promise<DockerContainer[]> {
    return new Promise((resolve, reject) => {
      const args = ["ps", "-a", "--format", "json"];
      if (this.params.dockerHost !== DEFAULT_DOCKER_HOST) {
        args.unshift("-H", this.params.dockerHost);
      }

      const dockerProcess = spawn("docker", args);
      let output = "";
      let errorOutput = "";

      dockerProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      dockerProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      dockerProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Docker command failed: ${errorOutput}`));
          return;
        }

        try {
          const containers: DockerContainer[] = [];
          const lines = output
            .trim()
            .split("\n")
            .filter((line) => line.trim());

          for (const line of lines) {
            try {
              const container = JSON.parse(line);
              containers.push({
                id: container.ID,
                name: container.Names,
                image: container.Image,
                status: container.Status,
                created: container.CreatedAt,
              });
            } catch {
              // Skip malformed JSON lines
              console.warn("Failed to parse container JSON:", line);
            }
          }

          resolve(containers);
        } catch (error) {
          reject(new Error(`Failed to parse Docker output: ${error}`));
        }
      });

      dockerProcess.on("error", (error) => {
        reject(new Error(`Failed to execute Docker command: ${error.message}`));
      });
    });
  }

  private async getContainerLogs(
    controllerParams: ControllerIndexParam[],
    container: DockerContainer,
    fromTime: Date,
    toTime: Date,
    doesLogMatch: BooleanSearchCallback,
    cancelToken: AbortSignal,
  ): Promise<DockerLogEntry[]> {
    return new Promise((resolve, reject) => {
      if (cancelToken.aborted) {
        reject(new Error("Query cancelled"));
        return;
      }

      const selectedStreams = controllerParams
        .filter((param) => param.name === "stream")
        .map(processStreamControllerParam);

      console.log(
        `Selected streams for container ${container.name}: ${selectedStreams.join(", ")}`,
      );

      let isStdoutSelected = selectedStreams.some((stream) =>
        stream.includes("stdout"),
      );
      let isStderrSelected = selectedStreams.some((stream) =>
        stream.includes("stderr"),
      );

      if (!isStdoutSelected && !isStderrSelected) {
        // Default to both streams if none are selected
        isStdoutSelected = true;
        isStderrSelected = true;
      }

      const args = ["logs"];

      if (this.params.dockerHost !== DEFAULT_DOCKER_HOST) {
        args.unshift("-H", this.params.dockerHost);
      }

      // Add timestamp and stream options
      args.push("--timestamps");

      // Add time filters
      args.push("--since", fromTime.toISOString());
      args.push("--until", toTime.toISOString());

      args.push(container.id);

      //TODO: allow editing the command
      const dockerProcess = spawn("docker", args);
      const logs: DockerLogEntry[] = [];

      const processLogLine = (line: string, stream: Stream) => {
        const indexOfSpace = line.indexOf(" ");
        const originalMessage = line.slice(indexOfSpace + 1);
        const timestampStr = line.slice(0, indexOfSpace).trim();
        const strippedOriginalMessage = strip(originalMessage).trim();
        if (!strippedOriginalMessage) {
          return; // Skip empty lines
        }

        try {
          // Docker log format: TIMESTAMP MESSAGE
          const timestampMatch = timestampStr.match(
            /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)$/,
          );
          if (timestampMatch) {
            const [_row, timestampStr] = timestampMatch;
            const timestamp = new Date(timestampStr);

            // Apply search filter
            if (doesLogMatch(strippedOriginalMessage)) {
              const { parsed, selectedMessageFieldName } = intelligentParse(
                strippedOriginalMessage,
                container.name,
                this.params.logPatterns,
              );

              const finalMessageFieldName =
                this.params.containerOverride?.[container.name]
                  ?.messageFieldName ?? selectedMessageFieldName;

              logs.push({
                timestamp,
                message: originalMessage,
                container: container.name,
                containerId: container.id,
                containerImage: container.image,
                containerStatus: container.status,
                parsedFields: parsed,
                selectedMessageFieldName: finalMessageFieldName,
                ansiFreeLine: strippedOriginalMessage,
                stream: stream,
              });
            }
          }
        } catch {
          // Skip malformed log lines
          console.warn("Failed to parse log line:", strippedOriginalMessage);
        }
      };

      const processData = (data: string, stream: Stream) => {
        // process stdout line by line
        const lines = data.split(/(\r?\n)/g);
        for (let i = 0; i < lines.length; i++) {
          processLogLine(lines[i], stream);
        }
      };

      if (isStdoutSelected) {
        dockerProcess.stdout.setEncoding("utf8");
        dockerProcess.stdout.on("data", (data) => {
          processData(data.toString(), "stdout");
        });
      }

      if (isStderrSelected) {
        dockerProcess.stderr.setEncoding("utf8");
        dockerProcess.stderr.on("data", (data) => {
          processData(data.toString(), "stderr");
        });
      }

      dockerProcess.on("close", (code) => {
        if (code !== 0 && code !== null) {
          reject(new Error(`Docker logs command failed with code ${code}`));
        } else {
          resolve(logs);
        }
      });

      dockerProcess.on("error", (error) => {
        reject(
          new Error(`Failed to execute Docker logs command: ${error.message}`),
        );
      });

      // Handle cancellation
      const abortHandler = () => {
        dockerProcess.kill("SIGTERM");
        reject(new Error("Query cancelled"));
      };

      cancelToken.addEventListener("abort", abortHandler);

      dockerProcess.on("close", () => {
        cancelToken.removeEventListener("abort", abortHandler);
      });
    });
  }

  async query(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ): Promise<void> {
    try {
      const doesLogMatch = buildDoesLogMatchCallback(searchTerm);
      const containers = await this.getContainers();

      // Filter containers based on containerFilter if provided
      const filteredContainers = this.params.containerFilter
        ? containers.filter(
            (container) =>
              container.name.includes(this.params.containerFilter ?? "") ||
              container.id.includes(this.params.containerFilter ?? ""),
          )
        : containers;

      // Apply controller params filtering if any
      const selectedContainers = controllerParams
        .filter((param) => param.name === "container")
        .map(processContainerControllerParam);

      const finalContainers = filteredContainers.filter((container) => {
        return selectedContainers.length > 0
          ? selectedContainers.some((selected) => {
              return (
                container.name.includes(selected) ||
                container.id.includes(selected)
              );
            })
          : true;
      });

      if (finalContainers.length === 0) {
        options.onBatchDone([]);
        return;
      }

      const allLogs = await Promise.all(
        finalContainers.map((container) =>
          this.processContainerLogs(
            controllerParams,
            container,
            options.fromTime,
            options.toTime,
            doesLogMatch,
            options.cancelToken,
          ),
        ),
      );
      const results = merge<ProcessedData>(allLogs, compareProcessedData);
      const limitedLogs = results.slice(0, options.limit);

      options.onBatchDone(limitedLogs);
    } catch (error) {
      if (options.cancelToken.aborted) {
        throw new Error("Query cancelled");
      }
      throw error;
    }
  }

  async getControllerParams(): Promise<Record<string, string[]>> {
    const streams = ["stdout", "stderr"];
    try {
      const containers = await this.getContainers();
      const containerNames = containers.map((c) => c.name);
      const containerIds = containers.map((c) => c.id.substring(0, 12));
      const images = [...new Set(containers.map((c) => c.image))];
      const statuses = [
        ...new Set(containers.map((c) => c.status.split(" ")[0])),
      ];

      return {
        container: [...containerNames],
        container_id: [...containerIds],
        image: images,
        status: statuses,
        stream: streams,
      };
    } catch (error) {
      console.error("Failed to get Docker containers:", error);

      return {
        container: [],
        container_id: [],
        image: [],
        status: [],
        stream: streams,
      };
    }
  }

  async processContainerLogs(
    controllerParams: ControllerIndexParam[],
    container: DockerContainer,
    fromTime: Date,
    toTime: Date,
    doesLogMatch: BooleanSearchCallback,
    cancelToken: AbortSignal,
  ): Promise<ProcessedData[]> {
    const logs = await this.getContainerLogs(
      controllerParams,
      container,
      fromTime,
      toTime,
      doesLogMatch,
      cancelToken,
    );

    return logs
      .map((log) => {
        const fields: ObjectFields = {};

        Object.entries(log.parsedFields).forEach(([key, value]) => {
          fields[key] = processField(value);
        });

        const object: ObjectFields = {
          _time: {
            type: "date",
            value: log.timestamp.getTime(),
          },
          _sortBy: {
            type: "number",
            value: log.timestamp.getTime(),
          },
          _raw: {
            type: "string",
            value: log.message,
          },
          ansi_free_line: processField(log.ansiFreeLine),
          container: processField(log.container),
          containerId: processField(log.containerId),
          image: processField(log.containerImage),
          status: processField(log.containerStatus),
          stream: processField(log.stream),
          ...fields,
        };

        return {
          object,
          message: asStringField(object[log.selectedMessageFieldName]).value,
        } satisfies ProcessedData;
      })
      .sort(
        (a, b) =>
          (b.object._sortBy!.value as number) -
          (a.object._sortBy!.value as number),
      );
  }
}

const processStreamControllerParam = (param: ControllerIndexParam) => {
  console.log("Processing stream controller param:", param);

  if (param.value.type === "string") {
    return extractStreamsFromString(param.value.value);
  } else {
    return extractStreamsFromString(param.value.pattern as Stream);
  }
};

const extractStreamsFromString = (streamString: string): Stream[] => {
  const streams: Stream[] = [];
  const parts = streamString.split("|").map((s) => s.trim());
  for (const part of parts) {
    if (part === "stdout" || part === "stderr") {
      streams.push(part as Stream);
    } else {
      console.warn(`Unknown stream type: ${part}`);
    }
  }
  return streams;
};

const processContainerControllerParam = (
  param: ControllerIndexParam,
): string => {
  if (param.value.type === "string") {
    return param.value.value;
  } else {
    return param.value.pattern;
  }
};
