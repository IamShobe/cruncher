import { QueryOptions, QueryProvider } from "~lib/adapters";
import {
  asStringField,
  compareProcessedData,
  Field,
  ObjectFields,
  ProcessedData,
} from "~lib/adapters/logTypes";
import merge from "merge-k-sorted-arrays";
import {
  ControllerIndexParam,
  Search,
  SearchAND,
  SearchLiteral,
  SearchOR,
} from "~lib/qql/grammar";
import { spawn } from "child_process";
import { strip } from "ansicolor";
import { DockerLogPatterns, DockerParams } from "..";

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
  logPatterns: DockerLogPatterns = []
): { parsed: Record<string, unknown>; selectedMessageFieldName: string } => {
  const parsed: Record<string, unknown> = {};
  const jsonParsed = parseJsonMessage(message);
  if (jsonParsed) {
    Object.assign(parsed, jsonParsed);
  }

  let selectedMessageFieldName = "message";
  logPatterns.forEach((logPattern) => {
    if (
      (logPattern.applyToAll || logPattern.applyTo.includes(containerName)) &&
      !logPattern.exclude.includes(containerName)
    ) {
      const match = new RegExp(logPattern.pattern).exec(message);
      if (match) {
        Object.assign(parsed, match.groups);
        selectedMessageFieldName = logPattern.messageFieldName ?? "message";
      } else {
        console.warn(`Log pattern '${logPattern.name}' failed:`, match);
      }
    }
  });

  return { parsed, selectedMessageFieldName };
};

const processField = (field: unknown): Field => {
  if (field === null || field === undefined) {
    return null;
  }

  if (typeof field === "number") {
    return {
      type: "number",
      value: field,
    };
  } else if (field instanceof Date) {
    return {
      type: "date",
      value: field.getTime(),
    };
  } else if (typeof field === "boolean") {
    return {
      type: "boolean",
      value: field,
    };
  } else if (Array.isArray(field)) {
    return {
      type: "array",
      value: field.map((item) => processField(item)),
    };
  } else if (typeof field === "object") {
    const objectFields: ObjectFields = {};

    Object.entries(field ?? {}).forEach(([key, value]) => {
      objectFields[key] = processField(value);
    });

    return {
      type: "object",
      value: objectFields,
    };
  } else if (typeof field === "string") {
    // try to parse as number
    if (/^\d+(?:\.\d+)?$/.test(field)) {
      return {
        type: "number",
        value: parseFloat(field),
      };
    }

    return {
      type: "string",
      value: field,
    };
  }

  throw new Error(`Unsupported field type: ${typeof field}`);
};

type SearchCallback = (item: string) => boolean;

const buildSearchAndCallback = (
  leftCallback: SearchCallback,
  search: SearchAND
) => {
  return (item: string) => {
    const leftRes = leftCallback(item);
    if (!leftRes) {
      return false;
    }

    const rightRes = buildSearchCallback(search.right)(item);
    return rightRes;
  };
};

const buildSearchOrCallback = (
  leftCallback: SearchCallback,
  search: SearchOR
) => {
  return (item: string) => {
    const leftRes = leftCallback(item);
    if (leftRes) {
      return true;
    }

    const rightRes = buildSearchCallback(search.right)(item);
    return rightRes;
  };
};

const buildSearchLiteralCallback = (searchLiteral: SearchLiteral) => {
  if (searchLiteral.tokens.length === 0) {
    return () => true;
  }

  return (searchTerm: string) =>
    searchLiteral.tokens.every((token) => {
      return searchTerm.toLowerCase().includes(String(token).toLowerCase());
    });
};

const buildSearchCallback = (searchTerm: Search): SearchCallback => {
  const left = searchTerm.left;
  const right = searchTerm.right;

  let leftCallback: SearchCallback;
  switch (left.type) {
    case "search":
      leftCallback = buildSearchCallback(left);
      break;
    case "searchLiteral":
      leftCallback = buildSearchLiteralCallback(left);
      break;
  }

  if (!right) {
    return leftCallback;
  }

  let rightCallback: SearchCallback;
  switch (right.type) {
    case "and":
      rightCallback = buildSearchAndCallback(leftCallback, right);
      break;
    case "or":
      rightCallback = buildSearchOrCallback(leftCallback, right);
      break;
  }

  return rightCallback;
};

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  created: string;
}

interface DockerLogEntry {
  timestamp: Date;
  message: string;
  container: string;
  containerId: string;
  containerImage: string;
  containerStatus: string;
  parsedFields: Record<string, unknown>;
  selectedMessageFieldName: string;
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
            } catch (_e) {
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
    container: DockerContainer,
    fromTime: Date,
    toTime: Date,
    searchCallback: SearchCallback,
    cancelToken: AbortSignal
  ): Promise<DockerLogEntry[]> {
    return new Promise((resolve, reject) => {
      if (cancelToken.aborted) {
        reject(new Error("Query cancelled"));
        return;
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

      const processLogLine = (line: string) => {
        const strippedLine = strip(line);
        if (!strippedLine.trim()) {
          return;
        }

        const indexOfSpace = line.indexOf(" ");
        const originalMessage = line.slice(indexOfSpace + 1);

        try {
          // Docker log format: TIMESTAMP MESSAGE
          const timestampMatch = strippedLine.match(
            /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.*)$/
          );
          if (timestampMatch) {
            const [_row, timestampStr, message] = timestampMatch;
            const timestamp = new Date(timestampStr);

            // Apply search filter
            if (searchCallback(message)) {
              const { parsed, selectedMessageFieldName } = intelligentParse(
                message,
                container.name,
                this.params.logPatterns
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
              });
            }
          }
        } catch (_e) {
          // Skip malformed log lines
          console.warn("Failed to parse log line:", strippedLine);
        }
      };

      dockerProcess.stdout.setEncoding("utf8");
      dockerProcess.stdout.on("data", (data) => {
        const str = data.toString();
        // process stdout line by line
        const lines = str.split(/(\r?\n)/g);
        for (let i = 0; i < lines.length; i++) {
          processLogLine(lines[i]);
        }
      });

      dockerProcess.stderr.on("data", (data) => {
        // Docker logs command outputs logs to stdout, stderr here would be actual errors
        console.error("Docker logs error:", data.toString());
      });

      dockerProcess.on("close", (code) => {
        if (code !== 0 && code !== null) {
          reject(new Error(`Docker logs command failed with code ${code}`));
        } else {
          resolve(logs);
        }
      });

      dockerProcess.on("error", (error) => {
        reject(
          new Error(`Failed to execute Docker logs command: ${error.message}`)
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
    options: QueryOptions
  ): Promise<void> {
    try {
      const searchCallback = buildSearchCallback(searchTerm);
      const containers = await this.getContainers();

      // Filter containers based on containerFilter if provided
      const filteredContainers = this.params.containerFilter
        ? containers.filter(
            (container) =>
              container.name.includes(this.params.containerFilter ?? "") ||
              container.id.includes(this.params.containerFilter ?? "")
          )
        : containers;

      // Apply controller params filtering if any
      const finalContainers =
        controllerParams.length > 0
          ? filteredContainers.filter((container) => {
              return controllerParams.some((param) => {
                if (param.name === "container") {
                  return (
                    container.name.includes(param.value.toString()) ||
                    container.id.includes(param.value.toString())
                  );
                }
                return false;
              });
            })
          : filteredContainers;

      if (finalContainers.length === 0) {
        options.onBatchDone([]);
        return;
      }

      const allLogs = await Promise.all(
        finalContainers.map((container) =>
          this.processContainerLogs(
            container,
            options.fromTime,
            options.toTime,
            searchCallback,
            options.cancelToken
          )
        )
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
      };
    } catch (error) {
      console.error("Failed to get Docker containers:", error);

      return {
        container: [],
        container_id: [],
        image: [],
        status: [],
      };
    }
  }

  async processContainerLogs(
    container: DockerContainer,
    fromTime: Date,
    toTime: Date,
    searchCallback: SearchCallback,
    cancelToken: AbortSignal
  ): Promise<ProcessedData[]> {
    const logs = await this.getContainerLogs(
      container,
      fromTime,
      toTime,
      searchCallback,
      cancelToken
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
          container: processField(log.container),
          containerId: processField(log.containerId),
          image: processField(log.containerImage),
          status: processField(log.containerStatus),
          message: processField(log.message),
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
          (a.object._sortBy!.value as number)
      );
  }
}
