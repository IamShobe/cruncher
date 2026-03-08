/**
 * ANTLR4 Visitor that collects highlight data for syntax highlighting.
 */

import {
  AbstractParseTreeVisitor,
  ParserRuleContext,
  TerminalNode,
} from "antlr4ng";
import type { HighlightData, HighlightType } from "./types";
import * as Parser from "./syntax/QQL";

const KEYWORDS = new Set([
  "table",
  "stats",
  "where",
  "sort",
  "eval",
  "regex",
  "timechart",
  "unpack",
  "as",
  "by",
  "span",
  "timeCol",
  "maxGroups",
  "asc",
  "desc",
  "in",
  "true",
  "false",
  "if",
  "case",
  "and",
  "or",
]);

export class HighlightCollector extends AbstractParseTreeVisitor<void> {
  private highlightData: HighlightData[] = [];

  getHighlightData(): HighlightData[] {
    return this.highlightData;
  }

  private addHighlight(
    type: HighlightType,
    startOffset: number,
    endOffset: number | undefined,
    metadata?: string,
  ) {
    this.highlightData.push({
      type,
      metadata,
      token: {
        startOffset,
        endOffset,
      },
    });
  }

  private highlightTerminal(
    terminal: TerminalNode | null | undefined,
    type: HighlightType,
    metadata?: string,
  ) {
    if (!terminal) return;
    const symbol = terminal.getSymbol();
    this.addHighlight(type, symbol.start ?? 0, symbol.stop ?? 0, metadata);
  }

  // For parser rule contexts, .start/.stop are Token objects.
  // Use .start.start and .stop.stop for character positions.
  private ctxStart(ctx: ParserRuleContext): number {
    return ctx.start?.start ?? 0;
  }

  private ctxStop(ctx: ParserRuleContext): number | undefined {
    return ctx.stop?.stop ?? undefined;
  }

  private highlightIdOrStr(ctx: Parser.IdentifierOrStringContext) {
    const start = this.ctxStart(ctx);
    const stop = this.ctxStop(ctx);
    // Skip error-recovery synthetic tokens (ANTLR4 produces stop < start for missing tokens)
    if (stop !== undefined && stop < start) return;
    const text = ctx.getText();
    const type: HighlightType = text.startsWith('"') ? "string" : "column";
    this.addHighlight(type, start, stop);
  }

  visitQuery = (ctx: Parser.QueryContext) => {
    this.visitChildren(ctx);
  };

  visitDatasource = (ctx: Parser.DatasourceContext) => {
    const term = ctx.AT_DATASOURCE();
    if (term) {
      const symbol = term.getSymbol()!;
      if (symbol) {
        this.addHighlight("datasource", symbol.start ?? 0, symbol.stop);
      }
    }
  };

  visitControllerParam = (ctx: Parser.ControllerParamContext) => {
    this.highlightTerminal(ctx.IDENTIFIER(), "param");
    this.highlightTerminal(ctx.EQUAL(), "operator");
    this.highlightTerminal(ctx.NOT_EQUAL(), "operator");
    // Highlight the value (quoted string or regex) as "index" so the editor
    // can style index names distinctly from regular string literals.
    const strCtx = ctx.literalString();
    if (strCtx) {
      const str = strCtx.DQUOT_STRING() || strCtx.SQUOT_STRING();
      if (str) {
        const sym = str.getSymbol();
        if (sym) this.addHighlight("index", sym.start ?? 0, sym.stop);
      }
      return;
    }
    const regexCtx = ctx.regexLiteral();
    if (regexCtx) {
      const pattern = regexCtx.REGEX_PATTERN();
      if (pattern) {
        const sym = pattern.getSymbol();
        if (sym) this.addHighlight("index", sym.start ?? 0, sym.stop);
      }
      return;
    }
  };

  visitSearch = (ctx: Parser.SearchContext) => {
    this.visitChildren(ctx);
  };

  visitSearchTail = (ctx: Parser.SearchTailContext) => {
    this.highlightTerminal(ctx.SEARCH_AND(), "keyword");
    this.highlightTerminal(ctx.SEARCH_OR(), "keyword");
    this.visitChildren(ctx);
  };

  visitSearchFactor = (ctx: Parser.SearchFactorContext) => {
    this.highlightTerminal(ctx.NOT_EQUAL(), "operator");
    this.visitChildren(ctx);
  };

  visitSearchLiteral = (ctx: Parser.SearchLiteralContext) => {
    for (const id of ctx.IDENTIFIER()) {
      const sym = id.getSymbol()!;
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }

    for (const float of ctx.FLOAT()) {
      const sym = float.getSymbol()!;
      if (sym) {
        this.addHighlight("number", sym.start ?? 0, sym.stop);
      }
    }

    for (const int of ctx.INTEGER()) {
      const sym = int.getSymbol()!;
      if (sym) {
        this.addHighlight("number", sym.start ?? 0, sym.stop);
      }
    }

    for (const str of ctx.literalString()) {
      this.visitLiteralString(str);
    }
  };

  visitPipelineCommand = (ctx: Parser.PipelineCommandContext) => {
    const pipe = ctx.PIPE();
    if (pipe) {
      const sym = pipe.getSymbol()!;
      if (sym) {
        this.addHighlight("pipe", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitTableCmd = (ctx: Parser.TableCmdContext) => {
    const kw = ctx.TABLE();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop, "cmd:table");
      }
    }

    this.visitChildren(ctx);
  };

  visitTableColumn = (ctx: Parser.TableColumnContext) => {
    const idOrStrs = ctx.identifierOrString();
    const asKeyword = ctx.AS();

    // Emit highlights in source order: column, AS keyword, alias
    if (idOrStrs[0]) this.highlightIdOrStr(idOrStrs[0]);
    if (asKeyword) {
      const sym = asKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }
    if (idOrStrs[1]) this.highlightIdOrStr(idOrStrs[1]);
  };

  visitStatsCmd = (ctx: Parser.StatsCmdContext) => {
    const kw = ctx.STATS();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop, "cmd:stats");
      }
    }

    this.highlightTerminal(ctx.BY(), "keyword");

    this.visitChildren(ctx);
  };

  visitAggregationFunction = (ctx: Parser.AggregationFunctionContext) => {
    const idOrStrs = ctx.identifierOrString();
    if (idOrStrs.length > 0) {
      // First identifierOrString is the function name
      this.addHighlight(
        "function",
        this.ctxStart(idOrStrs[0]),
        this.ctxStop(idOrStrs[0]),
      );
    }

    // Column argument is now inside the aggFunctionArg sub-rule
    const aggArg = ctx.aggFunctionArg?.();
    if (aggArg) {
      const argIds = aggArg.identifierOrString();
      if (argIds.length > 0) {
        // First id is the column name (or inner function name if nested)
        this.highlightIdOrStr(argIds[0]);
      }
      if (aggArg.LPAREN?.() && argIds.length > 1) {
        // Nested function: highlight the inner column arg too
        this.highlightIdOrStr(argIds[1]);
      }
    }

    const asKeyword = ctx.AS();
    if (asKeyword) {
      const sym = asKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitGroupby = (ctx: Parser.GroupbyContext) => {
    for (const idOrStr of ctx.identifierOrString()) {
      this.highlightIdOrStr(idOrStr);
    }
  };

  visitWhereCmd = (ctx: Parser.WhereCmdContext) => {
    const kw = ctx.WHERE();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop, "cmd:where");
      }
    }

    this.visitChildren(ctx);
  };

  visitSortCmd = (ctx: Parser.SortCmdContext) => {
    const kw = ctx.SORT();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop, "cmd:sort");
      }
    }

    this.visitChildren(ctx);
  };

  visitSortColumn = (ctx: Parser.SortColumnContext) => {
    this.highlightIdOrStr(ctx.identifierOrString());

    const ascKeyword = ctx.ASC();
    if (ascKeyword) {
      const sym = ascKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    const descKeyword = ctx.DESC();
    if (descKeyword) {
      const sym = descKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitEvalCmd = (ctx: Parser.EvalCmdContext) => {
    const kw = ctx.EVAL();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop, "cmd:eval");
      }
    }

    this.visitChildren(ctx);
  };

  visitEvalExpression = (ctx: Parser.EvalExpressionContext) => {
    this.highlightIdOrStr(ctx.identifierOrString());

    const eq = ctx.EQUAL();
    const sym = eq?.getSymbol();
    if (sym) {
      this.addHighlight("operator", sym.start ?? 0, sym.stop);
    }

    this.visitChildren(ctx);
  };

  visitRegexCmd = (ctx: Parser.RegexCmdContext) => {
    this.highlightTerminal(ctx.REGEX(), "keyword", "cmd:regex");
    this.highlightTerminal(ctx.FIELD(), "keyword");
    this.highlightTerminal(ctx.EQUAL(), "operator");
    const identCtx = ctx.identifierOrString();
    if (identCtx) this.highlightIdOrStr(identCtx);
    const regexLitCtx = ctx.regexLiteral();
    if (regexLitCtx) this.visitRegexLiteral(regexLitCtx);
  };

  visitTimechartCmd = (ctx: Parser.TimechartCmdContext) => {
    const kw = ctx.TIMECHART();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop, "cmd:timechart");
      }
    }

    this.highlightTerminal(ctx.BY(), "keyword");

    this.visitChildren(ctx);
  };

  visitTimechartParams = (ctx: Parser.TimechartParamsContext) => {
    const spanKeyword = ctx.SPAN();
    if (spanKeyword) {
      const sym = spanKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    const timecolKeyword = ctx.TIMECOL();
    if (timecolKeyword) {
      const sym = timecolKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    const maxgroupsKeyword = ctx.MAXGROUPS();
    if (maxgroupsKeyword) {
      const sym = maxgroupsKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    const idOrStr = ctx.identifierOrString();
    if (idOrStr) {
      this.highlightIdOrStr(idOrStr);
    }

    const intToken = ctx.INTEGER();
    if (intToken) {
      const sym = intToken.getSymbol();
      if (sym) {
        this.addHighlight("number", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitUnpackCmd = (ctx: Parser.UnpackCmdContext) => {
    this.highlightTerminal(ctx.UNPACK(), "keyword", "cmd:unpack");
    this.highlightIdOrStr(ctx.identifierOrString());
  };

  visitLogicalExpression = (ctx: Parser.LogicalExpressionContext) => {
    this.visitChildren(ctx);
  };

  visitLogicalTail = (ctx: Parser.LogicalTailContext) => {
    const andKeyword = ctx.AND();
    if (andKeyword) {
      const sym = andKeyword.getSymbol();
      if (sym) {
        this.addHighlight("operator", sym.start ?? 0, sym.stop);
      }
    } else {
      const orKeyword = ctx.OR();
      if (orKeyword) {
        const sym = orKeyword.getSymbol();
        if (sym) {
          this.addHighlight("operator", sym.start ?? 0, sym.stop);
        }
      }
    }

    this.visitChildren(ctx);
  };

  visitUnitExpression = (ctx: Parser.UnitExpressionContext) => {
    this.visitChildren(ctx);
  };

  visitNotExpression = (ctx: Parser.NotExpressionContext) => {
    if (ctx.NOT()) {
      const sym = ctx.NOT().getSymbol()!;
      if (sym) {
        this.addHighlight("operator", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitInArrayExpression = (ctx: Parser.InArrayExpressionContext) => {
    if (ctx.IN()) {
      const sym = ctx.IN().getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitComparisonExpression = (ctx: Parser.ComparisonExpressionContext) => {
    const opToken =
      ctx.EQUAL_EQUAL() ||
      ctx.NOT_EQUAL() ||
      ctx.GREATER_EQUAL() ||
      ctx.LESS_EQUAL() ||
      ctx.GREATER_THAN() ||
      ctx.LESS_THAN();

    if (opToken) {
      const sym = opToken.getSymbol()!;
      if (sym) {
        this.addHighlight("operator", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitFunctionExpression = (ctx: Parser.FunctionExpressionContext) => {
    const id = ctx.IDENTIFIER();
    if (id) {
      const sym = id.getSymbol()!;
      if (sym) {
        this.addHighlight("function", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitFunctionArg = (ctx: Parser.FunctionArgContext) => {
    this.visitChildren(ctx);
  };

  visitFunctionArgs = (ctx: Parser.FunctionArgsContext) => {
    this.visitChildren(ctx);
  };

  visitEvalFunctionArg = (ctx: Parser.EvalFunctionArgContext) => {
    this.visitChildren(ctx);
  };

  visitEvalFunction = (ctx: Parser.EvalFunctionContext) => {
    const ifKeyword = ctx.IF();
    if (ifKeyword) {
      const sym = ifKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    const caseKeyword = ctx.CASE();
    if (caseKeyword) {
      const sym = caseKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitCaseThen = (ctx: Parser.CaseThenContext) => {
    this.visitChildren(ctx);
  };

  visitCalcExpression = (ctx: Parser.CalcExpressionContext) => {
    this.visitChildren(ctx);
  };

  visitCalcAction = (ctx: Parser.CalcActionContext) => {
    const plusOp = ctx.PLUS();
    if (plusOp) {
      const sym = plusOp.getSymbol();
      if (sym) {
        this.addHighlight("operator", sym.start ?? 0, sym.stop);
      }
    } else {
      const minusOp = ctx.MINUS();
      if (minusOp) {
        const sym = minusOp.getSymbol();
        if (sym) {
          this.addHighlight("operator", sym.start ?? 0, sym.stop);
        }
      }
    }

    this.visitChildren(ctx);
  };

  visitCalcTerm = (ctx: Parser.CalcTermContext) => {
    this.visitChildren(ctx);
  };

  visitCalcTermAction = (ctx: Parser.CalcTermActionContext) => {
    const multiplyOp = ctx.MULTIPLY();
    if (multiplyOp) {
      const sym = multiplyOp.getSymbol();
      if (sym) {
        this.addHighlight("operator", sym.start ?? 0, sym.stop);
      }
    } else {
      const divideOp = ctx.DIVIDE();
      if (divideOp) {
        const sym = divideOp.getSymbol();
        if (sym) {
          this.addHighlight("operator", sym.start ?? 0, sym.stop);
        }
      }
    }

    this.visitChildren(ctx);
  };

  visitCalculateUnit = (ctx: Parser.CalculateUnitContext) => {
    this.visitChildren(ctx);
  };

  visitFactor = (ctx: Parser.FactorContext) => {
    const floatToken = ctx.FLOAT();
    if (floatToken) {
      const sym = floatToken.getSymbol();
      if (sym) this.addHighlight("number", sym.start ?? 0, sym.stop);
      return;
    }
    const intToken = ctx.INTEGER();
    if (intToken) {
      const sym = intToken.getSymbol();
      if (sym) this.addHighlight("number", sym.start ?? 0, sym.stop);
      return;
    }
    const idToken = ctx.IDENTIFIER();
    if (idToken) {
      const sym = idToken.getSymbol();
      if (sym) this.addHighlight("column", sym.start ?? 0, sym.stop);
      return;
    }
    this.visitChildren(ctx);
  };

  visitLiteralBoolean = (ctx: Parser.LiteralBooleanContext) => {
    if (ctx.TRUE() || ctx.FALSE()) {
      const sym = (ctx.TRUE() || ctx.FALSE())!.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitLiteralString = (ctx: Parser.LiteralStringContext) => {
    const str = ctx.DQUOT_STRING() || ctx.SQUOT_STRING();
    if (str) {
      const sym = str.getSymbol()!;
      if (sym) {
        this.addHighlight("string", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitRegexLiteral = (ctx: Parser.RegexLiteralContext) => {
    const token = ctx.REGEX_PATTERN();
    if (!token) return;
    const sym = token.getSymbol()!;
    if (sym) {
      this.addHighlight("regex", sym.start ?? 0, sym.stop);
    }
  };

  protected defaultResult(): void {
    return undefined;
  }
}
