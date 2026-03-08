// Generated from /Users/elran777/git/IamShobe/cruncher/packages/qql/src/syntax/QQL.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";

import { QueryContext } from "./QQL.js";
import { DatasourceContext } from "./QQL.js";
import { ControllerParamContext } from "./QQL.js";
import { SearchContext } from "./QQL.js";
import { SearchTailContext } from "./QQL.js";
import { SearchTermContext } from "./QQL.js";
import { SearchFactorContext } from "./QQL.js";
import { SearchLiteralContext } from "./QQL.js";
import { PipelineCommandContext } from "./QQL.js";
import { TableCmdContext } from "./QQL.js";
import { TableColumnContext } from "./QQL.js";
import { StatsCmdContext } from "./QQL.js";
import { AggregationFunctionContext } from "./QQL.js";
import { AggFunctionArgContext } from "./QQL.js";
import { GroupbyContext } from "./QQL.js";
import { WhereCmdContext } from "./QQL.js";
import { SortCmdContext } from "./QQL.js";
import { SortColumnContext } from "./QQL.js";
import { EvalCmdContext } from "./QQL.js";
import { EvalExpressionContext } from "./QQL.js";
import { RegexCmdContext } from "./QQL.js";
import { TimechartCmdContext } from "./QQL.js";
import { TimechartParamsContext } from "./QQL.js";
import { UnpackCmdContext } from "./QQL.js";
import { LogicalExpressionContext } from "./QQL.js";
import { LogicalTailContext } from "./QQL.js";
import { UnitExpressionContext } from "./QQL.js";
import { NotExpressionContext } from "./QQL.js";
import { InArrayExpressionContext } from "./QQL.js";
import { ComparisonExpressionContext } from "./QQL.js";
import { FunctionExpressionContext } from "./QQL.js";
import { FunctionArgsContext } from "./QQL.js";
import { FunctionArgContext } from "./QQL.js";
import { EvalFunctionArgContext } from "./QQL.js";
import { EvalFunctionContext } from "./QQL.js";
import { CaseThenContext } from "./QQL.js";
import { CalcExpressionContext } from "./QQL.js";
import { CalcActionContext } from "./QQL.js";
import { CalcTermContext } from "./QQL.js";
import { CalcTermActionContext } from "./QQL.js";
import { CalculateUnitContext } from "./QQL.js";
import { FactorContext } from "./QQL.js";
import { LiteralBooleanContext } from "./QQL.js";
import { LiteralStringContext } from "./QQL.js";
import { RegexLiteralContext } from "./QQL.js";
import { IdentifierOrStringContext } from "./QQL.js";

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `QQL`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class QQLVisitor<Result> extends AbstractParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `QQL.query`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery?: (ctx: QueryContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.datasource`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitDatasource?: (ctx: DatasourceContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.controllerParam`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitControllerParam?: (ctx: ControllerParamContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.search`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSearch?: (ctx: SearchContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.searchTail`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSearchTail?: (ctx: SearchTailContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.searchTerm`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSearchTerm?: (ctx: SearchTermContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.searchFactor`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSearchFactor?: (ctx: SearchFactorContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.searchLiteral`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSearchLiteral?: (ctx: SearchLiteralContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.pipelineCommand`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitPipelineCommand?: (ctx: PipelineCommandContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.tableCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTableCmd?: (ctx: TableCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.tableColumn`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTableColumn?: (ctx: TableColumnContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.statsCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitStatsCmd?: (ctx: StatsCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.aggregationFunction`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAggregationFunction?: (ctx: AggregationFunctionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.aggFunctionArg`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAggFunctionArg?: (ctx: AggFunctionArgContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.groupby`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitGroupby?: (ctx: GroupbyContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.whereCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitWhereCmd?: (ctx: WhereCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.sortCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSortCmd?: (ctx: SortCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.sortColumn`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSortColumn?: (ctx: SortColumnContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.evalCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitEvalCmd?: (ctx: EvalCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.evalExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitEvalExpression?: (ctx: EvalExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.regexCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRegexCmd?: (ctx: RegexCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.timechartCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTimechartCmd?: (ctx: TimechartCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.timechartParams`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTimechartParams?: (ctx: TimechartParamsContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.unpackCmd`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUnpackCmd?: (ctx: UnpackCmdContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.logicalExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLogicalExpression?: (ctx: LogicalExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.logicalTail`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLogicalTail?: (ctx: LogicalTailContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.unitExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUnitExpression?: (ctx: UnitExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.notExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitNotExpression?: (ctx: NotExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.inArrayExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitInArrayExpression?: (ctx: InArrayExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.comparisonExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitComparisonExpression?: (ctx: ComparisonExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.functionExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitFunctionExpression?: (ctx: FunctionExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.functionArgs`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitFunctionArgs?: (ctx: FunctionArgsContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.functionArg`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitFunctionArg?: (ctx: FunctionArgContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.evalFunctionArg`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitEvalFunctionArg?: (ctx: EvalFunctionArgContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.evalFunction`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitEvalFunction?: (ctx: EvalFunctionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.caseThen`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitCaseThen?: (ctx: CaseThenContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.calcExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitCalcExpression?: (ctx: CalcExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.calcAction`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitCalcAction?: (ctx: CalcActionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.calcTerm`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitCalcTerm?: (ctx: CalcTermContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.calcTermAction`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitCalcTermAction?: (ctx: CalcTermActionContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.calculateUnit`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitCalculateUnit?: (ctx: CalculateUnitContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.factor`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitFactor?: (ctx: FactorContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.literalBoolean`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLiteralBoolean?: (ctx: LiteralBooleanContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.literalString`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLiteralString?: (ctx: LiteralStringContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.regexLiteral`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRegexLiteral?: (ctx: RegexLiteralContext) => Result;
  /**
   * Visit a parse tree produced by `QQL.identifierOrString`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitIdentifierOrString?: (ctx: IdentifierOrStringContext) => Result;
}
