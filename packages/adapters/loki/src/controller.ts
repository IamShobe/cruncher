import { QueryOptions, QueryProvider } from "@cruncher/adapter-utils";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import type { LokiParams } from ".";
import { buildExpression, LIMIT } from "./query";
import {
  ProcessedData,
  ObjectFields,
  processField,
  asNumberField,
} from "@cruncher/adapter-utils/logTypes";
import { LokiLabelFilter } from "./query";

const getAllObjects = (
  streams: Array<{
    stream: Record<string, string>;
    values: [string, string][];
  }>,
): ProcessedData[] => {
  // streams: [{ stream: {label...}, values: [[timestamp, line], ...] }]
  const results: ProcessedData[] = [];
  for (const stream of streams) {
    for (const [timestamp, message] of stream.values) {
      const objectFields: ObjectFields = {
        _time: {
          type: "date",
          value: Number(timestamp) / 1_000_000, // epoch ms
        },
        _sortBy: {
          type: "number",
          value: Number(timestamp),
        },
        _raw: {
          type: "string",
          value: message,
        },
      };
      // Add all stream labels as fields
      if (stream.stream) {
        Object.entries(stream.stream).forEach(([key, value]) => {
          objectFields[key] = processField(value);
        });
      }
      results.push({ object: objectFields, message });
    }
  }
  // Sort by _sortBy descending (newest first)
  return results.sort(
    (a, b) =>
      asNumberField(b.object._sortBy).value -
      asNumberField(a.object._sortBy).value,
  );
};

export class LokiController implements QueryProvider {
  private url: string;
  private filter: LokiLabelFilter[];
  private querySuffix: string[];

  constructor(params: LokiParams) {
    this.url = params.url;
    this.filter = params.filter;
    this.querySuffix = params.querySuffix;
  }

  private async _doQuery(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ) {
    // Build LogQL query string
    const logql = buildExpression(
      this.filter,
      controllerParams,
      searchTerm,
      this.querySuffix,
    );
    // Convert times to nanoseconds
    const start = options.fromTime.getTime() * 1_000_000;
    const end = options.toTime.getTime() * 1_000_000;
    const params = new URLSearchParams({
      query: logql,
      start: String(start),
      end: String(end),
      limit: String(LIMIT),
      direction: "backward",
    });
    const url = `${this.url}/loki/api/v1/query_range?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      signal: options.cancelToken,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to execute query: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    if (data.status !== "success" || !data.data || !data.data.result) {
      throw new Error("Failed to execute query");
    }
    // Parse streams result
    return getAllObjects(data.data.result);
  }

  private async _getLabels() {
    const url = `${this.url}/loki/api/v1/labels`;
    const response = await fetch(url);
    const resp = (await response.json()) as { data?: string[] };
    return resp.data ?? [];
  }

  private async _getLabelValues(label: string) {
    const url = `${this.url}/loki/api/v1/label/${label}/values`;
    const response = await fetch(url);
    const resp = (await response.json()) as { data?: string[] };
    return resp.data ?? [];
  }

  private async _getControllerParams() {
    const labels = await this._getLabels();
    const resp: Record<string, string[]> = {};
    const promises = labels.map((label) => {
      return this._getLabelValues(label).then((values) => {
        resp[label] = values;
      });
    });
    await Promise.all(promises);
    return resp;
  }

  private async _runAllBatches(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ) {
    let currentLimit = options.limit;
    while (true) {
      const objects = await this._doQuery(
        controllerParams,
        searchTerm,
        options,
      );
      options.onBatchDone(objects);
      currentLimit -= objects.length;
      if (currentLimit <= 0) {
        break;
      }
      const fromTime = options.fromTime.getTime();
      const earliestTimestamp =
        objects.length > 0
          ? asNumberField(objects[objects.length - 1].object._time).value
          : 0;
      if (
        earliestTimestamp === 0 ||
        !(earliestTimestamp > fromTime && objects.length === LIMIT)
      ) {
        break;
      }
      options.toTime = new Date(earliestTimestamp - 1);
    }
  }

  query(
    contollerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ): Promise<void> {
    return this._runAllBatches(contollerParams, searchTerm, options);
  }

  getControllerParams(): Promise<Record<string, string[]>> {
    return this._getControllerParams();
  }
}
