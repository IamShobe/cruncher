/**
 * ANTLR4 Visitor that collects suggestion data for autocomplete.
 */

import { AbstractParseTreeVisitor } from "antlr4ng";
import type { SuggestionData } from "./types";

export class SuggestionCollector extends AbstractParseTreeVisitor<void> {
  private suggestionData: SuggestionData[] = [];

  getSuggestionData(): SuggestionData[] {
    return this.suggestionData.filter(s => !s.disabled);
  }

  private addSuggestion(data: SuggestionData) {
    this.suggestionData.push(data);
  }

  private getNextTokenPosition(ctx: any): number {
    // Get the approximate position after this context
    if (ctx && typeof ctx.getStop === "function") {
      const lastToken = ctx.getStop();
      if (lastToken && typeof lastToken.stop === "number") {
        return (lastToken.stop ?? 0) + 1;
      }
    }
    return 0;
  }

  visitQuery = (ctx: any) => {
    const datasources = ctx.datasource?.() || [];
    const controllerParams = ctx.controllerParam?.() || [];

    // After datasources, suggest controller params
    if (datasources.length > 0) {
      const pos = this.getNextTokenPosition(datasources[datasources.length - 1]);
      this.addSuggestion({
        type: "controllerParam",
        fromPosition: pos,
        disabled: false,
      });
    } else {
      this.addSuggestion({
        type: "datasource",
        fromPosition: 0,
        disabled: false,
      });
    }

    // Visit children
    for (const ds of datasources) {
      this.visitDatasource(ds);
    }
    for (const cp of controllerParams) {
      this.visitControllerParam(cp);
    }
    const search = ctx.search?.();
    if (search) {
      this.visitSearch(search);
    }
    for (const pc of (ctx.pipelineCommand?.() || [])) {
      this.visitPipelineCommand(pc);
    }
  };

  visitDatasource = (ctx: any) => {};

  visitControllerParam = (ctx: any) => {};

  visitSearch = (ctx: any) => {
    const searchFactor = ctx.searchFactor?.();
    if (searchFactor) {
      this.visitSearchFactor(searchFactor);
    }
    const searchTail = ctx.searchTail?.();
    if (searchTail) {
      this.visitSearchTail(searchTail);
    }
  };

  visitSearchTail = (ctx: any) => {
    const search = ctx.search?.();
    if (search) {
      this.visitSearch(search);
    }
  };

  visitSearchFactor = (ctx: any) => {};

  visitSearchLiteral = (ctx: any) => {};

  visitPipelineCommand = (ctx: any) => {
    // Suggest pipeline keywords at start of command
    const pos = (ctx.PIPE?.()?.getSymbol?.()?.stop ?? 0) + 1;
    this.addSuggestion({
      type: "keywords",
      keywords: ["table", "stats", "regex", "sort", "where", "timechart", "eval", "unpack"],
      fromPosition: pos,
      disabled: false,
    });

    // Visit specific commands
    if (ctx.tableCmd?.()) {
      this.visitTableCmd(ctx.tableCmd?.());
    } else if (ctx.statsCmd?.()) {
      this.visitStatsCmd(ctx.statsCmd?.());
    } else if (ctx.whereCmd?.()) {
      this.visitWhereCmd(ctx.whereCmd?.());
    } else if (ctx.sortCmd?.()) {
      this.visitSortCmd(ctx.sortCmd?.());
    } else if (ctx.evalCmd?.()) {
      this.visitEvalCmd(ctx.evalCmd?.());
    } else if (ctx.regexCmd?.()) {
      this.visitRegexCmd(ctx.regexCmd?.());
    } else if (ctx.timechartCmd?.()) {
      this.visitTimechartCmd(ctx.timechartCmd?.());
    } else if (ctx.unpackCmd?.()) {
      this.visitUnpackCmd(ctx.unpackCmd?.());
    }
  };

  visitTableCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.TABLE?.());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      disabled: false,
    });
  };

  visitTableColumn = (ctx: any) => {};

  visitStatsCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.STATS?.());
    this.addSuggestion({
      type: "function",
      fromPosition: pos,
      disabled: false,
    });

    // Check for "by" keyword
    if (!ctx.BY?.()) {
      const aggFuncs = ctx.aggregationFunction?.() || [];
      const lastAgg = aggFuncs[aggFuncs.length - 1];
      const byPos = this.getNextTokenPosition(lastAgg);
      this.addSuggestion({
        type: "keywords",
        keywords: ["by"],
        fromPosition: byPos,
        disabled: false,
      });
    }
  };

  visitAggregationFunction = (ctx: any) => {};

  visitGroupby = (ctx: any) => {};

  visitWhereCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.WHERE?.());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      disabled: false,
    });
    this.addSuggestion({
      type: "booleanFunction",
      fromPosition: pos,
      disabled: false,
    });

    const logExpr = ctx.logicalExpression?.();
    if (logExpr) {
      this.visitLogicalExpression(logExpr);
    }
  };

  visitSortCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.SORT?.());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      disabled: false,
    });
  };

  visitSortColumn = (ctx: any) => {};

  visitEvalCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.EVAL?.());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      disabled: false,
    });

    this.visitChildren(ctx);
  };

  visitEvalExpression = (ctx: any) => {};

  visitRegexCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.REGEX?.());
    this.addSuggestion({
      type: "keywords",
      keywords: ["field"],
      fromPosition: pos,
      disabled: false,
    });

    const fieldPos = this.getNextTokenPosition(ctx.FIELD?.());
    this.addSuggestion({
      type: "column",
      fromPosition: fieldPos,
      disabled: false,
    });
  };

  visitTimechartCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.TIMECHART?.());
    this.addSuggestion({
      type: "function",
      fromPosition: pos,
      disabled: false,
    });

    // Suggest params
    const aggFuncs = ctx.aggregationFunction?.() || [];
    const lastAgg = aggFuncs[aggFuncs.length - 1];
    const paramPos = this.getNextTokenPosition(lastAgg);
    this.addSuggestion({
      type: "params",
      keywords: ["span", "timeCol", "maxGroups"],
      fromPosition: paramPos,
      disabled: false,
    });

    // Check for "by"
    if (!ctx.BY?.()) {
      const params = ctx.timechartParams?.() || [];
      const lastParam = params[params.length - 1];
      const byPos = this.getNextTokenPosition(lastParam);
      this.addSuggestion({
        type: "keywords",
        keywords: ["by"],
        fromPosition: byPos,
        disabled: false,
      });
    }
  };

  visitTimechartParams = (ctx: any) => {};

  visitUnpackCmd = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.UNPACK?.());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      disabled: false,
    });
  };

  visitLogicalExpression = (ctx: any) => {
    const unitExpr = ctx.unitExpression?.();
    if (unitExpr) {
      this.visitUnitExpression(unitExpr);
    }
    for (const tail of (ctx.logicalTail?.() || [])) {
      this.visitLogicalTail(tail);
    }
  };

  visitLogicalTail = (ctx: any) => {
    const logExpr = ctx.logicalExpression?.();
    if (logExpr) {
      this.visitLogicalExpression(logExpr);
    }
  };

  visitUnitExpression = (ctx: any) => {
    if (ctx.inArrayExpression?.()) {
      this.visitInArrayExpression(ctx.inArrayExpression?.());
    } else if (ctx.comparisonExpression?.()) {
      this.visitComparisonExpression(ctx.comparisonExpression?.());
    } else if (ctx.notExpression?.()) {
      this.visitNotExpression(ctx.notExpression?.());
    } else if (ctx.functionExpression?.()) {
      this.visitFunctionExpression(ctx.functionExpression?.());
    } else if (ctx.logicalExpression?.()) {
      this.visitLogicalExpression(ctx.logicalExpression?.());
    }
  };

  visitNotExpression = (ctx: any) => {
    const unitExpr = ctx.unitExpression?.();
    if (unitExpr) {
      this.visitUnitExpression(unitExpr);
    }
  };

  visitInArrayExpression = (ctx: any) => {};

  visitComparisonExpression = (ctx: any) => {};

  visitFunctionExpression = (ctx: any) => {
    const pos = this.getNextTokenPosition(ctx.IDENTIFIER?.());
    this.addSuggestion({
      type: "function",
      fromPosition: pos,
      disabled: false,
    });

    const funcArgs = ctx.functionArgs?.();
    if (funcArgs) {
      this.visitFunctionArgs(funcArgs);
    }
  };

  visitFunctionArgs = (ctx: any) => {
    for (const arg of (ctx.functionArg?.() || [])) {
      this.visitFunctionArg(arg);
    }
  };

  visitFunctionArg = (ctx: any) => {};

  visitEvalFunctionArg = (ctx: any) => {};

  visitEvalFunction = (ctx: any) => {};

  visitCaseThen = (ctx: any) => {};

  visitCalcExpression = (ctx: any) => {
    const calcTerm = ctx.calcTerm?.();
    if (calcTerm) {
      this.visitCalcTerm(calcTerm);
    }
    for (const action of (ctx.calcAction?.() || [])) {
      this.visitCalcAction(action);
    }
  };

  visitCalcAction = (ctx: any) => {
    const calcTerm = ctx.calcTerm?.();
    if (calcTerm) {
      this.visitCalcTerm(calcTerm);
    }
  };

  visitCalcTerm = (ctx: any) => {
    const calcUnit = ctx.calculateUnit?.();
    if (calcUnit) {
      this.visitCalculateUnit(calcUnit);
    }
    for (const action of (ctx.calcTermAction?.() || [])) {
      this.visitCalcTermAction(action);
    }
  };

  visitCalcTermAction = (ctx: any) => {
    const calcUnit = ctx.calculateUnit?.();
    if (calcUnit) {
      this.visitCalculateUnit(calcUnit);
    }
  };

  visitCalculateUnit = (ctx: any) => {
    const factor = ctx.factor?.();
    if (factor) {
      this.visitFactor(factor);
    } else {
      const calcExpr = ctx.calcExpression?.();
      if (calcExpr) {
        this.visitCalcExpression(calcExpr);
      }
    }
  };

  visitFactor = (ctx: any) => {};

  visitLiteralBoolean = (ctx: any) => {};

  visitLiteralString = (ctx: any) => {};

  visitRegexLiteral = (ctx: any) => {};

  protected defaultResult(): void {
    return undefined;
  }

  protected aggregateResult(aggregate: void, nextResult: void): void {
    // Empty
  }
}
