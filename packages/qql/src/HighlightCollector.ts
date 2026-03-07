/**
 * ANTLR4 Visitor that collects highlight data for syntax highlighting.
 */

import { AbstractParseTreeVisitor, TerminalNode } from "antlr4ng";
import type { HighlightData } from "./types";
import * as Parser from "./generated/QQLParser";

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
  "field",
  "asc",
  "desc",
  "in",
  "true",
  "false",
  "if",
  "case",
  "else",
  "and",
  "or",
]);

export class HighlightCollector extends AbstractParseTreeVisitor<void> {
  private highlightData: HighlightData[] = [];

  getHighlightData(): HighlightData[] {
    return this.highlightData;
  }

  private addHighlight(type: string, startOffset: number, endOffset: number | undefined) {
    this.highlightData.push({
      type,
      token: {
        startOffset,
        endOffset,
      },
    });
  }

  private highlightTerminal(terminal: any, type: string) {
    if (terminal) {
      const symbol = typeof terminal.getSymbol === "function" ? terminal.getSymbol()! : null;
      if (symbol) {
        this.addHighlight(type, symbol.start ?? 0, symbol.stop ?? 0);
      }
    }
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
    const ids = (ctx as any).IDENTIFIER?.();
    if (Array.isArray(ids) && ids.length > 0) {
      this.highlightTerminal(ids[0], "identifier");
    }

    this.highlightTerminal(ctx.EQUAL?.(), "operator");

    this.visitChildren(ctx);
  };

  visitSearch = (ctx: Parser.SearchContext) => {
    this.visitChildren(ctx);
  };

  visitSearchTail = (ctx: Parser.SearchTailContext) => {
    this.highlightTerminal(ctx.SEARCH_AND?.(), "keyword");
    this.highlightTerminal(ctx.SEARCH_OR?.(), "keyword");
    this.visitChildren(ctx);
  };

  visitSearchFactor = (ctx: Parser.SearchFactorContext) => {
    this.highlightTerminal(ctx.SEARCH_PARAM_NEQ?.(), "operator");
    this.visitChildren(ctx);
  };

  visitSearchLiteral = (ctx: Parser.SearchLiteralContext) => {
    for (const id of ctx.IDENTIFIER()) {
      const sym = id.getSymbol()!;
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
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
        this.addHighlight("operator", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitTableCmd = (ctx: Parser.TableCmdContext) => {
    const kw = ctx.TABLE();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitTableColumn = (ctx: Parser.TableColumnContext) => {
    const ids = ctx.IDENTIFIER();
    if (ids && ids.length > 0) {
      const sym = ids[0].getSymbol();
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }

    const asKeyword = ctx.AS();
    if (asKeyword) {
      const sym = asKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    if (ids && ids.length > 1) {
      const sym = ids[1].getSymbol();
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitStatsCmd = (ctx: Parser.StatsCmdContext) => {
    const kw = ctx.STATS();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitAggregationFunction = (ctx: Parser.AggregationFunctionContext) => {
    const ids = ctx.IDENTIFIER();
    if (ids && ids.length > 0) {
      const sym = ids[0].getSymbol();
      if (sym) {
        this.addHighlight("function", sym.start ?? 0, sym.stop);
      }
    }

    const asKeyword = ctx.AS();
    if (asKeyword) {
      const sym = asKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    if (ids && ids.length > 1) {
      const sym = ids[1].getSymbol();
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitGroupby = (ctx: Parser.GroupbyContext) => {
    for (const id of ctx.IDENTIFIER()) {
      const sym = id.getSymbol()!;
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }
  };

  visitWhereCmd = (ctx: Parser.WhereCmdContext) => {
    const kw = ctx.WHERE();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitSortCmd = (ctx: Parser.SortCmdContext) => {
    const kw = ctx.SORT();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitSortColumn = (ctx: Parser.SortColumnContext) => {
    const id = ctx.IDENTIFIER();
    if (id) {
      const sym = id.getSymbol();
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }

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
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitEvalExpression = (ctx: Parser.EvalExpressionContext) => {
    const id = ctx.IDENTIFIER();
    if (id) {
      const sym = id.getSymbol()!;
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }

    const eq = ctx.EQUAL();
    if (eq) {
      const sym = eq.getSymbol()!;
      if (sym) {
        this.addHighlight("operator", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitRegexCmd = (ctx: Parser.RegexCmdContext) => {
    this.highlightTerminal(ctx.REGEX(), "keyword");
    this.highlightTerminal(ctx.FIELD(), "keyword");

    // Highlight identifiers
    const ids = (ctx as any).IDENTIFIER?.();
    if (Array.isArray(ids)) {
      for (const id of ids) {
        this.highlightTerminal(id, "identifier");
      }
    }

    this.visitChildren(ctx);
  };

  visitTimechartCmd = (ctx: Parser.TimechartCmdContext) => {
    const kw = ctx.TIMECHART();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

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

    const id = ctx.IDENTIFIER();
    if (id) {
      const sym = id.getSymbol();
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
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
    const kw = ctx.UNPACK();
    if (kw) {
      const sym = kw.getSymbol()!;
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    const id = ctx.IDENTIFIER();
    if (id) {
      const sym = id.getSymbol()!;
      if (sym) {
        this.addHighlight("identifier", sym.start ?? 0, sym.stop);
      }
    }
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
    const opToken = ctx.EQUAL_EQUAL() || ctx.NOT_EQUAL() || ctx.GREATER_EQUAL() ||
      ctx.LESS_EQUAL() || ctx.GREATER_THAN() || ctx.LESS_THAN();

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

    const elseKeyword = ctx.ELSE();
    if (elseKeyword) {
      const sym = elseKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

    this.visitChildren(ctx);
  };

  visitCaseThen = (ctx: Parser.CaseThenContext) => {
    const ifKeyword = ctx.IF();
    if (ifKeyword) {
      const sym = ifKeyword.getSymbol();
      if (sym) {
        this.addHighlight("keyword", sym.start ?? 0, sym.stop);
      }
    }

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
    const sym = ctx.REGEX_PATTERN().getSymbol()!;
    if (sym) {
      this.addHighlight("regex", sym.start ?? 0, sym.stop);
    }
  };

  protected defaultResult(): void {
    return undefined;
  }
}
