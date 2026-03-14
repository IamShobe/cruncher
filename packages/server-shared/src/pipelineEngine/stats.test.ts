import { expect, test, describe } from "vitest";
import { processStats } from "./stats";
import type { DisplayResults } from "../displayTypes";
import type { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import type { AggregationFunction } from "@cruncher/qql/grammar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeEvents = (rows: ProcessedData[]): DisplayResults => ({
  events: { type: "events", data: rows },
  table: undefined,
  view: undefined,
});

const makeTable = (rows: ProcessedData[]): DisplayResults => ({
  events: { type: "events", data: [] },
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

const agg = (
  func: string,
  column?: string,
  alias?: string,
): AggregationFunction => ({
  function: func,
  column,
  columnExpression: undefined,
  alias,
});

// ─── count ────────────────────────────────────────────────────────────────────

describe("count", () => {
  test("count all rows (no groupBy)", () => {
    const data = makeEvents([row({}), row({}), row({})]);
    const result = processStats(data, [agg("count")], undefined);
    expect(result.table?.dataPoints).toHaveLength(1);
    expect(result.table?.dataPoints[0].object["count"]).toEqual(num(3));
  });

  test("count with alias", () => {
    const data = makeEvents([row({}), row({})]);
    const result = processStats(
      data,
      [agg("count", undefined, "total")],
      undefined,
    );
    expect(result.table?.dataPoints[0].object["total"]).toEqual(num(2));
  });

  test("count with column produces count(col) name", () => {
    const data = makeEvents([row({ v: num(1) }), row({ v: num(2) })]);
    const result = processStats(data, [agg("count", "v")], undefined);
    expect(result.table?.dataPoints[0].object["count(v)"]).toEqual(num(2));
  });

  test("count empty dataset returns no rows", () => {
    const data = makeEvents([]);
    const result = processStats(data, [agg("count")], undefined);
    // No groups are formed from an empty dataset, so the result has no rows
    expect(result.table?.dataPoints).toHaveLength(0);
  });

  test("count by groupBy", () => {
    const data = makeEvents([
      row({ status: str("ok") }),
      row({ status: str("ok") }),
      row({ status: str("err") }),
    ]);
    const result = processStats(data, [agg("count")], ["status"]);
    expect(result.table?.dataPoints).toHaveLength(2);
    const okRow = result.table!.dataPoints.find(
      (r) => r.object["status"]?.value === "ok",
    );
    const errRow = result.table!.dataPoints.find(
      (r) => r.object["status"]?.value === "err",
    );
    expect(okRow?.object["count"]).toEqual(num(2));
    expect(errRow?.object["count"]).toEqual(num(1));
  });
});

// ─── sum ──────────────────────────────────────────────────────────────────────

describe("sum", () => {
  test("sums all values (no groupBy)", () => {
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(2) }),
      row({ v: num(3) }),
    ]);
    const result = processStats(data, [agg("sum", "v")], undefined);
    expect(result.table?.dataPoints[0].object["sum(v)"]).toEqual(num(6));
  });

  test("sum with groupBy", () => {
    const data = makeEvents([
      row({ group: str("a"), v: num(10) }),
      row({ group: str("a"), v: num(20) }),
      row({ group: str("b"), v: num(5) }),
    ]);
    const result = processStats(data, [agg("sum", "v")], ["group"]);
    expect(result.table?.dataPoints).toHaveLength(2);
    const a = result.table!.dataPoints.find(
      (r) => r.object["group"]?.value === "a",
    );
    const b = result.table!.dataPoints.find(
      (r) => r.object["group"]?.value === "b",
    );
    expect(a?.object["sum(v)"]).toEqual(num(30));
    expect(b?.object["sum(v)"]).toEqual(num(5));
  });

  test("sum with alias", () => {
    const data = makeEvents([row({ v: num(10) }), row({ v: num(20) })]);
    const result = processStats(data, [agg("sum", "v", "total")], undefined);
    expect(result.table?.dataPoints[0].object["total"]).toEqual(num(30));
  });

  test("sum of non-numbers throws", () => {
    const data = makeEvents([row({ v: str("a") }), row({ v: str("b") })]);
    expect(() => processStats(data, [agg("sum", "v")], undefined)).toThrow();
  });
});

// ─── avg ──────────────────────────────────────────────────────────────────────

describe("avg", () => {
  test("averages all values", () => {
    const data = makeEvents([
      row({ v: num(10) }),
      row({ v: num(20) }),
      row({ v: num(30) }),
    ]);
    const result = processStats(data, [agg("avg", "v")], undefined);
    expect(result.table?.dataPoints[0].object["avg(v)"]).toEqual(num(20));
  });

  test("avg with groupBy", () => {
    const data = makeEvents([
      row({ g: str("a"), v: num(10) }),
      row({ g: str("a"), v: num(30) }),
      row({ g: str("b"), v: num(100) }),
    ]);
    const result = processStats(data, [agg("avg", "v")], ["g"]);
    const a = result.table!.dataPoints.find(
      (r) => r.object["g"]?.value === "a",
    );
    expect(a?.object["avg(v)"]).toEqual(num(20));
  });

  test("avg of single value equals that value", () => {
    const data = makeEvents([row({ v: num(7) })]);
    const result = processStats(data, [agg("avg", "v")], undefined);
    expect(result.table?.dataPoints[0].object["avg(v)"]).toEqual(num(7));
  });
});

// ─── min / max ────────────────────────────────────────────────────────────────

describe("min", () => {
  test("returns the minimum value", () => {
    const data = makeEvents([
      row({ v: num(5) }),
      row({ v: num(1) }),
      row({ v: num(3) }),
    ]);
    const result = processStats(data, [agg("min", "v")], undefined);
    expect(result.table?.dataPoints[0].object["min(v)"]).toEqual(num(1));
  });

  test("min with groupBy", () => {
    const data = makeEvents([
      row({ g: str("a"), v: num(5) }),
      row({ g: str("a"), v: num(2) }),
      row({ g: str("b"), v: num(10) }),
    ]);
    const result = processStats(data, [agg("min", "v")], ["g"]);
    const a = result.table!.dataPoints.find(
      (r) => r.object["g"]?.value === "a",
    );
    expect(a?.object["min(v)"]).toEqual(num(2));
  });
});

describe("max", () => {
  test("returns the maximum value", () => {
    const data = makeEvents([
      row({ v: num(5) }),
      row({ v: num(1) }),
      row({ v: num(9) }),
    ]);
    const result = processStats(data, [agg("max", "v")], undefined);
    expect(result.table?.dataPoints[0].object["max(v)"]).toEqual(num(9));
  });

  test("max with groupBy", () => {
    const data = makeEvents([
      row({ g: str("a"), v: num(5) }),
      row({ g: str("a"), v: num(99) }),
      row({ g: str("b"), v: num(10) }),
    ]);
    const result = processStats(data, [agg("max", "v")], ["g"]);
    const a = result.table!.dataPoints.find(
      (r) => r.object["g"]?.value === "a",
    );
    expect(a?.object["max(v)"]).toEqual(num(99));
  });
});

// ─── first / last ─────────────────────────────────────────────────────────────

describe("first", () => {
  test("returns the first value", () => {
    const data = makeEvents([
      row({ v: num(10) }),
      row({ v: num(20) }),
      row({ v: num(30) }),
    ]);
    const result = processStats(data, [agg("first", "v")], undefined);
    expect(result.table?.dataPoints[0].object["first(v)"]).toEqual(num(10));
  });
});

describe("last", () => {
  test("returns the last value", () => {
    const data = makeEvents([
      row({ v: num(10) }),
      row({ v: num(20) }),
      row({ v: num(30) }),
    ]);
    const result = processStats(data, [agg("last", "v")], undefined);
    expect(result.table?.dataPoints[0].object["last(v)"]).toEqual(num(30));
  });
});

// ─── Multiple aggregations ────────────────────────────────────────────────────

describe("multiple aggregations at once", () => {
  test("computes count and sum in a single pass", () => {
    const data = makeEvents([row({ v: num(10) }), row({ v: num(20) })]);
    const result = processStats(
      data,
      [agg("count"), agg("sum", "v")],
      undefined,
    );
    const dp = result.table?.dataPoints[0];
    expect(dp?.object["count"]).toEqual(num(2));
    expect(dp?.object["sum(v)"]).toEqual(num(30));
  });

  test("multi-group multi-agg", () => {
    const data = makeEvents([
      row({ g: str("a"), v: num(1) }),
      row({ g: str("a"), v: num(3) }),
      row({ g: str("b"), v: num(10) }),
    ]);
    const result = processStats(data, [agg("count"), agg("sum", "v")], ["g"]);
    expect(result.table?.dataPoints).toHaveLength(2);
    const a = result.table!.dataPoints.find(
      (r) => r.object["g"]?.value === "a",
    );
    expect(a?.object["count"]).toEqual(num(2));
    expect(a?.object["sum(v)"]).toEqual(num(4));
  });
});

// ─── columns metadata ─────────────────────────────────────────────────────────

describe("result columns metadata", () => {
  test("columns include groupBy and aggregation column names", () => {
    const data = makeEvents([row({ g: str("a"), v: num(1) })]);
    const result = processStats(data, [agg("sum", "v")], ["g"]);
    expect(result.table?.columns).toContain("g");
    expect(result.table?.columns).toContain("sum(v)");
  });

  test("columns reflect alias when provided", () => {
    const data = makeEvents([row({ v: num(1) })]);
    const result = processStats(data, [agg("sum", "v", "total")], undefined);
    expect(result.table?.columns).toContain("total");
    expect(result.table?.columns).not.toContain("sum(v)");
  });
});

// ─── Table mode ───────────────────────────────────────────────────────────────

describe("stats operates on table.dataPoints when table is present", () => {
  test("aggregates table rows", () => {
    const data = makeTable([row({ v: num(5) }), row({ v: num(15) })]);
    const result = processStats(data, [agg("sum", "v")], undefined);
    expect(result.table?.dataPoints[0].object["sum(v)"]).toEqual(num(20));
  });
});

// ─── Unsupported function ─────────────────────────────────────────────────────

test("unsupported aggregation function throws", () => {
  const data = makeEvents([row({ v: num(1) })]);
  expect(() => processStats(data, [agg("median", "v")], undefined)).toThrow();
});
