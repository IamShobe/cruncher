/**
 * ANTLR4 Visitor that builds the AST from the parse tree.
 * All node shapes match those in types.ts exactly.
 */

import { AbstractParseTreeVisitor, ParseTreeVisitor } from "antlr4ng";
import {
  parseDoubleQuotedString,
  parseSingleQuotedString,
  unquoteBacktick,
  isNumeric,
} from "./helpers";
import type { QQLParserErrorDetail } from "./types";
import type {
  AggregationFunction,
  AndExpression,
  CalcAction,
  CalcExpression,
  CalcTerm,
  CalcTermAction,
  CalculateUnit,
  ColumnRef,
  ComparisonExpression,
  ControllerIndexParam,
  Datasource,
  EvalCaseFunction,
  EvalCaseThen,
  EvalFunction,
  EvalFunctionArg,
  EvalIfFunction,
  FactorType,
  FunctionArg,
  FunctionExpression,
  InArrayExpression,
  LiteralBoolean,
  LiteralFloat,
  LiteralNumber,
  LiteralString,
  LogicalExpression,
  NotExpression,
  Order,
  OrExpression,
  RegexLiteral,
  Search,
  SearchAND,
  SearchLiteral,
  SearchOR,
  SuggestionData,
  TableColumn,
  UnitExpression,
} from "./types";
import * as Parser from "./generated/QQL";

/**
 * Helper function to convert child context to string value
 */
function getTokenText(token: any): string {
  if (!token) return "";
  if (token.getText) return token.getText();
  if (typeof token === "string") return token;
  return String(token);
}

/**
 * Extract string value from identifierOrString context
 */
function extractIdentifierValue(ctx: any): string {
  if (!ctx) return "";

  if (ctx.IDENTIFIER?.()) {
    return ctx.IDENTIFIER().getText();
  }

  const dquotString = ctx.DQUOT_STRING?.();
  if (dquotString) {
    return parseDoubleQuotedString(dquotString.getText());
  }

  const squotString = ctx.SQUOT_STRING?.();
  if (squotString) {
    return parseSingleQuotedString(squotString.getText());
  }

  return ctx.getText?.() || "";
}

export class ASTBuilder extends AbstractParseTreeVisitor<any> {
  public errors: QQLParserErrorDetail[] = [];

  defaultResult() {
    return null;
  }

  private addError(message: string, ctx?: any): void {
    const start = ctx?.start;
    this.errors.push({
      line: start?.line ?? 0,
      column: start?.column ?? 0,
      message,
      token: {
        startOffset: start?.start ?? 0,
        endOffset: start?.stop ?? undefined,
      },
    });
  }

  visitQuery = (ctx: Parser.QueryContext) => {
    const dataSources: Datasource[] = [];
    const controllerParams: ControllerIndexParam[] = [];

    // Visit all datasources
    for (const dsCtx of ctx.datasource()) {
      dataSources.push(this.visitDatasource(dsCtx));
    }

    // Visit all controller params
    for (const cpCtx of ctx.controllerParam()) {
      controllerParams.push(this.visitControllerParam(cpCtx));
    }

    // Visit search (optional — empty input has no search)
    const searchCtx = ctx.search?.();
    const search = searchCtx
      ? this.visitSearch(searchCtx)
      : { type: "search" as const, left: { type: "searchLiteral" as const, tokens: [] }, right: undefined };

    // Visit pipeline commands
    const pipeline: any[] = [];
    for (const pcCtx of ctx.pipelineCommand()) {
      const cmd = this.visitPipelineCommand(pcCtx);
      if (cmd) {
        pipeline.push(cmd);
      }
    }

    return {
      type: "query" as const,
      dataSources,
      controllerParams,
      search,
      pipeline,
    };
  };

  visitDatasource = (ctx: Parser.DatasourceContext) => {
    const text = ctx.AT_DATASOURCE().getText();
    // Remove the @ prefix
    const name = text.substring(1);
    return {
      type: "datasource" as const,
      name,
    };
  };

  visitControllerParam = (ctx: Parser.ControllerParamContext) => {
    const name = ctx.IDENTIFIER().getText();
    const operator = ctx.NOT_EQUAL?.() ? "!=" : "=";
    let value: LiteralString | RegexLiteral;
    if (ctx.literalString()) {
      value = this.visitLiteralString(ctx.literalString()!);
    } else if (ctx.regexLiteral()) {
      value = this.visitRegexLiteral(ctx.regexLiteral()!);
    } else {
      this.addError(`Expected string or regex literal after '${name}${operator}'`, ctx);
      value = { type: "string" as const, value: "" };
    }

    return {
      type: "controllerIndexParam" as const,
      name,
      value,
      operator,
    };
  };

  visitSearch = (ctx: Parser.SearchContext): Search => {
    const searchTermCtx = ctx.searchTerm();

    // Get the left side - could be a literal or a parenthesized search
    let left: SearchLiteral | Search;
    const innerSearch = searchTermCtx.search?.();
    if (innerSearch) {
      // Parenthesized search
      left = this.visitSearch(innerSearch);
    } else {
      // Search factor (literal)
      const factor = searchTermCtx.searchFactor?.();
      if (!factor) {
        this.addError("Invalid search term", searchTermCtx);
        left = { type: "searchLiteral" as const, tokens: [] };
      } else {
        left = this.visitSearchFactor(factor);
      }
    }

    const tail = ctx.searchTail?.();
    const right = tail ? this.visitSearchTail(tail) : undefined;

    return {
      type: "search" as const,
      left,
      right,
    };
  };

  visitSearchTail = (ctx: Parser.SearchTailContext): SearchAND | SearchOR => {
    if (ctx.SEARCH_AND()) {
      return {
        type: "and" as const,
        right: this.visitSearch(ctx.search()),
      };
    } else {
      return {
        type: "or" as const,
        right: this.visitSearch(ctx.search()),
      };
    }
  };

  visitSearchFactor = (ctx: Parser.SearchFactorContext): SearchLiteral => {
    const searchLiterals = ctx.searchLiteral();
    const left = this.visitSearchLiteral(searchLiterals[0]!);

    if (ctx.NOT_EQUAL?.() && searchLiterals.length > 1) {
      const right = this.visitSearchLiteral(searchLiterals[1]!);
      return {
        type: "searchLiteral" as const,
        tokens: [...left.tokens, "!=", ...right.tokens],
      };
    }

    return left;
  };

  visitSearchLiteral = (ctx: Parser.SearchLiteralContext): SearchLiteral => {
    const tokens: (string | number)[] = [];

    const ids = ctx.IDENTIFIER();
    const floats = ctx.FLOAT();
    const ints = ctx.INTEGER();
    const litStrs = ctx.literalString();

    let idIdx = 0;
    let floatIdx = 0;
    let intIdx = 0;
    let strIdx = 0;

    // Parse in order of appearance in the grammar
    for (let i = 0; i < ctx.getChildCount(); i++) {
      const child = ctx.getChild(i)!;
      if (!child) continue;

      const childText = typeof child === "object" && child !== null && "getText" in child ? (child as any).getText() : String(child);

      if (childText === "," || childText === " ") {
        continue;
      }

      // Try to match to token types
      if (ids && idIdx < ids.length && ids[idIdx].getText() === childText) {
        tokens.push(ids[idIdx].getText());
        idIdx++;
      } else if (floats && floatIdx < floats.length && floats[floatIdx].getText() === childText) {
        tokens.push(parseFloat(floats[floatIdx].getText()));
        floatIdx++;
      } else if (ints && intIdx < ints.length && ints[intIdx].getText() === childText) {
        tokens.push(parseInt(ints[intIdx].getText(), 10));
        intIdx++;
      } else if (litStrs && strIdx < litStrs.length && litStrs[strIdx].getText() === childText) {
        tokens.push(this.visitLiteralString(litStrs[strIdx]).value);
        strIdx++;
      }
    }

    return {
      type: "searchLiteral" as const,
      tokens,
    };
  };

  visitPipelineCommand = (ctx: Parser.PipelineCommandContext) => {
    if (ctx.tableCmd()) {
      return this.visitTableCmd(ctx.tableCmd()!);
    } else if (ctx.statsCmd()) {
      return this.visitStatsCmd(ctx.statsCmd()!);
    } else if (ctx.whereCmd()) {
      return this.visitWhereCmd(ctx.whereCmd()!);
    } else if (ctx.sortCmd()) {
      return this.visitSortCmd(ctx.sortCmd()!);
    } else if (ctx.evalCmd()) {
      return this.visitEvalCmd(ctx.evalCmd()!);
    } else if (ctx.regexCmd()) {
      return this.visitRegexCmd(ctx.regexCmd()!);
    } else if (ctx.timechartCmd()) {
      return this.visitTimechartCmd(ctx.timechartCmd()!);
    } else if (ctx.unpackCmd()) {
      return this.visitUnpackCmd(ctx.unpackCmd()!);
    }
    return null;
  };

  visitTableCmd = (ctx: Parser.TableCmdContext) => {
    const columns: TableColumn[] = [];
    for (const colCtx of ctx.tableColumn()) {
      columns.push(this.visitTableColumn(colCtx));
    }

    return {
      type: "table" as const,
      columns,
    };
  };

  visitTableColumn = (ctx: Parser.TableColumnContext): TableColumn => {
    const idOrStrings = ctx.identifierOrString();
    const column = extractIdentifierValue(idOrStrings[0]);
    const alias = ctx.AS() && idOrStrings.length > 1 ? extractIdentifierValue(idOrStrings[1]) : undefined;

    return {
      column,
      alias,
    };
  };

  visitStatsCmd = (ctx: Parser.StatsCmdContext) => {
    const aggregationFunctions: AggregationFunction[] = [];
    for (const aggCtx of ctx.aggregationFunction()) {
      aggregationFunctions.push(this.visitAggregationFunction(aggCtx));
    }

    let groupby: string[] | undefined;
    const groupbyCtx = ctx.groupby?.();
    if (groupbyCtx) {
      groupby = this.visitGroupby(groupbyCtx);
    }

    return {
      type: "stats" as const,
      aggregationFunctions,
      groupby,
    };
  };

  visitAggregationFunction = (ctx: Parser.AggregationFunctionContext): AggregationFunction => {
    const idOrStrings = ctx.identifierOrString();
    const functionName = extractIdentifierValue(idOrStrings[0]);
    const hasParens = !!ctx.LPAREN?.();
    const hasAs = !!ctx.AS?.();

    let columnName: string | undefined;
    let alias: string | undefined;

    if (hasParens && hasAs) {
      if (idOrStrings.length > 2) {
        // e.g. count(col) as alias — idOrStrings: [func, col, alias]
        columnName = extractIdentifierValue(idOrStrings[1]);
        alias = extractIdentifierValue(idOrStrings[2]);
      } else {
        // e.g. count() as alias — idOrStrings: [func, alias]
        alias = idOrStrings.length > 1 ? extractIdentifierValue(idOrStrings[1]) : undefined;
      }
    } else if (hasParens) {
      // e.g. count(col) — idOrStrings: [func, col?]
      columnName = idOrStrings.length > 1 ? extractIdentifierValue(idOrStrings[1]) : undefined;
    } else if (hasAs) {
      // e.g. count as alias — idOrStrings: [func, alias]
      alias = idOrStrings.length > 1 ? extractIdentifierValue(idOrStrings[1]) : undefined;
    }

    return {
      function: functionName,
      column: columnName,
      alias,
    };
  };

  visitGroupby = (ctx: Parser.GroupbyContext): string[] => {
    const idOrStrings = ctx.identifierOrString?.();
    if (!idOrStrings) return [];
    return idOrStrings.map((idOrStr: any) => extractIdentifierValue(idOrStr));
  };

  visitWhereCmd = (ctx: Parser.WhereCmdContext) => {
    const expression = this.visitLogicalExpression(ctx.logicalExpression());

    return {
      type: "where" as const,
      expression,
    };
  };

  visitSortCmd = (ctx: Parser.SortCmdContext) => {
    const columns: { column: string; order: Order }[] = [];
    for (const colCtx of ctx.sortColumn()) {
      columns.push(this.visitSortColumn(colCtx));
    }

    return {
      type: "sort" as const,
      columns,
    };
  };

  visitSortColumn = (ctx: Parser.SortColumnContext): { column: string; order: Order } => {
    const column = extractIdentifierValue(ctx.identifierOrString());
    let order: Order = "asc";

    if (ctx.DESC()) {
      order = "desc";
    } else if (ctx.ASC()) {
      order = "asc";
    }

    return { column, order };
  };

  visitEvalCmd = (ctx: Parser.EvalCmdContext) => {
    const exprCtx = ctx.evalExpression();
    if (!exprCtx) {
      return { type: "eval" as const, variableName: "", expression: null as any };
    }
    const variableName = extractIdentifierValue(exprCtx.identifierOrString());
    const evalFuncArgCtx = exprCtx.evalFunctionArg();
    if (!evalFuncArgCtx) {
      return { type: "eval" as const, variableName, expression: null as any };
    }
    const expression = this.visitEvalFunctionArg(evalFuncArgCtx);

    return {
      type: "eval" as const,
      variableName,
      expression,
    };
  };

  visitRegexCmd = (ctx: Parser.RegexCmdContext) => {
    // Syntax: REGEX (FIELD EQUAL identifierOrString)? regexLiteral
    const identCtx = ctx.identifierOrString();
    const columnSelected = identCtx ? extractIdentifierValue(identCtx) : undefined;
    const regexLiteralCtx = ctx.regexLiteral();
    if (!regexLiteralCtx) {
      return { type: "regex" as const, columnSelected, pattern: null as any };
    }
    const pattern = this.visitRegexLiteral(regexLiteralCtx);
    return { type: "regex" as const, columnSelected, pattern };
  };

  visitTimechartCmd = (ctx: Parser.TimechartCmdContext) => {
    const aggregationFunctions: AggregationFunction[] = [];
    const aggFuncs = ctx.aggregationFunction();
    if (aggFuncs) {
      for (const aggCtx of aggFuncs) {
        aggregationFunctions.push(this.visitAggregationFunction(aggCtx));
      }
    }

    const params: any = {};
    const paramContexts = ctx.timechartParams();
    if (paramContexts) {
      for (const pCtx of paramContexts) {
        const param = this.visitTimechartParams(pCtx);
        Object.assign(params, param);
      }
    }

    let groupby: string[] | undefined;
    const groupbyCtx = ctx.groupby?.();
    if (groupbyCtx) {
      groupby = this.visitGroupby(groupbyCtx);
    }

    return {
      type: "timechart" as const,
      aggregationFunctions,
      params,
      groupby,
    };
  };

  visitTimechartParams = (ctx: Parser.TimechartParamsContext) => {
    if (ctx.SPAN()) {
      return {
        span: extractIdentifierValue(ctx.identifierOrString()),
      };
    } else if (ctx.TIMECOL()) {
      return {
        timeCol: extractIdentifierValue(ctx.identifierOrString()),
      };
    } else if (ctx.MAXGROUPS()) {
      return {
        maxGroups: parseInt(ctx.INTEGER?.()?.getText?.() || "0", 10),
      };
    }
    return {};
  };

  visitUnpackCmd = (ctx: Parser.UnpackCmdContext) => {
    const field = extractIdentifierValue(ctx.identifierOrString());

    return {
      type: "unpack" as const,
      field,
    };
  };

  // ==================== EXPRESSION RULES ====================

  visitLogicalExpression = (ctx: Parser.LogicalExpressionContext): LogicalExpression => {
    const left = this.visitUnitExpression(ctx.unitExpression());
    const tails = ctx.logicalTail();

    let right: AndExpression | OrExpression | undefined;
    if (tails && tails.length > 0) {
      // Process tails in order - last one takes precedence
      for (let i = 0; i < tails.length; i++) {
        right = this.visitLogicalTail(tails[i]) as any;
      }
    }

    return {
      type: "logicalExpression" as const,
      left,
      right,
    };
  };

  visitLogicalTail = (ctx: Parser.LogicalTailContext): AndExpression | OrExpression => {
    const right = this.visitLogicalExpression(ctx.logicalExpression());

    if (ctx.AND()) {
      return {
        type: "andExpression" as const,
        right,
      };
    } else {
      return {
        type: "orExpression" as const,
        right,
      };
    }
  };

  visitUnitExpression = (ctx: Parser.UnitExpressionContext): UnitExpression => {
    const value = this.visitUnitExpressionValue(ctx);

    return {
      type: "unitExpression" as const,
      value,
    };
  };

  private visitUnitExpressionValue = (ctx: Parser.UnitExpressionContext) => {
    if (ctx.inArrayExpression()) {
      return this.visitInArrayExpression(ctx.inArrayExpression()!);
    } else if (ctx.comparisonExpression()) {
      return this.visitComparisonExpression(ctx.comparisonExpression()!);
    } else if (ctx.notExpression()) {
      return this.visitNotExpression(ctx.notExpression()!);
    } else if (ctx.functionExpression()) {
      return this.visitFunctionExpression(ctx.functionExpression()!);
    } else if (ctx.logicalExpression()) {
      // If it's a parenthesized logical expression, visit it directly
      return this.visitLogicalExpression(ctx.logicalExpression()!);
    }
    this.addError("Unknown unit expression type", ctx);
    return { type: "comparisonExpression" as const, left: { type: "columnRef" as const, columnName: "" }, operator: "==", right: { type: "columnRef" as const, columnName: "" } };
  };

  visitNotExpression = (ctx: Parser.NotExpressionContext): NotExpression => {
    const expression = this.visitUnitExpression(ctx.unitExpression());

    return {
      type: "notExpression" as const,
      expression,
    };
  };

  visitInArrayExpression = (ctx: Parser.InArrayExpressionContext): InArrayExpression => {
    const left = this.visitFactor(ctx.factor(0)!);
    const right: FactorType[] = [];

    const factors = ctx.factor();
    for (let i = 1; i < factors.length; i++) {
      right.push(this.visitFactor(factors[i]));
    }

    return {
      type: "inArrayExpression" as const,
      left: left as FactorType,
      right,
    };
  };

  visitComparisonExpression = (ctx: Parser.ComparisonExpressionContext): ComparisonExpression => {
    const left = this.visitFactor(ctx.factor(0)!);
    const right = this.visitFactor(ctx.factor(1)!);

    let operator = "==";
    if (ctx.EQUAL_EQUAL()) operator = "==";
    else if (ctx.NOT_EQUAL()) operator = "!=";
    else if (ctx.GREATER_EQUAL()) operator = ">=";
    else if (ctx.LESS_EQUAL()) operator = "<=";
    else if (ctx.GREATER_THAN()) operator = ">";
    else if (ctx.LESS_THAN()) operator = "<";

    return {
      type: "comparisonExpression" as const,
      left: left as FactorType,
      operator,
      right: right as FactorType,
    };
  };

  visitFunctionExpression = (ctx: Parser.FunctionExpressionContext): FunctionExpression => {
    const functionName = ctx.IDENTIFIER().getText();
    const args: FunctionArg[] = [];

    if (ctx.functionArgs()) {
      for (const argCtx of ctx.functionArgs()!.functionArg()) {
        args.push(this.visitFunctionArg(argCtx));
      }
    }

    return {
      type: "functionExpression" as const,
      functionName,
      args,
    };
  };

  visitFunctionArg = (ctx: Parser.FunctionArgContext): FunctionArg => {
    if (ctx.factor()) {
      return this.visitFactor(ctx.factor()!);
    } else if (ctx.regexLiteral()) {
      return this.visitRegexLiteral(ctx.regexLiteral()!);
    } else if (ctx.logicalExpression()) {
      return this.visitLogicalExpression(ctx.logicalExpression()!);
    } else if (ctx.functionExpression()) {
      return this.visitFunctionExpression(ctx.functionExpression()!);
    }
    this.addError("Unknown function argument type", ctx);
    return { type: "columnRef" as const, columnName: "" };
  };

  visitEvalFunctionArg = (ctx: Parser.EvalFunctionArgContext): EvalFunctionArg => {
    if (ctx.evalFunction()) {
      return this.visitEvalFunction(ctx.evalFunction()!);
    } else if (ctx.functionExpression()) {
      return this.visitFunctionExpression(ctx.functionExpression()!);
    } else if (ctx.logicalExpression()) {
      return this.visitLogicalExpression(ctx.logicalExpression()!);
    } else if (ctx.calcExpression()) {
      return this.visitCalcExpression(ctx.calcExpression()!);
    }
    this.addError("Unknown eval function argument type", ctx);
    return { type: "columnRef" as const, columnName: "" };
  };

  visitEvalFunction = (ctx: Parser.EvalFunctionContext): EvalFunction => {
    if (ctx.IF()) {
      const condition = this.visitLogicalExpression(ctx.logicalExpression()!);
      const args = ctx.evalFunctionArg();
      const then = this.visitEvalFunctionArg(args[0]!);
      const els = args.length > 1 ? this.visitEvalFunctionArg(args[1]!) : undefined;

      return {
        type: "functionExpression",
        functionName: "if",
        condition,
        then,
        else: els,
      } as EvalIfFunction;
    } else if (ctx.CASE()) {
      const caseThenCtx = ctx.caseThen()!;
      const caseThen = this.visitCaseThen(caseThenCtx);
      const evalArgs = ctx.evalFunctionArg();
      const elseCase = evalArgs.length > 0 ? this.visitEvalFunctionArg(evalArgs[0]!) : undefined;

      return {
        type: "functionExpression",
        functionName: "case",
        cases: [caseThen],
        elseCase,
      } as EvalCaseFunction;
    }
    this.addError("Unknown eval function type", ctx);
    return { type: "functionExpression" as const, functionName: "if", condition: { type: "logicalExpression" as const, left: { type: "unitExpression" as const, value: { type: "comparisonExpression" as const, left: { type: "columnRef" as const, columnName: "" }, operator: "==", right: { type: "columnRef" as const, columnName: "" } } }, right: undefined }, then: { type: "columnRef" as const, columnName: "" }, else: undefined } as EvalIfFunction;
  };

  visitCaseThen = (ctx: Parser.CaseThenContext): EvalCaseThen => {
    const expression = this.visitLogicalExpression(ctx.logicalExpression());
    const truethy = this.visitEvalFunctionArg(ctx.evalFunctionArg());

    return {
      type: "functionExpression",
      functionName: "caseThen",
      expression,
      truethy,
    };
  };

  visitCalcExpression = (ctx: Parser.CalcExpressionContext): CalcExpression => {
    const left = this.visitCalcTerm(ctx.calcTerm());
    const tail: CalcAction[] = [];

    for (const actionCtx of ctx.calcAction()) {
      tail.push(this.visitCalcAction(actionCtx));
    }

    return {
      type: "calcExpression" as const,
      left,
      tail: tail.length > 0 ? tail : undefined,
    };
  };

  visitCalcAction = (ctx: Parser.CalcActionContext): CalcAction => {
    const right = this.visitCalcTerm(ctx.calcTerm());
    const operator = ctx.PLUS() ? "+" : "-";

    return {
      type: "calcAction" as const,
      operator,
      right,
    };
  };

  visitCalcTerm = (ctx: Parser.CalcTermContext): CalcTerm => {
    const left = this.visitCalculateUnit(ctx.calculateUnit());
    const tail: CalcTermAction[] = [];

    for (const actionCtx of ctx.calcTermAction()) {
      tail.push(this.visitCalcTermAction(actionCtx));
    }

    return {
      type: "calcTerm" as const,
      left,
      tail: tail.length > 0 ? tail : undefined,
    };
  };

  visitCalcTermAction = (ctx: Parser.CalcTermActionContext): CalcTermAction => {
    const right = this.visitCalculateUnit(ctx.calculateUnit());
    const operator = ctx.MULTIPLY() ? "*" : "/";

    return {
      type: "calcTermAction" as const,
      operator,
      right,
    };
  };

  visitCalculateUnit = (ctx: Parser.CalculateUnitContext): CalculateUnit => {
    if (ctx.factor()) {
      const factor = this.visitFactor(ctx.factor()!);
      return {
        type: "calculateUnit" as const,
        value: factor,
      };
    } else if (ctx.calcExpression()) {
      const expr = this.visitCalcExpression(ctx.calcExpression()!);
      return {
        type: "calculateUnit" as const,
        value: expr,
      };
    }
    this.addError("Unknown calculate unit type", ctx);
    return { type: "calculateUnit" as const, value: { type: "columnRef" as const, columnName: "" } };
  };

  visitFactor = (ctx: Parser.FactorContext): FactorType => {
    if (ctx.literalString()) {
      return this.visitLiteralString(ctx.literalString()!);
    } else if (ctx.FLOAT()) {
      const value = parseFloat(ctx.FLOAT()!.getText());
      return {
        type: "float" as const,
        value,
      };
    } else if (ctx.INTEGER()) {
      const value = parseInt(ctx.INTEGER()!.getText(), 10);
      return {
        type: "number" as const,
        value,
      };
    } else if (ctx.IDENTIFIER()) {
      return {
        type: "columnRef" as const,
        columnName: ctx.IDENTIFIER()!.getText(),
      };
    } else if (ctx.literalBoolean()) {
      return this.visitLiteralBoolean(ctx.literalBoolean()!);
    }
    this.addError("Unknown factor type", ctx);
    return { type: "columnRef" as const, columnName: "" };
  };

  visitLiteralBoolean = (ctx: Parser.LiteralBooleanContext): LiteralBoolean => {
    return {
      type: "boolean" as const,
      value: ctx.TRUE() ? true : false,
    };
  };

  visitLiteralString = (ctx: Parser.LiteralStringContext): LiteralString => {
    let value: string;

    if (ctx.DQUOT_STRING()) {
      value = parseDoubleQuotedString(ctx.DQUOT_STRING()!.getText());
    } else if (ctx.SQUOT_STRING()) {
      value = parseSingleQuotedString(ctx.SQUOT_STRING()!.getText());
    } else {
      this.addError("Unknown string literal type", ctx);
      value = "";
    }

    return {
      type: "string" as const,
      value,
    };
  };

  visitRegexLiteral = (ctx: Parser.RegexLiteralContext): RegexLiteral => {
    const token = ctx.REGEX_PATTERN();
    if (!token) {
      this.addError("Missing regex pattern", ctx);
      return { type: "regex" as const, pattern: "" };
    }
    return {
      type: "regex" as const,
      pattern: unquoteBacktick(token.getText()),
    };
  };
}
