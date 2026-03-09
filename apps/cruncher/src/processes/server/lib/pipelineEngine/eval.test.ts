import { expect, test, describe } from "vitest";
import { processEval } from "./eval";
import type { DisplayResults } from "~lib/displayTypes";
import type { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import type {
  CalcExpression,
  CalculateUnit,
  CalcTerm,
  CalcAction,
  CalcTermAction,
  EvalFunctionArg,
  EvalCaseFunction,
  EvalIfFunction,
  EvalCaseThen,
  LogicalExpression,
  ComparisonExpression,
  UnitExpression,
  FunctionExpression,
} from "@cruncher/qql/grammar";

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
const bool = (v: boolean) => ({ type: "boolean" as const, value: v });

// Build a simple number literal CalcExpression: just a number, no tail
const numCalcUnit = (v: number): CalculateUnit => ({
  type: "calculateUnit",
  value: { type: "number", value: v },
});

const colCalcUnit = (col: string): CalculateUnit => ({
  type: "calculateUnit",
  value: { type: "columnRef", columnName: col },
});

const calcTerm = (left: CalculateUnit, tail?: CalcTermAction[]): CalcTerm => ({
  type: "calcTerm",
  left,
  tail,
});

const calcExpr = (left: CalcTerm, tail?: CalcAction[]): CalcExpression => ({
  type: "calcExpression",
  left,
  tail,
});

const _simpleCalc = (v: number): CalcExpression =>
  calcExpr(calcTerm(numCalcUnit(v)));

const _colCalc = (col: string): CalcExpression =>
  calcExpr(calcTerm(colCalcUnit(col)));

const termAction = (
  operator: string,
  right: CalculateUnit,
): CalcTermAction => ({
  type: "calcTermAction",
  operator,
  right,
});

const calcAction = (operator: string, right: CalcTerm): CalcAction => ({
  type: "calcAction",
  operator,
  right,
});

// Build a simple comparison LogicalExpression
const comparison = (
  leftVal: EvalFunctionArg,
  operator: string,
  rightVal: EvalFunctionArg,
): LogicalExpression => {
  const comp: ComparisonExpression = {
    type: "comparisonExpression",
    left: leftVal as any,
    operator,
    right: rightVal as any,
  };
  const unit: UnitExpression = { type: "unitExpression", value: comp };
  return { type: "logicalExpression", left: unit, right: undefined };
};

const ifExpr = (
  cond: LogicalExpression,
  thenExpr: EvalFunctionArg,
  elseExpr?: EvalFunctionArg,
): EvalIfFunction => ({
  type: "functionExpression",
  functionName: "if",
  condition: cond,
  then: thenExpr,
  else: elseExpr,
});

const caseExpr = (
  cases: EvalCaseThen[],
  elseCase?: EvalFunctionArg,
): EvalCaseFunction => ({
  type: "functionExpression",
  functionName: "case",
  cases,
  elseCase,
});

const caseThen = (
  cond: LogicalExpression,
  truethy: EvalFunctionArg,
): EvalCaseThen => ({
  type: "functionExpression",
  functionName: "caseThen",
  expression: cond,
  truethy,
});

const fn = (
  functionName: string,
  args: EvalFunctionArg[],
): FunctionExpression => ({
  type: "functionExpression",
  functionName,
  args: args as any,
});

// ─── Literal assignment ────────────────────────────────────────────────────────

describe("literal assignment", () => {
  test("assigns a literal number", () => {
    const data = makeEvents([row({})]);
    const result = processEval(data, "x", { type: "number", value: 42 });
    expect(result.events.data[0].object["x"]).toEqual(num(42));
  });

  test("assigns a literal string", () => {
    const data = makeEvents([row({})]);
    const result = processEval(data, "label", {
      type: "string",
      value: "hello",
    });
    expect(result.events.data[0].object["label"]).toEqual(str("hello"));
  });

  test("assigns a literal boolean true", () => {
    const data = makeEvents([row({})]);
    const result = processEval(data, "flag", { type: "boolean", value: true });
    expect(result.events.data[0].object["flag"]).toEqual(bool(true));
  });

  test("assigns a literal boolean false", () => {
    const data = makeEvents([row({})]);
    const result = processEval(data, "flag", { type: "boolean", value: false });
    expect(result.events.data[0].object["flag"]).toEqual(bool(false));
  });
});

// ─── Column reference ─────────────────────────────────────────────────────────

describe("column reference", () => {
  test("copies an existing column value", () => {
    const data = makeEvents([row({ score: num(99) })]);
    const result = processEval(data, "copy", {
      type: "columnRef",
      columnName: "score",
    });
    expect(result.events.data[0].object["copy"]).toEqual(num(99));
  });

  test("returns undefined for a missing column reference", () => {
    const data = makeEvents([row({})]);
    const result = processEval(data, "copy", {
      type: "columnRef",
      columnName: "missing",
    });
    expect(result.events.data[0].object["copy"]).toBeUndefined();
  });

  test("applies to every row independently", () => {
    const data = makeEvents([
      row({ v: num(1) }),
      row({ v: num(2) }),
      row({ v: num(3) }),
    ]);
    const result = processEval(data, "dup", {
      type: "columnRef",
      columnName: "v",
    });
    expect(result.events.data.map((r) => r.object["dup"])).toEqual([
      num(1),
      num(2),
      num(3),
    ]);
  });
});

// ─── Arithmetic (calcExpression) ──────────────────────────────────────────────

describe("arithmetic - addition", () => {
  test("adds two literals: 2 + 3 = 5", () => {
    const expr = calcExpr(calcTerm(numCalcUnit(2)), [
      calcAction("+", calcTerm(numCalcUnit(3))),
    ]);
    const data = makeEvents([row({})]);
    const result = processEval(data, "result", expr);
    expect(result.events.data[0].object["result"]).toEqual(num(5));
  });

  test("adds a column to a literal: a + 10", () => {
    const expr = calcExpr(calcTerm(colCalcUnit("a")), [
      calcAction("+", calcTerm(numCalcUnit(10))),
    ]);
    const data = makeEvents([row({ a: num(5) })]);
    const result = processEval(data, "result", expr);
    expect(result.events.data[0].object["result"]).toEqual(num(15));
  });

  test("adds two columns: a + b", () => {
    const expr = calcExpr(calcTerm(colCalcUnit("a")), [
      calcAction("+", calcTerm(colCalcUnit("b"))),
    ]);
    const data = makeEvents([row({ a: num(7), b: num(3) })]);
    const result = processEval(data, "sum", expr);
    expect(result.events.data[0].object["sum"]).toEqual(num(10));
  });

  test("chains multiple additions: 1 + 2 + 3 = 6", () => {
    const expr = calcExpr(calcTerm(numCalcUnit(1)), [
      calcAction("+", calcTerm(numCalcUnit(2))),
      calcAction("+", calcTerm(numCalcUnit(3))),
    ]);
    const data = makeEvents([row({})]);
    const result = processEval(data, "total", expr);
    expect(result.events.data[0].object["total"]).toEqual(num(6));
  });
});

describe("arithmetic - subtraction", () => {
  test("subtracts two literals: 10 - 4 = 6", () => {
    const expr = calcExpr(calcTerm(numCalcUnit(10)), [
      calcAction("-", calcTerm(numCalcUnit(4))),
    ]);
    const data = makeEvents([row({})]);
    const result = processEval(data, "result", expr);
    expect(result.events.data[0].object["result"]).toEqual(num(6));
  });

  test("mixed add and subtract: 10 + 5 - 3 = 12", () => {
    const expr = calcExpr(calcTerm(numCalcUnit(10)), [
      calcAction("+", calcTerm(numCalcUnit(5))),
      calcAction("-", calcTerm(numCalcUnit(3))),
    ]);
    const data = makeEvents([row({})]);
    const result = processEval(data, "result", expr);
    expect(result.events.data[0].object["result"]).toEqual(num(12));
  });
});

describe("arithmetic - multiplication", () => {
  test("multiplies two literals: 3 * 4 = 12", () => {
    const expr = calcExpr(
      calcTerm(numCalcUnit(3), [termAction("*", numCalcUnit(4))]),
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "result", expr);
    expect(result.events.data[0].object["result"]).toEqual(num(12));
  });

  test("multiplies column by literal: rate * 100", () => {
    const expr = calcExpr(
      calcTerm(colCalcUnit("rate"), [termAction("*", numCalcUnit(100))]),
    );
    const data = makeEvents([row({ rate: num(0.5) })]);
    const result = processEval(data, "pct", expr);
    expect(result.events.data[0].object["pct"]).toEqual(num(50));
  });
});

describe("arithmetic - division", () => {
  test("divides two literals: 10 / 2 = 5", () => {
    const expr = calcExpr(
      calcTerm(numCalcUnit(10), [termAction("/", numCalcUnit(2))]),
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "result", expr);
    expect(result.events.data[0].object["result"]).toEqual(num(5));
  });
});

describe("arithmetic - operator precedence via term tail", () => {
  test("multiplication before addition: 2 + 3 * 4 = 14", () => {
    // In grammar: left term is just 2, then + right term (3 * 4)
    const mulTerm = calcTerm(numCalcUnit(3), [termAction("*", numCalcUnit(4))]);
    const expr = calcExpr(calcTerm(numCalcUnit(2)), [calcAction("+", mulTerm)]);
    const data = makeEvents([row({})]);
    const result = processEval(data, "result", expr);
    expect(result.events.data[0].object["result"]).toEqual(num(14));
  });
});

// ─── Logical expression ───────────────────────────────────────────────────────

describe("logical expression", () => {
  test("evaluates to true and stores boolean", () => {
    const expr: LogicalExpression = comparison(
      { type: "number", value: 5 },
      ">",
      { type: "number", value: 3 },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "flag", expr);
    expect(result.events.data[0].object["flag"]).toEqual(bool(true));
  });

  test("evaluates to false", () => {
    const expr: LogicalExpression = comparison(
      { type: "number", value: 1 },
      ">",
      { type: "number", value: 10 },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "flag", expr);
    expect(result.events.data[0].object["flag"]).toEqual(bool(false));
  });

  test("uses column value in comparison", () => {
    const expr: LogicalExpression = comparison(
      { type: "columnRef", columnName: "score" },
      ">=",
      { type: "number", value: 50 },
    );
    const data = makeEvents([row({ score: num(75) }), row({ score: num(25) })]);
    const result = processEval(data, "passing", expr);
    expect(result.events.data[0].object["passing"]).toEqual(bool(true));
    expect(result.events.data[1].object["passing"]).toEqual(bool(false));
  });
});

// ─── if function ──────────────────────────────────────────────────────────────

describe("if function", () => {
  test("returns then-branch when condition is true", () => {
    const expr = ifExpr(
      comparison({ type: "number", value: 1 }, "==", {
        type: "number",
        value: 1,
      }),
      { type: "string", value: "yes" },
      { type: "string", value: "no" },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "answer", expr);
    expect(result.events.data[0].object["answer"]).toEqual(str("yes"));
  });

  test("returns else-branch when condition is false", () => {
    const expr = ifExpr(
      comparison({ type: "number", value: 0 }, "==", {
        type: "number",
        value: 1,
      }),
      { type: "string", value: "yes" },
      { type: "string", value: "no" },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "answer", expr);
    expect(result.events.data[0].object["answer"]).toEqual(str("no"));
  });

  test("returns undefined when condition is false and no else branch", () => {
    const expr = ifExpr(
      comparison({ type: "number", value: 0 }, "==", {
        type: "number",
        value: 1,
      }),
      { type: "string", value: "yes" },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "answer", expr);
    expect(result.events.data[0].object["answer"]).toBeUndefined();
  });

  test("uses column in condition", () => {
    const expr = ifExpr(
      comparison({ type: "columnRef", columnName: "level" }, ">", {
        type: "number",
        value: 5,
      }),
      { type: "string", value: "high" },
      { type: "string", value: "low" },
    );
    const data = makeEvents([row({ level: num(10) }), row({ level: num(2) })]);
    const result = processEval(data, "category", expr);
    expect(result.events.data[0].object["category"]).toEqual(str("high"));
    expect(result.events.data[1].object["category"]).toEqual(str("low"));
  });
});

// ─── case function ────────────────────────────────────────────────────────────

describe("case function", () => {
  test("matches first case", () => {
    const expr = caseExpr(
      [
        caseThen(
          comparison({ type: "number", value: 1 }, "==", {
            type: "number",
            value: 1,
          }),
          { type: "string", value: "one" },
        ),
        caseThen(
          comparison({ type: "number", value: 2 }, "==", {
            type: "number",
            value: 2,
          }),
          { type: "string", value: "two" },
        ),
      ],
      { type: "string", value: "other" },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(str("one"));
  });

  test("matches second case when first fails", () => {
    const expr = caseExpr(
      [
        caseThen(
          comparison({ type: "number", value: 1 }, "==", {
            type: "number",
            value: 2,
          }),
          { type: "string", value: "first" },
        ),
        caseThen(
          comparison({ type: "number", value: 1 }, "==", {
            type: "number",
            value: 1,
          }),
          { type: "string", value: "second" },
        ),
      ],
      { type: "string", value: "else" },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(str("second"));
  });

  test("falls back to elseCase when no case matches", () => {
    const expr = caseExpr(
      [
        caseThen(
          comparison({ type: "number", value: 0 }, "==", {
            type: "number",
            value: 1,
          }),
          { type: "string", value: "never" },
        ),
      ],
      { type: "string", value: "fallback" },
    );
    const data = makeEvents([row({})]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(str("fallback"));
  });

  test("returns undefined when no case matches and no elseCase", () => {
    const expr = caseExpr([
      caseThen(
        comparison({ type: "number", value: 0 }, "==", {
          type: "number",
          value: 1,
        }),
        { type: "string", value: "never" },
      ),
    ]);
    const data = makeEvents([row({})]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toBeUndefined();
  });

  test("uses column value to pick a case", () => {
    const expr = caseExpr(
      [
        caseThen(
          comparison({ type: "columnRef", columnName: "status" }, "==", {
            type: "string",
            value: "ok",
          }),
          { type: "number", value: 1 },
        ),
        caseThen(
          comparison({ type: "columnRef", columnName: "status" }, "==", {
            type: "string",
            value: "warn",
          }),
          { type: "number", value: 2 },
        ),
      ],
      { type: "number", value: 0 },
    );
    const data = makeEvents([
      row({ status: str("ok") }),
      row({ status: str("warn") }),
      row({ status: str("err") }),
    ]);
    const result = processEval(data, "code", expr);
    expect(result.events.data[0].object["code"]).toEqual(num(1));
    expect(result.events.data[1].object["code"]).toEqual(num(2));
    expect(result.events.data[2].object["code"]).toEqual(num(0));
  });
});

// ─── String functions ─────────────────────────────────────────────────────────

describe("string functions in eval", () => {
  test("lower converts to lowercase", () => {
    const expr = fn("lower", [{ type: "columnRef", columnName: "msg" }]);
    const data = makeEvents([row({ msg: str("HELLO") })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(str("hello"));
  });

  test("upper converts to uppercase", () => {
    const expr = fn("upper", [{ type: "columnRef", columnName: "msg" }]);
    const data = makeEvents([row({ msg: str("hello") })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(str("HELLO"));
  });

  test("trim removes surrounding whitespace", () => {
    const expr = fn("trim", [{ type: "columnRef", columnName: "msg" }]);
    const data = makeEvents([row({ msg: str("  hello  ") })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(str("hello"));
  });
});

// ─── Number functions ─────────────────────────────────────────────────────────

describe("number functions in eval", () => {
  test("abs returns absolute value", () => {
    const expr = fn("abs", [{ type: "columnRef", columnName: "val" }]);
    const data = makeEvents([row({ val: num(-7) })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(num(7));
  });

  test("round rounds to nearest integer", () => {
    const expr = fn("round", [{ type: "columnRef", columnName: "val" }]);
    const data = makeEvents([row({ val: num(3.7) })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(num(4));
  });

  test("ceil rounds up", () => {
    const expr = fn("ceil", [{ type: "columnRef", columnName: "val" }]);
    const data = makeEvents([row({ val: num(3.2) })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(num(4));
  });

  test("floor rounds down", () => {
    const expr = fn("floor", [{ type: "columnRef", columnName: "val" }]);
    const data = makeEvents([row({ val: num(3.9) })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(num(3));
  });
});

// ─── Table mode ───────────────────────────────────────────────────────────────

describe("eval operates on table.dataPoints when table is present", () => {
  test("assigns literal to table rows", () => {
    const data = makeTable([row({ v: num(1) }), row({ v: num(2) })]);
    const result = processEval(data, "label", { type: "string", value: "x" });
    expect(result.table?.dataPoints[0].object["label"]).toEqual(str("x"));
    expect(result.table?.dataPoints[1].object["label"]).toEqual(str("x"));
  });

  test("does not touch events.data when table is present", () => {
    const data = makeTable([row({ v: num(1) })]);
    const result = processEval(data, "label", { type: "string", value: "x" });
    expect(result.events.data).toHaveLength(0);
  });

  test("column reference in table mode", () => {
    const data = makeTable([row({ score: num(10) })]);
    const result = processEval(
      data,
      "double",
      calcExpr(
        calcTerm(colCalcUnit("score"), [termAction("*", numCalcUnit(2))]),
      ),
    );
    expect(result.table?.dataPoints[0].object["double"]).toEqual(num(20));
  });
});

// ─── Functions with CalcExpression args ──────────────────────────────────────
// Regression: `ceil(duration_ms / 1000)` — a built-in numeric function whose
// argument is a CalcExpression (not a plain FactorType / columnRef).

describe("functions with calc expression args", () => {
  test("ceil(col / literal): ceil(duration_ms / 1000)", () => {
    const divExpr = calcExpr(
      calcTerm(colCalcUnit("duration_ms"), [
        termAction("/", numCalcUnit(1000)),
      ]),
    );
    const expr = fn("ceil", [divExpr as any]);
    const data = makeEvents([row({ duration_ms: num(5500) })]);
    const result = processEval(data, "rounded", expr);
    expect(result.events.data[0].object["rounded"]).toEqual(num(6));
  });

  test("floor(col * literal): floor(rate * 100)", () => {
    const mulExpr = calcExpr(
      calcTerm(colCalcUnit("rate"), [termAction("*", numCalcUnit(100))]),
    );
    const expr = fn("floor", [mulExpr as any]);
    const data = makeEvents([row({ rate: num(0.375) })]);
    const result = processEval(data, "pct", expr);
    expect(result.events.data[0].object["pct"]).toEqual(num(37)); // floor(37.5) = 37
  });

  test("abs(col + col): abs(a + b)", () => {
    const addExpr = calcExpr(calcTerm(colCalcUnit("a")), [
      calcAction("+", calcTerm(colCalcUnit("b"))),
    ]);
    const expr = fn("abs", [addExpr as any]);
    const data = makeEvents([row({ a: num(-3), b: num(1) })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(num(2)); // abs(-3+1) = 2
  });

  test("round(col / literal): round(val / 3)", () => {
    const divExpr = calcExpr(
      calcTerm(colCalcUnit("val"), [termAction("/", numCalcUnit(3))]),
    );
    const expr = fn("round", [divExpr as any]);
    const data = makeEvents([row({ val: num(10) })]);
    const result = processEval(data, "out", expr);
    expect(result.events.data[0].object["out"]).toEqual(num(3)); // round(10/3) = 3
  });
});

// ─── Overwrite existing column ────────────────────────────────────────────────

test("eval overwrites an existing column", () => {
  const data = makeEvents([row({ x: num(1) })]);
  const result = processEval(data, "x", { type: "number", value: 99 });
  expect(result.events.data[0].object["x"]).toEqual(num(99));
});

// ─── Empty data ───────────────────────────────────────────────────────────────

test("eval on empty dataset returns empty data unchanged", () => {
  const data = makeEvents([]);
  const result = processEval(data, "x", { type: "number", value: 42 });
  expect(result.events.data).toHaveLength(0);
});
