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
import { K8sLogPatterns, K8sParams } from ".";

const env = Object.assign({}, process.env, {
  PATH: "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
});

const parseJsonMessage = (message: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(message);
  } catch {
    return null;
  }
};

const intelligentParse = (
  message: string,
  podName: string,
  logPatterns: K8sLogPatterns = [],
): { parsed: Record<string, unknown>; selectedMessageFieldName: string } => {
  const parsed: Record<string, unknown> = {};
  const jsonParsed = parseJsonMessage(message);
  if (jsonParsed) {
    Object.assign(parsed, jsonParsed);
  }

  let selectedMessageFieldName = "_raw";
  logPatterns.forEach((logPattern) => {
    if (
      (logPattern.applyToAll || logPattern.applyTo.includes(podName)) &&
      !logPattern.exclude.includes(podName)
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

interface K8sPod {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  containers: string[];
  phase: string;
}

interface K8sLogEntry {
  timestamp: Date;
  message: string;
  ansiFreeLine: string;
  pod: string;
  namespace: string;
  container: string;
  phase: string;
  parsedFields: Record<string, unknown>;
  selectedMessageFieldName: string;
}

export class K8sController implements QueryProvider {
  constructor(private params: K8sParams) {}

  private buildBaseArgs(): string[] {
    const args: string[] = [];
    if (this.params.context) {
      args.push("--context", this.params.context);
    }
    return args;
  }

  private getNamespace(): string {
    return this.params.namespace ?? "default";
  }

  private async getPods(namespace?: string): Promise<K8sPod[]> {
    return new Promise((resolve, reject) => {
      const ns = namespace ?? this.getNamespace();
      const args = [
        ...this.buildBaseArgs(),
        "get",
        "pods",
        "-n",
        ns,
        "-o",
        "json",
      ];

      const kubectlProcess = spawn(this.params.binaryLocation, args, { env });
      let output = "";
      let errorOutput = "";

      kubectlProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      kubectlProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      kubectlProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`kubectl get pods failed: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          const pods: K8sPod[] = (result.items ?? []).map((item: Record<string, unknown>) => {
            const metadata = item.metadata as Record<string, unknown>;
            const spec = item.spec as Record<string, unknown>;
            const status = item.status as Record<string, unknown>;
            const containers = ((spec?.containers as Array<Record<string, unknown>>) ?? []).map(
              (c) => c.name as string,
            );
            return {
              name: metadata?.name as string,
              namespace: metadata?.namespace as string,
              labels: (metadata?.labels as Record<string, string>) ?? {},
              containers,
              phase: (status?.phase as string) ?? "Unknown",
            };
          });
          resolve(pods);
        } catch (error) {
          reject(new Error(`Failed to parse kubectl output: ${error}`));
        }
      });

      kubectlProcess.on("error", (error) => {
        reject(new Error(`Failed to execute kubectl command: ${error.message}`));
      });
    });
  }

  private async getPodLogs(
    pod: K8sPod,
    container: string,
    fromTime: Date,
    toTime: Date,
    doesLogMatch: BooleanSearchCallback,
    cancelToken: AbortSignal,
  ): Promise<K8sLogEntry[]> {
    return new Promise((resolve, reject) => {
      if (cancelToken.aborted) {
        reject(new Error("Query cancelled"));
        return;
      }

      const args = [
        ...this.buildBaseArgs(),
        "logs",
        pod.name,
        "-c",
        container,
        "-n",
        pod.namespace,
        "--timestamps",
        `--since-time=${fromTime.toISOString()}`,
      ];

      const kubectlProcess = spawn(this.params.binaryLocation, args, { env });
      const logs: K8sLogEntry[] = [];

      const processLogLine = (line: string) => {
        const indexOfSpace = line.indexOf(" ");
        if (indexOfSpace === -1) return;

        const timestampStr = line.slice(0, indexOfSpace).trim();
        const originalMessage = line.slice(indexOfSpace + 1);
        const strippedOriginalMessage = strip(originalMessage).trim();

        if (!strippedOriginalMessage) return;

        try {
          const timestamp = new Date(timestampStr);
          if (isNaN(timestamp.getTime())) return;

          // kubectl has no --until-time, so filter manually
          if (timestamp > toTime) return;

          if (doesLogMatch(strippedOriginalMessage)) {
            const { parsed, selectedMessageFieldName } = intelligentParse(
              strippedOriginalMessage,
              pod.name,
              this.params.logPatterns,
            );

            const finalMessageFieldName =
              this.params.podOverride?.[pod.name]?.messageFieldName ??
              selectedMessageFieldName;

            logs.push({
              timestamp,
              message: originalMessage,
              ansiFreeLine: strippedOriginalMessage,
              pod: pod.name,
              namespace: pod.namespace,
              container,
              phase: pod.phase,
              parsedFields: parsed,
              selectedMessageFieldName: finalMessageFieldName,
            });
          }
        } catch {
          console.warn("Failed to parse log line:", line);
        }
      };

      let buffer = "";
      kubectlProcess.stdout.setEncoding("utf8");
      kubectlProcess.stdout.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split(/(\r?\n)/g);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          processLogLine(line);
        }
      });

      kubectlProcess.stderr.setEncoding("utf8");
      kubectlProcess.stderr.on("data", (data) => {
        console.warn(`kubectl logs stderr for ${pod.name}/${container}:`, data);
      });

      kubectlProcess.on("close", (code) => {
        if (buffer) processLogLine(buffer);

        if (code !== 0 && code !== null) {
          reject(
            new Error(
              `kubectl logs command failed with code ${code} for pod ${pod.name}/${container}`,
            ),
          );
        } else {
          resolve(logs);
        }
      });

      kubectlProcess.on("error", (error) => {
        reject(
          new Error(`Failed to execute kubectl logs command: ${error.message}`),
        );
      });

      const abortHandler = () => {
        kubectlProcess.kill("SIGTERM");
        reject(new Error("Query cancelled"));
      };

      cancelToken.addEventListener("abort", abortHandler);
      kubectlProcess.on("close", () => {
        cancelToken.removeEventListener("abort", abortHandler);
      });
    });
  }

  async getControllerParams(): Promise<Record<string, string[]>> {
    try {
      const pods = await this.getPods();
      const filteredPods = this.applyPodFilter(pods);

      const podNames = filteredPods.map((p) => p.name);
      const namespaces = [...new Set(filteredPods.map((p) => p.namespace))];
      const containers = [
        ...new Set(filteredPods.flatMap((p) => p.containers)),
      ];
      const phases = [...new Set(filteredPods.map((p) => p.phase))];

      return {
        pod: podNames,
        namespace: namespaces,
        container: containers,
        phase: phases,
      };
    } catch (error) {
      console.error("Failed to get Kubernetes pods:", error);
      return {
        pod: [],
        namespace: [],
        container: [],
        phase: [],
      };
    }
  }

  async query(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ): Promise<void> {
    try {
      const doesLogMatch = buildDoesLogMatchCallback(searchTerm);
      const pods = await this.getPods();
      const filteredPods = this.applyPodFilter(pods);

      const selectedPods = extractControllerParamValues(
        controllerParams,
        "pod",
      );
      const selectedContainers = extractControllerParamValues(
        controllerParams,
        "container",
      );
      const selectedNamespaces = extractControllerParamValues(
        controllerParams,
        "namespace",
      );

      const finalPods = filteredPods.filter((pod) => {
        if (
          selectedNamespaces.length > 0 &&
          !selectedNamespaces.includes(pod.namespace)
        ) {
          return false;
        }
        if (
          selectedPods.length > 0 &&
          !selectedPods.some((s) => pod.name.includes(s))
        ) {
          return false;
        }
        return true;
      });

      if (finalPods.length === 0) {
        options.onBatchDone([]);
        return;
      }

      // Build pod+container pairs to fetch
      const tasks: Array<{ pod: K8sPod; container: string }> = [];
      for (const pod of finalPods) {
        const containersToFetch =
          selectedContainers.length > 0
            ? pod.containers.filter((c) => selectedContainers.includes(c))
            : pod.containers;
        for (const container of containersToFetch) {
          tasks.push({ pod, container });
        }
      }

      const allLogs = await Promise.all(
        tasks.map(({ pod, container }) =>
          this.processPodLogs(
            pod,
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

  private applyPodFilter(pods: K8sPod[]): K8sPod[] {
    if (!this.params.podFilter) return pods;
    return pods.filter((pod) => pod.name.includes(this.params.podFilter!));
  }

  private async processPodLogs(
    pod: K8sPod,
    container: string,
    fromTime: Date,
    toTime: Date,
    doesLogMatch: BooleanSearchCallback,
    cancelToken: AbortSignal,
  ): Promise<ProcessedData[]> {
    const logs = await this.getPodLogs(
      pod,
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
          pod: processField(log.pod),
          podNamespace: processField(log.namespace),
          container: processField(log.container),
          phase: processField(log.phase),
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

const extractControllerParamValues = (
  controllerParams: ControllerIndexParam[],
  name: string,
): string[] => {
  return controllerParams
    .filter((param) => param.name === name)
    .map((param) => {
      if (param.value.type === "string") {
        return param.value.value;
      } else {
        return param.value.pattern;
      }
    });
};
