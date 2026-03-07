import { expect, test } from "vitest";
import { allData } from "../index";
import type { SuggestionData } from "../types";

function getSuggestions(input: string): SuggestionData[] {
  return allData(input).suggestions;
}

function types(suggestions: SuggestionData[]) {
  return suggestions.map((s) => s.type);
}

// ─── Empty / preamble ─────────────────────────────────────────────────────────

test("empty input: suggests datasource at position 0", () => {
  const sug = getSuggestions("");
  expect(sug).toEqual([{ type: "datasource", fromPosition: 0, disabled: false }]);
});

test("@mydata: suggests controllerParam after datasource", () => {
  // @mydata is 7 chars (0-6), so fromPosition should be 7
  const sug = getSuggestions("@mydata");
  expect(types(sug)).toContain("controllerParam");
  const cp = sug.find((s) => s.type === "controllerParam")!;
  expect(cp.fromPosition).toBe(7);
});

test("controller param without datasource: still suggests controllerParam", () => {
  // index="main" is a valid controllerParam; more params may follow
  const sug = getSuggestions('index="main"');
  expect(types(sug)).toContain("controllerParam");
});

// ─── Pipeline keyword suggestions ────────────────────────────────────────────

test("| : suggests all pipeline command keywords after pipe", () => {
  const sug = getSuggestions("| ");
  const kw = sug.find((s) => s.type === "keywords") as Extract<SuggestionData, { type: "keywords" }> | undefined;
  expect(kw).toBeDefined();
  expect(kw!.keywords).toEqual(
    expect.arrayContaining(["table", "stats", "where", "sort", "eval", "regex", "timechart", "unpack"]),
  );
  // fromPosition should be right after the pipe (pos 0 stop → 1)
  expect(kw!.fromPosition).toBe(1);
});

// ─── table ────────────────────────────────────────────────────────────────────

test("| table: suggests column", () => {
  expect(types(getSuggestions("| table "))).toContain("column");
});

test("| table: column suggestion fromPosition is after TABLE keyword", () => {
  // "| table " → TABLE at 2-6 (stop=6), fromPosition should be 7
  const sug = getSuggestions("| table ");
  const col = sug.find((s) => s.type === "column")!;
  expect(col.fromPosition).toBe(7);
});

test("| table col: column suggestion still present (for next column)", () => {
  expect(types(getSuggestions("| table col "))).toContain("column");
});

// ─── stats ────────────────────────────────────────────────────────────────────

test("| stats: suggests function", () => {
  expect(types(getSuggestions("| stats "))).toContain("function");
});

test("| stats: function suggestion fromPosition is after STATS keyword", () => {
  // "| stats " → STATS at 2-6 (stop=6), fromPosition should be 7
  const sug = getSuggestions("| stats ");
  const fn = sug.find((s) => s.type === "function")!;
  expect(fn.fromPosition).toBe(7);
});

test("| stats: no 'by' keyword suggested before any agg function is typed", () => {
  const sug = getSuggestions("| stats ");
  const byKw = sug.find(
    (s) => s.type === "keywords" && (s as any).keywords?.includes("by"),
  );
  expect(byKw).toBeUndefined();
});

test("| stats count(col): suggests 'by' keyword after agg function", () => {
  // "| stats count(col) " → count(col) ends at pos 17 (')' stop=17), fromPosition=18
  const sug = getSuggestions("| stats count(col) ");
  const byKw = sug.find(
    (s) => s.type === "keywords" && (s as any).keywords?.includes("by"),
  ) as Extract<SuggestionData, { type: "keywords" }> | undefined;
  expect(byKw).toBeDefined();
  expect(byKw!.fromPosition).toBe(18);
});

test("| stats count(col) by: no 'by' keyword once BY is present", () => {
  const sug = getSuggestions("| stats count(col) by ");
  const byKw = sug.find(
    (s) => s.type === "keywords" && (s as any).keywords?.includes("by"),
  );
  expect(byKw).toBeUndefined();
});

// ─── where ────────────────────────────────────────────────────────────────────

test("| where: suggests column and booleanFunction", () => {
  const t = types(getSuggestions("| where "));
  expect(t).toContain("column");
  expect(t).toContain("booleanFunction");
});

test("| where: suggestions fromPosition is after WHERE keyword", () => {
  // "| where " → WHERE at 2-6 (stop=6), fromPosition should be 7
  const sug = getSuggestions("| where ");
  const col = sug.find((s) => s.type === "column")!;
  expect(col.fromPosition).toBe(7);
});

test("| where contains(: suggests column (for function arg), not agg function", () => {
  const sug = getSuggestions("| where contains(");
  const t = types(sug);
  expect(t).toContain("column");
  // Should NOT suggest aggregation functions inside a boolean function call
  const fn = sug.find((s) => s.type === "function");
  expect(fn).toBeUndefined();
});

// ─── sort ─────────────────────────────────────────────────────────────────────

test("| sort: suggests column", () => {
  expect(types(getSuggestions("| sort "))).toContain("column");
});

test("| sort: column fromPosition is after SORT keyword", () => {
  // "| sort " → SORT at 2-5 (stop=5), fromPosition should be 6
  const sug = getSuggestions("| sort ");
  const col = sug.find((s) => s.type === "column")!;
  expect(col.fromPosition).toBe(6);
});

// ─── eval ─────────────────────────────────────────────────────────────────────

test("| eval col =: suggests column with correct position", () => {
  // "| eval col = " → EVAL at 2-5 (stop=5), fromPosition should be 6
  const sug = getSuggestions("| eval col = ");
  expect(types(sug)).toContain("column");
  const col = sug.find((s) => s.type === "column")!;
  expect(col.fromPosition).toBe(6);
});

test("| eval: suggests column even with no expression yet", () => {
  // When eval has no expression, ANTLR error recovery may drop the pipelineCommand;
  // the engine should still suggest column names after the eval keyword.
  expect(types(getSuggestions("| eval "))).toContain("column");
});

// ─── regex ────────────────────────────────────────────────────────────────────

test("| regex: suggests 'field' keyword", () => {
  expect(types(getSuggestions("| regex "))).toContain("keywords");
  const sug = getSuggestions("| regex ");
  const kw = sug.find(
    (s) => s.type === "keywords" && (s as any).keywords?.includes("field"),
  );
  expect(kw).toBeDefined();
});

test("| regex field: suggests column after FIELD keyword", () => {
  // "| regex field " → FIELD at 8-12 (stop=12), fromPosition should be 13
  const sug = getSuggestions("| regex field ");
  expect(types(sug)).toContain("column");
  const col = sug.find((s) => s.type === "column")!;
  expect(col.fromPosition).toBe(13);
});

// ─── unpack ───────────────────────────────────────────────────────────────────

test("| unpack: suggests column", () => {
  expect(types(getSuggestions("| unpack "))).toContain("column");
});

test("| unpack: column fromPosition is after UNPACK keyword", () => {
  // "| unpack " → UNPACK at 2-7 (stop=7), fromPosition should be 8
  const sug = getSuggestions("| unpack ");
  const col = sug.find((s) => s.type === "column")!;
  expect(col.fromPosition).toBe(8);
});

// ─── Multiple pipeline commands ───────────────────────────────────────────────

test("| table col |: second pipe gives keywords at correct position", () => {
  // "| table col | " → second pipe at position 12 (stop=12), fromPosition=13
  const sug = getSuggestions("| table col | ");
  const allKw = sug.filter(
    (s) => s.type === "keywords" && (s as any).keywords?.includes("table"),
  ) as Extract<SuggestionData, { type: "keywords" }>[];
  // There should be two keyword suggestion entries — one per pipe
  expect(allKw.length).toBe(2);
  const second = allKw.find((k) => k.fromPosition > 5);
  expect(second).toBeDefined();
  expect(second!.fromPosition).toBe(13);
});

// ─── Aggregation function args ────────────────────────────────────────────────

test("| stats count(: suggests column inside function args", () => {
  // "| stats count(" → LPAREN at 13 (stop=13), fromPosition should be 14
  const sug = getSuggestions("| stats count(");
  expect(types(sug)).toContain("column");
  const col = sug.find((s) => s.type === "column" && s.fromPosition === 14);
  expect(col).toBeDefined();
});

test("| stats count(col): column suggestion is bounded by closing paren", () => {
  // "| stats count(col)" → RPAREN at 17 (stop=17), toPosition should be 17
  const sug = getSuggestions("| stats count(col)");
  const col = sug.find((s) => s.type === "column" && (s as any).fromPosition === 14);
  expect(col).toBeDefined();
  expect((col as any).toPosition).toBe(17);
});

test("| table asd t: pipeline keywords not suggested at column position", () => {
  // "| table asd t" → TABLE stops at 6, pipeline keywords toPosition=6
  // The cursor at position 12 (typing 't') is past toPosition, so no pipeline kw shown
  const sug = getSuggestions("| table asd t");
  const allPipelineKw = sug.filter(
    (s) => s.type === "keywords" && (s as any).keywords?.includes("table"),
  ) as Extract<SuggestionData, { type: "keywords" }>[];
  // There is one keywords suggestion but it has a toPosition <= 6
  expect(allPipelineKw.length).toBe(1);
  expect(allPipelineKw[0].toPosition).toBeDefined();
  expect(allPipelineKw[0].toPosition!).toBeLessThanOrEqual(6);
});
