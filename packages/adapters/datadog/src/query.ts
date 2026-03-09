import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import {
  ProcessedData,
  ObjectFields,
  processField,
} from "@cruncher/adapter-utils/logTypes";
import {
  buildSearchTreeCallback,
  SearchTreeBuilder,
} from "@cruncher/qql/searchTree";

// ---------------------------------------------------------------------------
// API types
// Response shape for app.datadoghq.com/api/v1/logs-analytics/list?type=logs
// ---------------------------------------------------------------------------

// Columns returned per event, matching the order requested in buildRequestPayload:
//   [0] status_line  [1] timestamp  [2] host  [3] service  [4] content
type EventColumns = [unknown, unknown, unknown, unknown, unknown];

export type DatadogEvent = {
  id?: string;
  event_id?: string;
  columns: EventColumns;
  event?: Record<string, unknown>;
};

export type DatadogLogsResponse = {
  result?: {
    events?: DatadogEvent[];
    nextPageToken?: string;
  };
  hitCount?: number;
};

// ---------------------------------------------------------------------------
// Query building
// ---------------------------------------------------------------------------

function buildSearchPattern(search: Search): string {
  const luceneBuilder: SearchTreeBuilder<string> = {
    buildAnd: (leftCallback, searchAnd) => (item: string) => {
      const left = leftCallback(item);
      const right = buildSearchTreeCallback(
        searchAnd.right,
        luceneBuilder,
      )(item);
      return [left, right].filter(Boolean).join(" AND ");
    },
    buildOr: (leftCallback, searchOr) => (item: string) => {
      const left = leftCallback(item);
      const right = buildSearchTreeCallback(
        searchOr.right,
        luceneBuilder,
      )(item);
      return [left, right].filter(Boolean).join(" OR ");
    },
    buildLiteral: (searchLiteral) => () => {
      if (!searchLiteral.tokens.length) return "";
      return searchLiteral.tokens
        .map((token) => `"${String(token)}"`)
        .join(" AND ");
    },
  };
  return buildSearchTreeCallback(search, luceneBuilder)("");
}

export function buildDatadogQuery(
  controllerParams: ControllerIndexParam[],
  searchTerm: Search,
  queryPrefix: string,
): string {
  const paramParts = controllerParams.map((param) => {
    const val =
      param.value.type === "regex" ? param.value.pattern : param.value;
    if (param.operator === "=") return `${param.name}:"${val}"`;
    if (param.operator === "!=") return `NOT ${param.name}:"${val}"`;
    return "";
  });

  const searchText = buildSearchPattern(searchTerm);
  return [queryPrefix, ...paramParts, searchText].filter(Boolean).join(" AND ");
}

// ---------------------------------------------------------------------------
// Request payload
// ---------------------------------------------------------------------------

export function buildRequestPayload(
  query: string,
  indexes: string[],
  fromTime: Date,
  toTime: Date,
  pageLimit: number,
  csrfToken: string,
  cursor?: string,
) {
  return {
    list: {
      // Column order determines the indices in DatadogEvent.columns.
      columns: [
        { field: { path: "status_line" } },
        { field: { path: "timestamp" } },
        { field: { path: "host" } },
        { field: { path: "service" } },
        { field: { path: "content" } },
      ],
      sorts: [{ time: { order: "desc" } }],
      limit: pageLimit,
      time: {
        from: fromTime.getTime(),
        to: toTime.getTime(),
      },
      search: { query },
      includeEvents: true,
      computeCount: false,
      indexes: indexes.length > 0 ? indexes : ["*"],
      executionInfo: {},
      ...(cursor ? { startAt: cursor } : {}),
    },
    querySourceId: "logs_explorer",
    userQueryId: crypto.randomUUID(),
    _authentication_token: csrfToken,
  };
}

// ---------------------------------------------------------------------------
// Response processing
// ---------------------------------------------------------------------------

export function processDatadogResponse(
  data: DatadogLogsResponse,
): ProcessedData[] {
  const events = data.result?.events ?? [];

  return events.map((entry) => {
    // Destructure columns in the order they were requested.
    const [statusLine, rawTimestamp, host, service] = entry.columns;

    const ts =
      typeof rawTimestamp === "number"
        ? rawTimestamp
        : typeof rawTimestamp === "string"
          ? new Date(rawTimestamp).getTime()
          : Date.now();

    const uniqueId = entry.id ?? entry.event_id ?? "";
    const eventData = entry.event ?? {};

    const message =
      typeof eventData["message"] === "string"
        ? eventData["message"]
        : typeof eventData["msg"] === "string"
          ? eventData["msg"]
          : JSON.stringify(eventData);

    const objectFields: ObjectFields = {
      _time: { type: "date", value: ts },
      _sortBy: { type: "number", value: ts },
      _uniqueId: { type: "string", value: uniqueId },
      id: { type: "string", value: uniqueId },
      _raw: { type: "string", value: JSON.stringify(entry) },
    };

    if (statusLine != null)
      objectFields.status = { type: "string", value: String(statusLine) };
    if (host != null)
      objectFields.host = { type: "string", value: String(host) };
    if (service != null)
      objectFields.service = { type: "string", value: String(service) };

    // If the message is a JSON object, flatten its fields into objectFields.
    if (typeof message === "string") {
      try {
        const parsed = JSON.parse(message);
        if (
          parsed !== null &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          for (const [key, value] of Object.entries(
            parsed as Record<string, unknown>,
          )) {
            if (!(key in objectFields)) {
              objectFields[key] = processField(value);
            }
          }
        }
      } catch {
        // message wasn't JSON — keep as-is
      }
    }

    // Flatten all remaining event fields, skipping already-mapped ones.
    const skip = new Set(["message", "msg"]);
    for (const [key, value] of Object.entries(eventData)) {
      if (!skip.has(key) && !(key in objectFields)) {
        objectFields[key] = processField(value);
      }
    }

    return { object: objectFields, message };
  });
}
