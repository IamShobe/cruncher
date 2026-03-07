import * as antlr from "antlr4ng";
import { QQLLexer } from "./generated/QQLLexer";
import { QQLParser } from "./generated/QQLParser";
import { ASTBuilder } from "./ASTBuilder";
import { HighlightCollector } from "./HighlightCollector";
import { SuggestionCollector } from "./SuggestionCollector";

/**
 * Custom error types
 */
export interface QQLLexError {
  line: number;
  column: number;
  message: string;
}

export interface QQLParserErrorDetail {
  line: number;
  column: number;
  message: string;
}

export class QQLLexingError extends Error {
  constructor(
    message: string,
    public errors: QQLLexError[],
  ) {
    super(message);
  }
}

export class QQLParserError extends Error {
  constructor(
    message: string,
    public errors: QQLParserErrorDetail[],
  ) {
    super(message);
  }
}

export const allData = (input: string) => {
  const inputStream = new antlr.CharStreamImpl(input);
  const lexer = new QQLLexer(inputStream);
  const tokenStream = new antlr.CommonTokenStream(lexer);
  const parser = new QQLParser(tokenStream);

  // Collect lexer errors
  const lexerErrors: QQLLexError[] = (lexer as any).errors?.map((err: any) => ({
    line: err.line ?? 0,
    column: (err as any).charPositionInLine ?? 0,
    message: err.message ?? String(err),
  })) || [];

  // Parse
  const parseTree = parser.query();

  // Build AST
  const astBuilder = new ASTBuilder();
  const ast = astBuilder.visit(parseTree);

  // Collect highlights
  const highlightCollector = new HighlightCollector();
  highlightCollector.visit(parseTree);
  const highlight = highlightCollector.getHighlightData();

  // Collect suggestions
  const suggestionCollector = new SuggestionCollector();
  suggestionCollector.visit(parseTree);
  const suggestions = suggestionCollector.getSuggestionData();

  return {
    ast,
    highlight,
    suggestions,
    parserError: lexerErrors.length > 0 ? lexerErrors : undefined,
  };
};

export const parse = (input: string) => {
  const inputStream = new antlr.CharStreamImpl(input);
  const lexer = new QQLLexer(inputStream);

  // Check for lexing errors
  const lexErrors = (lexer as any).errors as any[] || [];
  if (lexErrors.length > 0) {
    const errors = lexErrors.map((err: any) => ({
      line: err.line ?? 0,
      column: (err as any).charPositionInLine ?? 0,
      message: err.message ?? String(err),
    }));
    throw new QQLLexingError("Failed to tokenize input", errors);
  }

  const tokenStream = new antlr.CommonTokenStream(lexer);
  const parser = new QQLParser(tokenStream);
  const parseTree = parser.query();

  // Check for parser errors
  const parseErrors = (parser as any).errors as any[] || [];
  if (parseErrors.length > 0) {
    const errors = parseErrors.map((err: any) => ({
      line: err.line ?? 0,
      column: (err as any).charPositionInLine ?? 0,
      message: err.message ?? String(err),
    }));
    throw new QQLParserError("Failed to parse input", errors);
  }

  // Build and return AST
  const astBuilder = new ASTBuilder();
  return astBuilder.visit(parseTree);
};

export type ParsedQuery = ReturnType<typeof parse>;
export type PipelineItem = ParsedQuery["pipeline"][number];

export type PipelineItemType = PipelineItem["type"];

export type NarrowedPipelineItem<T extends PipelineItemType> = Extract<
  PipelineItem,
  { type: T }
>;

export function isTableCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"table"> {
  return item.type === "table";
}

export function isStatsCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"stats"> {
  return item.type === "stats";
}

export function isWhereCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"where"> {
  return item.type === "where";
}

export function isSortCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"sort"> {
  return item.type === "sort";
}

export function isRegexCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"regex"> {
  return item.type === "regex";
}

export function isUnpackCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"unpack"> {
  return item.type === "unpack";
}

export function isEvalCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"eval"> {
  return item.type === "eval";
}

export function isTimeChartCommand(
  item: PipelineItem,
): item is NarrowedPipelineItem<"timechart"> {
  return item.type === "timechart";
}

export * from "./searchTree";
