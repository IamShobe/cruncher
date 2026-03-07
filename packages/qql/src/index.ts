import type { ILexingError, IRecognitionException } from "chevrotain";
import { QQLLexer, QQLParser } from "./grammar";

export class QQLLexingError extends Error {
  constructor(
    message: string,
    public errors: ILexingError[],
  ) {
    super(message);
  }
}

export class QQLParserError extends Error {
  constructor(
    message: string,
    public errors: IRecognitionException[],
  ) {
    super(message);
  }
}

export const allData = (input: string) => {
  const lexer = QQLLexer.tokenize(input);

  const parser = new QQLParser();
  parser.input = lexer.tokens;
  const response = parser.query();

  lexer.groups["singleLineComments"].forEach((comment) => {
    parser.highlightComment(comment);
  });

  return {
    ast: response,
    highlight: parser.getHighlightData(),
    suggestions: parser.getSuggestionData(),
    parserError: parser.errors,
  };
};

export const parse = (input: string) => {
  const lexer = QQLLexer.tokenize(input);
  if (lexer.errors.length > 0) {
    throw new QQLLexingError("Failed to tokenize input", lexer.errors);
  }

  const parser = new QQLParser();
  parser.input = lexer.tokens;
  const response = parser.query();
  if (parser.errors.length > 0) {
    throw new QQLParserError("Failed to parse input", parser.errors);
  }

  return response;
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
