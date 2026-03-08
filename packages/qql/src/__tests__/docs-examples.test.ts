/**
 * Tests derived from QQL documentation examples.
 * Ensures every example shown in the docs actually parses correctly.
 *
 * Doc source: docs/src/content/docs/qql-reference/
 *
 * KNOWN DOC DISCREPANCIES (noted inline):
 *  - timechart docs show `span=5m` but grammar requires `span 5m` (no `=`)
 *  - `case()` docs show multi-condition pairs; grammar supports only one pair + else
 *  - `where lower(x) == "y"` pattern: function calls cannot appear as comparison operands
 *    in the grammar (`factor` rule is identifier/literal only); these are grammar gaps
 *  - `stats avg(abs(x))` etc.: aggregation args are `identifierOrString?`, not expressions
 */

import { expect, test, describe } from "vitest";
import { parse } from "../index";

// ---------------------------------------------------------------------------
// docs: commands/where.mdx
// ---------------------------------------------------------------------------

describe("docs: where command", () => {
  test("status and duration filter", () => {
    expect(() =>
      parse(`| where status == "error" && duration > 1000`),
    ).not.toThrow();
  });

  test("in-array membership", () => {
    expect(() => parse(`| where user in ["alice", "bob"]`)).not.toThrow();
  });

  test("negation of equality", () => {
    expect(() => parse(`| where !(level == "info")`)).not.toThrow();
  });

  test("parenthesised OR combined with AND", () => {
    expect(() =>
      parse(
        `| where (status == "error" || status == "warn") && duration >= 500`,
      ),
    ).not.toThrow();
  });

  test("contains function", () => {
    expect(() => parse(`| where contains(user, "admin")`)).not.toThrow();
  });

  test("match function with backtick regex", () => {
    // eslint-disable-next-line no-useless-escape
    expect(() => parse("| where match(message, `^Error:.*`)")).not.toThrow();
  });

  test("isNull function", () => {
    expect(() => parse(`| where isNull(optional_field)`)).not.toThrow();
  });

  test("boolean literal comparison", () => {
    expect(() => parse(`| where is_active == true`)).not.toThrow();
  });

  test("comparison operators !=", () => {
    expect(() => parse(`| where level != "debug"`)).not.toThrow();
  });

  test("comparison operators >=", () => {
    expect(() => parse(`| where duration >= 500`)).not.toThrow();
  });

  test("comparison operators <=", () => {
    expect(() => parse(`| where duration <= 500`)).not.toThrow();
  });

  test("chained where commands in pipeline", () => {
    expect(() =>
      parse(`| where status == "error" | where duration > 100`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: commands/eval.mdx
// ---------------------------------------------------------------------------

describe("docs: eval command", () => {
  test("arithmetic division", () => {
    expect(() => parse(`| eval duration_sec = duration / 1000`)).not.toThrow();
  });

  test("boolean comparison in parentheses", () => {
    // `(status == "error")` is a parenthesised logicalExpression used as evalFunctionArg
    expect(() => parse(`| eval is_error = (status == "error")`)).not.toThrow();
  });

  test("lower() string function", () => {
    expect(() => parse(`| eval user_lower = lower(user)`)).not.toThrow();
  });

  test("if() two-branch", () => {
    expect(() =>
      parse(`| eval error_type = if(status == "error", "critical", "normal")`),
    ).not.toThrow();
  });

  test("match() with regex literal", () => {
    expect(() =>
      parse("| eval match_found = match(message, `^Error:.*`)"),
    ).not.toThrow();
  });

  test("case() single condition pair plus else", () => {
    // Grammar supports exactly one condition/value pair + else:
    //   case(cond, val, else)
    // Doc example uses multi-pair syntax which the grammar does NOT support.
    // This corrected form uses only one pair.
    expect(() =>
      parse(`| eval group = case(status == "error", "A", "other")`),
    ).not.toThrow();
  });

  test("eval with multiple pipeline stages", () => {
    expect(() =>
      parse(`| eval dur = duration / 1000 | eval rounded = round(dur)`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: commands/stats.mdx
// ---------------------------------------------------------------------------

describe("docs: stats command", () => {
  test("count alias", () => {
    expect(() => parse(`| stats count() as total`)).not.toThrow();
  });

  test("multiple aggregations with group by", () => {
    // Note: aggregation arg must be a plain identifier — nested function calls
    // like avg(abs(x)) are NOT supported by the grammar.
    expect(() =>
      parse(
        `| stats count() as total, avg(duration) as avg_duration, first(user) as first_user by status`,
      ),
    ).not.toThrow();
  });

  test("sum aggregation", () => {
    expect(() => parse(`| stats sum(duration) by service`)).not.toThrow();
  });

  test("min and max aggregations", () => {
    expect(() =>
      parse(`| stats min(latency) as min_lat, max(latency) as max_lat`),
    ).not.toThrow();
  });

  test("last aggregation", () => {
    expect(() => parse(`| stats last(message) by level`)).not.toThrow();
  });

  test("group by multiple fields", () => {
    expect(() => parse(`| stats count() by service, status`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: commands/sort.mdx
// ---------------------------------------------------------------------------

describe("docs: sort command", () => {
  test("multi-field sort with explicit order", () => {
    expect(() => parse(`| sort timestamp desc, user asc`)).not.toThrow();
  });

  test("single field default asc", () => {
    expect(() => parse(`| sort timestamp`)).not.toThrow();
  });

  test("single field desc", () => {
    expect(() => parse(`| sort duration desc`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: commands/table.mdx
// ---------------------------------------------------------------------------

describe("docs: table command", () => {
  test("columns with aliases", () => {
    expect(() =>
      parse(`| table timestamp as time, message, level as severity`),
    ).not.toThrow();
  });

  test("multiple columns no aliases", () => {
    expect(() => parse(`| table timestamp, message, level`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: commands/timechart.mdx
//
// NOTE: Docs show `span=5m` / `timeCol=event_time` / `maxGroups=10` syntax
// (with `=`), but the grammar rule is `SPAN identifierOrString` (space, no `=`).
// Tests below use the CORRECT grammar syntax.
// ---------------------------------------------------------------------------

describe("docs: timechart command", () => {
  test("count with span", () => {
    // Grammar: `span <value>`, not `span=<value>`
    expect(() => parse(`| timechart count() span 5m`)).not.toThrow();
  });

  test("count with timeCol", () => {
    expect(() => parse(`| timechart count() timeCol event_time`)).not.toThrow();
  });

  test("count with maxGroups", () => {
    expect(() => parse(`| timechart count() maxGroups 10`)).not.toThrow();
  });

  test("multiple aggregations with all params and group by", () => {
    expect(() =>
      parse(
        `| timechart span 5m timeCol event_time maxGroups 10 count() as total, avg(duration) as avg_duration by status`,
      ),
    ).not.toThrow();
  });

  test("group by single field", () => {
    expect(() => parse(`| timechart count() by service`)).not.toThrow();
  });

  test("span with hours", () => {
    expect(() => parse(`| timechart count() span 1h`)).not.toThrow();
  });

  test("span with days", () => {
    expect(() => parse(`| timechart count() span 7d`)).not.toThrow();
  });

  test("span with seconds", () => {
    expect(() => parse(`| timechart count() span 30s`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: commands/unpack.mdx
// ---------------------------------------------------------------------------

describe("docs: unpack command", () => {
  test("unpack single column", () => {
    expect(() => parse(`| unpack payload`)).not.toThrow();
    expect(parse(`| unpack payload`)).toMatchObject({
      pipeline: [{ type: "unpack", field: "payload" }],
    });
  });

  test("chained unpack commands", () => {
    expect(() => parse(`| unpack payload | unpack details`)).not.toThrow();
    expect(parse(`| unpack payload | unpack details`)).toMatchObject({
      pipeline: [
        { type: "unpack", field: "payload" },
        { type: "unpack", field: "details" },
      ],
    });
  });

  test("unpack metadata column", () => {
    expect(() => parse(`| unpack metadata`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: commands/regex.mdx
// ---------------------------------------------------------------------------

describe("docs: regex command", () => {
  test("regex with field specifier and named capture groups", () => {
    expect(() =>
      parse(
        '| regex field="message" `(?<user>\\w+) logged in from (?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)`',
      ),
    ).not.toThrow();
  });

  test("regex without field (applies to _raw)", () => {
    expect(() => parse("| regex `^ERROR.*`")).not.toThrow();
  });

  test("regex with plain identifier field", () => {
    expect(() => parse("| regex field=message `^Error`")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/booleans/contains.mdx
// ---------------------------------------------------------------------------

describe("docs: contains() function", () => {
  test("in where clause", () => {
    expect(() => parse(`| where contains(message, "error")`)).not.toThrow();
  });

  test("in eval assignment", () => {
    expect(() =>
      parse(`| eval has_timeout = contains(error_message, "timeout")`),
    ).not.toThrow();
  });

  test("contains with special char in string", () => {
    expect(() =>
      parse(`| eval is_json = contains(raw_log, "{")`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/booleans/startsWith.mdx
// ---------------------------------------------------------------------------

describe("docs: startsWith() function", () => {
  test("in where clause", () => {
    expect(() => parse(`| where startsWith(message, "Error:")`)).not.toThrow();
  });

  test("in eval assignment", () => {
    expect(() =>
      parse(`| eval is_api_call = startsWith(request_path, "/api/")`),
    ).not.toThrow();
  });

  test("filter production hostnames", () => {
    expect(() => parse(`| where startsWith(hostname, "prod-")`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/booleans/endsWith.mdx
// ---------------------------------------------------------------------------

describe("docs: endsWith() function", () => {
  test("in where clause", () => {
    expect(() => parse(`| where endsWith(filename, ".log")`)).not.toThrow();
  });

  test("in eval assignment", () => {
    expect(() =>
      parse(`| eval is_json_file = endsWith(filename, ".json")`),
    ).not.toThrow();
  });

  test("filter by message suffix", () => {
    expect(() => parse(`| where endsWith(message, "success")`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/booleans/match.mdx
// ---------------------------------------------------------------------------

describe("docs: match() function", () => {
  test("in where clause", () => {
    expect(() => parse("| where match(message, `^Error:.*`)")).not.toThrow();
  });

  test("in eval assignment - status code pattern", () => {
    expect(() =>
      parse("| eval is_4xx_5xx = match(status_code, `^[45][0-9]{2}$`)"),
    ).not.toThrow();
  });

  test("alternation pattern in where", () => {
    expect(() =>
      parse("| where match(hostname, `^(prod|staging)-.*`)"),
    ).not.toThrow();
  });

  test("UUID pattern in eval", () => {
    expect(() =>
      parse(
        "| eval is_uuid = match(id, `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)",
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/booleans/isNull.mdx
// ---------------------------------------------------------------------------

describe("docs: isNull() function", () => {
  test("in where clause", () => {
    expect(() => parse(`| where isNull(optional_field)`)).not.toThrow();
  });

  test("negated in eval", () => {
    expect(() => parse(`| eval has_user = !(isNull(user_id))`)).not.toThrow();
  });

  test("filter successful records", () => {
    expect(() => parse(`| where isNull(error_code)`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/booleans/isNotNull.mdx
// ---------------------------------------------------------------------------

describe("docs: isNotNull() function", () => {
  test("in where clause", () => {
    expect(() => parse(`| where isNotNull(user)`)).not.toThrow();
  });

  test("in eval assignment", () => {
    expect(() =>
      parse(`| eval has_metadata = isNotNull(metadata_json)`),
    ).not.toThrow();
  });

  test("combined isNotNull conditions", () => {
    expect(() =>
      parse(`| where isNotNull(user_id) && isNotNull(request_id)`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/strings/lower.mdx
// ---------------------------------------------------------------------------

describe("docs: lower() function", () => {
  test("in eval assignment", () => {
    expect(() => parse(`| eval user_lower = lower(user)`)).not.toThrow();
  });

  test("in where comparison (function as comparison operand)", () => {
    // After grammar fix: functionExpression is a valid factor in comparisonExpression
    expect(() => parse(`| where lower(status) == "error"`)).not.toThrow();
  });

  test("normalize service name", () => {
    expect(() =>
      parse(`| eval normalized_service = lower(service_name)`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/strings/upper.mdx
// ---------------------------------------------------------------------------

describe("docs: upper() function", () => {
  test("in eval assignment", () => {
    expect(() => parse(`| eval user_upper = upper(user)`)).not.toThrow();
  });

  test("in where comparison (function as comparison operand)", () => {
    expect(() => parse(`| where upper(env) == "PRODUCTION"`)).not.toThrow();
  });

  test("normalize log level field", () => {
    expect(() => parse(`| eval level_upper = upper(level)`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/strings/length.mdx
// ---------------------------------------------------------------------------

describe("docs: length() function", () => {
  test("in eval with if", () => {
    expect(() =>
      parse(
        `| eval log_size_category = if(length(raw_log) > 10000, "large", "small")`,
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/strings/trim.mdx
// ---------------------------------------------------------------------------

describe("docs: trim() function", () => {
  test("in eval assignment", () => {
    expect(() => parse(`| eval clean_message = trim(message)`)).not.toThrow();
  });

  test("nested lower(trim(...))", () => {
    // This tests function composition in eval context
    expect(() =>
      parse(`| eval normalized_tag = lower(trim(tag))`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/numbers/abs.mdx
// ---------------------------------------------------------------------------

describe("docs: abs() function", () => {
  test("in eval assignment", () => {
    expect(() => parse(`| eval abs_delta = abs(difference)`)).not.toThrow();
  });

  test("error magnitude", () => {
    expect(() =>
      parse(`| eval error_magnitude = abs(deviation_percent)`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/numbers/ceil.mdx
// ---------------------------------------------------------------------------

describe("docs: ceil() function", () => {
  test("with arithmetic arg", () => {
    expect(() =>
      parse(`| eval min_pages = ceil(total_bytes / page_size)`),
    ).not.toThrow();
  });

  test("round up duration to seconds", () => {
    expect(() =>
      parse(`| eval rounded_duration = ceil(duration_ms / 1000)`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/numbers/floor.mdx
// ---------------------------------------------------------------------------

describe("docs: floor() function", () => {
  test("complete hours from seconds", () => {
    expect(() =>
      parse(`| eval hours = floor(duration_seconds / 3600)`),
    ).not.toThrow();
  });

  test("request batch grouping", () => {
    expect(() =>
      parse(`| eval request_batch = floor(request_id / 100)`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/numbers/round.mdx
// ---------------------------------------------------------------------------

describe("docs: round() function", () => {
  test("round ms to seconds", () => {
    expect(() =>
      parse(`| eval rounded_duration = round(duration_ms / 1000)`),
    ).not.toThrow();
  });

  test("round percentile to integer", () => {
    expect(() =>
      parse(`| eval percentile_rounded = round(percentile)`),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/conditional/if.mdx
// ---------------------------------------------------------------------------

describe("docs: if() function", () => {
  test("boolean field creation", () => {
    expect(() =>
      parse(`| eval is_error = if(status == "error", true, false)`),
    ).not.toThrow();
  });

  test("categorization by status code", () => {
    expect(() =>
      parse(`| eval severity = if(status_code >= 500, "critical", "normal")`),
    ).not.toThrow();
  });

  test("nested if for multi-level categorization", () => {
    expect(() =>
      parse(
        `| eval tier = if(score > 90, "gold", if(score > 70, "silver", "bronze"))`,
      ),
    ).not.toThrow();
  });

  test("if with arithmetic in then-branch", () => {
    expect(() =>
      parse(`| eval discount = if(total_spent > 1000, total_spent * 0.1, 0)`),
    ).not.toThrow();
  });

  test("string from boolean field", () => {
    expect(() =>
      parse(`| eval result_display = if(success, "OK", "FAILED")`),
    ).not.toThrow();
  });

  test("if without else branch", () => {
    expect(() => parse(`| eval col = if(x == 1, "yes")`)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: functions/conditional/case.mdx
//
// NOTE: The docs show multi-condition pairs like case(c1,v1,c2,v2,...,else)
// but the grammar only supports ONE condition-value pair + else:
//   case(cond, val, else)
// Tests below use the CORRECT single-pair form.
// ---------------------------------------------------------------------------

describe("docs: case() function", () => {
  test("simple status mapping (single pair)", () => {
    expect(() =>
      parse(`| eval status_label = case(status == "error", "Error", "OK")`),
    ).not.toThrow();
  });

  test("numeric severity tier (single pair)", () => {
    expect(() =>
      parse(`| eval severity_tier = case(level == "FATAL", 1, 5)`),
    ).not.toThrow();
  });

  test("performance classification (single pair)", () => {
    expect(() =>
      parse(
        `| eval performance = case(response_time_ms < 100, "fast", "slow")`,
      ),
    ).not.toThrow();
  });

  test("boolean default value", () => {
    expect(() =>
      parse(
        `| eval should_alert = case(environment == "production" && error_count > 10, true, false)`,
      ),
    ).not.toThrow();
  });

  test("case with column ref in condition", () => {
    expect(parse(`| eval g = case(x > 1, "big", "small")`)).toMatchObject({
      pipeline: [
        {
          type: "eval",
          variableName: "g",
          expression: {
            type: "functionExpression",
            functionName: "case",
          },
        },
      ],
    });
  });
});

// ---------------------------------------------------------------------------
// docs: qql-reference/02-query.mdx  (controller params & datasources)
// ---------------------------------------------------------------------------

describe("docs: query structure - controller params", () => {
  test("equality controller param", () => {
    expect(() =>
      parse(
        `user="alice" environment="prod" | where duration > 1000 | table timestamp, message`,
      ),
    ).not.toThrow();
  });

  test("exclusion controller param", () => {
    expect(() =>
      parse(`environment!="dev" | stats count() by service`),
    ).not.toThrow();
  });

  test("regex controller param", () => {
    expect(() =>
      parse('namespace=`^prod-.*` | where level == "error"'),
    ).not.toThrow();
  });

  test("regex exclusion controller param", () => {
    expect(() =>
      parse("namespace!=`^test-.*` | stats count() by service"),
    ).not.toThrow();
  });
});

describe("docs: query structure - datasource selection", () => {
  test("datasource with search and where", () => {
    expect(() => parse(`@docker error | where level == "error"`)).not.toThrow();
    expect(parse(`@docker error | where level == "error"`)).toMatchObject({
      dataSources: [{ type: "datasource", name: "docker" }],
    });
  });

  test("datasource with stats pipeline", () => {
    expect(() =>
      parse(`@my-loki-prod | where service == "api" | stats count() by status`),
    ).not.toThrow();
  });
});

describe("docs: query structure - search expressions", () => {
  test("controller param plus search word", () => {
    expect(() => parse(`user="alice" error | table message`)).not.toThrow();
  });

  test("implicit AND between search words", () => {
    expect(() => parse(`error timeout`)).not.toThrow();
  });

  test("exact phrase in double quotes", () => {
    expect(() => parse(`"disk full"`)).not.toThrow();
  });

  test("OR between search words", () => {
    expect(() => parse(`error OR warning`)).not.toThrow();
  });

  test("parenthesised OR with additional token (implicit AND)", () => {
    // Grammar supports: LPAREN search RPAREN searchFactor — implicit AND tail
    expect(() => parse(`(error OR warning) timeout`)).not.toThrow();
  });
});

describe("docs: query structure - comments", () => {
  test("inline comment after command", () => {
    expect(() =>
      parse(
        `@docker | where level == "error" // only errors\n| stats count() by service`,
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// docs: qql-reference/01-qql.mdx  (complete example)
// ---------------------------------------------------------------------------

describe("docs: qql.mdx complete example", () => {
  test("multi-stage pipeline from overview page", () => {
    // The overview shows `sort -count` (wrong syntax); corrected to `sort count desc`
    expect(() =>
      parse(
        `service="api" method="POST" | eval duration_ms = duration / 1000 | where duration_ms > 100 | stats avg(duration_ms) as avg_dur, max(duration_ms) as max_dur, count() as cnt by endpoint | sort cnt desc`,
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Structural validation for key patterns
// ---------------------------------------------------------------------------

describe("structural: where expressions from docs", () => {
  test("contains produces functionExpression in where", () => {
    expect(parse(`| where contains(user, "admin")`)).toMatchObject({
      pipeline: [
        {
          type: "where",
          expression: {
            type: "logicalExpression",
            left: {
              type: "unitExpression",
              value: {
                type: "functionExpression",
                functionName: "contains",
                args: [
                  { type: "columnRef", columnName: "user" },
                  { type: "string", value: "admin" },
                ],
              },
            },
          },
        },
      ],
    });
  });

  test("in-array expression from docs", () => {
    expect(parse(`| where user in ["alice", "bob"]`)).toMatchObject({
      pipeline: [
        {
          type: "where",
          expression: {
            type: "logicalExpression",
            left: {
              type: "unitExpression",
              value: {
                type: "inArrayExpression",
                left: { type: "columnRef", columnName: "user" },
                right: [
                  { type: "string", value: "alice" },
                  { type: "string", value: "bob" },
                ],
              },
            },
          },
        },
      ],
    });
  });
});

describe("structural: eval expressions from docs", () => {
  test("eval lower() produces functionExpression", () => {
    expect(parse(`| eval user_lower = lower(user)`)).toMatchObject({
      pipeline: [
        {
          type: "eval",
          variableName: "user_lower",
          expression: {
            type: "functionExpression",
            functionName: "lower",
            args: [{ type: "columnRef", columnName: "user" }],
          },
        },
      ],
    });
  });

  test("eval if() with string literals", () => {
    expect(
      parse(`| eval error_type = if(status == "error", "critical", "normal")`),
    ).toMatchObject({
      pipeline: [
        {
          type: "eval",
          variableName: "error_type",
          expression: {
            type: "functionExpression",
            functionName: "if",
          },
        },
      ],
    });
  });

  test("eval ceil() with arithmetic arg", () => {
    expect(
      parse(`| eval rounded_duration = ceil(duration_ms / 1000)`),
    ).toMatchObject({
      pipeline: [
        {
          type: "eval",
          variableName: "rounded_duration",
          expression: {
            type: "functionExpression",
            functionName: "ceil",
          },
        },
      ],
    });
  });
});

describe("structural: stats from docs", () => {
  test("stats with multiple aggs and group by", () => {
    expect(
      parse(
        `| stats count() as total, avg(duration) as avg_duration, first(user) as first_user by status`,
      ),
    ).toMatchObject({
      pipeline: [
        {
          type: "stats",
          aggregationFunctions: [
            { function: "count", alias: "total" },
            { function: "avg", column: "duration", alias: "avg_duration" },
            { function: "first", column: "user", alias: "first_user" },
          ],
          groupby: ["status"],
        },
      ],
    });
  });
});

describe("structural: unpack from docs", () => {
  test("unpack produces correct AST node", () => {
    expect(parse(`| unpack payload`)).toMatchObject({
      pipeline: [{ type: "unpack", field: "payload" }],
    });
  });
});

describe("structural: timechart from docs (corrected syntax)", () => {
  test("timechart with span, timeCol, maxGroups, aggregations, group by", () => {
    expect(
      parse(
        `| timechart span 5m timeCol event_time maxGroups 10 count() as total, avg(duration) as avg_duration by status`,
      ),
    ).toMatchObject({
      pipeline: [
        {
          type: "timechart",
          params: { span: "5m", timeCol: "event_time", maxGroups: 10 },
          aggregationFunctions: [
            { function: "count", alias: "total" },
            { function: "avg", column: "duration", alias: "avg_duration" },
          ],
          groupby: ["status"],
        },
      ],
    });
  });
});
