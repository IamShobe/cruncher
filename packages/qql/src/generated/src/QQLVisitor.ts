// Generated from src/QQL.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { QueryContext } from "./QQLParser.js";
import { DatasourceContext } from "./QQLParser.js";
import { ControllerParamContext } from "./QQLParser.js";
import { SearchContext } from "./QQLParser.js";
import { SearchTailContext } from "./QQLParser.js";
import { SearchTermContext } from "./QQLParser.js";
import { SearchFactorContext } from "./QQLParser.js";
import { SearchLiteralContext } from "./QQLParser.js";
import { PipelineCommandContext } from "./QQLParser.js";
import { TableCmdContext } from "./QQLParser.js";
import { TableColumnContext } from "./QQLParser.js";
import { StatsCmdContext } from "./QQLParser.js";
import { AggregationFunctionContext } from "./QQLParser.js";
import { GroupbyContext } from "./QQLParser.js";
import { WhereCmdContext } from "./QQLParser.js";
import { SortCmdContext } from "./QQLParser.js";
import { SortColumnContext } from "./QQLParser.js";
import { EvalCmdContext } from "./QQLParser.js";
import { EvalExpressionContext } from "./QQLParser.js";
import { RegexCmdContext } from "./QQLParser.js";
import { TimechartCmdContext } from "./QQLParser.js";
import { TimechartParamsContext } from "./QQLParser.js";
import { UnpackCmdContext } from "./QQLParser.js";
import { LogicalExpressionContext } from "./QQLParser.js";
import { LogicalTailContext } from "./QQLParser.js";
import { UnitExpressionContext } from "./QQLParser.js";
import { NotExpressionContext } from "./QQLParser.js";
import { InArrayExpressionContext } from "./QQLParser.js";
import { ComparisonExpressionContext } from "./QQLParser.js";
import { FunctionExpressionContext } from "./QQLParser.js";
import { FunctionArgsContext } from "./QQLParser.js";
import { FunctionArgContext } from "./QQLParser.js";
import { EvalFunctionArgContext } from "./QQLParser.js";
import { EvalFunctionContext } from "./QQLParser.js";
import { CaseThenContext } from "./QQLParser.js";
import { CalcExpressionContext } from "./QQLParser.js";
import { CalcActionContext } from "./QQLParser.js";
import { CalcTermContext } from "./QQLParser.js";
import { CalcTermActionContext } from "./QQLParser.js";
import { CalculateUnitContext } from "./QQLParser.js";
import { FactorContext } from "./QQLParser.js";
import { LiteralBooleanContext } from "./QQLParser.js";
import { LiteralStringContext } from "./QQLParser.js";
import { RegexLiteralContext } from "./QQLParser.js";
import { IdentifierOrStringContext } from "./QQLParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `QQLParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class QQLVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `QQLParser.query`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuery?: (ctx: QueryContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.datasource`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDatasource?: (ctx: DatasourceContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.controllerParam`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitControllerParam?: (ctx: ControllerParamContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.search`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearch?: (ctx: SearchContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.searchTail`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchTail?: (ctx: SearchTailContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.searchTerm`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchTerm?: (ctx: SearchTermContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.searchFactor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchFactor?: (ctx: SearchFactorContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.searchLiteral`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchLiteral?: (ctx: SearchLiteralContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.pipelineCommand`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPipelineCommand?: (ctx: PipelineCommandContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.tableCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableCmd?: (ctx: TableCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.tableColumn`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableColumn?: (ctx: TableColumnContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.statsCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatsCmd?: (ctx: StatsCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.aggregationFunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAggregationFunction?: (ctx: AggregationFunctionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.groupby`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupby?: (ctx: GroupbyContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.whereCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhereCmd?: (ctx: WhereCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.sortCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSortCmd?: (ctx: SortCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.sortColumn`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSortColumn?: (ctx: SortColumnContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.evalCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEvalCmd?: (ctx: EvalCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.evalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEvalExpression?: (ctx: EvalExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.regexCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRegexCmd?: (ctx: RegexCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.timechartCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTimechartCmd?: (ctx: TimechartCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.timechartParams`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTimechartParams?: (ctx: TimechartParamsContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.unpackCmd`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnpackCmd?: (ctx: UnpackCmdContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.logicalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalExpression?: (ctx: LogicalExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.logicalTail`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalTail?: (ctx: LogicalTailContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.unitExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnitExpression?: (ctx: UnitExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.notExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNotExpression?: (ctx: NotExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.inArrayExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInArrayExpression?: (ctx: InArrayExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.comparisonExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComparisonExpression?: (ctx: ComparisonExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.functionExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionExpression?: (ctx: FunctionExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.functionArgs`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionArgs?: (ctx: FunctionArgsContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.functionArg`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionArg?: (ctx: FunctionArgContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.evalFunctionArg`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEvalFunctionArg?: (ctx: EvalFunctionArgContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.evalFunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEvalFunction?: (ctx: EvalFunctionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.caseThen`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCaseThen?: (ctx: CaseThenContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.calcExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCalcExpression?: (ctx: CalcExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.calcAction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCalcAction?: (ctx: CalcActionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.calcTerm`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCalcTerm?: (ctx: CalcTermContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.calcTermAction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCalcTermAction?: (ctx: CalcTermActionContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.calculateUnit`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCalculateUnit?: (ctx: CalculateUnitContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.factor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFactor?: (ctx: FactorContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.literalBoolean`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLiteralBoolean?: (ctx: LiteralBooleanContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.literalString`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLiteralString?: (ctx: LiteralStringContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.regexLiteral`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRegexLiteral?: (ctx: RegexLiteralContext) => Result;
    /**
     * Visit a parse tree produced by `QQLParser.identifierOrString`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierOrString?: (ctx: IdentifierOrStringContext) => Result;
}

