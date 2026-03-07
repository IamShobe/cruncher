// Generated from /Users/elran777/git/IamShobe/cruncher/packages/qql/src/syntax/QQL.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { QQLVisitor } from "./QQLVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class QQL extends antlr.Parser {
    public static readonly PIPE = 1;
    public static readonly COMMA = 2;
    public static readonly LPAREN = 3;
    public static readonly RPAREN = 4;
    public static readonly EQUAL_EQUAL = 5;
    public static readonly EQUAL = 6;
    public static readonly NOT_EQUAL = 7;
    public static readonly AT_DATASOURCE = 8;
    public static readonly DQUOT_STRING = 9;
    public static readonly SQUOT_STRING = 10;
    public static readonly REGEX_PATTERN = 11;
    public static readonly SEARCH_AND = 12;
    public static readonly SEARCH_OR = 13;
    public static readonly FLOAT = 14;
    public static readonly INTEGER = 15;
    public static readonly IDENTIFIER = 16;
    public static readonly WS = 17;
    public static readonly COMMENT = 18;
    public static readonly TABLE = 19;
    public static readonly STATS = 20;
    public static readonly WHERE = 21;
    public static readonly SORT = 22;
    public static readonly EVAL = 23;
    public static readonly REGEX = 24;
    public static readonly TIMECHART = 25;
    public static readonly UNPACK = 26;
    public static readonly CM_WS = 27;
    public static readonly CM_CMT = 28;
    public static readonly AS = 29;
    public static readonly TBL_WS = 30;
    public static readonly TBL_CMT = 31;
    public static readonly BY = 32;
    public static readonly ST_WS = 33;
    public static readonly ST_CMT = 34;
    public static readonly ASC = 35;
    public static readonly DESC = 36;
    public static readonly SO_WS = 37;
    public static readonly SO_CMT = 38;
    public static readonly IN = 39;
    public static readonly TRUE = 40;
    public static readonly FALSE = 41;
    public static readonly AND = 42;
    public static readonly OR = 43;
    public static readonly NOT = 44;
    public static readonly EX_WS = 45;
    public static readonly EX_CMT = 46;
    public static readonly IF = 47;
    public static readonly CASE = 48;
    public static readonly EV_WS = 49;
    public static readonly EV_CMT = 50;
    public static readonly SPAN = 51;
    public static readonly TIMECOL = 52;
    public static readonly MAXGROUPS = 53;
    public static readonly TC_WS = 54;
    public static readonly TC_CMT = 55;
    public static readonly FIELD = 56;
    public static readonly RX_WS = 57;
    public static readonly RX_CMT = 58;
    public static readonly FL_WS = 59;
    public static readonly FL_CMT = 60;
    public static readonly LBRACKET = 61;
    public static readonly RBRACKET = 62;
    public static readonly GREATER_EQUAL = 63;
    public static readonly LESS_EQUAL = 64;
    public static readonly GREATER_THAN = 65;
    public static readonly LESS_THAN = 66;
    public static readonly PLUS = 67;
    public static readonly MINUS = 68;
    public static readonly MULTIPLY = 69;
    public static readonly DIVIDE = 70;
    public static readonly EX_GEQ = 71;
    public static readonly EX_LEQ = 72;
    public static readonly EX_GT = 73;
    public static readonly EX_LT = 74;
    public static readonly EX_PLUS = 75;
    public static readonly EX_MINUS = 76;
    public static readonly EX_MUL = 77;
    public static readonly EX_DIV = 78;
    public static readonly EX_LBRACK = 79;
    public static readonly EX_RBRACK = 80;
    public static readonly RULE_query = 0;
    public static readonly RULE_datasource = 1;
    public static readonly RULE_controllerParam = 2;
    public static readonly RULE_search = 3;
    public static readonly RULE_searchTail = 4;
    public static readonly RULE_searchTerm = 5;
    public static readonly RULE_searchFactor = 6;
    public static readonly RULE_searchLiteral = 7;
    public static readonly RULE_pipelineCommand = 8;
    public static readonly RULE_tableCmd = 9;
    public static readonly RULE_tableColumn = 10;
    public static readonly RULE_statsCmd = 11;
    public static readonly RULE_aggregationFunction = 12;
    public static readonly RULE_groupby = 13;
    public static readonly RULE_whereCmd = 14;
    public static readonly RULE_sortCmd = 15;
    public static readonly RULE_sortColumn = 16;
    public static readonly RULE_evalCmd = 17;
    public static readonly RULE_evalExpression = 18;
    public static readonly RULE_regexCmd = 19;
    public static readonly RULE_timechartCmd = 20;
    public static readonly RULE_timechartParams = 21;
    public static readonly RULE_unpackCmd = 22;
    public static readonly RULE_logicalExpression = 23;
    public static readonly RULE_logicalTail = 24;
    public static readonly RULE_unitExpression = 25;
    public static readonly RULE_notExpression = 26;
    public static readonly RULE_inArrayExpression = 27;
    public static readonly RULE_comparisonExpression = 28;
    public static readonly RULE_functionExpression = 29;
    public static readonly RULE_functionArgs = 30;
    public static readonly RULE_functionArg = 31;
    public static readonly RULE_evalFunctionArg = 32;
    public static readonly RULE_evalFunction = 33;
    public static readonly RULE_caseThen = 34;
    public static readonly RULE_calcExpression = 35;
    public static readonly RULE_calcAction = 36;
    public static readonly RULE_calcTerm = 37;
    public static readonly RULE_calcTermAction = 38;
    public static readonly RULE_calculateUnit = 39;
    public static readonly RULE_factor = 40;
    public static readonly RULE_literalBoolean = 41;
    public static readonly RULE_literalString = 42;
    public static readonly RULE_regexLiteral = 43;
    public static readonly RULE_identifierOrString = 44;

    public static readonly literalNames = [
        null, "'|'", null, null, null, null, null, null, null, null, null, 
        null, "'AND'", "'OR'", null, null, null, null, null, "'table'", 
        "'stats'", "'where'", "'sort'", "'eval'", "'regex'", "'timechart'", 
        "'unpack'", null, null, null, null, null, null, null, null, "'asc'", 
        "'desc'", null, null, null, null, null, null, null, null, null, 
        null, "'if'", "'case'", null, null, "'span'", "'timeCol'", "'maxGroups'", 
        null, null, "'field'"
    ];

    public static readonly symbolicNames = [
        null, "PIPE", "COMMA", "LPAREN", "RPAREN", "EQUAL_EQUAL", "EQUAL", 
        "NOT_EQUAL", "AT_DATASOURCE", "DQUOT_STRING", "SQUOT_STRING", "REGEX_PATTERN", 
        "SEARCH_AND", "SEARCH_OR", "FLOAT", "INTEGER", "IDENTIFIER", "WS", 
        "COMMENT", "TABLE", "STATS", "WHERE", "SORT", "EVAL", "REGEX", "TIMECHART", 
        "UNPACK", "CM_WS", "CM_CMT", "AS", "TBL_WS", "TBL_CMT", "BY", "ST_WS", 
        "ST_CMT", "ASC", "DESC", "SO_WS", "SO_CMT", "IN", "TRUE", "FALSE", 
        "AND", "OR", "NOT", "EX_WS", "EX_CMT", "IF", "CASE", "EV_WS", "EV_CMT", 
        "SPAN", "TIMECOL", "MAXGROUPS", "TC_WS", "TC_CMT", "FIELD", "RX_WS", 
        "RX_CMT", "FL_WS", "FL_CMT", "LBRACKET", "RBRACKET", "GREATER_EQUAL", 
        "LESS_EQUAL", "GREATER_THAN", "LESS_THAN", "PLUS", "MINUS", "MULTIPLY", 
        "DIVIDE", "EX_GEQ", "EX_LEQ", "EX_GT", "EX_LT", "EX_PLUS", "EX_MINUS", 
        "EX_MUL", "EX_DIV", "EX_LBRACK", "EX_RBRACK"
    ];
    public static readonly ruleNames = [
        "query", "datasource", "controllerParam", "search", "searchTail", 
        "searchTerm", "searchFactor", "searchLiteral", "pipelineCommand", 
        "tableCmd", "tableColumn", "statsCmd", "aggregationFunction", "groupby", 
        "whereCmd", "sortCmd", "sortColumn", "evalCmd", "evalExpression", 
        "regexCmd", "timechartCmd", "timechartParams", "unpackCmd", "logicalExpression", 
        "logicalTail", "unitExpression", "notExpression", "inArrayExpression", 
        "comparisonExpression", "functionExpression", "functionArgs", "functionArg", 
        "evalFunctionArg", "evalFunction", "caseThen", "calcExpression", 
        "calcAction", "calcTerm", "calcTermAction", "calculateUnit", "factor", 
        "literalBoolean", "literalString", "regexLiteral", "identifierOrString",
    ];

    public get grammarFileName(): string { return "QQL.g4"; }
    public get literalNames(): (string | null)[] { return QQL.literalNames; }
    public get symbolicNames(): (string | null)[] { return QQL.symbolicNames; }
    public get ruleNames(): string[] { return QQL.ruleNames; }
    public get serializedATN(): number[] { return QQL._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, QQL._ATN, QQL.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public query(): QueryContext {
        let localContext = new QueryContext(this.context, this.state);
        this.enterRule(localContext, 0, QQL.RULE_query);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 93;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 8) {
                {
                {
                this.state = 90;
                this.datasource();
                }
                }
                this.state = 95;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 99;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 96;
                    this.controllerParam();
                    }
                    }
                }
                this.state = 101;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
            }
            this.state = 103;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 116232) !== 0)) {
                {
                this.state = 102;
                this.search();
                }
            }

            this.state = 108;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1) {
                {
                {
                this.state = 105;
                this.pipelineCommand();
                }
                }
                this.state = 110;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 111;
            this.match(QQL.EOF);
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
        this.enterRule(localContext, 2, QQL.RULE_datasource);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 113;
            this.match(QQL.AT_DATASOURCE);
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
        this.enterRule(localContext, 4, QQL.RULE_controllerParam);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 115;
            this.match(QQL.IDENTIFIER);
            this.state = 116;
            _la = this.tokenStream.LA(1);
            if(!(_la === 6 || _la === 7)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 119;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
                {
                this.state = 117;
                this.literalString();
                }
                break;
            case QQL.REGEX_PATTERN:
                {
                this.state = 118;
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
        this.enterRule(localContext, 6, QQL.RULE_search);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 121;
            this.searchTerm();
            this.state = 123;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12 || _la === 13) {
                {
                this.state = 122;
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
        this.enterRule(localContext, 8, QQL.RULE_searchTail);
        try {
            this.state = 129;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.SEARCH_AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 125;
                this.match(QQL.SEARCH_AND);
                this.state = 126;
                this.search();
                }
                break;
            case QQL.SEARCH_OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 127;
                this.match(QQL.SEARCH_OR);
                this.state = 128;
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
    public searchTerm(): SearchTermContext {
        let localContext = new SearchTermContext(this.context, this.state);
        this.enterRule(localContext, 10, QQL.RULE_searchTerm);
        try {
            this.state = 136;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 131;
                this.match(QQL.LPAREN);
                this.state = 132;
                this.search();
                this.state = 133;
                this.match(QQL.RPAREN);
                }
                break;
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
            case QQL.FLOAT:
            case QQL.INTEGER:
            case QQL.IDENTIFIER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 135;
                this.searchFactor();
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
        this.enterRule(localContext, 12, QQL.RULE_searchFactor);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 138;
            this.searchLiteral();
            this.state = 141;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7) {
                {
                this.state = 139;
                this.match(QQL.NOT_EQUAL);
                this.state = 140;
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
        this.enterRule(localContext, 14, QQL.RULE_searchLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 147;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                this.state = 147;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case QQL.IDENTIFIER:
                    {
                    this.state = 143;
                    this.match(QQL.IDENTIFIER);
                    }
                    break;
                case QQL.FLOAT:
                    {
                    this.state = 144;
                    this.match(QQL.FLOAT);
                    }
                    break;
                case QQL.INTEGER:
                    {
                    this.state = 145;
                    this.match(QQL.INTEGER);
                    }
                    break;
                case QQL.DQUOT_STRING:
                case QQL.SQUOT_STRING:
                    {
                    this.state = 146;
                    this.literalString();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 149;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 116224) !== 0));
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
        this.enterRule(localContext, 16, QQL.RULE_pipelineCommand);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 151;
            this.match(QQL.PIPE);
            this.state = 160;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.TABLE:
                {
                this.state = 152;
                this.tableCmd();
                }
                break;
            case QQL.STATS:
                {
                this.state = 153;
                this.statsCmd();
                }
                break;
            case QQL.WHERE:
                {
                this.state = 154;
                this.whereCmd();
                }
                break;
            case QQL.SORT:
                {
                this.state = 155;
                this.sortCmd();
                }
                break;
            case QQL.EVAL:
                {
                this.state = 156;
                this.evalCmd();
                }
                break;
            case QQL.REGEX:
                {
                this.state = 157;
                this.regexCmd();
                }
                break;
            case QQL.TIMECHART:
                {
                this.state = 158;
                this.timechartCmd();
                }
                break;
            case QQL.UNPACK:
                {
                this.state = 159;
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
        this.enterRule(localContext, 18, QQL.RULE_tableCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 162;
            this.match(QQL.TABLE);
            this.state = 163;
            this.tableColumn();
            this.state = 170;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67076) !== 0)) {
                {
                {
                this.state = 165;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 2) {
                    {
                    this.state = 164;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 167;
                this.tableColumn();
                }
                }
                this.state = 172;
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
        this.enterRule(localContext, 20, QQL.RULE_tableColumn);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 173;
            this.identifierOrString();
            this.state = 176;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 29) {
                {
                this.state = 174;
                this.match(QQL.AS);
                this.state = 175;
                this.identifierOrString();
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
        this.enterRule(localContext, 22, QQL.RULE_statsCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 178;
            this.match(QQL.STATS);
            this.state = 179;
            this.aggregationFunction();
            this.state = 186;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67076) !== 0)) {
                {
                {
                this.state = 181;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 2) {
                    {
                    this.state = 180;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 183;
                this.aggregationFunction();
                }
                }
                this.state = 188;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 191;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 32) {
                {
                this.state = 189;
                this.match(QQL.BY);
                this.state = 190;
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
        this.enterRule(localContext, 24, QQL.RULE_aggregationFunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 193;
            this.identifierOrString();
            this.state = 199;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 194;
                this.match(QQL.LPAREN);
                this.state = 196;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67072) !== 0)) {
                    {
                    this.state = 195;
                    this.identifierOrString();
                    }
                }

                this.state = 198;
                this.match(QQL.RPAREN);
                }
            }

            this.state = 203;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 29) {
                {
                this.state = 201;
                this.match(QQL.AS);
                this.state = 202;
                this.identifierOrString();
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
        this.enterRule(localContext, 26, QQL.RULE_groupby);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 205;
            this.identifierOrString();
            this.state = 212;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67076) !== 0)) {
                {
                {
                this.state = 207;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 2) {
                    {
                    this.state = 206;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 209;
                this.identifierOrString();
                }
                }
                this.state = 214;
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
        this.enterRule(localContext, 28, QQL.RULE_whereCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 215;
            this.match(QQL.WHERE);
            this.state = 216;
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
        this.enterRule(localContext, 30, QQL.RULE_sortCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 218;
            this.match(QQL.SORT);
            this.state = 219;
            this.sortColumn();
            this.state = 226;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67076) !== 0)) {
                {
                {
                this.state = 221;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 2) {
                    {
                    this.state = 220;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 223;
                this.sortColumn();
                }
                }
                this.state = 228;
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
        this.enterRule(localContext, 32, QQL.RULE_sortColumn);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 229;
            this.identifierOrString();
            this.state = 231;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 35 || _la === 36) {
                {
                this.state = 230;
                _la = this.tokenStream.LA(1);
                if(!(_la === 35 || _la === 36)) {
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
        this.enterRule(localContext, 34, QQL.RULE_evalCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 233;
            this.match(QQL.EVAL);
            this.state = 234;
            this.evalExpression();
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
        this.enterRule(localContext, 36, QQL.RULE_evalExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 236;
            this.identifierOrString();
            this.state = 237;
            this.match(QQL.EQUAL);
            this.state = 238;
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
        this.enterRule(localContext, 38, QQL.RULE_regexCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 240;
            this.match(QQL.REGEX);
            this.state = 244;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 56) {
                {
                this.state = 241;
                this.match(QQL.FIELD);
                this.state = 242;
                this.match(QQL.EQUAL);
                this.state = 243;
                this.identifierOrString();
                }
            }

            this.state = 246;
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
        this.enterRule(localContext, 40, QQL.RULE_timechartCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 248;
            this.match(QQL.TIMECHART);
            this.state = 249;
            this.aggregationFunction();
            this.state = 256;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67076) !== 0)) {
                {
                {
                this.state = 251;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 2) {
                    {
                    this.state = 250;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 253;
                this.aggregationFunction();
                }
                }
                this.state = 258;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 262;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 7) !== 0)) {
                {
                {
                this.state = 259;
                this.timechartParams();
                }
                }
                this.state = 264;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 267;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 32) {
                {
                this.state = 265;
                this.match(QQL.BY);
                this.state = 266;
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
        this.enterRule(localContext, 42, QQL.RULE_timechartParams);
        try {
            this.state = 275;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.SPAN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 269;
                this.match(QQL.SPAN);
                this.state = 270;
                this.identifierOrString();
                }
                break;
            case QQL.TIMECOL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 271;
                this.match(QQL.TIMECOL);
                this.state = 272;
                this.identifierOrString();
                }
                break;
            case QQL.MAXGROUPS:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 273;
                this.match(QQL.MAXGROUPS);
                this.state = 274;
                this.match(QQL.INTEGER);
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
        this.enterRule(localContext, 44, QQL.RULE_unpackCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 277;
            this.match(QQL.UNPACK);
            this.state = 278;
            this.identifierOrString();
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
        this.enterRule(localContext, 46, QQL.RULE_logicalExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 280;
            this.unitExpression();
            this.state = 284;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 32, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 281;
                    this.logicalTail();
                    }
                    }
                }
                this.state = 286;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 32, this.context);
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
        this.enterRule(localContext, 48, QQL.RULE_logicalTail);
        try {
            this.state = 291;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 287;
                this.match(QQL.AND);
                this.state = 288;
                this.logicalExpression();
                }
                break;
            case QQL.OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 289;
                this.match(QQL.OR);
                this.state = 290;
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
        this.enterRule(localContext, 50, QQL.RULE_unitExpression);
        try {
            this.state = 303;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
            case QQL.FLOAT:
            case QQL.INTEGER:
            case QQL.IDENTIFIER:
            case QQL.TRUE:
            case QQL.FALSE:
            case QQL.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 297;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 34, this.context) ) {
                case 1:
                    {
                    this.state = 293;
                    this.inArrayExpression();
                    }
                    break;
                case 2:
                    {
                    this.state = 294;
                    this.comparisonExpression();
                    }
                    break;
                case 3:
                    {
                    this.state = 295;
                    this.notExpression();
                    }
                    break;
                case 4:
                    {
                    this.state = 296;
                    this.functionExpression();
                    }
                    break;
                }
                }
                break;
            case QQL.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 299;
                this.match(QQL.LPAREN);
                this.state = 300;
                this.logicalExpression();
                this.state = 301;
                this.match(QQL.RPAREN);
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
        this.enterRule(localContext, 52, QQL.RULE_notExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 305;
            this.match(QQL.NOT);
            this.state = 306;
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
        this.enterRule(localContext, 54, QQL.RULE_inArrayExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 308;
            this.factor();
            this.state = 309;
            this.match(QQL.IN);
            this.state = 310;
            this.match(QQL.LBRACKET);
            this.state = 311;
            this.factor();
            this.state = 316;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 2) {
                {
                {
                this.state = 312;
                this.match(QQL.COMMA);
                this.state = 313;
                this.factor();
                }
                }
                this.state = 318;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 319;
            this.match(QQL.RBRACKET);
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
        this.enterRule(localContext, 56, QQL.RULE_comparisonExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 321;
            this.factor();
            this.state = 322;
            _la = this.tokenStream.LA(1);
            if(!(_la === 5 || _la === 7 || ((((_la - 63)) & ~0x1F) === 0 && ((1 << (_la - 63)) & 15) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 323;
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
        this.enterRule(localContext, 58, QQL.RULE_functionExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 325;
            this.match(QQL.IDENTIFIER);
            this.state = 326;
            this.match(QQL.LPAREN);
            this.state = 328;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 118280) !== 0) || ((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & 19) !== 0)) {
                {
                this.state = 327;
                this.functionArgs();
                }
            }

            this.state = 330;
            this.match(QQL.RPAREN);
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
        this.enterRule(localContext, 60, QQL.RULE_functionArgs);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 332;
            this.functionArg();
            this.state = 337;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 2) {
                {
                {
                this.state = 333;
                this.match(QQL.COMMA);
                this.state = 334;
                this.functionArg();
                }
                }
                this.state = 339;
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
        this.enterRule(localContext, 62, QQL.RULE_functionArg);
        try {
            this.state = 344;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 340;
                this.factor();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 341;
                this.regexLiteral();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 342;
                this.logicalExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 343;
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
        this.enterRule(localContext, 64, QQL.RULE_evalFunctionArg);
        try {
            this.state = 350;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 346;
                this.evalFunction();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 347;
                this.functionExpression();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 348;
                this.logicalExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 349;
                this.calcExpression();
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
        this.enterRule(localContext, 66, QQL.RULE_evalFunction);
        let _la: number;
        try {
            this.state = 372;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.IF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 352;
                this.match(QQL.IF);
                this.state = 353;
                this.match(QQL.LPAREN);
                this.state = 354;
                this.logicalExpression();
                this.state = 355;
                this.match(QQL.COMMA);
                this.state = 356;
                this.evalFunctionArg();
                this.state = 359;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 2) {
                    {
                    this.state = 357;
                    this.match(QQL.COMMA);
                    this.state = 358;
                    this.evalFunctionArg();
                    }
                }

                this.state = 361;
                this.match(QQL.RPAREN);
                }
                break;
            case QQL.CASE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 363;
                this.match(QQL.CASE);
                this.state = 364;
                this.match(QQL.LPAREN);
                this.state = 365;
                this.caseThen();
                this.state = 368;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 2) {
                    {
                    this.state = 366;
                    this.match(QQL.COMMA);
                    this.state = 367;
                    this.evalFunctionArg();
                    }
                }

                this.state = 370;
                this.match(QQL.RPAREN);
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
        this.enterRule(localContext, 68, QQL.RULE_caseThen);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 374;
            this.logicalExpression();
            this.state = 375;
            this.match(QQL.COMMA);
            this.state = 376;
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
        this.enterRule(localContext, 70, QQL.RULE_calcExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 378;
            this.calcTerm();
            this.state = 382;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 67 || _la === 68) {
                {
                {
                this.state = 379;
                this.calcAction();
                }
                }
                this.state = 384;
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
        this.enterRule(localContext, 72, QQL.RULE_calcAction);
        try {
            this.state = 389;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.PLUS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 385;
                this.match(QQL.PLUS);
                this.state = 386;
                this.calcTerm();
                }
                break;
            case QQL.MINUS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 387;
                this.match(QQL.MINUS);
                this.state = 388;
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
        this.enterRule(localContext, 74, QQL.RULE_calcTerm);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 391;
            this.calculateUnit();
            this.state = 395;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 69 || _la === 70) {
                {
                {
                this.state = 392;
                this.calcTermAction();
                }
                }
                this.state = 397;
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
        this.enterRule(localContext, 76, QQL.RULE_calcTermAction);
        try {
            this.state = 402;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.MULTIPLY:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 398;
                this.match(QQL.MULTIPLY);
                this.state = 399;
                this.calculateUnit();
                }
                break;
            case QQL.DIVIDE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 400;
                this.match(QQL.DIVIDE);
                this.state = 401;
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
        this.enterRule(localContext, 78, QQL.RULE_calculateUnit);
        try {
            this.state = 409;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
            case QQL.FLOAT:
            case QQL.INTEGER:
            case QQL.IDENTIFIER:
            case QQL.TRUE:
            case QQL.FALSE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 404;
                this.factor();
                }
                break;
            case QQL.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 405;
                this.match(QQL.LPAREN);
                this.state = 406;
                this.calcExpression();
                this.state = 407;
                this.match(QQL.RPAREN);
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
        this.enterRule(localContext, 80, QQL.RULE_factor);
        try {
            this.state = 416;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 411;
                this.literalString();
                }
                break;
            case QQL.FLOAT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 412;
                this.match(QQL.FLOAT);
                }
                break;
            case QQL.INTEGER:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 413;
                this.match(QQL.INTEGER);
                }
                break;
            case QQL.IDENTIFIER:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 414;
                this.match(QQL.IDENTIFIER);
                }
                break;
            case QQL.TRUE:
            case QQL.FALSE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 415;
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
        this.enterRule(localContext, 82, QQL.RULE_literalBoolean);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 418;
            _la = this.tokenStream.LA(1);
            if(!(_la === 40 || _la === 41)) {
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
        this.enterRule(localContext, 84, QQL.RULE_literalString);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 420;
            _la = this.tokenStream.LA(1);
            if(!(_la === 9 || _la === 10)) {
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
        this.enterRule(localContext, 86, QQL.RULE_regexLiteral);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 422;
            this.match(QQL.REGEX_PATTERN);
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
    public identifierOrString(): IdentifierOrStringContext {
        let localContext = new IdentifierOrStringContext(this.context, this.state);
        this.enterRule(localContext, 88, QQL.RULE_identifierOrString);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 424;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 67072) !== 0))) {
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

    public static readonly _serializedATN: number[] = [
        4,1,80,427,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,1,0,5,0,92,8,0,
        10,0,12,0,95,9,0,1,0,5,0,98,8,0,10,0,12,0,101,9,0,1,0,3,0,104,8,
        0,1,0,5,0,107,8,0,10,0,12,0,110,9,0,1,0,1,0,1,1,1,1,1,2,1,2,1,2,
        1,2,3,2,120,8,2,1,3,1,3,3,3,124,8,3,1,4,1,4,1,4,1,4,3,4,130,8,4,
        1,5,1,5,1,5,1,5,1,5,3,5,137,8,5,1,6,1,6,1,6,3,6,142,8,6,1,7,1,7,
        1,7,1,7,4,7,148,8,7,11,7,12,7,149,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,
        8,1,8,3,8,161,8,8,1,9,1,9,1,9,3,9,166,8,9,1,9,5,9,169,8,9,10,9,12,
        9,172,9,9,1,10,1,10,1,10,3,10,177,8,10,1,11,1,11,1,11,3,11,182,8,
        11,1,11,5,11,185,8,11,10,11,12,11,188,9,11,1,11,1,11,3,11,192,8,
        11,1,12,1,12,1,12,3,12,197,8,12,1,12,3,12,200,8,12,1,12,1,12,3,12,
        204,8,12,1,13,1,13,3,13,208,8,13,1,13,5,13,211,8,13,10,13,12,13,
        214,9,13,1,14,1,14,1,14,1,15,1,15,1,15,3,15,222,8,15,1,15,5,15,225,
        8,15,10,15,12,15,228,9,15,1,16,1,16,3,16,232,8,16,1,17,1,17,1,17,
        1,18,1,18,1,18,1,18,1,19,1,19,1,19,1,19,3,19,245,8,19,1,19,1,19,
        1,20,1,20,1,20,3,20,252,8,20,1,20,5,20,255,8,20,10,20,12,20,258,
        9,20,1,20,5,20,261,8,20,10,20,12,20,264,9,20,1,20,1,20,3,20,268,
        8,20,1,21,1,21,1,21,1,21,1,21,1,21,3,21,276,8,21,1,22,1,22,1,22,
        1,23,1,23,5,23,283,8,23,10,23,12,23,286,9,23,1,24,1,24,1,24,1,24,
        3,24,292,8,24,1,25,1,25,1,25,1,25,3,25,298,8,25,1,25,1,25,1,25,1,
        25,3,25,304,8,25,1,26,1,26,1,26,1,27,1,27,1,27,1,27,1,27,1,27,5,
        27,315,8,27,10,27,12,27,318,9,27,1,27,1,27,1,28,1,28,1,28,1,28,1,
        29,1,29,1,29,3,29,329,8,29,1,29,1,29,1,30,1,30,1,30,5,30,336,8,30,
        10,30,12,30,339,9,30,1,31,1,31,1,31,1,31,3,31,345,8,31,1,32,1,32,
        1,32,1,32,3,32,351,8,32,1,33,1,33,1,33,1,33,1,33,1,33,1,33,3,33,
        360,8,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,3,33,369,8,33,1,33,1,
        33,3,33,373,8,33,1,34,1,34,1,34,1,34,1,35,1,35,5,35,381,8,35,10,
        35,12,35,384,9,35,1,36,1,36,1,36,1,36,3,36,390,8,36,1,37,1,37,5,
        37,394,8,37,10,37,12,37,397,9,37,1,38,1,38,1,38,1,38,3,38,403,8,
        38,1,39,1,39,1,39,1,39,1,39,3,39,410,8,39,1,40,1,40,1,40,1,40,1,
        40,3,40,417,8,40,1,41,1,41,1,42,1,42,1,43,1,43,1,44,1,44,1,44,0,
        0,45,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,
        44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,
        88,0,6,1,0,6,7,1,0,35,36,3,0,5,5,7,7,63,66,1,0,40,41,1,0,9,10,2,
        0,9,10,16,16,449,0,93,1,0,0,0,2,113,1,0,0,0,4,115,1,0,0,0,6,121,
        1,0,0,0,8,129,1,0,0,0,10,136,1,0,0,0,12,138,1,0,0,0,14,147,1,0,0,
        0,16,151,1,0,0,0,18,162,1,0,0,0,20,173,1,0,0,0,22,178,1,0,0,0,24,
        193,1,0,0,0,26,205,1,0,0,0,28,215,1,0,0,0,30,218,1,0,0,0,32,229,
        1,0,0,0,34,233,1,0,0,0,36,236,1,0,0,0,38,240,1,0,0,0,40,248,1,0,
        0,0,42,275,1,0,0,0,44,277,1,0,0,0,46,280,1,0,0,0,48,291,1,0,0,0,
        50,303,1,0,0,0,52,305,1,0,0,0,54,308,1,0,0,0,56,321,1,0,0,0,58,325,
        1,0,0,0,60,332,1,0,0,0,62,344,1,0,0,0,64,350,1,0,0,0,66,372,1,0,
        0,0,68,374,1,0,0,0,70,378,1,0,0,0,72,389,1,0,0,0,74,391,1,0,0,0,
        76,402,1,0,0,0,78,409,1,0,0,0,80,416,1,0,0,0,82,418,1,0,0,0,84,420,
        1,0,0,0,86,422,1,0,0,0,88,424,1,0,0,0,90,92,3,2,1,0,91,90,1,0,0,
        0,92,95,1,0,0,0,93,91,1,0,0,0,93,94,1,0,0,0,94,99,1,0,0,0,95,93,
        1,0,0,0,96,98,3,4,2,0,97,96,1,0,0,0,98,101,1,0,0,0,99,97,1,0,0,0,
        99,100,1,0,0,0,100,103,1,0,0,0,101,99,1,0,0,0,102,104,3,6,3,0,103,
        102,1,0,0,0,103,104,1,0,0,0,104,108,1,0,0,0,105,107,3,16,8,0,106,
        105,1,0,0,0,107,110,1,0,0,0,108,106,1,0,0,0,108,109,1,0,0,0,109,
        111,1,0,0,0,110,108,1,0,0,0,111,112,5,0,0,1,112,1,1,0,0,0,113,114,
        5,8,0,0,114,3,1,0,0,0,115,116,5,16,0,0,116,119,7,0,0,0,117,120,3,
        84,42,0,118,120,3,86,43,0,119,117,1,0,0,0,119,118,1,0,0,0,120,5,
        1,0,0,0,121,123,3,10,5,0,122,124,3,8,4,0,123,122,1,0,0,0,123,124,
        1,0,0,0,124,7,1,0,0,0,125,126,5,12,0,0,126,130,3,6,3,0,127,128,5,
        13,0,0,128,130,3,6,3,0,129,125,1,0,0,0,129,127,1,0,0,0,130,9,1,0,
        0,0,131,132,5,3,0,0,132,133,3,6,3,0,133,134,5,4,0,0,134,137,1,0,
        0,0,135,137,3,12,6,0,136,131,1,0,0,0,136,135,1,0,0,0,137,11,1,0,
        0,0,138,141,3,14,7,0,139,140,5,7,0,0,140,142,3,14,7,0,141,139,1,
        0,0,0,141,142,1,0,0,0,142,13,1,0,0,0,143,148,5,16,0,0,144,148,5,
        14,0,0,145,148,5,15,0,0,146,148,3,84,42,0,147,143,1,0,0,0,147,144,
        1,0,0,0,147,145,1,0,0,0,147,146,1,0,0,0,148,149,1,0,0,0,149,147,
        1,0,0,0,149,150,1,0,0,0,150,15,1,0,0,0,151,160,5,1,0,0,152,161,3,
        18,9,0,153,161,3,22,11,0,154,161,3,28,14,0,155,161,3,30,15,0,156,
        161,3,34,17,0,157,161,3,38,19,0,158,161,3,40,20,0,159,161,3,44,22,
        0,160,152,1,0,0,0,160,153,1,0,0,0,160,154,1,0,0,0,160,155,1,0,0,
        0,160,156,1,0,0,0,160,157,1,0,0,0,160,158,1,0,0,0,160,159,1,0,0,
        0,161,17,1,0,0,0,162,163,5,19,0,0,163,170,3,20,10,0,164,166,5,2,
        0,0,165,164,1,0,0,0,165,166,1,0,0,0,166,167,1,0,0,0,167,169,3,20,
        10,0,168,165,1,0,0,0,169,172,1,0,0,0,170,168,1,0,0,0,170,171,1,0,
        0,0,171,19,1,0,0,0,172,170,1,0,0,0,173,176,3,88,44,0,174,175,5,29,
        0,0,175,177,3,88,44,0,176,174,1,0,0,0,176,177,1,0,0,0,177,21,1,0,
        0,0,178,179,5,20,0,0,179,186,3,24,12,0,180,182,5,2,0,0,181,180,1,
        0,0,0,181,182,1,0,0,0,182,183,1,0,0,0,183,185,3,24,12,0,184,181,
        1,0,0,0,185,188,1,0,0,0,186,184,1,0,0,0,186,187,1,0,0,0,187,191,
        1,0,0,0,188,186,1,0,0,0,189,190,5,32,0,0,190,192,3,26,13,0,191,189,
        1,0,0,0,191,192,1,0,0,0,192,23,1,0,0,0,193,199,3,88,44,0,194,196,
        5,3,0,0,195,197,3,88,44,0,196,195,1,0,0,0,196,197,1,0,0,0,197,198,
        1,0,0,0,198,200,5,4,0,0,199,194,1,0,0,0,199,200,1,0,0,0,200,203,
        1,0,0,0,201,202,5,29,0,0,202,204,3,88,44,0,203,201,1,0,0,0,203,204,
        1,0,0,0,204,25,1,0,0,0,205,212,3,88,44,0,206,208,5,2,0,0,207,206,
        1,0,0,0,207,208,1,0,0,0,208,209,1,0,0,0,209,211,3,88,44,0,210,207,
        1,0,0,0,211,214,1,0,0,0,212,210,1,0,0,0,212,213,1,0,0,0,213,27,1,
        0,0,0,214,212,1,0,0,0,215,216,5,21,0,0,216,217,3,46,23,0,217,29,
        1,0,0,0,218,219,5,22,0,0,219,226,3,32,16,0,220,222,5,2,0,0,221,220,
        1,0,0,0,221,222,1,0,0,0,222,223,1,0,0,0,223,225,3,32,16,0,224,221,
        1,0,0,0,225,228,1,0,0,0,226,224,1,0,0,0,226,227,1,0,0,0,227,31,1,
        0,0,0,228,226,1,0,0,0,229,231,3,88,44,0,230,232,7,1,0,0,231,230,
        1,0,0,0,231,232,1,0,0,0,232,33,1,0,0,0,233,234,5,23,0,0,234,235,
        3,36,18,0,235,35,1,0,0,0,236,237,3,88,44,0,237,238,5,6,0,0,238,239,
        3,64,32,0,239,37,1,0,0,0,240,244,5,24,0,0,241,242,5,56,0,0,242,243,
        5,6,0,0,243,245,3,88,44,0,244,241,1,0,0,0,244,245,1,0,0,0,245,246,
        1,0,0,0,246,247,3,86,43,0,247,39,1,0,0,0,248,249,5,25,0,0,249,256,
        3,24,12,0,250,252,5,2,0,0,251,250,1,0,0,0,251,252,1,0,0,0,252,253,
        1,0,0,0,253,255,3,24,12,0,254,251,1,0,0,0,255,258,1,0,0,0,256,254,
        1,0,0,0,256,257,1,0,0,0,257,262,1,0,0,0,258,256,1,0,0,0,259,261,
        3,42,21,0,260,259,1,0,0,0,261,264,1,0,0,0,262,260,1,0,0,0,262,263,
        1,0,0,0,263,267,1,0,0,0,264,262,1,0,0,0,265,266,5,32,0,0,266,268,
        3,26,13,0,267,265,1,0,0,0,267,268,1,0,0,0,268,41,1,0,0,0,269,270,
        5,51,0,0,270,276,3,88,44,0,271,272,5,52,0,0,272,276,3,88,44,0,273,
        274,5,53,0,0,274,276,5,15,0,0,275,269,1,0,0,0,275,271,1,0,0,0,275,
        273,1,0,0,0,276,43,1,0,0,0,277,278,5,26,0,0,278,279,3,88,44,0,279,
        45,1,0,0,0,280,284,3,50,25,0,281,283,3,48,24,0,282,281,1,0,0,0,283,
        286,1,0,0,0,284,282,1,0,0,0,284,285,1,0,0,0,285,47,1,0,0,0,286,284,
        1,0,0,0,287,288,5,42,0,0,288,292,3,46,23,0,289,290,5,43,0,0,290,
        292,3,46,23,0,291,287,1,0,0,0,291,289,1,0,0,0,292,49,1,0,0,0,293,
        298,3,54,27,0,294,298,3,56,28,0,295,298,3,52,26,0,296,298,3,58,29,
        0,297,293,1,0,0,0,297,294,1,0,0,0,297,295,1,0,0,0,297,296,1,0,0,
        0,298,304,1,0,0,0,299,300,5,3,0,0,300,301,3,46,23,0,301,302,5,4,
        0,0,302,304,1,0,0,0,303,297,1,0,0,0,303,299,1,0,0,0,304,51,1,0,0,
        0,305,306,5,44,0,0,306,307,3,50,25,0,307,53,1,0,0,0,308,309,3,80,
        40,0,309,310,5,39,0,0,310,311,5,61,0,0,311,316,3,80,40,0,312,313,
        5,2,0,0,313,315,3,80,40,0,314,312,1,0,0,0,315,318,1,0,0,0,316,314,
        1,0,0,0,316,317,1,0,0,0,317,319,1,0,0,0,318,316,1,0,0,0,319,320,
        5,62,0,0,320,55,1,0,0,0,321,322,3,80,40,0,322,323,7,2,0,0,323,324,
        3,80,40,0,324,57,1,0,0,0,325,326,5,16,0,0,326,328,5,3,0,0,327,329,
        3,60,30,0,328,327,1,0,0,0,328,329,1,0,0,0,329,330,1,0,0,0,330,331,
        5,4,0,0,331,59,1,0,0,0,332,337,3,62,31,0,333,334,5,2,0,0,334,336,
        3,62,31,0,335,333,1,0,0,0,336,339,1,0,0,0,337,335,1,0,0,0,337,338,
        1,0,0,0,338,61,1,0,0,0,339,337,1,0,0,0,340,345,3,80,40,0,341,345,
        3,86,43,0,342,345,3,46,23,0,343,345,3,58,29,0,344,340,1,0,0,0,344,
        341,1,0,0,0,344,342,1,0,0,0,344,343,1,0,0,0,345,63,1,0,0,0,346,351,
        3,66,33,0,347,351,3,58,29,0,348,351,3,46,23,0,349,351,3,70,35,0,
        350,346,1,0,0,0,350,347,1,0,0,0,350,348,1,0,0,0,350,349,1,0,0,0,
        351,65,1,0,0,0,352,353,5,47,0,0,353,354,5,3,0,0,354,355,3,46,23,
        0,355,356,5,2,0,0,356,359,3,64,32,0,357,358,5,2,0,0,358,360,3,64,
        32,0,359,357,1,0,0,0,359,360,1,0,0,0,360,361,1,0,0,0,361,362,5,4,
        0,0,362,373,1,0,0,0,363,364,5,48,0,0,364,365,5,3,0,0,365,368,3,68,
        34,0,366,367,5,2,0,0,367,369,3,64,32,0,368,366,1,0,0,0,368,369,1,
        0,0,0,369,370,1,0,0,0,370,371,5,4,0,0,371,373,1,0,0,0,372,352,1,
        0,0,0,372,363,1,0,0,0,373,67,1,0,0,0,374,375,3,46,23,0,375,376,5,
        2,0,0,376,377,3,64,32,0,377,69,1,0,0,0,378,382,3,74,37,0,379,381,
        3,72,36,0,380,379,1,0,0,0,381,384,1,0,0,0,382,380,1,0,0,0,382,383,
        1,0,0,0,383,71,1,0,0,0,384,382,1,0,0,0,385,386,5,67,0,0,386,390,
        3,74,37,0,387,388,5,68,0,0,388,390,3,74,37,0,389,385,1,0,0,0,389,
        387,1,0,0,0,390,73,1,0,0,0,391,395,3,78,39,0,392,394,3,76,38,0,393,
        392,1,0,0,0,394,397,1,0,0,0,395,393,1,0,0,0,395,396,1,0,0,0,396,
        75,1,0,0,0,397,395,1,0,0,0,398,399,5,69,0,0,399,403,3,78,39,0,400,
        401,5,70,0,0,401,403,3,78,39,0,402,398,1,0,0,0,402,400,1,0,0,0,403,
        77,1,0,0,0,404,410,3,80,40,0,405,406,5,3,0,0,406,407,3,70,35,0,407,
        408,5,4,0,0,408,410,1,0,0,0,409,404,1,0,0,0,409,405,1,0,0,0,410,
        79,1,0,0,0,411,417,3,84,42,0,412,417,5,14,0,0,413,417,5,15,0,0,414,
        417,5,16,0,0,415,417,3,82,41,0,416,411,1,0,0,0,416,412,1,0,0,0,416,
        413,1,0,0,0,416,414,1,0,0,0,416,415,1,0,0,0,417,81,1,0,0,0,418,419,
        7,3,0,0,419,83,1,0,0,0,420,421,7,4,0,0,421,85,1,0,0,0,422,423,5,
        11,0,0,423,87,1,0,0,0,424,425,7,5,0,0,425,89,1,0,0,0,50,93,99,103,
        108,119,123,129,136,141,147,149,160,165,170,176,181,186,191,196,
        199,203,207,212,221,226,231,244,251,256,262,267,275,284,291,297,
        303,316,328,337,344,350,359,368,372,382,389,395,402,409,416
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!QQL.__ATN) {
            QQL.__ATN = new antlr.ATNDeserializer().deserialize(QQL._serializedATN);
        }

        return QQL.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(QQL.literalNames, QQL.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return QQL.vocabulary;
    }

    private static readonly decisionsToDFA = QQL._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class QueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(QQL.EOF, 0)!;
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
    public search(): SearchContext | null {
        return this.getRuleContext(0, SearchContext);
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
        return QQL.RULE_query;
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
        return this.getToken(QQL.AT_DATASOURCE, 0)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_datasource;
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
        return this.getToken(QQL.IDENTIFIER, 0)!;
    }
    public EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.EQUAL, 0);
    }
    public NOT_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.NOT_EQUAL, 0);
    }
    public literalString(): LiteralStringContext | null {
        return this.getRuleContext(0, LiteralStringContext);
    }
    public regexLiteral(): RegexLiteralContext | null {
        return this.getRuleContext(0, RegexLiteralContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_controllerParam;
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
    public searchTerm(): SearchTermContext {
        return this.getRuleContext(0, SearchTermContext)!;
    }
    public searchTail(): SearchTailContext | null {
        return this.getRuleContext(0, SearchTailContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_search;
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
        return this.getToken(QQL.SEARCH_AND, 0);
    }
    public search(): SearchContext {
        return this.getRuleContext(0, SearchContext)!;
    }
    public SEARCH_OR(): antlr.TerminalNode | null {
        return this.getToken(QQL.SEARCH_OR, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_searchTail;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSearchTail) {
            return visitor.visitSearchTail(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SearchTermContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQL.LPAREN, 0);
    }
    public search(): SearchContext | null {
        return this.getRuleContext(0, SearchContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQL.RPAREN, 0);
    }
    public searchFactor(): SearchFactorContext | null {
        return this.getRuleContext(0, SearchFactorContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_searchTerm;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSearchTerm) {
            return visitor.visitSearchTerm(this);
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
    public NOT_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.NOT_EQUAL, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_searchFactor;
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
    		return this.getTokens(QQL.IDENTIFIER);
    	} else {
    		return this.getToken(QQL.IDENTIFIER, i);
    	}
    }
    public FLOAT(): antlr.TerminalNode[];
    public FLOAT(i: number): antlr.TerminalNode | null;
    public FLOAT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQL.FLOAT);
    	} else {
    		return this.getToken(QQL.FLOAT, i);
    	}
    }
    public INTEGER(): antlr.TerminalNode[];
    public INTEGER(i: number): antlr.TerminalNode | null;
    public INTEGER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQL.INTEGER);
    	} else {
    		return this.getToken(QQL.INTEGER, i);
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
        return QQL.RULE_searchLiteral;
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
        return this.getToken(QQL.PIPE, 0)!;
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
        return QQL.RULE_pipelineCommand;
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
        return this.getToken(QQL.TABLE, 0)!;
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
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQL.RULE_tableCmd;
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
    public identifierOrString(): IdentifierOrStringContext[];
    public identifierOrString(i: number): IdentifierOrStringContext | null;
    public identifierOrString(i?: number): IdentifierOrStringContext[] | IdentifierOrStringContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierOrStringContext);
        }

        return this.getRuleContext(i, IdentifierOrStringContext);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(QQL.AS, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_tableColumn;
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
        return this.getToken(QQL.STATS, 0)!;
    }
    public aggregationFunction(): AggregationFunctionContext[];
    public aggregationFunction(i: number): AggregationFunctionContext | null;
    public aggregationFunction(i?: number): AggregationFunctionContext[] | AggregationFunctionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AggregationFunctionContext);
        }

        return this.getRuleContext(i, AggregationFunctionContext);
    }
    public BY(): antlr.TerminalNode | null {
        return this.getToken(QQL.BY, 0);
    }
    public groupby(): GroupbyContext | null {
        return this.getRuleContext(0, GroupbyContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQL.RULE_statsCmd;
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
    public identifierOrString(): IdentifierOrStringContext[];
    public identifierOrString(i: number): IdentifierOrStringContext | null;
    public identifierOrString(i?: number): IdentifierOrStringContext[] | IdentifierOrStringContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierOrStringContext);
        }

        return this.getRuleContext(i, IdentifierOrStringContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQL.LPAREN, 0);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQL.RPAREN, 0);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(QQL.AS, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_aggregationFunction;
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
    public identifierOrString(): IdentifierOrStringContext[];
    public identifierOrString(i: number): IdentifierOrStringContext | null;
    public identifierOrString(i?: number): IdentifierOrStringContext[] | IdentifierOrStringContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierOrStringContext);
        }

        return this.getRuleContext(i, IdentifierOrStringContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQL.RULE_groupby;
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
        return this.getToken(QQL.WHERE, 0)!;
    }
    public logicalExpression(): LogicalExpressionContext {
        return this.getRuleContext(0, LogicalExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_whereCmd;
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
        return this.getToken(QQL.SORT, 0)!;
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
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQL.RULE_sortCmd;
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
    public identifierOrString(): IdentifierOrStringContext {
        return this.getRuleContext(0, IdentifierOrStringContext)!;
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(QQL.ASC, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(QQL.DESC, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_sortColumn;
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
        return this.getToken(QQL.EVAL, 0)!;
    }
    public evalExpression(): EvalExpressionContext {
        return this.getRuleContext(0, EvalExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_evalCmd;
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
    public identifierOrString(): IdentifierOrStringContext {
        return this.getRuleContext(0, IdentifierOrStringContext)!;
    }
    public EQUAL(): antlr.TerminalNode {
        return this.getToken(QQL.EQUAL, 0)!;
    }
    public evalFunctionArg(): EvalFunctionArgContext {
        return this.getRuleContext(0, EvalFunctionArgContext)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_evalExpression;
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
        return this.getToken(QQL.REGEX, 0)!;
    }
    public regexLiteral(): RegexLiteralContext {
        return this.getRuleContext(0, RegexLiteralContext)!;
    }
    public FIELD(): antlr.TerminalNode | null {
        return this.getToken(QQL.FIELD, 0);
    }
    public EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.EQUAL, 0);
    }
    public identifierOrString(): IdentifierOrStringContext | null {
        return this.getRuleContext(0, IdentifierOrStringContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_regexCmd;
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
        return this.getToken(QQL.TIMECHART, 0)!;
    }
    public aggregationFunction(): AggregationFunctionContext[];
    public aggregationFunction(i: number): AggregationFunctionContext | null;
    public aggregationFunction(i?: number): AggregationFunctionContext[] | AggregationFunctionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AggregationFunctionContext);
        }

        return this.getRuleContext(i, AggregationFunctionContext);
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
        return this.getToken(QQL.BY, 0);
    }
    public groupby(): GroupbyContext | null {
        return this.getRuleContext(0, GroupbyContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQL.RULE_timechartCmd;
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
        return this.getToken(QQL.SPAN, 0);
    }
    public identifierOrString(): IdentifierOrStringContext | null {
        return this.getRuleContext(0, IdentifierOrStringContext);
    }
    public TIMECOL(): antlr.TerminalNode | null {
        return this.getToken(QQL.TIMECOL, 0);
    }
    public MAXGROUPS(): antlr.TerminalNode | null {
        return this.getToken(QQL.MAXGROUPS, 0);
    }
    public INTEGER(): antlr.TerminalNode | null {
        return this.getToken(QQL.INTEGER, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_timechartParams;
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
        return this.getToken(QQL.UNPACK, 0)!;
    }
    public identifierOrString(): IdentifierOrStringContext {
        return this.getRuleContext(0, IdentifierOrStringContext)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_unpackCmd;
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
        return QQL.RULE_logicalExpression;
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
        return this.getToken(QQL.AND, 0);
    }
    public logicalExpression(): LogicalExpressionContext {
        return this.getRuleContext(0, LogicalExpressionContext)!;
    }
    public OR(): antlr.TerminalNode | null {
        return this.getToken(QQL.OR, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_logicalTail;
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
        return this.getToken(QQL.LPAREN, 0);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQL.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_unitExpression;
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
        return this.getToken(QQL.NOT, 0)!;
    }
    public unitExpression(): UnitExpressionContext {
        return this.getRuleContext(0, UnitExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_notExpression;
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
        return this.getToken(QQL.IN, 0)!;
    }
    public LBRACKET(): antlr.TerminalNode {
        return this.getToken(QQL.LBRACKET, 0)!;
    }
    public RBRACKET(): antlr.TerminalNode {
        return this.getToken(QQL.RBRACKET, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQL.RULE_inArrayExpression;
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
        return this.getToken(QQL.EQUAL_EQUAL, 0);
    }
    public NOT_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.NOT_EQUAL, 0);
    }
    public GREATER_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.GREATER_EQUAL, 0);
    }
    public LESS_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.LESS_EQUAL, 0);
    }
    public GREATER_THAN(): antlr.TerminalNode | null {
        return this.getToken(QQL.GREATER_THAN, 0);
    }
    public LESS_THAN(): antlr.TerminalNode | null {
        return this.getToken(QQL.LESS_THAN, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_comparisonExpression;
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
        return this.getToken(QQL.IDENTIFIER, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QQL.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QQL.RPAREN, 0)!;
    }
    public functionArgs(): FunctionArgsContext | null {
        return this.getRuleContext(0, FunctionArgsContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_functionExpression;
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
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QQL.RULE_functionArgs;
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
        return QQL.RULE_functionArg;
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
    public evalFunction(): EvalFunctionContext | null {
        return this.getRuleContext(0, EvalFunctionContext);
    }
    public functionExpression(): FunctionExpressionContext | null {
        return this.getRuleContext(0, FunctionExpressionContext);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public calcExpression(): CalcExpressionContext | null {
        return this.getRuleContext(0, CalcExpressionContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_evalFunctionArg;
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
        return this.getToken(QQL.IF, 0);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QQL.LPAREN, 0)!;
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QQL.COMMA);
    	} else {
    		return this.getToken(QQL.COMMA, i);
    	}
    }
    public evalFunctionArg(): EvalFunctionArgContext[];
    public evalFunctionArg(i: number): EvalFunctionArgContext | null;
    public evalFunctionArg(i?: number): EvalFunctionArgContext[] | EvalFunctionArgContext | null {
        if (i === undefined) {
            return this.getRuleContexts(EvalFunctionArgContext);
        }

        return this.getRuleContext(i, EvalFunctionArgContext);
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QQL.RPAREN, 0)!;
    }
    public CASE(): antlr.TerminalNode | null {
        return this.getToken(QQL.CASE, 0);
    }
    public caseThen(): CaseThenContext | null {
        return this.getRuleContext(0, CaseThenContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_evalFunction;
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
    public logicalExpression(): LogicalExpressionContext {
        return this.getRuleContext(0, LogicalExpressionContext)!;
    }
    public COMMA(): antlr.TerminalNode {
        return this.getToken(QQL.COMMA, 0)!;
    }
    public evalFunctionArg(): EvalFunctionArgContext {
        return this.getRuleContext(0, EvalFunctionArgContext)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_caseThen;
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
        return QQL.RULE_calcExpression;
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
        return this.getToken(QQL.PLUS, 0);
    }
    public calcTerm(): CalcTermContext {
        return this.getRuleContext(0, CalcTermContext)!;
    }
    public MINUS(): antlr.TerminalNode | null {
        return this.getToken(QQL.MINUS, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_calcAction;
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
        return QQL.RULE_calcTerm;
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
        return this.getToken(QQL.MULTIPLY, 0);
    }
    public calculateUnit(): CalculateUnitContext {
        return this.getRuleContext(0, CalculateUnitContext)!;
    }
    public DIVIDE(): antlr.TerminalNode | null {
        return this.getToken(QQL.DIVIDE, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_calcTermAction;
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
        return this.getToken(QQL.LPAREN, 0);
    }
    public calcExpression(): CalcExpressionContext | null {
        return this.getRuleContext(0, CalcExpressionContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQL.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_calculateUnit;
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
    public FLOAT(): antlr.TerminalNode | null {
        return this.getToken(QQL.FLOAT, 0);
    }
    public INTEGER(): antlr.TerminalNode | null {
        return this.getToken(QQL.INTEGER, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QQL.IDENTIFIER, 0);
    }
    public literalBoolean(): LiteralBooleanContext | null {
        return this.getRuleContext(0, LiteralBooleanContext);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_factor;
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
        return this.getToken(QQL.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(QQL.FALSE, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_literalBoolean;
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
        return this.getToken(QQL.DQUOT_STRING, 0);
    }
    public SQUOT_STRING(): antlr.TerminalNode | null {
        return this.getToken(QQL.SQUOT_STRING, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_literalString;
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
        return this.getToken(QQL.REGEX_PATTERN, 0)!;
    }
    public override get ruleIndex(): number {
        return QQL.RULE_regexLiteral;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitRegexLiteral) {
            return visitor.visitRegexLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IdentifierOrStringContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QQL.IDENTIFIER, 0);
    }
    public DQUOT_STRING(): antlr.TerminalNode | null {
        return this.getToken(QQL.DQUOT_STRING, 0);
    }
    public SQUOT_STRING(): antlr.TerminalNode | null {
        return this.getToken(QQL.SQUOT_STRING, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_identifierOrString;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitIdentifierOrString) {
            return visitor.visitIdentifierOrString(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
