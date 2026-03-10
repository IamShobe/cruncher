/**
 * ANTLR4 Visitor that collects suggestion data for autocomplete.
 */

import {
  AbstractParseTreeVisitor,
  CommonTokenStream,
  ParserRuleContext,
  TerminalNode,
} from "antlr4ng";
import type { SuggestionData } from "./types";
import { QQLLexer } from "./syntax/QQLLexer";
import {
  AggregationFunctionContext,
  CalcActionContext,
  CalcExpressionContext,
  CalcTermActionContext,
  CalcTermContext,
  CalculateUnitContext,
  CaseThenContext,
  ComparisonExpressionContext,
  ControllerParamContext,
  DatasourceContext,
  EvalCmdContext,
  EvalExpressionContext,
  EvalFunctionArgContext,
  EvalFunctionContext,
  FactorContext,
  FunctionArgContext,
  FunctionArgsContext,
  FunctionExpressionContext,
  GroupbyContext,
  IdentifierOrStringContext,
  InArrayExpressionContext,
  LiteralBooleanContext,
  LiteralStringContext,
  LogicalExpressionContext,
  LogicalTailContext,
  NotExpressionContext,
  PipelineCommandContext,
  QueryContext,
  RegexCmdContext,
  RegexLiteralContext,
  SearchContext,
  SearchFactorContext,
  SearchTailContext,
  SearchTermContext,
  SortCmdContext,
  SortColumnContext,
  StatsCmdContext,
  TableCmdContext,
  TableColumnContext,
  TimechartCmdContext,
  TimechartParamsContext,
  UnpackCmdContext,
  UnitExpressionContext,
  WhereCmdContext,
} from "./syntax/QQL";

const PIPELINE_KEYWORDS = [
  "table",
  "stats",
  "regex",
  "sort",
  "where",
  "timechart",
  "eval",
  "unpack",
];

export class SuggestionCollector extends AbstractParseTreeVisitor<void> {
  private suggestionData: SuggestionData[] = [];
  /** Pipe positions covered by a visitPipelineCommand call */
  private coveredPipePositions = new Set<number>();
  /** End position of the current pipeline command being visited (char stop index) */
  private currentCmdEndPos: number | undefined = undefined;

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
  private getNextTokenPosition(
    ctx: TerminalNode | ParserRuleContext | null | undefined,
  ): number {
    if (!ctx) return 0;
    // TerminalNode: getSymbol() returns the Token
    if (ctx instanceof TerminalNode) {
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

  visitQuery = (ctx: QueryContext) => {
    const datasources: DatasourceContext[] = ctx.datasource();
    const controllerParams: ControllerParamContext[] = ctx.controllerParam();

    const lastCp =
      controllerParams.length > 0
        ? controllerParams[controllerParams.length - 1]
        : null;
    // A controllerParam is "complete" only when it has a value (literal string or regex).
    // If the user typed `key=` but no value yet, we suppress further controllerParam
    // suggestions and let visitControllerParam emit the paramValue suggestions instead.
    const lastCpComplete =
      !lastCp || !!(lastCp.literalString() || lastCp.regexLiteral());

    // Collect all keys already present so the frontend can hide duplicates.
    const usedKeys: string[] = controllerParams
      .map((cp) => cp.IDENTIFIER().getText() ?? "")
      .filter((k): k is string => k !== "");

    // Controller params are only valid before the search term or first pipe.
    // Compute an upper bound so suggestions don't bleed into pipeline commands.
    const searchCtx = ctx.search();
    const pipelineCmds: PipelineCommandContext[] = ctx.pipelineCommand();
    let cpZoneEnd: number | undefined;
    if (searchCtx?.start?.start != null) {
      cpZoneEnd = (searchCtx.start.start as number) - 1;
    } else if (pipelineCmds.length > 0) {
      const firstPipeStart: number | undefined =
        pipelineCmds[0].PIPE().getSymbol().start ?? undefined;
      if (firstPipeStart != null) cpZoneEnd = firstPipeStart - 1;
    }

    if (datasources.length > 0) {
      if (lastCpComplete) {
        const pos = lastCp
          ? this.getNextTokenPosition(lastCp)
          : this.getNextTokenPosition(datasources[datasources.length - 1]);
        this.addSuggestion({
          type: "controllerParam",
          excludeKeys: usedKeys,
          fromPosition: pos,
          toPosition: cpZoneEnd,
          disabled: false,
        });
      }
    } else if (controllerParams.length > 0) {
      if (lastCpComplete) {
        const pos = this.getNextTokenPosition(lastCp!);
        this.addSuggestion({
          type: "controllerParam",
          excludeKeys: usedKeys,
          fromPosition: pos,
          toPosition: cpZoneEnd,
          disabled: false,
        });
      }
    } else {
      // Nothing typed yet — suggest both datasource (@foo) and index params (index="...")
      this.addSuggestion({
        type: "datasource",
        fromPosition: 0,
        toPosition: cpZoneEnd,
        disabled: false,
      });
      this.addSuggestion({
        type: "controllerParam",
        excludeKeys: [],
        fromPosition: 0,
        toPosition: cpZoneEnd,
        disabled: false,
      });
    }

    for (const ds of datasources) this.visitDatasource(ds);
    for (const cp of controllerParams) this.visitControllerParam(cp, cpZoneEnd);

    if (searchCtx) this.visitSearch(searchCtx);

    for (let i = 0; i < pipelineCmds.length; i++) {
      const nextPipeStart: number | undefined =
        pipelineCmds[i + 1]?.PIPE().getSymbol().start ?? undefined;
      this.visitPipelineCommand(pipelineCmds[i], nextPipeStart);
    }
  };

  visitDatasource = (_ctx: DatasourceContext) => {};

  visitControllerParam = (ctx: ControllerParamContext, toPosition?: number) => {
    // After the = operator, suggest available values — but only when the param
    // has no value yet. Once a literalString/regexLiteral is present the param
    // is complete and no further value suggestions are needed.
    const op = ctx.EQUAL() ?? ctx.NOT_EQUAL();
    const identifier = ctx.IDENTIFIER();
    const hasValue = !!(ctx.literalString() || ctx.regexLiteral());
    if (op && identifier && !hasValue) {
      const key = identifier.getText() ?? "";
      const pos = this.getNextTokenPosition(op);
      this.addSuggestion({
        type: "paramValue",
        key,
        fromPosition: pos,
        toPosition,
        disabled: false,
      });
    }
  };

  visitSearch = (ctx: SearchContext) => {
    const searchTerm = ctx.searchTerm();
    if (searchTerm) this.visitSearchTerm(searchTerm);
    const searchTail = ctx.searchTail();
    if (searchTail) this.visitSearchTail(searchTail);
  };

  visitSearchTerm = (ctx: SearchTermContext) => {
    const searchFactor = ctx.searchFactor?.();
    if (searchFactor) this.visitSearchFactor(searchFactor);
    const search = ctx.search?.();
    if (search) this.visitSearch(search);
  };

  visitSearchTail = (ctx: SearchTailContext) => {
    const search = ctx.search?.();
    if (search) this.visitSearch(search);
  };

  visitSearchFactor = (_ctx: SearchFactorContext) => {};

  visitPipelineCommand = (
    ctx: PipelineCommandContext,
    nextPipeStart?: number,
  ) => {
    // Record the pipe position so getSuggestionData() doesn't double-add it
    const pipeSym = ctx.PIPE().getSymbol();
    const pipeStop = pipeSym?.stop ?? -1;
    if (pipeStop >= 0) this.coveredPipePositions.add(pipeStop);

    const pos = pipeStop + 1;

    // Bound the suggestion to the command keyword's stop so it doesn't
    // bleed into positions where the user is typing command arguments
    const cmdKw =
      ctx.tableCmd()?.TABLE() ??
      ctx.statsCmd()?.STATS() ??
      ctx.whereCmd()?.WHERE() ??
      ctx.sortCmd()?.SORT() ??
      ctx.evalCmd()?.EVAL() ??
      ctx.regexCmd()?.REGEX() ??
      ctx.timechartCmd()?.TIMECHART() ??
      ctx.unpackCmd()?.UNPACK();
    const cmdKwStop: number | undefined = cmdKw?.getSymbol()?.stop;

    this.addSuggestion({
      type: "keywords",
      keywords: PIPELINE_KEYWORDS,
      fromPosition: pos,
      toPosition: cmdKwStop != null ? cmdKwStop : undefined,
      disabled: false,
    });

    // Set the end-of-command boundary to just before the next pipe, so
    // sub-visitor suggestions are correctly bounded even when the command
    // has no arguments yet (ctx.stop would equal the keyword token itself).
    this.currentCmdEndPos =
      nextPipeStart != null ? nextPipeStart - 1 : undefined;

    const tableCmd = ctx.tableCmd();
    const statsCmd = ctx.statsCmd();
    const whereCmd = ctx.whereCmd();
    const sortCmd = ctx.sortCmd();
    const evalCmd = ctx.evalCmd();
    const regexCmd = ctx.regexCmd();
    const timechartCmd = ctx.timechartCmd();
    const unpackCmd = ctx.unpackCmd();

    if (tableCmd) this.visitTableCmd(tableCmd);
    else if (statsCmd) this.visitStatsCmd(statsCmd);
    else if (whereCmd) this.visitWhereCmd(whereCmd);
    else if (sortCmd) this.visitSortCmd(sortCmd);
    else if (evalCmd) this.visitEvalCmd(evalCmd);
    else if (regexCmd) this.visitRegexCmd(regexCmd);
    else if (timechartCmd) this.visitTimechartCmd(timechartCmd);
    else if (unpackCmd) this.visitUnpackCmd(unpackCmd);
    else if (this.tokenStream) {
      // Fallback: ANTLR error recovery dropped the sub-command context (e.g.
      // "| eval " or "| regex " with no expression/literal following the keyword).
      // Scan the token stream for the command keyword so we can still emit the
      // right suggestions.
      for (const tok of this.tokenStream.getTokens()) {
        if ((tok.start ?? -1) <= pipeStop) continue;
        if (tok.type === QQLLexer.PIPE) break;
        if (tok.type === QQLLexer.EVAL) {
          this.addSuggestion({
            type: "column",
            fromPosition: (tok.stop ?? 0) + 1,
            toPosition: this.currentCmdEndPos,
            disabled: false,
          });
          break;
        }
        if (tok.type === QQLLexer.REGEX) {
          this.addSuggestion({
            type: "keywords",
            keywords: ["field="],
            fromPosition: (tok.stop ?? 0) + 1,
            toPosition: this.currentCmdEndPos,
            disabled: false,
          });
          break;
        }
      }
    }

    this.currentCmdEndPos = undefined;
  };

  visitTableCmd = (ctx: TableCmdContext) => {
    const tableKwPos = this.getNextTokenPosition(ctx.TABLE());
    this.addSuggestion({
      type: "column",
      fromPosition: tableKwPos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });

    const tableColumns: TableColumnContext[] = ctx.tableColumn();
    const commas: TerminalNode[] = ctx.COMMA();

    for (let i = 0; i < tableColumns.length; i++) {
      const colCtx = tableColumns[i];
      const hasAs = !!colCtx.AS();
      const idOrStrings: IdentifierOrStringContext[] =
        colCtx.identifierOrString();

      // After the column name, suggest "as" if no alias has been typed yet.
      // Stop at the next comma so "as" doesn't bleed into the next column entry.
      // Guard against error-recovered phantom tokens: ANTLR places their stop at
      // the preceding boundary token (TABLE stop or comma stop), so their
      // afterColumnPos lands at exactly prevBoundary+1. Real tokens always exceed that.
      if (idOrStrings.length > 0 && !hasAs) {
        const afterColumnPos = this.getNextTokenPosition(idOrStrings[0]);
        const prevCommaStop: number | undefined =
          commas[i - 1]?.getSymbol()?.stop;
        const prevBoundary =
          prevCommaStop != null ? prevCommaStop : tableKwPos - 1;
        if (afterColumnPos <= prevBoundary + 1) continue;

        const nextCommaStart: number | undefined =
          commas[i]?.getSymbol()?.start;
        this.addSuggestion({
          type: "keywords",
          keywords: ["as"],
          fromPosition: afterColumnPos,
          toPosition: nextCommaStart ?? this.currentCmdEndPos,
          disabled: false,
        });
      }
    }
  };

  visitStatsCmd = (ctx: StatsCmdContext) => {
    const pos = this.getNextTokenPosition(ctx.STATS());
    this.addSuggestion({
      type: "function",
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });

    const aggFuncs: AggregationFunctionContext[] = ctx.aggregationFunction();
    for (const agg of aggFuncs) this.visitAggregationFunction(agg);

    if (ctx.BY()) {
      // Suggest groupby columns right after the BY keyword
      const byPos = this.getNextTokenPosition(ctx.BY());
      this.addSuggestion({
        type: "column",
        fromPosition: byPos,
        toPosition: this.currentCmdEndPos,
        disabled: false,
      });
      const groupbyCtx = ctx.groupby();
      if (groupbyCtx) this.visitGroupby(groupbyCtx);
    } else {
      // Only suggest "by" once the last agg function is fully closed
      const lastAgg =
        aggFuncs.length > 0 ? aggFuncs[aggFuncs.length - 1] : null;
      if (lastAgg?.LPAREN() && lastAgg?.RPAREN()) {
        const byPos = this.getNextTokenPosition(lastAgg);
        this.addSuggestion({
          type: "keywords",
          keywords: ["by"],
          fromPosition: byPos,
          toPosition: this.currentCmdEndPos,
          disabled: false,
        });
      }
    }
  };

  visitWhereCmd = (ctx: WhereCmdContext) => {
    const pos = this.getNextTokenPosition(ctx.WHERE());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });
    this.addSuggestion({
      type: "booleanFunction",
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });

    const logExpr = ctx.logicalExpression();
    if (logExpr) this.visitLogicalExpression(logExpr);
  };

  visitSortCmd = (ctx: SortCmdContext) => {
    const pos = this.getNextTokenPosition(ctx.SORT());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });
    for (const col of ctx.sortColumn()) this.visitSortColumn(col);
  };

  visitEvalCmd = (ctx: EvalCmdContext) => {
    const pos = this.getNextTokenPosition(ctx.EVAL());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });
    this.visitChildren(ctx);
  };

  visitRegexCmd = (ctx: RegexCmdContext) => {
    const pos = this.getNextTokenPosition(ctx.REGEX());
    this.addSuggestion({
      type: "keywords",
      keywords: ["field="],
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });

    const eq = ctx.EQUAL();
    if (eq) {
      const colPos = this.getNextTokenPosition(eq);
      this.addSuggestion({
        type: "column",
        fromPosition: colPos,
        toPosition: this.currentCmdEndPos,
        disabled: false,
      });
    }
  };

  visitTimechartCmd = (ctx: TimechartCmdContext) => {
    const pos = this.getNextTokenPosition(ctx.TIMECHART());
    this.addSuggestion({
      type: "function",
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });

    const aggFuncs: AggregationFunctionContext[] = ctx.aggregationFunction();
    for (const agg of aggFuncs) this.visitAggregationFunction(agg);

    if (aggFuncs.length > 0) {
      const lastAgg = aggFuncs[aggFuncs.length - 1];
      // Only suggest params/by after the agg function is fully closed
      if (lastAgg?.RPAREN()) {
        const paramPos = this.getNextTokenPosition(lastAgg);
        this.addSuggestion({
          type: "params",
          keywords: ["span", "timeCol", "maxGroups"],
          fromPosition: paramPos,
          toPosition: this.currentCmdEndPos,
          disabled: false,
        });

        if (ctx.BY()) {
          const byPos = this.getNextTokenPosition(ctx.BY());
          this.addSuggestion({
            type: "column",
            fromPosition: byPos,
            toPosition: this.currentCmdEndPos,
            disabled: false,
          });
          const groupbyCtx = ctx.groupby();
          if (groupbyCtx) this.visitGroupby(groupbyCtx);
        } else {
          const params: TimechartParamsContext[] = ctx.timechartParams();
          const last = params.length > 0 ? params[params.length - 1] : lastAgg;
          const byPos = this.getNextTokenPosition(last);
          this.addSuggestion({
            type: "keywords",
            keywords: ["by"],
            fromPosition: byPos,
            toPosition: this.currentCmdEndPos,
            disabled: false,
          });
        }
      }
    }
  };

  visitUnpackCmd = (ctx: UnpackCmdContext) => {
    const pos = this.getNextTokenPosition(ctx.UNPACK());
    this.addSuggestion({
      type: "column",
      fromPosition: pos,
      toPosition: this.currentCmdEndPos,
      disabled: false,
    });
  };

  visitLogicalExpression = (ctx: LogicalExpressionContext) => {
    const unitExpr = ctx.unitExpression();
    if (unitExpr) this.visitUnitExpression(unitExpr);
    for (const tail of ctx.logicalTail()) this.visitLogicalTail(tail);
  };

  visitLogicalTail = (ctx: LogicalTailContext) => {
    const logExpr = ctx.logicalExpression();
    if (logExpr) this.visitLogicalExpression(logExpr);
  };

  visitUnitExpression = (ctx: UnitExpressionContext) => {
    const inArr = ctx.inArrayExpression();
    const comp = ctx.comparisonExpression();
    const notExpr = ctx.notExpression();
    const funcExpr = ctx.functionExpression();
    const logExpr = ctx.logicalExpression();

    if (inArr) this.visitInArrayExpression(inArr);
    else if (comp) this.visitComparisonExpression(comp);
    else if (notExpr) this.visitNotExpression(notExpr);
    else if (funcExpr) this.visitFunctionExpression(funcExpr);
    else if (logExpr) this.visitLogicalExpression(logExpr);
  };

  visitNotExpression = (ctx: NotExpressionContext) => {
    const unitExpr = ctx.unitExpression();
    if (unitExpr) this.visitUnitExpression(unitExpr);
  };

  visitInArrayExpression = (_ctx: InArrayExpressionContext) => {};

  visitComparisonExpression = (ctx: ComparisonExpressionContext) => {
    // After the comparison operator, suggest columns for the RHS
    const op =
      ctx.EQUAL_EQUAL() ??
      ctx.NOT_EQUAL() ??
      ctx.GREATER_EQUAL() ??
      ctx.LESS_EQUAL() ??
      ctx.GREATER_THAN() ??
      ctx.LESS_THAN();
    if (op) {
      const pos = this.getNextTokenPosition(op);
      this.addSuggestion({
        type: "column",
        fromPosition: pos,
        toPosition: this.currentCmdEndPos,
        disabled: false,
      });
    }
  };

  visitFunctionExpression = (ctx: FunctionExpressionContext) => {
    // Suggest column names as arguments to the function (not agg-function names)
    const lparen = ctx.LPAREN();
    if (lparen) {
      const pos = this.getNextTokenPosition(lparen);
      this.addSuggestion({
        type: "column",
        fromPosition: pos,
        toPosition: this.currentCmdEndPos,
        disabled: false,
      });
    }
    const funcArgs = ctx.functionArgs();
    if (funcArgs) this.visitFunctionArgs(funcArgs);
  };

  visitFunctionArgs = (ctx: FunctionArgsContext) => {
    for (const arg of ctx.functionArg()) this.visitFunctionArg(arg);
  };

  visitFunctionArg = (_ctx: FunctionArgContext) => {};

  visitEvalExpression = (ctx: EvalExpressionContext) => {
    // After the '=' sign, suggest columns and boolean functions for the RHS
    const eq = ctx.EQUAL();
    if (eq) {
      const pos = this.getNextTokenPosition(eq);
      this.addSuggestion({
        type: "column",
        fromPosition: pos,
        toPosition: this.currentCmdEndPos,
        disabled: false,
      });
      this.addSuggestion({
        type: "booleanFunction",
        fromPosition: pos,
        toPosition: this.currentCmdEndPos,
        disabled: false,
      });
    }
  };
  visitEvalFunctionArg = (_ctx: EvalFunctionArgContext) => {};
  visitEvalFunction = (_ctx: EvalFunctionContext) => {};
  visitCaseThen = (_ctx: CaseThenContext) => {};
  visitAggregationFunction = (ctx: AggregationFunctionContext) => {
    const lparen = ctx.LPAREN();
    if (lparen) {
      const fromPos = this.getNextTokenPosition(lparen);
      // Bound to the closing paren so column suggestions disappear after ')'
      const rparenStop: number | undefined = ctx.RPAREN()?.getSymbol()?.stop;
      this.addSuggestion({
        type: "column",
        fromPosition: fromPos,
        toPosition: rparenStop ?? this.currentCmdEndPos,
        disabled: false,
      });
    }
  };
  visitGroupby = (ctx: GroupbyContext) => {
    // After each comma in the groupby list, suggest another column
    for (const comma of ctx.COMMA()) {
      const pos = this.getNextTokenPosition(comma);
      this.addSuggestion({
        type: "column",
        fromPosition: pos,
        toPosition: this.currentCmdEndPos,
        disabled: false,
      });
    }
  };
  visitSortColumn = (ctx: SortColumnContext) => {
    // After the column name, suggest asc/desc if neither is present yet
    if (!ctx.ASC() && !ctx.DESC()) {
      const idCtx = ctx.identifierOrString();
      if (idCtx) {
        const fromPos = this.getNextTokenPosition(idCtx);
        this.addSuggestion({
          type: "keywords",
          keywords: ["asc", "desc"],
          fromPosition: fromPos,
          toPosition: this.currentCmdEndPos,
          disabled: false,
        });
      }
    }
  };
  visitTableColumn = (_ctx: TableColumnContext) => {};
  visitTimechartParams = (_ctx: TimechartParamsContext) => {};

  visitCalcExpression = (ctx: CalcExpressionContext) => {
    const calcTerm = ctx.calcTerm();
    if (calcTerm) this.visitCalcTerm(calcTerm);
    for (const action of ctx.calcAction()) this.visitCalcAction(action);
  };

  visitCalcAction = (ctx: CalcActionContext) => {
    const calcTerm = ctx.calcTerm();
    if (calcTerm) this.visitCalcTerm(calcTerm);
  };

  visitCalcTerm = (ctx: CalcTermContext) => {
    const calcUnit = ctx.calculateUnit();
    if (calcUnit) this.visitCalculateUnit(calcUnit);
    for (const action of ctx.calcTermAction()) this.visitCalcTermAction(action);
  };

  visitCalcTermAction = (ctx: CalcTermActionContext) => {
    const calcUnit = ctx.calculateUnit();
    if (calcUnit) this.visitCalculateUnit(calcUnit);
  };

  visitCalculateUnit = (ctx: CalculateUnitContext) => {
    const factor = ctx.factor();
    if (factor) this.visitFactor(factor);
    else {
      const calcExpr = ctx.calcExpression();
      if (calcExpr) this.visitCalcExpression(calcExpr);
    }
  };

  visitFactor = (_ctx: FactorContext) => {};
  visitLiteralBoolean = (_ctx: LiteralBooleanContext) => {};
  visitLiteralString = (_ctx: LiteralStringContext) => {};
  visitRegexLiteral = (_ctx: RegexLiteralContext) => {};

  protected defaultResult(): void {
    return undefined;
  }

  protected aggregateResult(_aggregate: void, _nextResult: void): void {}
}
