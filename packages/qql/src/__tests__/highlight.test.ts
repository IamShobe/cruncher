import { expect, test } from "vitest";
import { allData } from "../index";

function getHighlights(input: string) {
  const result = allData(input);
  return result.highlight.map((h) => ({
    type: (h as any).type,
    startOffset: (h as any).token.startOffset,
    endOffset: (h as any).token.endOffset,
  }));
}

test("highlight | table asd", () => {
  expect(getHighlights("| table asd")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "column", startOffset: 8, endOffset: 10 },
  ]);
});

test("highlight | table with alias", () => {
  expect(getHighlights("| table asd as foo")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "column", startOffset: 8, endOffset: 10 },
    { type: "keyword", startOffset: 12, endOffset: 13 },
    { type: "column", startOffset: 15, endOffset: 17 },
  ]);
});

test("highlight | table multiple columns", () => {
  expect(getHighlights("| table a, b")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "column", startOffset: 8, endOffset: 8 },
    { type: "column", startOffset: 11, endOffset: 11 },
  ]);
});

test("highlight | table as (incomplete - error recovery)", () => {
  // ANTLR4 error recovery creates phantom tokens; they must not appear as highlights
  const highlights = getHighlights("| table as");
  // No highlight should have endOffset < startOffset
  for (const h of highlights) {
    if (h.endOffset !== undefined) {
      expect(h.endOffset).toBeGreaterThanOrEqual(h.startOffset);
    }
  }
  // 'as' should appear exactly once (as keyword), not also as a phantom column
  const asHighlights = highlights.filter(
    (h) => h.startOffset === 8 && h.endOffset === 9,
  );
  expect(asHighlights).toHaveLength(1);
  expect(asHighlights[0].type).toBe("keyword");
});

test("highlight offsets are plain numbers", () => {
  const highlights = getHighlights("| table asd");
  for (const h of highlights) {
    expect(typeof h.startOffset).toBe("number");
    expect(typeof h.endOffset).toBe("number");
  }
});

// ─── Search-term highlights ───────────────────────────────────────────────────

test("highlight number in search", () => {
  expect(getHighlights("42")).toEqual([
    { type: "number", startOffset: 0, endOffset: 1 },
  ]);
});

test("highlight number and identifier in search", () => {
  // visitSearchLiteral emits identifiers before integers regardless of source order
  expect(getHighlights("42 hello")).toEqual([
    { type: "identifier", startOffset: 3, endOffset: 7 },
    { type: "number", startOffset: 0, endOffset: 1 },
  ]);
});

test("highlight double-quoted string in search", () => {
  expect(getHighlights('"hello world"')).toEqual([
    { type: "string", startOffset: 0, endOffset: 12 },
  ]);
});

test("highlight single-quoted string in search", () => {
  expect(getHighlights("'foo'")).toEqual([
    { type: "string", startOffset: 0, endOffset: 4 },
  ]);
});

test("highlight datasource token", () => {
  expect(getHighlights("@mydata")).toEqual([
    { type: "datasource", startOffset: 0, endOffset: 6 },
  ]);
});

test("highlight controller param (key=value)", () => {
  expect(getHighlights("key=value")).toEqual([
    { type: "identifier", startOffset: 0, endOffset: 2 },
    { type: "operator", startOffset: 3, endOffset: 3 },
    { type: "identifier", startOffset: 4, endOffset: 8 },
  ]);
});

// ─── Sort command highlights ──────────────────────────────────────────────────

test("highlight | sort col asc", () => {
  expect(getHighlights("| sort col asc")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 5 },
    { type: "column", startOffset: 7, endOffset: 9 },
    { type: "keyword", startOffset: 11, endOffset: 13 },
  ]);
});

test("highlight | sort col desc", () => {
  expect(getHighlights("| sort col desc")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 5 },
    { type: "column", startOffset: 7, endOffset: 9 },
    { type: "keyword", startOffset: 11, endOffset: 14 },
  ]);
});

// ─── Where command highlights ─────────────────────────────────────────────────

test("highlight | where with == operator", () => {
  // operator is emitted first (explicitly), then factor children in order
  expect(getHighlights("| where x == 1")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "operator", startOffset: 10, endOffset: 11 },
    { type: "column", startOffset: 8, endOffset: 8 },
    { type: "number", startOffset: 13, endOffset: 13 },
  ]);
});

test("highlight | where with != operator", () => {
  expect(getHighlights("| where x != 2")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "operator", startOffset: 10, endOffset: 11 },
    { type: "column", startOffset: 8, endOffset: 8 },
    { type: "number", startOffset: 13, endOffset: 13 },
  ]);
});

test("highlight | where with function call (function name + string arg)", () => {
  expect(getHighlights('| where contains(x, "val")')).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "function", startOffset: 8, endOffset: 15 },
    { type: "column", startOffset: 17, endOffset: 17 },
    { type: "string", startOffset: 20, endOffset: 24 },
  ]);
});

// ─── Eval command highlights ──────────────────────────────────────────────────

test("highlight | eval x = y", () => {
  expect(getHighlights("| eval x = y")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 5 },
    { type: "column", startOffset: 7, endOffset: 7 },
    { type: "operator", startOffset: 9, endOffset: 9 },
    { type: "column", startOffset: 11, endOffset: 11 },
  ]);
});

test("highlight | eval arithmetic (+ operator)", () => {
  expect(getHighlights("| eval x = a + 1")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 5 },
    { type: "column", startOffset: 7, endOffset: 7 },
    { type: "operator", startOffset: 9, endOffset: 9 },
    { type: "column", startOffset: 11, endOffset: 11 },
    { type: "operator", startOffset: 13, endOffset: 13 },
    { type: "number", startOffset: 15, endOffset: 15 },
  ]);
});

// ─── Stats command highlights ─────────────────────────────────────────────────

test("highlight | stats by keyword", () => {
  expect(getHighlights("| stats count() by col")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "keyword", startOffset: 16, endOffset: 17 },
    { type: "function", startOffset: 8, endOffset: 12 },
    { type: "column", startOffset: 19, endOffset: 21 },
  ]);
});

test("highlight | stats with function, as, and by", () => {
  // Note: alias after AS is not highlighted (aggregationFunction only highlights function name and column arg)
  expect(getHighlights("| stats count(col) as alias by group")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "keyword", startOffset: 28, endOffset: 29 },
    { type: "function", startOffset: 8, endOffset: 12 },
    { type: "column", startOffset: 14, endOffset: 16 },
    { type: "keyword", startOffset: 19, endOffset: 20 },
    { type: "column", startOffset: 31, endOffset: 35 },
  ]);
});

// ─── Regex command highlights ─────────────────────────────────────────────────

test("highlight | regex field `pattern`", () => {
  expect(getHighlights("| regex field `pattern`")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "keyword", startOffset: 8, endOffset: 12 },
    { type: "regex", startOffset: 14, endOffset: 22 },
  ]);
});

// ─── Table with quoted column ─────────────────────────────────────────────────

test("highlight | table with double-quoted column name", () => {
  expect(getHighlights('| table "quoted col"')).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "string", startOffset: 8, endOffset: 19 },
  ]);
});

// ─── Unpack command highlights ────────────────────────────────────────────────

test("highlight | unpack col", () => {
  expect(getHighlights("| unpack col")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 7 },
    { type: "column", startOffset: 9, endOffset: 11 },
  ]);
});

// ─── timechart maxGroups highlights number ────────────────────────────────────

test("highlight | where column == number", () => {
  // Both the column reference and the integer literal must be highlighted
  expect(getHighlights("| where ads == 123")).toEqual([
    { type: "pipe", startOffset: 0, endOffset: 0 },
    { type: "keyword", startOffset: 2, endOffset: 6 },
    { type: "operator", startOffset: 12, endOffset: 13 },
    { type: "column", startOffset: 8, endOffset: 10 },
    { type: "number", startOffset: 15, endOffset: 17 },
  ]);
});

test("highlight | timechart maxGroups=5 has number token", () => {
  const highlights = getHighlights("| timechart maxGroups=5 count(col)");
  const numberHighlight = highlights.find((h) => h.type === "number");
  expect(numberHighlight).toBeDefined();
  expect(numberHighlight).toMatchObject({ type: "number", startOffset: 22, endOffset: 22 });
});
