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
import * as Parser from "./generated/QQLParser";

/**
 * Helper function to convert child context to string value
 */
function getTokenText(token: any): string {
  if (!token) return "";
  if (token.getText) return token.getText();
  if (typeof token === "string") return token;
  return String(token);
}

export class ASTBuilder extends AbstractParseTreeVisitor<any> {
  defaultResult() {
    return null;
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

    // Visit search
    const search = this.visitSearch(ctx.search());

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
    const value = ctx.literalString()
      ? this.visitLiteralString(ctx.literalString()!)
      : this.visitRegexLiteral(ctx.regexLiteral()!);

    return {
      type: "controllerIndexParam" as const,
      name,
      value: value,
      operator: "=",
    };
  };

  visitSearch = (ctx: Parser.SearchContext): Search => {
    const left = this.visitSearchFactor(ctx.searchFactor());
    const tail = ctx.searchTail();
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

    if (ctx.SEARCH_PARAM_NEQ() && searchLiterals.length > 1) {
      const right = this.visitSearchLiteral(searchLiterals[1]!);
      // For now, combine them into one literal (handles the search param != case)
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
    const ints = ctx.INTEGER();
    const litStrs = ctx.literalString();

    let idIdx = 0;
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
    const ids = ctx.IDENTIFIER();
    const column = ids[0]?.getText() || "";
    const alias = ctx.AS() && ids.length > 1 ? ids[1]?.getText() : undefined;

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
    const groupbyCtx = ctx.groupby();
    if (groupbyCtx) {
      groupby = groupbyCtx.IDENTIFIER().map(id => id.getText());
    }

    return {
      type: "stats" as const,
      aggregationFunctions,
      groupby,
    };
  };

  visitAggregationFunction = (ctx: Parser.AggregationFunctionContext): AggregationFunction => {
    const ids = ctx.IDENTIFIER();
    const functionName = ids[0]?.getText() || "";
    const columnName = ids.length > 1 ? ids[1]?.getText() : undefined;
    const alias = ctx.AS() && ids.length > 2 ? ids[2]?.getText() : undefined;

    return {
      function: functionName,
      column: columnName,
      alias,
    };
  };

  visitGroupby = (ctx: Parser.GroupbyContext): string[] => {
    return ctx.IDENTIFIER().map(id => id.getText());
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
    const column = ctx.IDENTIFIER().getText();
    let order: Order = "asc";

    if (ctx.DESC()) {
      order = "desc";
    } else if (ctx.ASC()) {
      order = "asc";
    }

    return { column, order };
  };

  visitEvalCmd = (ctx: Parser.EvalCmdContext) => {
    const expressions: { name: string; expression: EvalFunctionArg }[] = [];

    for (const exprCtx of ctx.evalExpression()) {
      expressions.push(this.visitEvalExpression(exprCtx));
    }

    return {
      type: "eval" as const,
      expressions,
    };
  };

  visitEvalExpression = (ctx: Parser.EvalExpressionContext) => {
    const name = ctx.IDENTIFIER().getText();
    const expression = this.visitEvalFunctionArg(ctx.evalFunctionArg());

    return {
      name,
      expression,
    };
  };

  visitRegexCmd = (ctx: Parser.RegexCmdContext) => {
    // Get field from children - RegexCmdContext should have REGEX, FIELD, and IDENTIFIER
    let field = "";
    for (let i = 0; i < ctx.getChildCount(); i++) {
      const child = ctx.getChild(i);
      const text = child && typeof child === "object" && "getText" in child ? (child as any).getText() : "";
      // Skip keywords
      if (text !== "regex" && text !== "field" && text && text.match(/^[a-zA-Z0-9_-]+$/)) {
        field = text;
        break;
      }
    }

    const pattern = this.visitRegexLiteral(ctx.regexLiteral());

    return {
      type: "regex" as const,
      field,
      pattern,
    };
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
    const groupbyCtx = ctx.groupby();
    if (groupbyCtx) {
      const ids = groupbyCtx.IDENTIFIER();
      if (ids) {
        groupby = ids.map(id => id.getText());
      }
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
        span: ctx.IDENTIFIER?.()?.getText?.() || "",
      };
    } else if (ctx.TIMECOL()) {
      return {
        timeCol: ctx.IDENTIFIER?.()?.getText?.() || "",
      };
    } else if (ctx.MAXGROUPS()) {
      return {
        maxGroups: parseInt(ctx.INTEGER?.()?.getText?.() || "0", 10),
      };
    }
    return {};
  };

  visitUnpackCmd = (ctx: Parser.UnpackCmdContext) => {
    const field = ctx.IDENTIFIER().getText();

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
    // Fallback - shouldn't reach here
    throw new Error("Unknown unit expression type");
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
    throw new Error("Unknown function argument type");
  };

  visitEvalFunctionArg = (ctx: Parser.EvalFunctionArgContext): EvalFunctionArg => {
    if (ctx.factor()) {
      return this.visitFactor(ctx.factor()!);
    } else if (ctx.logicalExpression()) {
      return this.visitLogicalExpression(ctx.logicalExpression()!);
    } else if (ctx.evalFunction()) {
      return this.visitEvalFunction(ctx.evalFunction()!);
    } else if (ctx.calcExpression()) {
      return this.visitCalcExpression(ctx.calcExpression()!);
    } else if (ctx.functionExpression()) {
      return this.visitFunctionExpression(ctx.functionExpression()!);
    }
    throw new Error("Unknown eval function argument type");
  };

  visitEvalFunction = (ctx: Parser.EvalFunctionContext): EvalFunction => {
    if (ctx.IF()) {
      const condition = this.visitLogicalExpression(ctx.logicalExpression()!);
      const then = this.visitEvalFunctionArg(ctx.evalFunctionArg(0)!);
      const els = ctx.evalFunctionArg(1) ? this.visitEvalFunctionArg(ctx.evalFunctionArg(1)!) : undefined;

      return {
        type: "functionExpression",
        functionName: "if",
        condition,
        then,
        else: els,
      } as EvalIfFunction;
    } else if (ctx.CASE()) {
      const cases: EvalCaseThen[] = [];
      for (const ctCtx of ctx.caseThen()) {
        cases.push(this.visitCaseThen(ctCtx));
      }

      let elseCase: EvalFunctionArg | undefined;
      const evalArgs = ctx.evalFunctionArg();
      if (evalArgs.length > cases.length) {
        elseCase = this.visitEvalFunctionArg(evalArgs[evalArgs.length - 1]);
      }

      return {
        type: "functionExpression",
        functionName: "case",
        cases,
        elseCase,
      } as EvalCaseFunction;
    }
    throw new Error("Unknown eval function type");
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
    throw new Error("Unknown calculate unit type");
  };

  visitFactor = (ctx: Parser.FactorContext): FactorType => {
    if (ctx.literalString()) {
      return this.visitLiteralString(ctx.literalString()!);
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
    throw new Error("Unknown factor type");
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
      throw new Error("Unknown string literal type");
    }

    return {
      type: "string" as const,
      value,
    };
  };

  visitRegexLiteral = (ctx: Parser.RegexLiteralContext): RegexLiteral => {
    const text = ctx.REGEX_PATTERN().getText();
    const pattern = unquoteBacktick(text);

    return {
      type: "regex" as const,
      pattern,
    };
  };
}
