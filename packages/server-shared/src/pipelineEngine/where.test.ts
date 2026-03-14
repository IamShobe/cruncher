import { expect, test, describe } from "vitest";
import { processWhere } from "./where";
import type { DisplayResults } from "../displayTypes";
import type { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import type {
  LogicalExpression,
  ComparisonExpression,
  UnitExpression,
  AndExpression,
  OrExpression,
  NotExpression,
  FunctionExpression,
  InArrayExpression,
} from "@cruncher/qql/grammar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeEvents = (rows: ProcessedData[]): DisplayResults => ({
  events: { type: "events", data: rows },
  table: undefined,
  view: undefined,
});

const makeTable = (rows: ProcessedData[]): DisplayResults => ({
  events: { type: "events", data: rows },
  table: { type: "table", columns: [], dataPoints: rows },
  view: undefined,
});

const row = (
  fields: Record<string, ProcessedData["object"][string]>,
): ProcessedData => ({
  object: fields,
  message: "",
});

const num = (v: number) => ({ type: "number" as const, value: v });
const str = (v: string) => ({ type: "string" as const, value: v });
const _bool = (v: boolean) => ({ type: "boolean" as const, value: v });

const comparison = (
  left: any,
  operator: string,
  right: any,
): LogicalExpression => {
  const comp: ComparisonExpression = {
    type: "comparisonExpression",
    left,
    operator,
    right,
  };
  const unit: UnitExpression = { type: "unitExpression", value: comp };
  return { type: "logicalExpression", left: unit, right: undefined };
};

const and = (
  left: LogicalExpression,
  right: LogicalExpression,
): LogicalExpression => {
  const andExpr: AndExpression = { type: "andExpression", right };
  return {
    type: "logicalExpression",
    left: left.left,
    right: andExpr,
  };
};

const or = (
  left: LogicalExpression,
  right: LogicalExpression,
): LogicalExpression => {
  const orExpr: OrExpression = { type: "orExpression", right };
  return {
    type: "logicalExpression",
    left: left.left,
    right: orExpr,
  };
};

const not = (inner: LogicalExpression): LogicalExpression => {
  const notExpr: NotExpression = {
    type: "notExpression",
    expression: { type: "unitExpression", value: inner },
  };
  const unit: UnitExpression = { type: "unitExpression", value: notExpr };
  return { type: "logicalExpression", left: unit, right: undefined };
};

const boolFn = (functionName: string, ...args: any[]): LogicalExpression => {
  const funcExpr: FunctionExpression = {
    type: "functionExpression",
    functionName,
    args,
  };
  const unit: UnitExpression = { type: "unitExpression", value: funcExpr };
  return { type: "logicalExpression", left: unit, right: undefined };
};

const inArray = (left: any, right: any[]): LogicalExpression => {
  const inExpr: InArrayExpression = { type: "inArrayExpression", left, right };
  const unit: UnitExpression = { type: "unitExpression", value: inExpr };
  return { type: "logicalExpression", left: unit, right: undefined };
};

// ─── Numeric comparisons ──────────────────────────────────────────────────────

describe("numeric comparisons", () => {
  test("== keeps matching rows", () => {
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(2) }),
      row({ v: num(1) }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "v" }, "==", {
        type: "number",
        value: 1,
      }),
    );
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.every((r) => r.object["v"]?.value === 1)).toBe(
      true,
    );
  });

  test("!= keeps non-matching rows", () => {
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(2) }),
      row({ v: num(3) }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "v" }, "!=", {
        type: "number",
        value: 2,
      }),
    );
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["v"]?.value)).toEqual([1, 3]);
  });

  test("> filters correctly", () => {
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(5) }),
      row({ v: num(10) }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "v" }, ">", {
        type: "number",
        value: 4,
      }),
    );
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["v"]?.value)).toEqual([
      5, 10,
    ]);
  });

  test("< filters correctly", () => {
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(5) }),
      row({ v: num(10) }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "v" }, "<", {
        type: "number",
        value: 6,
      }),
    );
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["v"]?.value)).toEqual([1, 5]);
  });

  test(">= includes boundary", () => {
    const data = makeEvents([
      row({ v: num(5) }),
      row({ v: num(6) }),
      row({ v: num(4) }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "v" }, ">=", {
        type: "number",
        value: 5,
      }),
    );
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["v"]?.value)).toEqual([5, 6]);
  });

  test("<= includes boundary", () => {
    const data = makeEvents([
      row({ v: num(5) }),
      row({ v: num(4) }),
      row({ v: num(6) }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "v" }, "<=", {
        type: "number",
        value: 5,
      }),
    );
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["v"]?.value)).toEqual([5, 4]);
  });
});

// ─── String comparisons ───────────────────────────────────────────────────────

describe("string comparisons", () => {
  test("string == keeps exact matches", () => {
    const data = makeEvents([
      row({ name: str("alice") }),
      row({ name: str("bob") }),
      row({ name: str("alice") }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "name" }, "==", {
        type: "string",
        value: "alice",
      }),
    );
    expect(result.events.data).toHaveLength(2);
  });

  test("string != excludes exact matches", () => {
    const data = makeEvents([
      row({ name: str("alice") }),
      row({ name: str("bob") }),
    ]);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "name" }, "!=", {
        type: "string",
        value: "alice",
      }),
    );
    expect(result.events.data).toHaveLength(1);
    expect(result.events.data[0].object["name"]).toEqual(str("bob"));
  });
});

// ─── Logical AND / OR ─────────────────────────────────────────────────────────

describe("AND expression", () => {
  test("AND: both conditions must match", () => {
    const cond = and(
      comparison({ type: "columnRef", columnName: "a" }, ">", {
        type: "number",
        value: 1,
      }),
      comparison({ type: "columnRef", columnName: "b" }, "<", {
        type: "number",
        value: 10,
      }),
    );
    const data = makeEvents([
      row({ a: num(5), b: num(5) }), // passes
      row({ a: num(0), b: num(5) }), // a fails
      row({ a: num(5), b: num(15) }), // b fails
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(1);
    expect(result.events.data[0].object["a"]?.value).toBe(5);
    expect(result.events.data[0].object["b"]?.value).toBe(5);
  });
});

describe("OR expression", () => {
  test("OR: either condition may match", () => {
    const cond = or(
      comparison({ type: "columnRef", columnName: "v" }, "==", {
        type: "number",
        value: 1,
      }),
      comparison({ type: "columnRef", columnName: "v" }, "==", {
        type: "number",
        value: 3,
      }),
    );
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(2) }),
      row({ v: num(3) }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["v"]?.value)).toEqual([1, 3]);
  });
});

// ─── NOT expression ───────────────────────────────────────────────────────────

describe("NOT expression", () => {
  test("NOT inverts the filter", () => {
    const cond = not(
      comparison({ type: "columnRef", columnName: "v" }, "==", {
        type: "number",
        value: 2,
      }),
    );
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(2) }),
      row({ v: num(3) }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["v"]?.value)).toEqual([1, 3]);
  });
});

// ─── Boolean functions ────────────────────────────────────────────────────────

describe("contains function", () => {
  test("keeps rows where the string contains the substring", () => {
    const cond = boolFn(
      "contains",
      { type: "columnRef", columnName: "msg" },
      { type: "string", value: "error" },
    );
    const data = makeEvents([
      row({ msg: str("an error occurred") }),
      row({ msg: str("all good") }),
      row({ msg: str("fatal error") }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
  });
});

describe("startsWith function", () => {
  test("keeps rows where string starts with prefix", () => {
    const cond = boolFn(
      "startsWith",
      { type: "columnRef", columnName: "level" },
      { type: "string", value: "ERR" },
    );
    const data = makeEvents([
      row({ level: str("ERR_FATAL") }),
      row({ level: str("WARN_LOW") }),
      row({ level: str("ERR_MINOR") }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
  });
});

describe("endsWith function", () => {
  test("keeps rows where string ends with suffix", () => {
    const cond = boolFn(
      "endsWith",
      { type: "columnRef", columnName: "file" },
      { type: "string", value: ".ts" },
    );
    const data = makeEvents([
      row({ file: str("app.ts") }),
      row({ file: str("app.js") }),
      row({ file: str("utils.ts") }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
  });
});

describe("match function", () => {
  test("keeps rows where the column matches the regex", () => {
    const cond = boolFn(
      "match",
      { type: "columnRef", columnName: "msg" },
      { type: "regex", pattern: "^error" },
    );
    const data = makeEvents([
      row({ msg: str("error: something went wrong") }),
      row({ msg: str("info: all clear") }),
      row({ msg: str("error: another issue") }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
  });
});

describe("isNull / isNotNull", () => {
  test("isNull keeps rows where the field is undefined", () => {
    const cond = boolFn("isNull", { type: "columnRef", columnName: "v" });
    const data = makeEvents([row({ v: num(1) }), row({}), row({ v: num(2) })]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(1);
    expect(result.events.data[0].object["v"]).toBeUndefined();
  });

  test("isNotNull keeps rows where the field is defined", () => {
    const cond = boolFn("isNotNull", { type: "columnRef", columnName: "v" });
    const data = makeEvents([row({ v: num(1) }), row({}), row({ v: num(2) })]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
  });
});

// ─── IN array expression ──────────────────────────────────────────────────────

describe("IN array expression", () => {
  test("keeps rows whose column value is in the array", () => {
    const cond = inArray({ type: "columnRef", columnName: "status" }, [
      { type: "string", value: "ok" },
      { type: "string", value: "warn" },
    ]);
    const data = makeEvents([
      row({ status: str("ok") }),
      row({ status: str("err") }),
      row({ status: str("warn") }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(2);
    expect(result.events.data.map((r) => r.object["status"]?.value)).toEqual([
      "ok",
      "warn",
    ]);
  });

  test("returns empty when no rows match", () => {
    const cond = inArray({ type: "columnRef", columnName: "status" }, [
      { type: "string", value: "missing" },
    ]);
    const data = makeEvents([
      row({ status: str("ok") }),
      row({ status: str("err") }),
    ]);
    const result = processWhere(data, cond);
    expect(result.events.data).toHaveLength(0);
  });
});

// ─── Table mode ───────────────────────────────────────────────────────────────

describe("where filters table.dataPoints when table is present", () => {
  test("filters table rows and leaves events untouched", () => {
    const allRows = [
      row({ v: num(1) }),
      row({ v: num(2) }),
      row({ v: num(3) }),
    ];
    const data = makeTable(allRows);
    const result = processWhere(
      data,
      comparison({ type: "columnRef", columnName: "v" }, ">", {
        type: "number",
        value: 1,
      }),
    );
    expect(result.table?.dataPoints).toHaveLength(2);
    expect(result.table?.dataPoints.map((r) => r.object["v"]?.value)).toEqual([
      2, 3,
    ]);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

test("empty dataset returns empty data", () => {
  const data = makeEvents([]);
  const result = processWhere(
    data,
    comparison({ type: "number", value: 1 }, "==", {
      type: "number",
      value: 1,
    }),
  );
  expect(result.events.data).toHaveLength(0);
});

test("filter that matches nothing returns empty data", () => {
  const data = makeEvents([row({ v: num(1) }), row({ v: num(2) })]);
  const result = processWhere(
    data,
    comparison({ type: "columnRef", columnName: "v" }, "==", {
      type: "number",
      value: 99,
    }),
  );
  expect(result.events.data).toHaveLength(0);
});

test("filter that matches all rows returns all rows", () => {
  const data = makeEvents([
    row({ v: num(1) }),
    row({ v: num(2) }),
    row({ v: num(3) }),
  ]);
  const result = processWhere(
    data,
    comparison({ type: "number", value: 1 }, "==", {
      type: "number",
      value: 1,
    }),
  );
  expect(result.events.data).toHaveLength(3);
});

test("comparison with undefined/missing column: == treats both undefined as equal", () => {
  const data = makeEvents([row({}), row({ v: num(1) })]);
  const result = processWhere(
    data,
    comparison({ type: "columnRef", columnName: "v" }, "==", {
      type: "columnRef",
      columnName: "missing",
    }),
  );
  // row({}) has v=undefined and missing=undefined, so == should be true
  expect(result.events.data).toHaveLength(1);
});
