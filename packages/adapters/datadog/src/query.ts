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
  event_id?: string;
  id?: string;
  message?: string;
  status?: string;
  timestamp?: string;
  host?: string;
  service?: string;
  source?: string;
  "datadog.index"?: string;
  columns: EventColumns;
  event?: Record<string, unknown>;
  custom?: Record<string, unknown>;
  tag?: Record<string, unknown>;
  tags?: string[];
};

export type DatadogPaging = {
  after?: string;
  values?: unknown[];
};

export type DatadogLogsResponse = {
  result?: {
    events?: DatadogEvent[];
    paging?: DatadogPaging;
  };
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

function escapeLuceneValue(val: string): string {
  // Escape backslash first, then double-quote
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildDatadogQuery(
  controllerParams: ControllerIndexParam[],
  searchTerm: Search,
  queryPrefix: string,
): string {
  const paramParts = controllerParams.map((param) => {
    const val =
      param.value.type === "regex" ? param.value.pattern : param.value.value;
    const escaped = escapeLuceneValue(val);
    if (param.operator === "=") return `${param.name}:"${escaped}"`;
    if (param.operator === "!=") return `NOT ${param.name}:"${escaped}"`;
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
  cursor?: DatadogPaging,
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
      // Cursor for subsequent pages: { after: string, values: unknown[] }
      ...(cursor?.after ? { paging: cursor } : {}),
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
    // Prefer top-level timestamp (ISO string); fall back to columns[1].
    const ts = entry.timestamp
      ? new Date(entry.timestamp).getTime()
      : (() => {
          const rawTimestamp = entry.columns[1];
          return typeof rawTimestamp === "number"
            ? rawTimestamp
            : typeof rawTimestamp === "string"
              ? new Date(rawTimestamp).getTime()
              : Date.now();
        })();

    // event_id is the real unique log ID; id is a cursor-like pagination token.
    const uniqueId = entry.event_id ?? entry.id ?? "";

    const eventData = entry.event ?? {};
    const message =
      entry.message ??
      (typeof eventData["message"] === "string"
        ? eventData["message"]
        : typeof eventData["msg"] === "string"
          ? eventData["msg"]
          : JSON.stringify(eventData));

    const objectFields: ObjectFields = {
      _time: { type: "date", value: ts },
      _sortBy: { type: "number", value: ts },
      _uniqueId: { type: "string", value: uniqueId },
      id: { type: "string", value: uniqueId },
      _raw: { type: "string", value: JSON.stringify(entry) },
    };

    // Map top-level fields directly.
    if (entry.status != null)
      objectFields.status = { type: "string", value: entry.status };
    if (entry.host != null)
      objectFields.host = { type: "string", value: entry.host };
    if (entry.service != null)
      objectFields.service = { type: "string", value: entry.service };
    if (entry.source != null)
      objectFields.source = { type: "string", value: entry.source };
    if (entry["datadog.index"] != null)
      objectFields._index = { type: "string", value: entry["datadog.index"] };
    if (entry.tags != null)
      objectFields.tags = { type: "string", value: entry.tags.join(", ") };

    // Flatten custom fields.
    for (const [key, value] of Object.entries(entry.custom ?? {})) {
      if (!(key in objectFields)) objectFields[key] = processField(value);
    }

    // Flatten event fields, skipping already-mapped ones.
    const skipEvent = new Set(["message", "msg"]);
    for (const [key, value] of Object.entries(eventData)) {
      if (!skipEvent.has(key) && !(key in objectFields))
        objectFields[key] = processField(value);
    }

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
            if (!(key in objectFields)) objectFields[key] = processField(value);
          }
        }
      } catch {
        // message wasn't JSON — keep as-is
      }
    }

    return { object: objectFields, message };
  });
}
