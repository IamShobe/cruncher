import * as antlr from "antlr4ng";
import { QQLLexer } from "./syntax/QQLLexer";
import { QQL } from "./syntax/QQL";
import { ASTBuilder } from "./ASTBuilder";
import { HighlightCollector } from "./HighlightCollector";
import { SuggestionCollector } from "./SuggestionCollector";
import type { HighlightData, QQLParserErrorDetail, SuggestionData } from "./types";

/**
 * Custom error types
 */
export interface QQLLexError {
  line: number;
  column: number;
  message: string;
  token: { startOffset: number; endOffset: number | undefined };
}

export type { QQLParserErrorDetail, LiteralFloat } from "./types";

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

export class QQLASTError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QQLASTError";
  }
}

export type AllDataResult = {
  ast: ReturnType<ASTBuilder["visit"]> | null;
  highlight: HighlightData[];
  suggestions: SuggestionData[];
  parserError: QQLParserErrorDetail[];
};

export const allData = (input: string): AllDataResult => {
  const inputStream = new antlr.CharStreamImpl(input);
  const lexer = new QQLLexer(inputStream);
  const tokenStream = new antlr.CommonTokenStream(lexer);
  const parser = new QQL(tokenStream);

  // Collect errors silently (suppress default stderr output)
  const lexerErrors: QQLLexError[] = [];
  lexer.removeErrorListeners();
  lexer.addErrorListener(makeErrorListener(lexerErrors));
  const parserErrors: QQLParserErrorDetail[] = [];
  parser.removeErrorListeners();
  parser.addErrorListener(makeErrorListener(parserErrors));

  const emptyResult = (e: unknown): AllDataResult => {
    const message = e instanceof Error ? e.message : String(e);
    return {
      ast: null,
      highlight: [],
      suggestions: [],
      parserError: [
        ...lexerErrors,
        ...parserErrors,
        {
          line: 0,
          column: 0,
          message,
          token: { startOffset: 0, endOffset: undefined },
        } satisfies QQLParserErrorDetail,
      ],
    };
  };

  // Parse
  let parseTree;
  try {
    parseTree = parser.query();
  } catch (e) {
    return emptyResult(e);
  }

  // Ensure all tokens are buffered so SuggestionCollector's fallback scan sees them
  tokenStream.fill();

  // Build AST + collect highlights/suggestions — any visitor can throw on malformed trees
  try {
    const astBuilder = new ASTBuilder();
    const ast = astBuilder.visit(parseTree);

    const highlightCollector = new HighlightCollector();
    highlightCollector.visit(parseTree);
    const visitorHighlights = highlightCollector.getHighlightData();

    // Comments are on the HIDDEN channel — not visited by the tree visitor.
    // Scan all buffered tokens and emit a "comment" highlight for each one.
    const commentHighlights: HighlightData[] = tokenStream.getTokens()
      .filter((t) => t.channel !== 0 && t.type !== antlr.Token.EOF)
      .map((t) => ({
        type: "comment" as const,
        token: {
          startOffset: t.start ?? 0,
          endOffset: t.stop ?? undefined,
        },
      }));

    const highlight = [...visitorHighlights, ...commentHighlights];

    const suggestionCollector = new SuggestionCollector(tokenStream);
    suggestionCollector.visit(parseTree);
    const suggestions = suggestionCollector.getSuggestionData();

    if (astBuilder.errors.length > 0) {
      console.warn("[QQL] AST builder errors:", astBuilder.errors);
    }

    return {
      ast,
      highlight,
      suggestions,
      parserError: [...lexerErrors, ...parserErrors, ...astBuilder.errors],
    };
  } catch (e) {
    console.error("[QQL] Unexpected error during parsing:", e);
    return emptyResult(e);
  }
};

function makeErrorListener(errors: QQLParserErrorDetail[]) {
  return {
    syntaxError(
      _recognizer: unknown,
      offendingSymbol: unknown,
      line: number,
      charPositionInLine: number,
      msg: string,
    ) {
      const sym = offendingSymbol as antlr.Token | null;
      errors.push({
        line,
        column: charPositionInLine,
        message: msg,
        token: {
          startOffset: sym?.start ?? 0,
          endOffset: sym?.stop ?? undefined,
        },
      });
    },
    reportAmbiguity() {},
    reportAttemptingFullContext() {},
    reportContextSensitivity() {},
  } as antlr.ANTLRErrorListener;
}

export const parse = (input: string) => {
  const inputStream = new antlr.CharStreamImpl(input);
  const lexer = new QQLLexer(inputStream);

  const lexErrors: QQLLexError[] = [];
  lexer.removeErrorListeners();
  lexer.addErrorListener(makeErrorListener(lexErrors));

  const tokenStream = new antlr.CommonTokenStream(lexer);
  const parser = new QQL(tokenStream);

  const parseErrors: QQLParserErrorDetail[] = [];
  parser.removeErrorListeners();
  parser.addErrorListener(makeErrorListener(parseErrors));

  const parseTree = parser.query();

  if (lexErrors.length > 0) {
    throw new QQLLexingError("Failed to tokenize input", lexErrors);
  }
  if (parseErrors.length > 0) {
    throw new QQLParserError("Failed to parse input", parseErrors);
  }

  const astBuilder = new ASTBuilder();
  const result = astBuilder.visit(parseTree);
  if (!result) {
    throw new QQLASTError("Failed to build AST");
  }
  return result;
};

export type ParsedQuery = ReturnType<typeof parse>;
export type PipelineItem = NonNullable<ParsedQuery>["pipeline"][number];

export type PipelineItemType = PipelineItem["type"];

export type NarrowedPipelineItem<T extends PipelineItemType> = Extract<
  PipelineItem,
  { type: T }
>;


export * from "./searchTree";
