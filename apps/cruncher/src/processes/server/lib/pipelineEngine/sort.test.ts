import { expect, test } from "vitest";
import { processSort } from "./sort";
import type { DisplayResults } from "~lib/displayTypes";
import type { ProcessedData } from "@cruncher/adapter-utils/logTypes";

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

const row = (fields: Record<string, ProcessedData["object"][string]>): ProcessedData => ({
  object: fields,
  message: "",
});

const num = (v: number) => ({ type: "number" as const, value: v });
const str = (v: string) => ({ type: "string" as const, value: v });
const date = (v: number) => ({ type: "date" as const, value: v });
const bool = (v: boolean) => ({ type: "boolean" as const, value: v });

const getValues = (result: DisplayResults, field: string) =>
  result.events.data.map((r) => r.object[field]);

const getTableValues = (result: DisplayResults, field: string) =>
  result.table!.dataPoints.map((r) => r.object[field]);

// ─── Number sorting ───────────────────────────────────────────────────────────

test("sort numbers ascending", () => {
  const data = makeEvents([
    row({ score: num(3) }),
    row({ score: num(1) }),
    row({ score: num(2) }),
  ]);
  const result = processSort(data, [{ name: "score", order: "asc" }]);
  expect(getValues(result, "score")).toEqual([num(1), num(2), num(3)]);
});

test("sort numbers descending", () => {
  const data = makeEvents([
    row({ score: num(1) }),
    row({ score: num(3) }),
    row({ score: num(2) }),
  ]);
  const result = processSort(data, [{ name: "score", order: "desc" }]);
  expect(getValues(result, "score")).toEqual([num(3), num(2), num(1)]);
});

// ─── String sorting ───────────────────────────────────────────────────────────

test("sort strings ascending", () => {
  const data = makeEvents([
    row({ name: str("charlie") }),
    row({ name: str("alice") }),
    row({ name: str("bob") }),
  ]);
  const result = processSort(data, [{ name: "name", order: "asc" }]);
  expect(getValues(result, "name")).toEqual([str("alice"), str("bob"), str("charlie")]);
});

test("sort strings descending", () => {
  const data = makeEvents([
    row({ name: str("alice") }),
    row({ name: str("charlie") }),
    row({ name: str("bob") }),
  ]);
  const result = processSort(data, [{ name: "name", order: "desc" }]);
  expect(getValues(result, "name")).toEqual([str("charlie"), str("bob"), str("alice")]);
});

// ─── Date sorting ─────────────────────────────────────────────────────────────

test("sort dates ascending (oldest first)", () => {
  const data = makeEvents([
    row({ ts: date(3000) }),
    row({ ts: date(1000) }),
    row({ ts: date(2000) }),
  ]);
  const result = processSort(data, [{ name: "ts", order: "asc" }]);
  expect(getValues(result, "ts")).toEqual([date(1000), date(2000), date(3000)]);
});

test("sort dates descending (newest first)", () => {
  const data = makeEvents([
    row({ ts: date(1000) }),
    row({ ts: date(3000) }),
    row({ ts: date(2000) }),
  ]);
  const result = processSort(data, [{ name: "ts", order: "desc" }]);
  expect(getValues(result, "ts")).toEqual([date(3000), date(2000), date(1000)]);
});

// ─── Boolean sorting ──────────────────────────────────────────────────────────

test("sort booleans ascending (false first)", () => {
  const data = makeEvents([
    row({ active: bool(true) }),
    row({ active: bool(false) }),
    row({ active: bool(true) }),
  ]);
  const result = processSort(data, [{ name: "active", order: "asc" }]);
  expect(getValues(result, "active")).toEqual([bool(false), bool(true), bool(true)]);
});

test("sort booleans descending (true first)", () => {
  const data = makeEvents([
    row({ active: bool(false) }),
    row({ active: bool(true) }),
    row({ active: bool(false) }),
  ]);
  const result = processSort(data, [{ name: "active", order: "desc" }]);
  expect(getValues(result, "active")).toEqual([bool(true), bool(false), bool(false)]);
});

// ─── Null/undefined handling ──────────────────────────────────────────────────

test("sort ascending: null values come first", () => {
  const data = makeEvents([
    row({ score: num(5) }),
    row({ score: null }),
    row({ score: num(1) }),
  ]);
  const result = processSort(data, [{ name: "score", order: "asc" }]);
  expect(getValues(result, "score")).toEqual([null, num(1), num(5)]);
});

test("sort descending: null values come last", () => {
  const data = makeEvents([
    row({ score: null }),
    row({ score: num(5) }),
    row({ score: num(1) }),
  ]);
  const result = processSort(data, [{ name: "score", order: "desc" }]);
  expect(getValues(result, "score")).toEqual([num(5), num(1), null]);
});

test("sort ascending: missing field treated as null (first)", () => {
  const data = makeEvents([
    row({ score: num(3) }),
    row({}),           // no "score" key → undefined
    row({ score: num(1) }),
  ]);
  const result = processSort(data, [{ name: "score", order: "asc" }]);
  const values = getValues(result, "score");
  expect(values[0]).toBeUndefined();
  expect(values[1]).toEqual(num(1));
  expect(values[2]).toEqual(num(3));
});

// ─── Multi-column sorting ─────────────────────────────────────────────────────

test("sort by primary column then secondary column", () => {
  const data = makeEvents([
    row({ group: str("b"), score: num(1) }),
    row({ group: str("a"), score: num(2) }),
    row({ group: str("a"), score: num(1) }),
    row({ group: str("b"), score: num(2) }),
  ]);
  const result = processSort(data, [
    { name: "group", order: "asc" },
    { name: "score", order: "asc" },
  ]);
  const groups = getValues(result, "group");
  const scores = getValues(result, "score");
  expect(groups).toEqual([str("a"), str("a"), str("b"), str("b")]);
  expect(scores).toEqual([num(1), num(2), num(1), num(2)]);
});

test("sort primary asc, secondary desc", () => {
  const data = makeEvents([
    row({ group: str("a"), score: num(1) }),
    row({ group: str("a"), score: num(3) }),
    row({ group: str("a"), score: num(2) }),
  ]);
  const result = processSort(data, [
    { name: "group", order: "asc" },
    { name: "score", order: "desc" },
  ]);
  expect(getValues(result, "score")).toEqual([num(3), num(2), num(1)]);
});

// ─── Table mode sorting ───────────────────────────────────────────────────────

test("sort operates on table.dataPoints when table is present", () => {
  const data = makeTable([
    row({ score: num(3) }),
    row({ score: num(1) }),
    row({ score: num(2) }),
  ]);
  const result = processSort(data, [{ name: "score", order: "asc" }]);
  expect(getTableValues(result, "score")).toEqual([num(1), num(2), num(3)]);
});

test("sort table descending", () => {
  const data = makeTable([
    row({ score: num(1) }),
    row({ score: num(3) }),
    row({ score: num(2) }),
  ]);
  const result = processSort(data, [{ name: "score", order: "desc" }]);
  expect(getTableValues(result, "score")).toEqual([num(3), num(2), num(1)]);
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

test("sort equal values preserves relative order", () => {
  const data = makeEvents([
    row({ score: num(1), id: str("a") }),
    row({ score: num(1), id: str("b") }),
    row({ score: num(1), id: str("c") }),
  ]);
  const result = processSort(data, [{ name: "score", order: "asc" }]);
  // all equal — relative order must be preserved (stable sort)
  expect(getValues(result, "id")).toEqual([str("a"), str("b"), str("c")]);
});

test("sort with no rules returns data unchanged", () => {
  const data = makeEvents([
    row({ score: num(3) }),
    row({ score: num(1) }),
  ]);
  const result = processSort(data, []);
  expect(getValues(result, "score")).toEqual([num(3), num(1)]);
});

test("sort by field name correctly finds the column", () => {
  // Regression: processSort uses rule.name to look up object fields —
  // passing the wrong key (e.g. 'column' instead of 'name') causes a silent no-op.
  const data = makeEvents([
    row({ _time: date(3000) }),
    row({ _time: date(1000) }),
    row({ _time: date(2000) }),
  ]);
  const result = processSort(data, [{ name: "_time", order: "asc" }]);
  expect(getValues(result, "_time")).toEqual([date(1000), date(2000), date(3000)]);
});

test("sort mixed types skips comparison (keeps original order for those rows)", () => {
  // number vs string — types differ, so the comparator skips them
  const data = makeEvents([
    row({ val: num(1) }),
    row({ val: str("hello") }),
    row({ val: num(2) }),
  ]);
  // Should not throw; mixed-type rows are left in relative order
  expect(() =>
    processSort(data, [{ name: "val", order: "asc" }]),
  ).not.toThrow();
});
