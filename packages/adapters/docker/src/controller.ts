import { QueryOptions, QueryProvider } from "@cruncher/adapter-utils";
import { strip } from "ansicolor";
import Dockerode from "dockerode";
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
  compiledPatterns: CompiledPattern[],
): { parsed: Record<string, unknown>; selectedMessageFieldName: string } => {
  const parsed: Record<string, unknown> = {};
  const jsonParsed = parseJsonMessage(message);
  if (jsonParsed) {
    Object.assign(parsed, jsonParsed);
  }

  let selectedMessageFieldName = "_raw";
  for (const { config: logPattern, pattern } of compiledPatterns) {
    if (
      (logPattern.applyToAll || logPattern.applyTo.includes(containerName)) &&
      !logPattern.exclude.includes(containerName)
    ) {
      const match = pattern.exec(message);
      if (match) {
        Object.assign(parsed, match.groups);
        selectedMessageFieldName = logPattern.messageFieldName ?? "_raw";
      }
    }
  }

  return { parsed, selectedMessageFieldName };
};

interface CompiledPattern {
  config: DockerLogPatterns[number];
  pattern: RegExp;
}

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

export class DockerController implements QueryProvider {
  private docker: Dockerode;
  private compiledPatterns: CompiledPattern[];

  constructor(private params: DockerParams) {
    this.docker = params.dockerHost.startsWith("unix://")
      ? new Dockerode({ socketPath: params.dockerHost.replace("unix://", "") })
      : new Dockerode({ host: params.dockerHost });
    this.compiledPatterns = params.logPatterns.map((p) => ({
      config: p,
      pattern: new RegExp(p.pattern),
    }));
  }

  private async getContainers(): Promise<DockerContainer[]> {
    const containers = await this.docker.listContainers({ all: true });
    return containers.map((c) => ({
      id: c.Id,
      name: c.Names[0]?.replace(/^\//, "") ?? c.Id,
      image: c.Image,
      status: c.Status,
      created: new Date(c.Created * 1000).toISOString(),
    }));
  }

  private async getContainerLogs(
    controllerParams: ControllerIndexParam[],
    container: DockerContainer,
    fromTime: Date,
    toTime: Date,
    doesLogMatch: BooleanSearchCallback,
    cancelToken: AbortSignal,
  ): Promise<DockerLogEntry[]> {
    if (cancelToken.aborted) {
      throw new Error("Query cancelled");
    }

    const selectedStreams = controllerParams
      .filter((param) => param.name === "stream")
      .map(processStreamControllerParam);

    let isStdoutSelected = selectedStreams.some((stream) =>
      stream.includes("stdout"),
    );
    let isStderrSelected = selectedStreams.some((stream) =>
      stream.includes("stderr"),
    );

    if (!isStdoutSelected && !isStderrSelected) {
      isStdoutSelected = true;
      isStderrSelected = true;
    }

    const buf = (await this.docker.getContainer(container.id).logs({
      stdout: isStdoutSelected,
      stderr: isStderrSelected,
      timestamps: true,
      since: Math.floor(fromTime.getTime() / 1000),
      until: Math.floor(toTime.getTime() / 1000),
      follow: false,
    })) as unknown as Buffer;

    if (cancelToken.aborted) {
      throw new Error("Query cancelled");
    }

    const logs: DockerLogEntry[] = [];

    const processLogLine = (line: string, stream: Stream) => {
      const indexOfSpace = line.indexOf(" ");
      if (indexOfSpace === -1) return;
      const originalMessage = line.slice(indexOfSpace + 1);
      const timestampStr = line.slice(0, indexOfSpace);
      const strippedOriginalMessage = strip(originalMessage).trim();
      if (!strippedOriginalMessage) return;

      const timestampMatch = timestampStr.match(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/,
      );
      if (!timestampMatch) return;

      const timestamp = new Date(timestampStr);
      if (!doesLogMatch(strippedOriginalMessage)) return;

      const { parsed, selectedMessageFieldName } = intelligentParse(
        strippedOriginalMessage,
        container.name,
        this.compiledPatterns,
      );

      logs.push({
        timestamp,
        message: originalMessage,
        container: container.name,
        containerId: container.id,
        containerImage: container.image,
        containerStatus: container.status,
        parsedFields: parsed,
        selectedMessageFieldName:
          this.params.containerOverride?.[container.name]?.messageFieldName ??
          selectedMessageFieldName,
        ansiFreeLine: strippedOriginalMessage,
        stream,
      });
    };

    // Parse Docker multiplex frame format:
    // [1 byte stream type] [3 bytes padding] [4 bytes big-endian length] [payload]
    let offset = 0;
    let stdoutRemainder = "";
    let stderrRemainder = "";

    while (offset + 8 <= buf.length) {
      const streamType = buf[offset];
      const frameSize = buf.readUInt32BE(offset + 4);
      offset += 8;
      if (offset + frameSize > buf.length) break;

      const chunk = buf.subarray(offset, offset + frameSize).toString("utf8");
      offset += frameSize;

      const isStdout = streamType === 1;
      if (
        (!isStdout && streamType !== 2) ||
        (isStdout && !isStdoutSelected) ||
        (!isStdout && !isStderrSelected)
      ) {
        continue;
      }

      const stream: Stream = isStdout ? "stdout" : "stderr";
      const prev = isStdout ? stdoutRemainder : stderrRemainder;
      const data = prev + chunk;
      const lines = data.split("\n");
      const remainder = lines.pop() ?? "";
      if (isStdout) stdoutRemainder = remainder;
      else stderrRemainder = remainder;

      for (const line of lines) {
        const trimmed = line.replace(/\r$/, "");
        if (trimmed) processLogLine(trimmed, stream);
      }
    }

    // Flush remaining data
    if (stdoutRemainder) processLogLine(stdoutRemainder, "stdout");
    if (stderrRemainder) processLogLine(stderrRemainder, "stderr");

    return logs;
  }

  async query(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ): Promise<void> {
    try {
      const doesLogMatch = buildDoesLogMatchCallback(searchTerm);
      const containers = await this.getContainers();

      const filteredContainers = this.params.containerFilter
        ? containers.filter(
            (container) =>
              container.name.includes(this.params.containerFilter ?? "") ||
              container.id.includes(this.params.containerFilter ?? ""),
          )
        : containers;

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

      const accumulated: (ProcessedData[] | null)[] = new Array(
        finalContainers.length,
      ).fill(null);

      await Promise.all(
        finalContainers.map((container, i) =>
          this.processContainerLogs(
            controllerParams,
            container,
            options.fromTime,
            options.toTime,
            doesLogMatch,
            options.cancelToken,
          ).then((logs) => {
            accumulated[i] = logs;
            const partial = merge<ProcessedData>(
              accumulated.filter((a): a is ProcessedData[] => a !== null),
              compareProcessedData,
            ).slice(0, options.limit);
            options.onBatchDone(partial);
          }),
        ),
      );
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
