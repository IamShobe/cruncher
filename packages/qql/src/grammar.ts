/**
 * Compatibility wrapper for tests - provides Chevrotain-like API using ANTLR4
 */

import * as antlr from "antlr4ng";
import { QQLLexer as AntlrQLLexer } from "./syntax/QQLLexer";
import { QQL as AntlrQQLParser } from "./syntax/QQL";
import { ASTBuilder } from "./ASTBuilder";
import { HighlightCollector } from "./HighlightCollector";
import { SuggestionCollector } from "./SuggestionCollector";

/**
 * Test-compatible lexer wrapper
 */
export class QQLLexer {
  static tokenize(input: string) {
    const inputStream = new antlr.CharStreamImpl(input);
    const lexer = new AntlrQLLexer(inputStream);
    const tokens = lexer.getAllTokens();

    const mappedTokens = tokens
      .filter((t: antlr.Token) => t.type !== -1) // Skip EOF
      .map((t: antlr.Token) => ({
        image: t.text || "",
        tokenType: t.type,
        startOffset: t.start ?? 0,
        endOffset: (t.stop ?? 0) + 1,
        startColumn: (t as any).column ?? 0,
        endColumn: ((t as any).column ?? 0) + (t.text?.length ?? 0),
        startLine: (t as any).line ?? 1,
        endLine: (t as any).line ?? 1,
      }));

    return {
      tokens: mappedTokens,
      errors: [],
      groups: {
        singleLineComments: tokens
          .filter((t: antlr.Token) => t.channel === 1) // HIDDEN channel
          .map((t: antlr.Token) => ({
            image: t.text || "",
            startOffset: t.start ?? 0,
            endOffset: t.stop ?? 0,
            startLine: (t as any).line ?? 1,
            endLine: (t as any).line ?? 1,
          })),
      },
    };
  }
}

/**
 * Test-compatible parser wrapper
 */
export class QQLParser {
  input: any[] = [];
  public errors: any[] = [];
  private highlightData: any[] = [];
  private suggestionData: any[] = [];

  query() {
    if (!this.input || this.input.length === 0) {
      throw new Error("No input provided to parser");
    }

    // Create a mock token source
    const mockTokenSource = {
      getInputStream: () => ({ getText: () => "" }),
      getSourceName: () => "input",
      getAllTokens: () => this.input,
      nextToken: () => this.input.shift(),
    };

    const tokenStream = new antlr.CommonTokenStream(mockTokenSource as any);
    (tokenStream as any)._tokens = this.input;

    const parser = new AntlrQQLParser(tokenStream);
    parser.removeErrorListeners();

    const errorListener = {
      syntaxError: (
        recognizer: any,
        offendingSymbol: any,
        line: number,
        column: number,
        msg: string,
        e: any,
      ) => {
        this.errors.push({
          message: msg,
          line,
          column,
        });
      },
    };

    parser.addErrorListener(errorListener as any);

    const parseTree = parser.query();

    // Build AST
    const astBuilder = new ASTBuilder();
    const ast = astBuilder.visit(parseTree);

    // Collect highlights
    const highlightCollector = new HighlightCollector();
    highlightCollector.visit(parseTree);
    this.highlightData = highlightCollector.getHighlightData();

    // Collect suggestions
    const suggestionCollector = new SuggestionCollector();
    suggestionCollector.visit(parseTree);
    this.suggestionData = suggestionCollector.getSuggestionData();

    return ast;
  }

  getHighlightData() {
    return this.highlightData;
  }

  getSuggestionData() {
    return this.suggestionData;
  }

  highlightComment(token: any) {
    this.highlightData.push({
      type: "comment",
      token: {
        startOffset: token.startOffset,
        endOffset: token.endOffset,
      },
    });
  }
}

export { isNumeric } from "./helpers";
export type {
  HighlightData,
  SuggetionType,
  SuggestionData,
  ControllerIndexParam,
  Search,
  SearchLiteral,
  SearchAND,
  SearchOR,
  TableColumn,
  AggregationFunction,
  Order,
  LogicalExpression,
  AndExpression,
  OrExpression,
  UnitExpression,
  FunctionArg,
  FunctionExpression,
  InArrayExpression,
  NotExpression,
  LiteralString,
  LiteralNumber,
  LiteralFloat,
  ColumnRef,
  LiteralBoolean,
  RegexLiteral,
  FactorType,
  ComparisonExpression,
  EvalCaseThen,
  EvalFunctionArg,
  EvalCaseFunction,
  EvalIfFunction,
  EvalFunction,
  CalculateUnit,
  CalcTerm,
  CalcTermAction,
  CalcExpression,
  CalcAction,
  Datasource,
} from "./types";
