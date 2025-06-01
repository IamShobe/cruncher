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
}

export const parse = (input: string) => {
  const lexer = QQLLexer.tokenize(input);
  if (lexer.errors.length > 0) {
    throw new QQLLexingError("Failed to parse input", lexer.errors);
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
