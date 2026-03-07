/**
 * ANTLR4 Visitor that collects suggestion data for autocomplete.
 */

import { AbstractParseTreeVisitor, CommonTokenStream } from "antlr4ng";
import type { SuggestionData } from "./types";
import { QQLLexer } from "./syntax/QQLLexer";

const PIPELINE_KEYWORDS = ["table", "stats", "regex", "sort", "where", "timechart", "eval", "unpack"];

export class SuggestionCollector extends AbstractParseTreeVisitor<void> {
  private suggestionData: SuggestionData[] = [];
  /** Pipe positions covered by a visitPipelineCommand call */
  private coveredPipePositions = new Set<number>();

  constructor(private readonly tokenStream?: CommonTokenStream) {
    super();
  }

  getSuggestionData(): SuggestionData[] {
    // Fallback: for any PIPE token whose position wasn't covered by a
    // visitPipelineCommand call (ANTLR error recovery dropped the node),
    // inject keyword suggestions so the user still gets completions.
    if (this.tokenStream) {
      const tokens = this.tokenStream.getTokens();
      for (const tok of tokens) {
        if (tok.type === QQLLexer.PIPE) {
          const pipePos = tok.stop ?? tok.start ?? 0;
          if (!this.coveredPipePositions.has(pipePos)) {
            this.suggestionData.push({
              type: "keywords",
              keywords: PIPELINE_KEYWORDS,
              fromPosition: pipePos + 1,
              disabled: false,
            });
          }
        }
      }
    }
    return this.suggestionData.filter((s) => !s.disabled);
  }

  private addSuggestion(data: SuggestionData) {
    this.suggestionData.push(data);
  }

  /**
   * Returns the character position immediately after `ctx`.
   * Works for both TerminalNode (has .getSymbol()) and ParserRuleContext (has .stop token).
   */
  private getNextTokenPosition(ctx: any): number {
    if (!ctx) return 0;
    // TerminalNode: getSymbol() returns the Token
    if (typeof ctx.getSymbol === "function") {
      const sym = ctx.getSymbol();
      if (sym && typeof sym.stop === "number" && sym.stop >= 0) {
        return sym.stop + 1;
      }
      return 0;
    }
    // ParserRuleContext: .stop is the last Token consumed
    if (ctx.stop && typeof ctx.stop.stop === "number" && ctx.stop.stop >= 0) {
      return ctx.stop.stop + 1;
    }
    return 0;
  }

  visitQuery = (ctx: any) => {
    const datasources: any[] = ctx.datasource?.() || [];
    const controllerParams: any[] = ctx.controllerParam?.() || [];

    if (datasources.length > 0) {
      // Suggest controller params immediately after the last datasource
      const pos = this.getNextTokenPosition(datasources[datasources.length - 1]);
      this.addSuggestion({ type: "controllerParam", fromPosition: pos, disabled: false });
    } else if (controllerParams.length > 0) {
      // Already have controller params but no datasource — suggest more
      const pos = this.getNextTokenPosition(controllerParams[controllerParams.length - 1]);
      this.addSuggestion({ type: "controllerParam", fromPosition: pos, disabled: false });
    } else {
      // Nothing typed yet — invite the user to pick a data source
      this.addSuggestion({ type: "datasource", fromPosition: 0, disabled: false });
    }

    for (const ds of datasources) this.visitDatasource(ds);
    for (const cp of controllerParams) this.visitControllerParam(cp);

    const search = ctx.search?.();
    if (search) this.visitSearch(search);

    for (const pc of (ctx.pipelineCommand?.() || [])) {
      this.visitPipelineCommand(pc);
    }
  };

  visitDatasource = (_ctx: any) => {};

  visitControllerParam = (_ctx: any) => {};

  visitSearch = (ctx: any) => {
    const searchTerm = ctx.searchTerm?.();
    if (searchTerm) this.visitSearchTerm(searchTerm);
    const searchTail = ctx.searchTail?.();
    if (searchTail) this.visitSearchTail(searchTail);
  };

  visitSearchTerm = (ctx: any) => {
    const searchFactor = ctx.searchFactor?.();
    if (searchFactor) this.visitSearchFactor(searchFactor);
    const search = ctx.search?.();
    if (search) this.visitSearch(search);
  };

  visitSearchTail = (ctx: any) => {
    const search = ctx.search?.();
    if (search) this.visitSearch(search);
  };

  visitSearchFactor = (_ctx: any) => {};

  visitPipelineCommand = (ctx: any) => {
    // Record the pipe position so getSuggestionData() doesn't double-add it
    const pipeSym = ctx.PIPE?.()?.getSymbol?.();
    const pipeStop = pipeSym?.stop ?? -1;
    if (pipeStop >= 0) this.coveredPipePositions.add(pipeStop);

    const pos = pipeStop + 1;

    // Bound the suggestion to the command keyword's stop so it doesn't
    // bleed into positions where the user is typing command arguments
    const cmdKw =
      ctx.tableCmd?.()?.TABLE?.() ??
      ctx.statsCmd?.()?.STATS?.() ??
      ctx.whereCmd?.()?.WHERE?.() ??
      ctx.sortCmd?.()?.SORT?.() ??
      ctx.evalCmd?.()?.EVAL?.() ??
      ctx.regexCmd?.()?.REGEX?.() ??
      ctx.timechartCmd?.()?.TIMECHART?.() ??
      ctx.unpackCmd?.()?.UNPACK?.();
    const cmdKwStop: number | undefined = cmdKw?.getSymbol?.()?.stop;

    this.addSuggestion({
      type: "keywords",
      keywords: PIPELINE_KEYWORDS,
      fromPosition: pos,
      toPosition: cmdKwStop != null ? cmdKwStop : undefined,
      disabled: false,
    });

    if (ctx.tableCmd?.()) this.visitTableCmd(ctx.tableCmd());
    else if (ctx.statsCmd?.()) this.visitStatsCmd(ctx.statsCmd());
    else if (ctx.whereCmd?.()) this.visitWhereCmd(ctx.whereCmd());
    else if (ctx.sortCmd?.()) this.visitSortCmd(ctx.sortCmd());
    else if (ctx.evalCmd?.()) this.visitEvalCmd(ctx.evalCmd());
    else if (ctx.regexCmd?.()) this.visitRegexCmd(ctx.regexCmd());
    else if (ctx.timechartCmd?.()) this.visitTimechartCmd(ctx.timechartCmd());
    else if (ctx.unpackCmd?.()) this.visitUnpackCmd(ctx.unpackCmd());
  };

  visitTableCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.TABLE?.());
    this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
  };

  visitStatsCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.STATS?.());
    this.addSuggestion({ type: "function", fromPosition: pos, disabled: false });

    const aggFuncs: any[] = ctx.aggregationFunction?.() || [];
    for (const agg of aggFuncs) this.visitAggregationFunction(agg);

    if (ctx.BY?.()) {
      // Suggest groupby columns right after the BY keyword
      const byPos = this.getNextTokenPosition(ctx.BY?.());
      this.addSuggestion({ type: "column", fromPosition: byPos, disabled: false });
      const groupbyCtx = ctx.groupby?.();
      if (groupbyCtx) this.visitGroupby(groupbyCtx);
    } else {
      // Only suggest "by" once the last agg function is fully closed
      const lastAgg = aggFuncs.length > 0 ? aggFuncs[aggFuncs.length - 1] : null;
      if (lastAgg?.LPAREN?.() && lastAgg?.RPAREN?.()) {
        const byPos = this.getNextTokenPosition(lastAgg);
        this.addSuggestion({ type: "keywords", keywords: ["by"], fromPosition: byPos, disabled: false });
      }
    }
  };

  visitWhereCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.WHERE?.());
    this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
    this.addSuggestion({ type: "booleanFunction", fromPosition: pos, disabled: false });

    const logExpr = ctx.logicalExpression?.();
    if (logExpr) this.visitLogicalExpression(logExpr);
  };

  visitSortCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.SORT?.());
    this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
    for (const col of (ctx.sortColumn?.() || [])) this.visitSortColumn(col);
  };

  visitEvalCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.EVAL?.());
    this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
    this.visitChildren(ctx);
  };

  visitRegexCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.REGEX?.());
    this.addSuggestion({ type: "keywords", keywords: ["field="], fromPosition: pos, disabled: false });

    const eq = ctx.EQUAL?.();
    if (eq) {
      const colPos = this.getNextTokenPosition(eq);
      this.addSuggestion({ type: "column", fromPosition: colPos, disabled: false });
    }
  };

  visitTimechartCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.TIMECHART?.());
    this.addSuggestion({ type: "function", fromPosition: pos, disabled: false });

    const aggFuncs: any[] = ctx.aggregationFunction?.() || [];
    for (const agg of aggFuncs) this.visitAggregationFunction(agg);

    if (aggFuncs.length > 0) {
      const lastAgg = aggFuncs[aggFuncs.length - 1];
      // Only suggest params/by after the agg function is fully closed
      if (lastAgg?.RPAREN?.()) {
        const paramPos = this.getNextTokenPosition(lastAgg);
        this.addSuggestion({ type: "params", keywords: ["span", "timeCol", "maxGroups"], fromPosition: paramPos, disabled: false });

        if (ctx.BY?.()) {
          const byPos = this.getNextTokenPosition(ctx.BY?.());
          this.addSuggestion({ type: "column", fromPosition: byPos, disabled: false });
          const groupbyCtx = ctx.groupby?.();
          if (groupbyCtx) this.visitGroupby(groupbyCtx);
        } else {
          const params: any[] = ctx.timechartParams?.() || [];
          const last = params.length > 0 ? params[params.length - 1] : lastAgg;
          const byPos = this.getNextTokenPosition(last);
          this.addSuggestion({ type: "keywords", keywords: ["by"], fromPosition: byPos, disabled: false });
        }
      }
    }
  };

  visitUnpackCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.UNPACK?.());
    this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
  };

  visitLogicalExpression = (ctx: any) => {
    const unitExpr = ctx.unitExpression?.();
    if (unitExpr) this.visitUnitExpression(unitExpr);
    for (const tail of (ctx.logicalTail?.() || [])) this.visitLogicalTail(tail);
  };

  visitLogicalTail = (ctx: any) => {
    const logExpr = ctx.logicalExpression?.();
    if (logExpr) this.visitLogicalExpression(logExpr);
  };

  visitUnitExpression = (ctx: any) => {
    if (ctx.inArrayExpression?.()) this.visitInArrayExpression(ctx.inArrayExpression());
    else if (ctx.comparisonExpression?.()) this.visitComparisonExpression(ctx.comparisonExpression());
    else if (ctx.notExpression?.()) this.visitNotExpression(ctx.notExpression());
    else if (ctx.functionExpression?.()) this.visitFunctionExpression(ctx.functionExpression());
    else if (ctx.logicalExpression?.()) this.visitLogicalExpression(ctx.logicalExpression());
  };

  visitNotExpression = (ctx: any) => {
    const unitExpr = ctx.unitExpression?.();
    if (unitExpr) this.visitUnitExpression(unitExpr);
  };

  visitInArrayExpression = (_ctx: any) => {};

  visitComparisonExpression = (ctx: any) => {
    // After the comparison operator, suggest columns for the RHS
    const op =
      ctx.EQUAL_EQUAL?.() ??
      ctx.NOT_EQUAL?.() ??
      ctx.GREATER_EQUAL?.() ??
      ctx.LESS_EQUAL?.() ??
      ctx.GREATER_THAN?.() ??
      ctx.LESS_THAN?.();
    if (op) {
      const pos = this.getNextTokenPosition(op);
      this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
    }
  };

  visitFunctionExpression = (ctx: any) => {
    // Suggest column names as arguments to the function (not agg-function names)
    const lparen = ctx.LPAREN?.();
    if (lparen) {
      const pos = this.getNextTokenPosition(lparen);
      this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
    }
    const funcArgs = ctx.functionArgs?.();
    if (funcArgs) this.visitFunctionArgs(funcArgs);
  };

  visitFunctionArgs = (ctx: any) => {
    for (const arg of (ctx.functionArg?.() || [])) this.visitFunctionArg(arg);
  };

  visitFunctionArg = (_ctx: any) => {};

  visitEvalExpression = (ctx: any) => {
    // After the '=' sign, suggest columns and boolean functions for the RHS
    const eq = ctx.EQUAL?.();
    if (eq) {
      const pos = this.getNextTokenPosition(eq);
      this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
      this.addSuggestion({ type: "booleanFunction", fromPosition: pos, disabled: false });
    }
  };
  visitEvalFunctionArg = (_ctx: any) => {};
  visitEvalFunction = (_ctx: any) => {};
  visitCaseThen = (_ctx: any) => {};
  visitAggregationFunction = (ctx: any) => {
    const lparen = ctx.LPAREN?.();
    if (lparen) {
      const fromPos = this.getNextTokenPosition(lparen);
      // Bound to the closing paren so column suggestions disappear after ')'
      const rparenStop: number | undefined = ctx.RPAREN?.()?.getSymbol?.()?.stop;
      this.addSuggestion({ type: "column", fromPosition: fromPos, toPosition: rparenStop, disabled: false });
    }
  };
  visitGroupby = (ctx: any) => {
    // After each comma in the groupby list, suggest another column
    for (const comma of (ctx.COMMA?.() || [])) {
      const pos = this.getNextTokenPosition(comma);
      this.addSuggestion({ type: "column", fromPosition: pos, disabled: false });
    }
  };
  visitSortColumn = (ctx: any) => {
    // After the column name, suggest asc/desc if neither is present yet
    if (!ctx.ASC?.() && !ctx.DESC?.()) {
      const idCtx = ctx.identifierOrString?.();
      if (idCtx) {
        const fromPos = this.getNextTokenPosition(idCtx);
        this.addSuggestion({ type: "keywords", keywords: ["asc", "desc"], fromPosition: fromPos, disabled: false });
      }
    }
  };
  visitTableColumn = (_ctx: any) => {};
  visitTimechartParams = (_ctx: any) => {};

  visitCalcExpression = (ctx: any) => {
    const calcTerm = ctx.calcTerm?.();
    if (calcTerm) this.visitCalcTerm(calcTerm);
    for (const action of (ctx.calcAction?.() || [])) this.visitCalcAction(action);
  };

  visitCalcAction = (ctx: any) => {
    const calcTerm = ctx.calcTerm?.();
    if (calcTerm) this.visitCalcTerm(calcTerm);
  };

  visitCalcTerm = (ctx: any) => {
    const calcUnit = ctx.calculateUnit?.();
    if (calcUnit) this.visitCalculateUnit(calcUnit);
    for (const action of (ctx.calcTermAction?.() || [])) this.visitCalcTermAction(action);
  };

  visitCalcTermAction = (ctx: any) => {
    const calcUnit = ctx.calculateUnit?.();
    if (calcUnit) this.visitCalculateUnit(calcUnit);
  };

  visitCalculateUnit = (ctx: any) => {
    const factor = ctx.factor?.();
    if (factor) this.visitFactor(factor);
    else {
      const calcExpr = ctx.calcExpression?.();
      if (calcExpr) this.visitCalcExpression(calcExpr);
    }
  };

  visitFactor = (_ctx: any) => {};
  visitLiteralBoolean = (_ctx: any) => {};
  visitLiteralString = (_ctx: any) => {};
  visitRegexLiteral = (_ctx: any) => {};

  protected defaultResult(): void {
    return undefined;
  }

  protected aggregateResult(_aggregate: void, _nextResult: void): void {}
}
