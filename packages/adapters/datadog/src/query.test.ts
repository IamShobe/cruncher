import { describe, expect, test } from "vitest";
import { z } from "zod/v4";
import {
  buildDatadogQuery,
  buildRequestPayload,
  processDatadogResponse,
  DatadogLogsResponse,
} from "./query";
import {
  ControllerIndexParam,
  Search,
  SearchLiteral,
} from "@cruncher/qql/grammar";

// Schema to safely extract a typed field value from ObjectFields
const FieldSchema = z.object({ value: z.unknown() });
function fieldValue(fields: Record<string, unknown>, key: string): unknown {
  return FieldSchema.parse(fields[key]).value;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A Search node whose left is an empty SearchLiteral and has no right. */
const emptySearch: Search = {
  type: "search",
  left: { type: "searchLiteral", tokens: [] } satisfies SearchLiteral,
  right: undefined,
};

function makeParam(
  name: string,
  value: string,
  operator: "=" | "!=",
): ControllerIndexParam {
  return {
    name,
    operator,
    value: { type: "string", value },
  } as unknown as ControllerIndexParam;
}

// ---------------------------------------------------------------------------
// buildDatadogQuery
// ---------------------------------------------------------------------------

describe("buildDatadogQuery", () => {
  test("empty params + empty search returns prefix only", () => {
    const result = buildDatadogQuery([], emptySearch, "env:prod");
    expect(result).toBe("env:prod");
  });

  test("empty params + empty search + no prefix returns empty string", () => {
    const result = buildDatadogQuery([], emptySearch, "");
    expect(result).toBe("");
  });

  test('= operator produces field:"value" syntax', () => {
    const result = buildDatadogQuery(
      [makeParam("service", "payments", "=")],
      emptySearch,
      "",
    );
    expect(result).toBe('service:"payments"');
  });

  test('!= operator produces NOT field:"value" syntax', () => {
    const result = buildDatadogQuery(
      [makeParam("service", "internal", "!=")],
      emptySearch,
      "",
    );
    expect(result).toBe('NOT service:"internal"');
  });

  test("index params are excluded (caller filters them out before calling)", () => {
    // The adapter filters index params before calling buildDatadogQuery; this
    // test confirms non-index params survive correctly alongside other params.
    const params = [
      makeParam("service", "api", "="),
      makeParam("env", "staging", "="),
    ];
    const result = buildDatadogQuery(params, emptySearch, "");
    expect(result).toBe('service:"api" AND env:"staging"');
  });

  test("multiple params are joined with AND", () => {
    const params = [
      makeParam("host", "web-01", "="),
      makeParam("status", "error", "!="),
    ];
    const result = buildDatadogQuery(params, emptySearch, "prefix:x");
    expect(result).toBe('prefix:x AND host:"web-01" AND NOT status:"error"');
  });

  test("double-quote in value is escaped", () => {
    const result = buildDatadogQuery(
      [makeParam("service", 'my"val', "=")],
      emptySearch,
      "",
    );
    expect(result).toBe('service:"my\\"val"');
  });

  test("backslash in value is escaped", () => {
    const result = buildDatadogQuery(
      [makeParam("path", "C:\\Users", "=")],
      emptySearch,
      "",
    );
    expect(result).toBe('path:"C:\\\\Users"');
  });

  test("backslash-then-double-quote are escaped in the correct order", () => {
    // Input value is two chars: \ then "
    // escapeLuceneValue must escape \ first (\ -> \\), then " (\" -> \\\")
    // so the two-char input becomes four chars: \  \  \  "
    const backslashThenQuote = "\\" + '"';
    const result = buildDatadogQuery(
      [makeParam("msg", backslashThenQuote, "!=")],
      emptySearch,
      "",
    );
    expect(result).toBe('NOT msg:"' + "\\\\" + '\\"' + '"');
  });
});

// ---------------------------------------------------------------------------
// buildRequestPayload
// ---------------------------------------------------------------------------

const PayloadSchema = z.object({
  list: z.object({
    columns: z.array(z.object({ field: z.object({ path: z.string() }) })),
    indexes: z.array(z.string()),
    limit: z.number(),
    time: z.object({ from: z.number(), to: z.number() }),
    search: z.object({ query: z.string() }),
    paging: z.object({ after: z.string() }).optional(),
  }),
  _authentication_token: z.string(),
});

describe("buildRequestPayload", () => {
  const from = new Date("2024-01-01T00:00:00Z");
  const to = new Date("2024-01-01T01:00:00Z");

  test("columns array has exactly 5 entries in the right order", () => {
    const payload = buildRequestPayload("*", ["main"], from, to, 100, "tok");
    const parsed = PayloadSchema.parse(payload);
    const paths = parsed.list.columns.map((c) => c.field.path);
    expect(paths).toEqual([
      "status_line",
      "timestamp",
      "host",
      "service",
      "content",
    ]);
  });

  test('indexes:[] falls back to ["*"]', () => {
    const payload = buildRequestPayload("*", [], from, to, 100, "tok");
    const parsed = PayloadSchema.parse(payload);
    expect(parsed.list.indexes).toEqual(["*"]);
  });

  test("non-empty indexes are passed through", () => {
    const payload = buildRequestPayload(
      "*",
      ["main", "secondary"],
      from,
      to,
      100,
      "tok",
    );
    const parsed = PayloadSchema.parse(payload);
    expect(parsed.list.indexes).toEqual(["main", "secondary"]);
  });

  test("pagination cursor is included when provided", () => {
    const payload = buildRequestPayload("*", ["*"], from, to, 100, "tok", {
      after: "cursor123",
      values: [],
    });
    const parsed = PayloadSchema.parse(payload);
    expect(parsed.list.paging?.after).toBe("cursor123");
  });

  test("pagination cursor is omitted when not provided", () => {
    const payload = buildRequestPayload("*", ["*"], from, to, 100, "tok");
    const parsed = PayloadSchema.parse(payload);
    expect(parsed.list.paging).toBeUndefined();
  });

  test("_authentication_token is set from csrfToken argument", () => {
    const payload = buildRequestPayload(
      "*",
      ["*"],
      from,
      to,
      100,
      "my-csrf-token",
    );
    const parsed = PayloadSchema.parse(payload);
    expect(parsed._authentication_token).toBe("my-csrf-token");
  });
});

// ---------------------------------------------------------------------------
// processDatadogResponse
// ---------------------------------------------------------------------------

describe("processDatadogResponse", () => {
  test("empty events returns []", () => {
    const result = processDatadogResponse({ result: { events: [] } });
    expect(result).toEqual([]);
  });

  test("no result returns []", () => {
    const result = processDatadogResponse({});
    expect(result).toEqual([]);
  });

  test("timestamp from top-level ISO string is converted to ms", () => {
    const iso = "2024-06-15T12:00:00.000Z";
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            timestamp: iso,
            columns: [null, null, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(fieldValue(entry.object, "_time")).toBe(new Date(iso).getTime());
  });

  test("timestamp falls back to columns[1] number when top-level is absent", () => {
    const tsMs = 1718445600000;
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            columns: [null, tsMs, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(fieldValue(entry.object, "_time")).toBe(tsMs);
  });

  test("event_id is preferred over id for _uniqueId", () => {
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            event_id: "eid-123",
            id: "id-456",
            columns: [null, null, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(fieldValue(entry.object, "_uniqueId")).toBe("eid-123");
  });

  test("id is used when event_id is absent", () => {
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            id: "id-789",
            columns: [null, null, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(fieldValue(entry.object, "_uniqueId")).toBe("id-789");
  });

  test("custom fields are flattened into objectFields", () => {
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            custom: { myField: "hello", count: 42 },
            columns: [null, null, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(entry.object.myField).toBeDefined();
    expect(fieldValue(entry.object, "myField")).toBe("hello");
  });

  test("event.message becomes the log message", () => {
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            event: { message: "hello world" },
            columns: [null, null, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(entry.message).toBe("hello world");
  });

  test("JSON message string is parsed and its fields merged into objectFields", () => {
    const json = JSON.stringify({ level: "info", requestId: "abc" });
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            message: json,
            columns: [null, null, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(entry.message).toBe(json);
    expect(fieldValue(entry.object, "level")).toBe("info");
    expect(fieldValue(entry.object, "requestId")).toBe("abc");
  });

  test("non-JSON message is kept as-is without crashing", () => {
    const response: DatadogLogsResponse = {
      result: {
        events: [
          {
            message: "plain text log line",
            columns: [null, null, null, null, null] as never,
          },
        ],
      },
    };
    const [entry] = processDatadogResponse(response);
    expect(entry.message).toBe("plain text log line");
  });
});
