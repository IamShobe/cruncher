// Generated from src/QQL.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { QQLVisitor } from "./QQLVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class QQLParser extends antlr.Parser {
    public static readonly TABLE = 1;
    public static readonly STATS = 2;
    public static readonly WHERE = 3;
    public static readonly SORT = 4;
    public static readonly EVAL = 5;
    public static readonly REGEX = 6;
    public static readonly TIMECHART = 7;
    public static readonly UNPACK = 8;
    public static readonly AS = 9;
    public static readonly BY = 10;
    public static readonly SPAN = 11;
    public static readonly TIMECOL = 12;
    public static readonly MAXGROUPS = 13;
    public static readonly FIELD = 14;
    public static readonly ASC = 15;
    public static readonly DESC = 16;
    public static readonly IN = 17;
    public static readonly TRUE = 18;
    public static readonly FALSE = 19;
    public static readonly IF = 20;
    public static readonly CASE = 21;
    public static readonly ELSE = 22;
    public static readonly SEARCH_AND = 23;
    public static readonly SEARCH_OR = 24;
    public static readonly PIPE = 25;
    public static readonly COMMA = 26;
    public static readonly LPAREN = 27;
    public static readonly RPAREN = 28;
    public static readonly LBRACKET = 29;
    public static readonly RBRACKET = 30;
    public static readonly EQUAL = 31;
    public static readonly EQUAL_EQUAL = 32;
    public static readonly NOT_EQUAL = 33;
    public static readonly GREATER_EQUAL = 34;
    public static readonly LESS_EQUAL = 35;
    public static readonly GREATER_THAN = 36;
    public static readonly LESS_THAN = 37;
    public static readonly AND = 38;
    public static readonly OR = 39;
    public static readonly NOT = 40;
    public static readonly PLUS = 41;
    public static readonly MINUS = 42;
    public static readonly MULTIPLY = 43;
    public static readonly DIVIDE = 44;
    public static readonly SEARCH_PARAM_NEQ = 45;
    public static readonly AT_DATASOURCE = 46;
    public static readonly DQUOT_STRING = 47;
    public static readonly SQUOT_STRING = 48;
    public static readonly REGEX_PATTERN = 49;
    public static readonly INTEGER = 50;
    public static readonly IDENTIFIER = 51;
    public static readonly WS = 52;
    public static readonly COMMENT = 53;
    public static readonly RULE_query = 0;
    public static readonly RULE_datasource = 1;
    public static readonly RULE_controllerParam = 2;
    public static readonly RULE_search = 3;
    public static readonly RULE_searchTail = 4;
    public static readonly RULE_searchFactor = 5;
    public static readonly RULE_searchLiteral = 6;
    public static readonly RULE_pipelineCommand = 7;
    public static readonly RULE_tableCmd = 8;
    public static readonly RULE_tableColumn = 9;
    public static readonly RULE_statsCmd = 10;
    public static readonly RULE_aggregationFunction = 11;
    public static readonly RULE_groupby = 12;
    public static readonly RULE_whereCmd = 13;
    public static readonly RULE_sortCmd = 14;
    public static readonly RULE_sortColumn = 15;
    public static readonly RULE_evalCmd = 16;
    public static readonly RULE_evalExpression = 17;
    public static readonly RULE_regexCmd = 18;
    public static readonly RULE_timechartCmd = 19;
    public static readonly RULE_timechartParams = 20;
    public static readonly RULE_unpackCmd = 21;
    public static readonly RULE_logicalExpression = 22;
    public static readonly RULE_logicalTail = 23;
    public static readonly RULE_unitExpression = 24;
    public static readonly RULE_notExpression = 25;
    public static readonly RULE_inArrayExpression = 26;
    public static readonly RULE_comparisonExpression = 27;
    public static readonly RULE_functionExpression = 28;
    public static readonly RULE_functionArgs = 29;
    public static readonly RULE_functionArg = 30;
    public static readonly RULE_evalFunctionArg = 31;
    public static readonly RULE_evalFunction = 32;
    public static readonly RULE_caseThen = 33;
    public static readonly RULE_calcExpression = 34;
    public static readonly RULE_calcAction = 35;
    public static readonly RULE_calcTerm = 36;
    public static readonly RULE_calcTermAction = 37;
    public static readonly RULE_calculateUnit = 38;
    public static readonly RULE_factor = 39;
    public static readonly RULE_literalBoolean = 40;
    public static readonly RULE_literalString = 41;
    public static readonly RULE_regexLiteral = 42;

    public static readonly literalNames = [
        null, "'table'", "'stats'", "'where'", "'sort'", "'eval'", "'regex'", 
        "'timechart'", "'unpack'", "'as'", "'by'", "'span'", "'timeCol'", 
        "'maxGroups'", "'field'", "'asc'", "'desc'", "'in'", "'true'", "'false'", 
        "'if'", "'case'", "'else'", "'AND'", "'OR'", "'|'", "','", "'('", 
        "')'", "'['", "']'", "'='", "'=='", null, "'>='", "'<='", "'>'", 
        "'<'", "'&&'", "'||'", "'!'", "'+'", "'-'", "'*'", "'/'"
    ];

    public static readonly symbolicNames = [
        null, "TABLE", "STATS", "WHERE", "SORT", "EVAL", "REGEX", "TIMECHART", 
        "UNPACK", "AS", "BY", "SPAN", "TIMECOL", "MAXGROUPS", "FIELD", "ASC", 
        "DESC", "IN", "TRUE", "FALSE", "IF", "CASE", "ELSE", "SEARCH_AND", 
        "SEARCH_OR", "PIPE", "COMMA", "LPAREN", "RPAREN", "LBRACKET", "RBRACKET", 
        "EQUAL", "EQUAL_EQUAL", "NOT_EQUAL", "GREATER_EQUAL", "LESS_EQUAL", 
        "GREATER_THAN", "LESS_THAN", "AND", "OR", "NOT", "PLUS", "MINUS", 
        "MULTIPLY", "DIVIDE", "SEARCH_PARAM_NEQ", "AT_DATASOURCE", "DQUOT_STRING", 
        "SQUOT_STRING", "REGEX_PATTERN", "INTEGER", "IDENTIFIER", "WS", 
        "COMMENT"
    ];
    public static readonly ruleNames = [
        "query", "datasource", "controllerParam", "search", "searchTail", 
        "searchFactor", "searchLiteral", "pipelineCommand", "tableCmd", 
        "tableColumn", "statsCmd", "aggregationFunction", "groupby", "whereCmd", 
        "sortCmd", "sortColumn", "evalCmd", "evalExpression", "regexCmd", 
        "timechartCmd", "timechartParams", "unpackCmd", "logicalExpression", 
        "logicalTail", "unitExpression", "notExpression", "inArrayExpression", 
        "comparisonExpression", "functionExpression", "functionArgs", "functionArg", 
        "evalFunctionArg", "evalFunction", "caseThen", "calcExpression", 
        "calcAction", "calcTerm", "calcTermAction", "calculateUnit", "factor", 
        "literalBoolean", "literalString", "regexLiteral",
    ];

    public get grammarFileName(): string { return "QQL.g4"; }
    public get literalNames(): (string | null)[] { return QQLParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return QQLParser.symbolicNames; }
    public get ruleNames(): string[] { return QQLParser.ruleNames; }
    public get serializedATN(): number[] { return QQLParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, QQLParser._ATN, QQLParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public query(): QueryContext {
        let localContext = new QueryContext(this.context, this.state);
        this.enterRule(localContext, 0, QQLParser.RULE_query);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 89;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 46) {
                {
                {
                this.state = 86;
                this.datasource();
                }
                }
                this.state = 91;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 95;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 92;
                    this.controllerParam();
                    }
                    }
                }
                this.state = 97;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
            }
            this.state = 98;
            this.search();
            this.state = 102;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 25) {
                {
                {
                this.state = 99;
                this.pipelineCommand();
                }
                }
                this.state = 104;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public datasource(): DatasourceContext {
        let localContext = new DatasourceContext(this.context, this.state);
        this.enterRule(localContext, 2, QQLParser.RULE_datasource);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 105;
            this.match(QQLParser.AT_DATASOURCE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public controllerParam(): ControllerParamContext {
        let localContext = new ControllerParamContext(this.context, this.state);
        this.enterRule(localContext, 4, QQLParser.RULE_controllerParam);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 107;
            this.match(QQLParser.IDENTIFIER);
            this.state = 108;
            this.match(QQLParser.EQUAL);
            this.state = 111;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.DQUOT_STRING:
            case QQLParser.SQUOT_STRING:
                {
                this.state = 109;
                this.literalString();
                }
                break;
            case QQLParser.REGEX_PATTERN:
                {
                this.state = 110;
                this.regexLiteral();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public search(): SearchContext {
        let localContext = new SearchContext(this.context, this.state);
        this.enterRule(localContext, 6, QQLParser.RULE_search);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 113;
            this.searchFactor();
            this.state = 115;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 23 || _la === 24) {
                {
                this.state = 114;
                this.searchTail();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public searchTail(): SearchTailContext {
        let localContext = new SearchTailContext(this.context, this.state);
        this.enterRule(localContext, 8, QQLParser.RULE_searchTail);
        try {
            this.state = 121;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.SEARCH_AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 117;
                this.match(QQLParser.SEARCH_AND);
                this.state = 118;
                this.search();
                }
                break;
            case QQLParser.SEARCH_OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 119;
                this.match(QQLParser.SEARCH_OR);
                this.state = 120;
                this.search();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public searchFactor(): SearchFactorContext {
        let localContext = new SearchFactorContext(this.context, this.state);
        this.enterRule(localContext, 10, QQLParser.RULE_searchFactor);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 123;
            this.searchLiteral();
            this.state = 126;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 45) {
                {
                this.state = 124;
                this.match(QQLParser.SEARCH_PARAM_NEQ);
                this.state = 125;
                this.searchLiteral();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public searchLiteral(): SearchLiteralContext {
        let localContext = new SearchLiteralContext(this.context, this.state);
        this.enterRule(localContext, 12, QQLParser.RULE_searchLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 131;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                this.state = 131;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case QQLParser.IDENTIFIER:
                    {
                    this.state = 128;
                    this.match(QQLParser.IDENTIFIER);
                    }
                    break;
                case QQLParser.INTEGER:
                    {
                    this.state = 129;
                    this.match(QQLParser.INTEGER);
                    }
                    break;
                case QQLParser.DQUOT_STRING:
                case QQLParser.SQUOT_STRING:
                    {
                    this.state = 130;
                    this.literalString();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 133;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (((((_la - 47)) & ~0x1F) === 0 && ((1 << (_la - 47)) & 27) !== 0));
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public pipelineCommand(): PipelineCommandContext {
        let localContext = new PipelineCommandContext(this.context, this.state);
        this.enterRule(localContext, 14, QQLParser.RULE_pipelineCommand);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 135;
            this.match(QQLParser.PIPE);
            this.state = 144;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.TABLE:
                {
                this.state = 136;
                this.tableCmd();
                }
                break;
            case QQLParser.STATS:
                {
                this.state = 137;
                this.statsCmd();
                }
                break;
            case QQLParser.WHERE:
                {
                this.state = 138;
                this.whereCmd();
                }
                break;
            case QQLParser.SORT:
                {
                this.state = 139;
                this.sortCmd();
                }
                break;
            case QQLParser.EVAL:
                {
                this.state = 140;
                this.evalCmd();
                }
                break;
            case QQLParser.REGEX:
                {
                this.state = 141;
                this.regexCmd();
                }
                break;
            case QQLParser.TIMECHART:
                {
                this.state = 142;
                this.timechartCmd();
                }
                break;
            case QQLParser.UNPACK:
                {
                this.state = 143;
                this.unpackCmd();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public tableCmd(): TableCmdContext {
        let localContext = new TableCmdContext(this.context, this.state);
        this.enterRule(localContext, 16, QQLParser.RULE_tableCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 146;
            this.match(QQLParser.TABLE);
            this.state = 147;
            this.tableColumn();
            this.state = 152;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 148;
                this.match(QQLParser.COMMA);
                this.state = 149;
                this.tableColumn();
                }
                }
                this.state = 154;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public tableColumn(): TableColumnContext {
        let localContext = new TableColumnContext(this.context, this.state);
        this.enterRule(localContext, 18, QQLParser.RULE_tableColumn);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 155;
            this.match(QQLParser.IDENTIFIER);
            this.state = 158;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9) {
                {
                this.state = 156;
                this.match(QQLParser.AS);
                this.state = 157;
                this.match(QQLParser.IDENTIFIER);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public statsCmd(): StatsCmdContext {
        let localContext = new StatsCmdContext(this.context, this.state);
        this.enterRule(localContext, 20, QQLParser.RULE_statsCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 160;
            this.match(QQLParser.STATS);
            this.state = 161;
            this.aggregationFunction();
            this.state = 166;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 162;
                this.match(QQLParser.COMMA);
                this.state = 163;
                this.aggregationFunction();
                }
                }
                this.state = 168;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 171;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 169;
                this.match(QQLParser.BY);
                this.state = 170;
                this.groupby();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public aggregationFunction(): AggregationFunctionContext {
        let localContext = new AggregationFunctionContext(this.context, this.state);
        this.enterRule(localContext, 22, QQLParser.RULE_aggregationFunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 173;
            this.match(QQLParser.IDENTIFIER);
            this.state = 179;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 27) {
                {
                this.state = 174;
                this.match(QQLParser.LPAREN);
                this.state = 176;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 51) {
                    {
                    this.state = 175;
                    this.match(QQLParser.IDENTIFIER);
                    }
                }

                this.state = 178;
                this.match(QQLParser.RPAREN);
                }
            }

            this.state = 183;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9) {
                {
                this.state = 181;
                this.match(QQLParser.AS);
                this.state = 182;
                this.match(QQLParser.IDENTIFIER);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public groupby(): GroupbyContext {
        let localContext = new GroupbyContext(this.context, this.state);
        this.enterRule(localContext, 24, QQLParser.RULE_groupby);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 185;
            this.match(QQLParser.IDENTIFIER);
            this.state = 190;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 186;
                this.match(QQLParser.COMMA);
                this.state = 187;
                this.match(QQLParser.IDENTIFIER);
                }
                }
                this.state = 192;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whereCmd(): WhereCmdContext {
        let localContext = new WhereCmdContext(this.context, this.state);
        this.enterRule(localContext, 26, QQLParser.RULE_whereCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 193;
            this.match(QQLParser.WHERE);
            this.state = 194;
            this.logicalExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sortCmd(): SortCmdContext {
        let localContext = new SortCmdContext(this.context, this.state);
        this.enterRule(localContext, 28, QQLParser.RULE_sortCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 196;
            this.match(QQLParser.SORT);
            this.state = 197;
            this.sortColumn();
            this.state = 202;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 198;
                this.match(QQLParser.COMMA);
                this.state = 199;
                this.sortColumn();
                }
                }
                this.state = 204;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sortColumn(): SortColumnContext {
        let localContext = new SortColumnContext(this.context, this.state);
        this.enterRule(localContext, 30, QQLParser.RULE_sortColumn);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 205;
            this.match(QQLParser.IDENTIFIER);
            this.state = 207;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 15 || _la === 16) {
                {
                this.state = 206;
                _la = this.tokenStream.LA(1);
                if(!(_la === 15 || _la === 16)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public evalCmd(): EvalCmdContext {
        let localContext = new EvalCmdContext(this.context, this.state);
        this.enterRule(localContext, 32, QQLParser.RULE_evalCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 209;
            this.match(QQLParser.EVAL);
            this.state = 210;
            this.evalExpression();
            this.state = 215;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 211;
                this.match(QQLParser.COMMA);
                this.state = 212;
                this.evalExpression();
                }
                }
                this.state = 217;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public evalExpression(): EvalExpressionContext {
        let localContext = new EvalExpressionContext(this.context, this.state);
        this.enterRule(localContext, 34, QQLParser.RULE_evalExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 218;
            this.match(QQLParser.IDENTIFIER);
            this.state = 219;
            this.match(QQLParser.EQUAL);
            this.state = 220;
            this.evalFunctionArg();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public regexCmd(): RegexCmdContext {
        let localContext = new RegexCmdContext(this.context, this.state);
        this.enterRule(localContext, 36, QQLParser.RULE_regexCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 222;
            this.match(QQLParser.REGEX);
            this.state = 223;
            this.match(QQLParser.FIELD);
            this.state = 224;
            this.regexLiteral();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public timechartCmd(): TimechartCmdContext {
        let localContext = new TimechartCmdContext(this.context, this.state);
        this.enterRule(localContext, 38, QQLParser.RULE_timechartCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 226;
            this.match(QQLParser.TIMECHART);
            this.state = 227;
            this.aggregationFunction();
            this.state = 232;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 228;
                this.match(QQLParser.COMMA);
                this.state = 229;
                this.aggregationFunction();
                }
                }
                this.state = 234;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 238;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14336) !== 0)) {
                {
                {
                this.state = 235;
                this.timechartParams();
                }
                }
                this.state = 240;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 243;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 241;
                this.match(QQLParser.BY);
                this.state = 242;
                this.groupby();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public timechartParams(): TimechartParamsContext {
        let localContext = new TimechartParamsContext(this.context, this.state);
        this.enterRule(localContext, 40, QQLParser.RULE_timechartParams);
        try {
            this.state = 251;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.SPAN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 245;
                this.match(QQLParser.SPAN);
                this.state = 246;
                this.match(QQLParser.IDENTIFIER);
                }
                break;
            case QQLParser.TIMECOL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 247;
                this.match(QQLParser.TIMECOL);
                this.state = 248;
                this.match(QQLParser.IDENTIFIER);
                }
                break;
            case QQLParser.MAXGROUPS:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 249;
                this.match(QQLParser.MAXGROUPS);
                this.state = 250;
                this.match(QQLParser.INTEGER);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public unpackCmd(): UnpackCmdContext {
        let localContext = new UnpackCmdContext(this.context, this.state);
        this.enterRule(localContext, 42, QQLParser.RULE_unpackCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 253;
            this.match(QQLParser.UNPACK);
            this.state = 254;
            this.match(QQLParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public logicalExpression(): LogicalExpressionContext {
        let localContext = new LogicalExpressionContext(this.context, this.state);
        this.enterRule(localContext, 44, QQLParser.RULE_logicalExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 256;
            this.unitExpression();
            this.state = 260;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 25, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 257;
                    this.logicalTail();
                    }
                    }
                }
                this.state = 262;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 25, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public logicalTail(): LogicalTailContext {
        let localContext = new LogicalTailContext(this.context, this.state);
        this.enterRule(localContext, 46, QQLParser.RULE_logicalTail);
        try {
            this.state = 267;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 263;
                this.match(QQLParser.AND);
                this.state = 264;
                this.logicalExpression();
                }
                break;
            case QQLParser.OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 265;
                this.match(QQLParser.OR);
                this.state = 266;
                this.logicalExpression();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public unitExpression(): UnitExpressionContext {
        let localContext = new UnitExpressionContext(this.context, this.state);
        this.enterRule(localContext, 48, QQLParser.RULE_unitExpression);
        try {
            this.state = 279;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.TRUE:
            case QQLParser.FALSE:
            case QQLParser.NOT:
            case QQLParser.DQUOT_STRING:
            case QQLParser.SQUOT_STRING:
            case QQLParser.INTEGER:
            case QQLParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 273;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 27, this.context) ) {
                case 1:
                    {
                    this.state = 269;
                    this.inArrayExpression();
                    }
                    break;
                case 2:
                    {
                    this.state = 270;
                    this.comparisonExpression();
                    }
                    break;
                case 3:
                    {
                    this.state = 271;
                    this.notExpression();
                    }
                    break;
                case 4:
                    {
                    this.state = 272;
                    this.functionExpression();
                    }
                    break;
                }
                }
                break;
            case QQLParser.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 275;
                this.match(QQLParser.LPAREN);
                this.state = 276;
                this.logicalExpression();
                this.state = 277;
                this.match(QQLParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public notExpression(): NotExpressionContext {
        let localContext = new NotExpressionContext(this.context, this.state);
        this.enterRule(localContext, 50, QQLParser.RULE_notExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 281;
            this.match(QQLParser.NOT);
            this.state = 282;
            this.unitExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public inArrayExpression(): InArrayExpressionContext {
        let localContext = new InArrayExpressionContext(this.context, this.state);
        this.enterRule(localContext, 52, QQLParser.RULE_inArrayExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 284;
            this.factor();
            this.state = 285;
            this.match(QQLParser.IN);
            this.state = 286;
            this.match(QQLParser.LBRACKET);
            this.state = 287;
            this.factor();
            this.state = 292;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 288;
                this.match(QQLParser.COMMA);
                this.state = 289;
                this.factor();
                }
                }
                this.state = 294;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 295;
            this.match(QQLParser.RBRACKET);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public comparisonExpression(): ComparisonExpressionContext {
        let localContext = new ComparisonExpressionContext(this.context, this.state);
        this.enterRule(localContext, 54, QQLParser.RULE_comparisonExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 297;
            this.factor();
            this.state = 298;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 63) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 299;
            this.factor();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public functionExpression(): FunctionExpressionContext {
        let localContext = new FunctionExpressionContext(this.context, this.state);
        this.enterRule(localContext, 56, QQLParser.RULE_functionExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 301;
            this.match(QQLParser.IDENTIFIER);
            this.state = 302;
            this.match(QQLParser.LPAREN);
            this.state = 304;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 135004160) !== 0) || ((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & 3969) !== 0)) {
                {
                this.state = 303;
                this.functionArgs();
                }
            }

            this.state = 306;
            this.match(QQLParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public functionArgs(): FunctionArgsContext {
        let localContext = new FunctionArgsContext(this.context, this.state);
        this.enterRule(localContext, 58, QQLParser.RULE_functionArgs);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 308;
            this.functionArg();
            this.state = 313;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 309;
                this.match(QQLParser.COMMA);
                this.state = 310;
                this.functionArg();
                }
                }
                this.state = 315;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public functionArg(): FunctionArgContext {
        let localContext = new FunctionArgContext(this.context, this.state);
        this.enterRule(localContext, 60, QQLParser.RULE_functionArg);
        try {
            this.state = 320;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 32, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 316;
                this.factor();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 317;
                this.regexLiteral();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 318;
                this.logicalExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 319;
                this.functionExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public evalFunctionArg(): EvalFunctionArgContext {
        let localContext = new EvalFunctionArgContext(this.context, this.state);
        this.enterRule(localContext, 62, QQLParser.RULE_evalFunctionArg);
        try {
            this.state = 327;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 33, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 322;
                this.factor();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 323;
                this.logicalExpression();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 324;
                this.evalFunction();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 325;
                this.calcExpression();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 326;
                this.functionExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public evalFunction(): EvalFunctionContext {
        let localContext = new EvalFunctionContext(this.context, this.state);
        this.enterRule(localContext, 64, QQLParser.RULE_evalFunction);
        try {
            let alternative: number;
            this.state = 348;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.IF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 329;
                this.match(QQLParser.IF);
                this.state = 330;
                this.match(QQLParser.LPAREN);
                this.state = 331;
                this.logicalExpression();
                this.state = 332;
                this.match(QQLParser.RPAREN);
                this.state = 333;
                this.evalFunctionArg();
                this.state = 336;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 34, this.context) ) {
                case 1:
                    {
                    this.state = 334;
                    this.match(QQLParser.ELSE);
                    this.state = 335;
                    this.evalFunctionArg();
                    }
                    break;
                }
                }
                break;
            case QQLParser.CASE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 338;
                this.match(QQLParser.CASE);
                this.state = 340;
                this.errorHandler.sync(this);
                alternative = 1;
                do {
                    switch (alternative) {
                    case 1:
                        {
                        {
                        this.state = 339;
                        this.caseThen();
                        }
                        }
                        break;
                    default:
                        throw new antlr.NoViableAltException(this);
                    }
                    this.state = 342;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 35, this.context);
                } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
                this.state = 346;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 36, this.context) ) {
                case 1:
                    {
                    this.state = 344;
                    this.match(QQLParser.ELSE);
                    this.state = 345;
                    this.evalFunctionArg();
                    }
                    break;
                }
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public caseThen(): CaseThenContext {
        let localContext = new CaseThenContext(this.context, this.state);
        this.enterRule(localContext, 66, QQLParser.RULE_caseThen);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 350;
            this.match(QQLParser.IF);
            this.state = 351;
            this.match(QQLParser.LPAREN);
            this.state = 352;
            this.logicalExpression();
            this.state = 353;
            this.match(QQLParser.RPAREN);
            this.state = 354;
            this.evalFunctionArg();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public calcExpression(): CalcExpressionContext {
        let localContext = new CalcExpressionContext(this.context, this.state);
        this.enterRule(localContext, 68, QQLParser.RULE_calcExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 356;
            this.calcTerm();
            this.state = 360;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 41 || _la === 42) {
                {
                {
                this.state = 357;
                this.calcAction();
                }
                }
                this.state = 362;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public calcAction(): CalcActionContext {
        let localContext = new CalcActionContext(this.context, this.state);
        this.enterRule(localContext, 70, QQLParser.RULE_calcAction);
        try {
            this.state = 367;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.PLUS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 363;
                this.match(QQLParser.PLUS);
                this.state = 364;
                this.calcTerm();
                }
                break;
            case QQLParser.MINUS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 365;
                this.match(QQLParser.MINUS);
                this.state = 366;
                this.calcTerm();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public calcTerm(): CalcTermContext {
        let localContext = new CalcTermContext(this.context, this.state);
        this.enterRule(localContext, 72, QQLParser.RULE_calcTerm);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 369;
            this.calculateUnit();
            this.state = 373;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 43 || _la === 44) {
                {
                {
                this.state = 370;
                this.calcTermAction();
                }
                }
                this.state = 375;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public calcTermAction(): CalcTermActionContext {
        let localContext = new CalcTermActionContext(this.context, this.state);
        this.enterRule(localContext, 74, QQLParser.RULE_calcTermAction);
        try {
            this.state = 380;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.MULTIPLY:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 376;
                this.match(QQLParser.MULTIPLY);
                this.state = 377;
                this.calculateUnit();
                }
                break;
            case QQLParser.DIVIDE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 378;
                this.match(QQLParser.DIVIDE);
                this.state = 379;
                this.calculateUnit();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public calculateUnit(): CalculateUnitContext {
        let localContext = new CalculateUnitContext(this.context, this.state);
        this.enterRule(localContext, 76, QQLParser.RULE_calculateUnit);
        try {
            this.state = 387;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.TRUE:
            case QQLParser.FALSE:
            case QQLParser.DQUOT_STRING:
            case QQLParser.SQUOT_STRING:
            case QQLParser.INTEGER:
            case QQLParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 382;
                this.factor();
                }
                break;
            case QQLParser.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 383;
                this.match(QQLParser.LPAREN);
                this.state = 384;
                this.calcExpression();
                this.state = 385;
                this.match(QQLParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public factor(): FactorContext {
        let localContext = new FactorContext(this.context, this.state);
        this.enterRule(localContext, 78, QQLParser.RULE_factor);
        try {
            this.state = 393;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.DQUOT_STRING:
            case QQLParser.SQUOT_STRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 389;
                this.literalString();
                }
                break;
            case QQLParser.INTEGER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 390;
                this.match(QQLParser.INTEGER);
                }
                break;
            case QQLParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 391;
                this.match(QQLParser.IDENTIFIER);
                }
                break;
            case QQLParser.TRUE:
            case QQLParser.FALSE:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 392;
                this.literalBoolean();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public literalBoolean(): LiteralBooleanContext {
        let localContext = new LiteralBooleanContext(this.context, this.state);
        this.enterRule(localContext, 80, QQLParser.RULE_literalBoolean);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 395;
            _la = this.tokenStream.LA(1);
            if(!(_la === 18 || _la === 19)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public literalString(): LiteralStringContext {
        let localContext = new LiteralStringContext(this.context, this.state);
        this.enterRule(localContext, 82, QQLParser.RULE_literalString);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 397;
            _la = this.tokenStream.LA(1);
            if(!(_la === 47 || _la === 48)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public regexLiteral(): RegexLiteralContext {
        let localContext = new RegexLiteralContext(this.context, this.state);
        this.enterRule(localContext, 84, QQLParser.RULE_regexLiteral);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 399;
            this.match(QQLParser.REGEX_PATTERN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,53,402,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,1,0,5,0,88,8,0,10,0,12,0,91,9,0,1,
        0,5,0,94,8,0,10,0,12,0,97,9,0,1,0,1,0,5,0,101,8,0,10,0,12,0,104,
        9,0,1,1,1,1,1,2,1,2,1,2,1,2,3,2,112,8,2,1,3,1,3,3,3,116,8,3,1,4,
        1,4,1,4,1,4,3,4,122,8,4,1,5,1,5,1,5,3,5,127,8,5,1,6,1,6,1,6,4,6,
        132,8,6,11,6,12,6,133,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,3,7,145,
        8,7,1,8,1,8,1,8,1,8,5,8,151,8,8,10,8,12,8,154,9,8,1,9,1,9,1,9,3,
        9,159,8,9,1,10,1,10,1,10,1,10,5,10,165,8,10,10,10,12,10,168,9,10,
        1,10,1,10,3,10,172,8,10,1,11,1,11,1,11,3,11,177,8,11,1,11,3,11,180,
        8,11,1,11,1,11,3,11,184,8,11,1,12,1,12,1,12,5,12,189,8,12,10,12,
        12,12,192,9,12,1,13,1,13,1,13,1,14,1,14,1,14,1,14,5,14,201,8,14,
        10,14,12,14,204,9,14,1,15,1,15,3,15,208,8,15,1,16,1,16,1,16,1,16,
        5,16,214,8,16,10,16,12,16,217,9,16,1,17,1,17,1,17,1,17,1,18,1,18,
        1,18,1,18,1,19,1,19,1,19,1,19,5,19,231,8,19,10,19,12,19,234,9,19,
        1,19,5,19,237,8,19,10,19,12,19,240,9,19,1,19,1,19,3,19,244,8,19,
        1,20,1,20,1,20,1,20,1,20,1,20,3,20,252,8,20,1,21,1,21,1,21,1,22,
        1,22,5,22,259,8,22,10,22,12,22,262,9,22,1,23,1,23,1,23,1,23,3,23,
        268,8,23,1,24,1,24,1,24,1,24,3,24,274,8,24,1,24,1,24,1,24,1,24,3,
        24,280,8,24,1,25,1,25,1,25,1,26,1,26,1,26,1,26,1,26,1,26,5,26,291,
        8,26,10,26,12,26,294,9,26,1,26,1,26,1,27,1,27,1,27,1,27,1,28,1,28,
        1,28,3,28,305,8,28,1,28,1,28,1,29,1,29,1,29,5,29,312,8,29,10,29,
        12,29,315,9,29,1,30,1,30,1,30,1,30,3,30,321,8,30,1,31,1,31,1,31,
        1,31,1,31,3,31,328,8,31,1,32,1,32,1,32,1,32,1,32,1,32,1,32,3,32,
        337,8,32,1,32,1,32,4,32,341,8,32,11,32,12,32,342,1,32,1,32,3,32,
        347,8,32,3,32,349,8,32,1,33,1,33,1,33,1,33,1,33,1,33,1,34,1,34,5,
        34,359,8,34,10,34,12,34,362,9,34,1,35,1,35,1,35,1,35,3,35,368,8,
        35,1,36,1,36,5,36,372,8,36,10,36,12,36,375,9,36,1,37,1,37,1,37,1,
        37,3,37,381,8,37,1,38,1,38,1,38,1,38,1,38,3,38,388,8,38,1,39,1,39,
        1,39,1,39,3,39,394,8,39,1,40,1,40,1,41,1,41,1,42,1,42,1,42,0,0,43,
        0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,
        46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,0,4,
        1,0,15,16,1,0,32,37,1,0,18,19,1,0,47,48,419,0,89,1,0,0,0,2,105,1,
        0,0,0,4,107,1,0,0,0,6,113,1,0,0,0,8,121,1,0,0,0,10,123,1,0,0,0,12,
        131,1,0,0,0,14,135,1,0,0,0,16,146,1,0,0,0,18,155,1,0,0,0,20,160,
        1,0,0,0,22,173,1,0,0,0,24,185,1,0,0,0,26,193,1,0,0,0,28,196,1,0,
        0,0,30,205,1,0,0,0,32,209,1,0,0,0,34,218,1,0,0,0,36,222,1,0,0,0,
        38,226,1,0,0,0,40,251,1,0,0,0,42,253,1,0,0,0,44,256,1,0,0,0,46,267,
        1,0,0,0,48,279,1,0,0,0,50,281,1,0,0,0,52,284,1,0,0,0,54,297,1,0,
        0,0,56,301,1,0,0,0,58,308,1,0,0,0,60,320,1,0,0,0,62,327,1,0,0,0,
        64,348,1,0,0,0,66,350,1,0,0,0,68,356,1,0,0,0,70,367,1,0,0,0,72,369,
        1,0,0,0,74,380,1,0,0,0,76,387,1,0,0,0,78,393,1,0,0,0,80,395,1,0,
        0,0,82,397,1,0,0,0,84,399,1,0,0,0,86,88,3,2,1,0,87,86,1,0,0,0,88,
        91,1,0,0,0,89,87,1,0,0,0,89,90,1,0,0,0,90,95,1,0,0,0,91,89,1,0,0,
        0,92,94,3,4,2,0,93,92,1,0,0,0,94,97,1,0,0,0,95,93,1,0,0,0,95,96,
        1,0,0,0,96,98,1,0,0,0,97,95,1,0,0,0,98,102,3,6,3,0,99,101,3,14,7,
        0,100,99,1,0,0,0,101,104,1,0,0,0,102,100,1,0,0,0,102,103,1,0,0,0,
        103,1,1,0,0,0,104,102,1,0,0,0,105,106,5,46,0,0,106,3,1,0,0,0,107,
        108,5,51,0,0,108,111,5,31,0,0,109,112,3,82,41,0,110,112,3,84,42,
        0,111,109,1,0,0,0,111,110,1,0,0,0,112,5,1,0,0,0,113,115,3,10,5,0,
        114,116,3,8,4,0,115,114,1,0,0,0,115,116,1,0,0,0,116,7,1,0,0,0,117,
        118,5,23,0,0,118,122,3,6,3,0,119,120,5,24,0,0,120,122,3,6,3,0,121,
        117,1,0,0,0,121,119,1,0,0,0,122,9,1,0,0,0,123,126,3,12,6,0,124,125,
        5,45,0,0,125,127,3,12,6,0,126,124,1,0,0,0,126,127,1,0,0,0,127,11,
        1,0,0,0,128,132,5,51,0,0,129,132,5,50,0,0,130,132,3,82,41,0,131,
        128,1,0,0,0,131,129,1,0,0,0,131,130,1,0,0,0,132,133,1,0,0,0,133,
        131,1,0,0,0,133,134,1,0,0,0,134,13,1,0,0,0,135,144,5,25,0,0,136,
        145,3,16,8,0,137,145,3,20,10,0,138,145,3,26,13,0,139,145,3,28,14,
        0,140,145,3,32,16,0,141,145,3,36,18,0,142,145,3,38,19,0,143,145,
        3,42,21,0,144,136,1,0,0,0,144,137,1,0,0,0,144,138,1,0,0,0,144,139,
        1,0,0,0,144,140,1,0,0,0,144,141,1,0,0,0,144,142,1,0,0,0,144,143,
        1,0,0,0,145,15,1,0,0,0,146,147,5,1,0,0,147,152,3,18,9,0,148,149,
        5,26,0,0,149,151,3,18,9,0,150,148,1,0,0,0,151,154,1,0,0,0,152,150,
        1,0,0,0,152,153,1,0,0,0,153,17,1,0,0,0,154,152,1,0,0,0,155,158,5,
        51,0,0,156,157,5,9,0,0,157,159,5,51,0,0,158,156,1,0,0,0,158,159,
        1,0,0,0,159,19,1,0,0,0,160,161,5,2,0,0,161,166,3,22,11,0,162,163,
        5,26,0,0,163,165,3,22,11,0,164,162,1,0,0,0,165,168,1,0,0,0,166,164,
        1,0,0,0,166,167,1,0,0,0,167,171,1,0,0,0,168,166,1,0,0,0,169,170,
        5,10,0,0,170,172,3,24,12,0,171,169,1,0,0,0,171,172,1,0,0,0,172,21,
        1,0,0,0,173,179,5,51,0,0,174,176,5,27,0,0,175,177,5,51,0,0,176,175,
        1,0,0,0,176,177,1,0,0,0,177,178,1,0,0,0,178,180,5,28,0,0,179,174,
        1,0,0,0,179,180,1,0,0,0,180,183,1,0,0,0,181,182,5,9,0,0,182,184,
        5,51,0,0,183,181,1,0,0,0,183,184,1,0,0,0,184,23,1,0,0,0,185,190,
        5,51,0,0,186,187,5,26,0,0,187,189,5,51,0,0,188,186,1,0,0,0,189,192,
        1,0,0,0,190,188,1,0,0,0,190,191,1,0,0,0,191,25,1,0,0,0,192,190,1,
        0,0,0,193,194,5,3,0,0,194,195,3,44,22,0,195,27,1,0,0,0,196,197,5,
        4,0,0,197,202,3,30,15,0,198,199,5,26,0,0,199,201,3,30,15,0,200,198,
        1,0,0,0,201,204,1,0,0,0,202,200,1,0,0,0,202,203,1,0,0,0,203,29,1,
        0,0,0,204,202,1,0,0,0,205,207,5,51,0,0,206,208,7,0,0,0,207,206,1,
        0,0,0,207,208,1,0,0,0,208,31,1,0,0,0,209,210,5,5,0,0,210,215,3,34,
        17,0,211,212,5,26,0,0,212,214,3,34,17,0,213,211,1,0,0,0,214,217,
        1,0,0,0,215,213,1,0,0,0,215,216,1,0,0,0,216,33,1,0,0,0,217,215,1,
        0,0,0,218,219,5,51,0,0,219,220,5,31,0,0,220,221,3,62,31,0,221,35,
        1,0,0,0,222,223,5,6,0,0,223,224,5,14,0,0,224,225,3,84,42,0,225,37,
        1,0,0,0,226,227,5,7,0,0,227,232,3,22,11,0,228,229,5,26,0,0,229,231,
        3,22,11,0,230,228,1,0,0,0,231,234,1,0,0,0,232,230,1,0,0,0,232,233,
        1,0,0,0,233,238,1,0,0,0,234,232,1,0,0,0,235,237,3,40,20,0,236,235,
        1,0,0,0,237,240,1,0,0,0,238,236,1,0,0,0,238,239,1,0,0,0,239,243,
        1,0,0,0,240,238,1,0,0,0,241,242,5,10,0,0,242,244,3,24,12,0,243,241,
        1,0,0,0,243,244,1,0,0,0,244,39,1,0,0,0,245,246,5,11,0,0,246,252,
        5,51,0,0,247,248,5,12,0,0,248,252,5,51,0,0,249,250,5,13,0,0,250,
        252,5,50,0,0,251,245,1,0,0,0,251,247,1,0,0,0,251,249,1,0,0,0,252,
        41,1,0,0,0,253,254,5,8,0,0,254,255,5,51,0,0,255,43,1,0,0,0,256,260,
        3,48,24,0,257,259,3,46,23,0,258,257,1,0,0,0,259,262,1,0,0,0,260,
        258,1,0,0,0,260,261,1,0,0,0,261,45,1,0,0,0,262,260,1,0,0,0,263,264,
        5,38,0,0,264,268,3,44,22,0,265,266,5,39,0,0,266,268,3,44,22,0,267,
        263,1,0,0,0,267,265,1,0,0,0,268,47,1,0,0,0,269,274,3,52,26,0,270,
        274,3,54,27,0,271,274,3,50,25,0,272,274,3,56,28,0,273,269,1,0,0,
        0,273,270,1,0,0,0,273,271,1,0,0,0,273,272,1,0,0,0,274,280,1,0,0,
        0,275,276,5,27,0,0,276,277,3,44,22,0,277,278,5,28,0,0,278,280,1,
        0,0,0,279,273,1,0,0,0,279,275,1,0,0,0,280,49,1,0,0,0,281,282,5,40,
        0,0,282,283,3,48,24,0,283,51,1,0,0,0,284,285,3,78,39,0,285,286,5,
        17,0,0,286,287,5,29,0,0,287,292,3,78,39,0,288,289,5,26,0,0,289,291,
        3,78,39,0,290,288,1,0,0,0,291,294,1,0,0,0,292,290,1,0,0,0,292,293,
        1,0,0,0,293,295,1,0,0,0,294,292,1,0,0,0,295,296,5,30,0,0,296,53,
        1,0,0,0,297,298,3,78,39,0,298,299,7,1,0,0,299,300,3,78,39,0,300,
        55,1,0,0,0,301,302,5,51,0,0,302,304,5,27,0,0,303,305,3,58,29,0,304,
        303,1,0,0,0,304,305,1,0,0,0,305,306,1,0,0,0,306,307,5,28,0,0,307,
        57,1,0,0,0,308,313,3,60,30,0,309,310,5,26,0,0,310,312,3,60,30,0,
        311,309,1,0,0,0,312,315,1,0,0,0,313,311,1,0,0,0,313,314,1,0,0,0,
        314,59,1,0,0,0,315,313,1,0,0,0,316,321,3,78,39,0,317,321,3,84,42,
        0,318,321,3,44,22,0,319,321,3,56,28,0,320,316,1,0,0,0,320,317,1,
        0,0,0,320,318,1,0,0,0,320,319,1,0,0,0,321,61,1,0,0,0,322,328,3,78,
        39,0,323,328,3,44,22,0,324,328,3,64,32,0,325,328,3,68,34,0,326,328,
        3,56,28,0,327,322,1,0,0,0,327,323,1,0,0,0,327,324,1,0,0,0,327,325,
        1,0,0,0,327,326,1,0,0,0,328,63,1,0,0,0,329,330,5,20,0,0,330,331,
        5,27,0,0,331,332,3,44,22,0,332,333,5,28,0,0,333,336,3,62,31,0,334,
        335,5,22,0,0,335,337,3,62,31,0,336,334,1,0,0,0,336,337,1,0,0,0,337,
        349,1,0,0,0,338,340,5,21,0,0,339,341,3,66,33,0,340,339,1,0,0,0,341,
        342,1,0,0,0,342,340,1,0,0,0,342,343,1,0,0,0,343,346,1,0,0,0,344,
        345,5,22,0,0,345,347,3,62,31,0,346,344,1,0,0,0,346,347,1,0,0,0,347,
        349,1,0,0,0,348,329,1,0,0,0,348,338,1,0,0,0,349,65,1,0,0,0,350,351,
        5,20,0,0,351,352,5,27,0,0,352,353,3,44,22,0,353,354,5,28,0,0,354,
        355,3,62,31,0,355,67,1,0,0,0,356,360,3,72,36,0,357,359,3,70,35,0,
        358,357,1,0,0,0,359,362,1,0,0,0,360,358,1,0,0,0,360,361,1,0,0,0,
        361,69,1,0,0,0,362,360,1,0,0,0,363,364,5,41,0,0,364,368,3,72,36,
        0,365,366,5,42,0,0,366,368,3,72,36,0,367,363,1,0,0,0,367,365,1,0,
        0,0,368,71,1,0,0,0,369,373,3,76,38,0,370,372,3,74,37,0,371,370,1,
        0,0,0,372,375,1,0,0,0,373,371,1,0,0,0,373,374,1,0,0,0,374,73,1,0,
        0,0,375,373,1,0,0,0,376,377,5,43,0,0,377,381,3,76,38,0,378,379,5,
        44,0,0,379,381,3,76,38,0,380,376,1,0,0,0,380,378,1,0,0,0,381,75,
        1,0,0,0,382,388,3,78,39,0,383,384,5,27,0,0,384,385,3,68,34,0,385,
        386,5,28,0,0,386,388,1,0,0,0,387,382,1,0,0,0,387,383,1,0,0,0,388,
        77,1,0,0,0,389,394,3,82,41,0,390,394,5,50,0,0,391,394,5,51,0,0,392,
        394,3,80,40,0,393,389,1,0,0,0,393,390,1,0,0,0,393,391,1,0,0,0,393,
        392,1,0,0,0,394,79,1,0,0,0,395,396,7,2,0,0,396,81,1,0,0,0,397,398,
        7,3,0,0,398,83,1,0,0,0,399,400,5,49,0,0,400,85,1,0,0,0,44,89,95,
        102,111,115,121,126,131,133,144,152,158,166,171,176,179,183,190,
        202,207,215,232,238,243,251,260,267,273,279,292,304,313,320,327,
        336,342,346,348,360,367,373,380,387,393
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!QQLParser.__ATN) {
            QQLParser.__ATN = new antlr.ATNDeserializer().deserialize(QQLParser._serializedATN);
        }

        return QQLParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(QQLParser.literalNames, QQLParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return QQLParser.vocabulary;
    }

    private static readonly decisionsToDFA = QQLParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class QueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public search(): SearchContext {
        return this.getRuleContext(0, SearchContext)!;
    }
    public datasource(): DatasourceContext[];
    public datasource(i: number): DatasourceContext | null;
    public datasource(i?: number): DatasourceContext[] | DatasourceContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DatasourceContext);
        }

        return this.getRuleContext(i, DatasourceContext);
    }
    public controllerParam(): ControllerParamContext[];
    public controllerParam(i: number): ControllerParamContext | null;
    public controllerParam(i?: number): ControllerParamContext[] | ControllerParamContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ControllerParamContext);
        }

        return this.getRuleContext(i, ControllerParamContext);
    }
    public pipelineCommand(): PipelineCommandContext[];
    public pipelineCommand(i: number): PipelineCommandContext | null;
    public pipelineCommand(i?: number): PipelineCommandContext[] | PipelineCommandContext | null {
        if (i === undefined) {
            return this.getRuleContexts(PipelineCommandContext);
        }

        return this.getRuleContext(i, PipelineCommandContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_query;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitQuery) {
            return visitor.visitQuery(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DatasourceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AT_DATASOURCE(): antlr.TerminalNode {
        return this.getToken(QQLParser.AT_DATASOURCE, 0)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_datasource;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitDatasource) {
            return visitor.visitDatasource(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ControllerParamContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QQLParser.IDENTIFIER, 0)!;
    }
    public EQUAL(): antlr.TerminalNode {
        return this.getToken(QQLParser.EQUAL, 0)!;
    }
    public literalString(): LiteralStringContext | null {
        return this.getRuleContext(0, LiteralStringContext);
    }
    public regexLiteral(): RegexLiteralContext | null {
        return this.getRuleContext(0, RegexLiteralContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_controllerParam;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitControllerParam) {
            return visitor.visitControllerParam(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SearchContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public searchFactor(): SearchFactorContext {
        return this.getRuleContext(0, SearchFactorContext)!;
    }
    public searchTail(): SearchTailContext | null {
        return this.getRuleContext(0, SearchTailContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_search;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSearch) {
            return visitor.visitSearch(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SearchTailContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SEARCH_AND(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.SEARCH_AND, 0);
    }
    public search(): SearchContext {
        return this.getRuleContext(0, SearchContext)!;
    }
    public SEARCH_OR(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.SEARCH_OR, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_searchTail;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSearchTail) {
            return visitor.visitSearchTail(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SearchFactorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public searchLiteral(): SearchLiteralContext[];
    public searchLiteral(i: number): SearchLiteralContext | null;
    public searchLiteral(i?: number): SearchLiteralContext[] | SearchLiteralContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SearchLiteralContext);
        }

        return this.getRuleContext(i, SearchLiteralContext);
    }
    public SEARCH_PARAM_NEQ(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.SEARCH_PARAM_NEQ, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_searchFactor;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSearchFactor) {
            return visitor.visitSearchFactor(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SearchLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.IDENTIFIER);
    	} else {
    		return this.getToken(QQLParser.IDENTIFIER, i);
    	}
    }
    public INTEGER(): antlr.TerminalNode[];
    public INTEGER(i: number): antlr.TerminalNode | null;
    public INTEGER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.INTEGER);
    	} else {
    		return this.getToken(QQLParser.INTEGER, i);
    	}
    }
    public literalString(): LiteralStringContext[];
    public literalString(i: number): LiteralStringContext | null;
    public literalString(i?: number): LiteralStringContext[] | LiteralStringContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LiteralStringContext);
        }

        return this.getRuleContext(i, LiteralStringContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_searchLiteral;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSearchLiteral) {
            return visitor.visitSearchLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PipelineCommandContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public PIPE(): antlr.TerminalNode {
        return this.getToken(QQLParser.PIPE, 0)!;
    }
    public tableCmd(): TableCmdContext | null {
        return this.getRuleContext(0, TableCmdContext);
    }
    public statsCmd(): StatsCmdContext | null {
        return this.getRuleContext(0, StatsCmdContext);
    }
    public whereCmd(): WhereCmdContext | null {
        return this.getRuleContext(0, WhereCmdContext);
    }
    public sortCmd(): SortCmdContext | null {
        return this.getRuleContext(0, SortCmdContext);
    }
    public evalCmd(): EvalCmdContext | null {
        return this.getRuleContext(0, EvalCmdContext);
    }
    public regexCmd(): RegexCmdContext | null {
        return this.getRuleContext(0, RegexCmdContext);
    }
    public timechartCmd(): TimechartCmdContext | null {
        return this.getRuleContext(0, TimechartCmdContext);
    }
    public unpackCmd(): UnpackCmdContext | null {
        return this.getRuleContext(0, UnpackCmdContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_pipelineCommand;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitPipelineCommand) {
            return visitor.visitPipelineCommand(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TableCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TABLE(): antlr.TerminalNode {
        return this.getToken(QQLParser.TABLE, 0)!;
    }
    public tableColumn(): TableColumnContext[];
    public tableColumn(i: number): TableColumnContext | null;
    public tableColumn(i?: number): TableColumnContext[] | TableColumnContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TableColumnContext);
        }

        return this.getRuleContext(i, TableColumnContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_tableCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitTableCmd) {
            return visitor.visitTableCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TableColumnContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.IDENTIFIER);
    	} else {
    		return this.getToken(QQLParser.IDENTIFIER, i);
    	}
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.AS, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_tableColumn;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitTableColumn) {
            return visitor.visitTableColumn(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StatsCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public STATS(): antlr.TerminalNode {
        return this.getToken(QQLParser.STATS, 0)!;
    }
    public aggregationFunction(): AggregationFunctionContext[];
    public aggregationFunction(i: number): AggregationFunctionContext | null;
    public aggregationFunction(i?: number): AggregationFunctionContext[] | AggregationFunctionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AggregationFunctionContext);
        }

        return this.getRuleContext(i, AggregationFunctionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public BY(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.BY, 0);
    }
    public groupby(): GroupbyContext | null {
        return this.getRuleContext(0, GroupbyContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_statsCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitStatsCmd) {
            return visitor.visitStatsCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AggregationFunctionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.IDENTIFIER);
    	} else {
    		return this.getToken(QQLParser.IDENTIFIER, i);
    	}
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.LPAREN, 0);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.RPAREN, 0);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.AS, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_aggregationFunction;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitAggregationFunction) {
            return visitor.visitAggregationFunction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GroupbyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.IDENTIFIER);
    	} else {
    		return this.getToken(QQLParser.IDENTIFIER, i);
    	}
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_groupby;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitGroupby) {
            return visitor.visitGroupby(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhereCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHERE(): antlr.TerminalNode {
        return this.getToken(QQLParser.WHERE, 0)!;
    }
    public logicalExpression(): LogicalExpressionContext {
        return this.getRuleContext(0, LogicalExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_whereCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitWhereCmd) {
            return visitor.visitWhereCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SortCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SORT(): antlr.TerminalNode {
        return this.getToken(QQLParser.SORT, 0)!;
    }
    public sortColumn(): SortColumnContext[];
    public sortColumn(i: number): SortColumnContext | null;
    public sortColumn(i?: number): SortColumnContext[] | SortColumnContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SortColumnContext);
        }

        return this.getRuleContext(i, SortColumnContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_sortCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSortCmd) {
            return visitor.visitSortCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SortColumnContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QQLParser.IDENTIFIER, 0)!;
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.ASC, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.DESC, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_sortColumn;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSortColumn) {
            return visitor.visitSortColumn(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EvalCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EVAL(): antlr.TerminalNode {
        return this.getToken(QQLParser.EVAL, 0)!;
    }
    public evalExpression(): EvalExpressionContext[];
    public evalExpression(i: number): EvalExpressionContext | null;
    public evalExpression(i?: number): EvalExpressionContext[] | EvalExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(EvalExpressionContext);
        }

        return this.getRuleContext(i, EvalExpressionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_evalCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitEvalCmd) {
            return visitor.visitEvalCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EvalExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QQLParser.IDENTIFIER, 0)!;
    }
    public EQUAL(): antlr.TerminalNode {
        return this.getToken(QQLParser.EQUAL, 0)!;
    }
    public evalFunctionArg(): EvalFunctionArgContext {
        return this.getRuleContext(0, EvalFunctionArgContext)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_evalExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitEvalExpression) {
            return visitor.visitEvalExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RegexCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public REGEX(): antlr.TerminalNode {
        return this.getToken(QQLParser.REGEX, 0)!;
    }
    public FIELD(): antlr.TerminalNode {
        return this.getToken(QQLParser.FIELD, 0)!;
    }
    public regexLiteral(): RegexLiteralContext {
        return this.getRuleContext(0, RegexLiteralContext)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_regexCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitRegexCmd) {
            return visitor.visitRegexCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TimechartCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TIMECHART(): antlr.TerminalNode {
        return this.getToken(QQLParser.TIMECHART, 0)!;
    }
    public aggregationFunction(): AggregationFunctionContext[];
    public aggregationFunction(i: number): AggregationFunctionContext | null;
    public aggregationFunction(i?: number): AggregationFunctionContext[] | AggregationFunctionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AggregationFunctionContext);
        }

        return this.getRuleContext(i, AggregationFunctionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public timechartParams(): TimechartParamsContext[];
    public timechartParams(i: number): TimechartParamsContext | null;
    public timechartParams(i?: number): TimechartParamsContext[] | TimechartParamsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TimechartParamsContext);
        }

        return this.getRuleContext(i, TimechartParamsContext);
    }
    public BY(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.BY, 0);
    }
    public groupby(): GroupbyContext | null {
        return this.getRuleContext(0, GroupbyContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_timechartCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitTimechartCmd) {
            return visitor.visitTimechartCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TimechartParamsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SPAN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.SPAN, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.IDENTIFIER, 0);
    }
    public TIMECOL(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.TIMECOL, 0);
    }
    public MAXGROUPS(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.MAXGROUPS, 0);
    }
    public INTEGER(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.INTEGER, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_timechartParams;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitTimechartParams) {
            return visitor.visitTimechartParams(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UnpackCmdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UNPACK(): antlr.TerminalNode {
        return this.getToken(QQLParser.UNPACK, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QQLParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_unpackCmd;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitUnpackCmd) {
            return visitor.visitUnpackCmd(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LogicalExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public unitExpression(): UnitExpressionContext {
        return this.getRuleContext(0, UnitExpressionContext)!;
    }
    public logicalTail(): LogicalTailContext[];
    public logicalTail(i: number): LogicalTailContext | null;
    public logicalTail(i?: number): LogicalTailContext[] | LogicalTailContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LogicalTailContext);
        }

        return this.getRuleContext(i, LogicalTailContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_logicalExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitLogicalExpression) {
            return visitor.visitLogicalExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LogicalTailContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AND(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.AND, 0);
    }
    public logicalExpression(): LogicalExpressionContext {
        return this.getRuleContext(0, LogicalExpressionContext)!;
    }
    public OR(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.OR, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_logicalTail;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitLogicalTail) {
            return visitor.visitLogicalTail(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UnitExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public inArrayExpression(): InArrayExpressionContext | null {
        return this.getRuleContext(0, InArrayExpressionContext);
    }
    public comparisonExpression(): ComparisonExpressionContext | null {
        return this.getRuleContext(0, ComparisonExpressionContext);
    }
    public notExpression(): NotExpressionContext | null {
        return this.getRuleContext(0, NotExpressionContext);
    }
    public functionExpression(): FunctionExpressionContext | null {
        return this.getRuleContext(0, FunctionExpressionContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.LPAREN, 0);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_unitExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitUnitExpression) {
            return visitor.visitUnitExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NotExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NOT(): antlr.TerminalNode {
        return this.getToken(QQLParser.NOT, 0)!;
    }
    public unitExpression(): UnitExpressionContext {
        return this.getRuleContext(0, UnitExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_notExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitNotExpression) {
            return visitor.visitNotExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InArrayExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public factor(): FactorContext[];
    public factor(i: number): FactorContext | null;
    public factor(i?: number): FactorContext[] | FactorContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FactorContext);
        }

        return this.getRuleContext(i, FactorContext);
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(QQLParser.IN, 0)!;
    }
    public LBRACKET(): antlr.TerminalNode {
        return this.getToken(QQLParser.LBRACKET, 0)!;
    }
    public RBRACKET(): antlr.TerminalNode {
        return this.getToken(QQLParser.RBRACKET, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_inArrayExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitInArrayExpression) {
            return visitor.visitInArrayExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ComparisonExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public factor(): FactorContext[];
    public factor(i: number): FactorContext | null;
    public factor(i?: number): FactorContext[] | FactorContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FactorContext);
        }

        return this.getRuleContext(i, FactorContext);
    }
    public EQUAL_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.EQUAL_EQUAL, 0);
    }
    public NOT_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.NOT_EQUAL, 0);
    }
    public GREATER_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.GREATER_EQUAL, 0);
    }
    public LESS_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.LESS_EQUAL, 0);
    }
    public GREATER_THAN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.GREATER_THAN, 0);
    }
    public LESS_THAN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.LESS_THAN, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_comparisonExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitComparisonExpression) {
            return visitor.visitComparisonExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FunctionExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QQLParser.IDENTIFIER, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QQLParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QQLParser.RPAREN, 0)!;
    }
    public functionArgs(): FunctionArgsContext | null {
        return this.getRuleContext(0, FunctionArgsContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_functionExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitFunctionExpression) {
            return visitor.visitFunctionExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FunctionArgsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public functionArg(): FunctionArgContext[];
    public functionArg(i: number): FunctionArgContext | null;
    public functionArg(i?: number): FunctionArgContext[] | FunctionArgContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FunctionArgContext);
        }

        return this.getRuleContext(i, FunctionArgContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQLParser.COMMA);
    	} else {
    		return this.getToken(QQLParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_functionArgs;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitFunctionArgs) {
            return visitor.visitFunctionArgs(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FunctionArgContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public factor(): FactorContext | null {
        return this.getRuleContext(0, FactorContext);
    }
    public regexLiteral(): RegexLiteralContext | null {
        return this.getRuleContext(0, RegexLiteralContext);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public functionExpression(): FunctionExpressionContext | null {
        return this.getRuleContext(0, FunctionExpressionContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_functionArg;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitFunctionArg) {
            return visitor.visitFunctionArg(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EvalFunctionArgContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public factor(): FactorContext | null {
        return this.getRuleContext(0, FactorContext);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public evalFunction(): EvalFunctionContext | null {
        return this.getRuleContext(0, EvalFunctionContext);
    }
    public calcExpression(): CalcExpressionContext | null {
        return this.getRuleContext(0, CalcExpressionContext);
    }
    public functionExpression(): FunctionExpressionContext | null {
        return this.getRuleContext(0, FunctionExpressionContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_evalFunctionArg;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitEvalFunctionArg) {
            return visitor.visitEvalFunctionArg(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EvalFunctionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IF(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.IF, 0);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.LPAREN, 0);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.RPAREN, 0);
    }
    public evalFunctionArg(): EvalFunctionArgContext[];
    public evalFunctionArg(i: number): EvalFunctionArgContext | null;
    public evalFunctionArg(i?: number): EvalFunctionArgContext[] | EvalFunctionArgContext | null {
        if (i === undefined) {
            return this.getRuleContexts(EvalFunctionArgContext);
        }

        return this.getRuleContext(i, EvalFunctionArgContext);
    }
    public ELSE(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.ELSE, 0);
    }
    public CASE(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.CASE, 0);
    }
    public caseThen(): CaseThenContext[];
    public caseThen(i: number): CaseThenContext | null;
    public caseThen(i?: number): CaseThenContext[] | CaseThenContext | null {
        if (i === undefined) {
            return this.getRuleContexts(CaseThenContext);
        }

        return this.getRuleContext(i, CaseThenContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_evalFunction;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitEvalFunction) {
            return visitor.visitEvalFunction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CaseThenContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IF(): antlr.TerminalNode {
        return this.getToken(QQLParser.IF, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QQLParser.LPAREN, 0)!;
    }
    public logicalExpression(): LogicalExpressionContext {
        return this.getRuleContext(0, LogicalExpressionContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QQLParser.RPAREN, 0)!;
    }
    public evalFunctionArg(): EvalFunctionArgContext {
        return this.getRuleContext(0, EvalFunctionArgContext)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_caseThen;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitCaseThen) {
            return visitor.visitCaseThen(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CalcExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public calcTerm(): CalcTermContext {
        return this.getRuleContext(0, CalcTermContext)!;
    }
    public calcAction(): CalcActionContext[];
    public calcAction(i: number): CalcActionContext | null;
    public calcAction(i?: number): CalcActionContext[] | CalcActionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(CalcActionContext);
        }

        return this.getRuleContext(i, CalcActionContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_calcExpression;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitCalcExpression) {
            return visitor.visitCalcExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CalcActionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public PLUS(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.PLUS, 0);
    }
    public calcTerm(): CalcTermContext {
        return this.getRuleContext(0, CalcTermContext)!;
    }
    public MINUS(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.MINUS, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_calcAction;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitCalcAction) {
            return visitor.visitCalcAction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CalcTermContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public calculateUnit(): CalculateUnitContext {
        return this.getRuleContext(0, CalculateUnitContext)!;
    }
    public calcTermAction(): CalcTermActionContext[];
    public calcTermAction(i: number): CalcTermActionContext | null;
    public calcTermAction(i?: number): CalcTermActionContext[] | CalcTermActionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(CalcTermActionContext);
        }

        return this.getRuleContext(i, CalcTermActionContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_calcTerm;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitCalcTerm) {
            return visitor.visitCalcTerm(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CalcTermActionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MULTIPLY(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.MULTIPLY, 0);
    }
    public calculateUnit(): CalculateUnitContext {
        return this.getRuleContext(0, CalculateUnitContext)!;
    }
    public DIVIDE(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.DIVIDE, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_calcTermAction;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitCalcTermAction) {
            return visitor.visitCalcTermAction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CalculateUnitContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public factor(): FactorContext | null {
        return this.getRuleContext(0, FactorContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.LPAREN, 0);
    }
    public calcExpression(): CalcExpressionContext | null {
        return this.getRuleContext(0, CalcExpressionContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_calculateUnit;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitCalculateUnit) {
            return visitor.visitCalculateUnit(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FactorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public literalString(): LiteralStringContext | null {
        return this.getRuleContext(0, LiteralStringContext);
    }
    public INTEGER(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.INTEGER, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.IDENTIFIER, 0);
    }
    public literalBoolean(): LiteralBooleanContext | null {
        return this.getRuleContext(0, LiteralBooleanContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_factor;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitFactor) {
            return visitor.visitFactor(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LiteralBooleanContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.FALSE, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_literalBoolean;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitLiteralBoolean) {
            return visitor.visitLiteralBoolean(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LiteralStringContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DQUOT_STRING(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.DQUOT_STRING, 0);
    }
    public SQUOT_STRING(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.SQUOT_STRING, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_literalString;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitLiteralString) {
            return visitor.visitLiteralString(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RegexLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public REGEX_PATTERN(): antlr.TerminalNode {
        return this.getToken(QQLParser.REGEX_PATTERN, 0)!;
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_regexLiteral;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitRegexLiteral) {
            return visitor.visitRegexLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
