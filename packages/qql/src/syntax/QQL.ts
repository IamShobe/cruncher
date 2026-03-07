// Generated from /Users/elran777/git/IamShobe/cruncher/packages/qql/src/syntax/QQL.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { QQLVisitor } from "./QQLVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class QQL extends antlr.Parser {
    public static readonly TABLE = 1;
    public static readonly STATS = 2;
    public static readonly WHERE = 3;
    public static readonly SORT = 4;
    public static readonly EVAL = 5;
    public static readonly REGEX = 6;
    public static readonly FIELD = 7;
    public static readonly TIMECHART = 8;
    public static readonly UNPACK = 9;
    public static readonly AS = 10;
    public static readonly BY = 11;
    public static readonly SPAN = 12;
    public static readonly TIMECOL = 13;
    public static readonly MAXGROUPS = 14;
    public static readonly ASC = 15;
    public static readonly DESC = 16;
    public static readonly IN = 17;
    public static readonly TRUE = 18;
    public static readonly FALSE = 19;
    public static readonly IF = 20;
    public static readonly CASE = 21;
    public static readonly SEARCH_AND = 22;
    public static readonly SEARCH_OR = 23;
    public static readonly PIPE = 24;
    public static readonly COMMA = 25;
    public static readonly LPAREN = 26;
    public static readonly RPAREN = 27;
    public static readonly LBRACKET = 28;
    public static readonly RBRACKET = 29;
    public static readonly EQUAL_EQUAL = 30;
    public static readonly EQUAL = 31;
    public static readonly NOT_EQUAL = 32;
    public static readonly GREATER_EQUAL = 33;
    public static readonly LESS_EQUAL = 34;
    public static readonly GREATER_THAN = 35;
    public static readonly LESS_THAN = 36;
    public static readonly AND = 37;
    public static readonly OR = 38;
    public static readonly NOT = 39;
    public static readonly PLUS = 40;
    public static readonly MINUS = 41;
    public static readonly MULTIPLY = 42;
    public static readonly DIVIDE = 43;
    public static readonly AT_DATASOURCE = 44;
    public static readonly DQUOT_STRING = 45;
    public static readonly SQUOT_STRING = 46;
    public static readonly REGEX_PATTERN = 47;
    public static readonly FLOAT = 48;
    public static readonly INTEGER = 49;
    public static readonly IDENTIFIER = 50;
    public static readonly WS = 51;
    public static readonly COMMENT = 52;
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
    public static readonly RULE_keyword = 45;

    public static readonly literalNames = [
        null, "'table'", "'stats'", "'where'", "'sort'", "'eval'", "'regex'", 
        "'field'", "'timechart'", "'unpack'", "'as'", "'by'", "'span'", 
        "'timeCol'", "'maxGroups'", "'asc'", "'desc'", "'in'", "'true'", 
        "'false'", "'if'", "'case'", "'AND'", "'OR'", "'|'", "','", "'('", 
        "')'", "'['", "']'", "'=='", "'='", "'!='", "'>='", "'<='", "'>'", 
        "'<'", "'&&'", "'||'", "'!'", "'+'", "'-'", "'*'", "'/'"
    ];

    public static readonly symbolicNames = [
        null, "TABLE", "STATS", "WHERE", "SORT", "EVAL", "REGEX", "FIELD", 
        "TIMECHART", "UNPACK", "AS", "BY", "SPAN", "TIMECOL", "MAXGROUPS", 
        "ASC", "DESC", "IN", "TRUE", "FALSE", "IF", "CASE", "SEARCH_AND", 
        "SEARCH_OR", "PIPE", "COMMA", "LPAREN", "RPAREN", "LBRACKET", "RBRACKET", 
        "EQUAL_EQUAL", "EQUAL", "NOT_EQUAL", "GREATER_EQUAL", "LESS_EQUAL", 
        "GREATER_THAN", "LESS_THAN", "AND", "OR", "NOT", "PLUS", "MINUS", 
        "MULTIPLY", "DIVIDE", "AT_DATASOURCE", "DQUOT_STRING", "SQUOT_STRING", 
        "REGEX_PATTERN", "FLOAT", "INTEGER", "IDENTIFIER", "WS", "COMMENT"
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
        "keyword",
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
            this.state = 95;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 44) {
                {
                {
                this.state = 92;
                this.datasource();
                }
                }
                this.state = 97;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 101;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 98;
                    this.controllerParam();
                    }
                    }
                }
                this.state = 103;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 1, this.context);
            }
            this.state = 105;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67109886) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 59) !== 0)) {
                {
                this.state = 104;
                this.search();
                }
            }

            this.state = 110;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 24) {
                {
                {
                this.state = 107;
                this.pipelineCommand();
                }
                }
                this.state = 112;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 113;
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
            this.state = 115;
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
            this.state = 117;
            this.match(QQL.IDENTIFIER);
            this.state = 118;
            _la = this.tokenStream.LA(1);
            if(!(_la === 31 || _la === 32)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 121;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
                {
                this.state = 119;
                this.literalString();
                }
                break;
            case QQL.REGEX_PATTERN:
                {
                this.state = 120;
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
            this.state = 123;
            this.searchTerm();
            this.state = 125;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 22 || _la === 23) {
                {
                this.state = 124;
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
            this.state = 131;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.SEARCH_AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 127;
                this.match(QQL.SEARCH_AND);
                this.state = 128;
                this.search();
                }
                break;
            case QQL.SEARCH_OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 129;
                this.match(QQL.SEARCH_OR);
                this.state = 130;
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
            this.state = 138;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 133;
                this.match(QQL.LPAREN);
                this.state = 134;
                this.search();
                this.state = 135;
                this.match(QQL.RPAREN);
                }
                break;
            case QQL.TABLE:
            case QQL.STATS:
            case QQL.WHERE:
            case QQL.SORT:
            case QQL.EVAL:
            case QQL.REGEX:
            case QQL.FIELD:
            case QQL.TIMECHART:
            case QQL.UNPACK:
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
            case QQL.FLOAT:
            case QQL.INTEGER:
            case QQL.IDENTIFIER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 137;
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
            this.state = 140;
            this.searchLiteral();
            this.state = 143;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 32) {
                {
                this.state = 141;
                this.match(QQL.NOT_EQUAL);
                this.state = 142;
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
            this.state = 150;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                this.state = 150;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case QQL.IDENTIFIER:
                    {
                    this.state = 145;
                    this.match(QQL.IDENTIFIER);
                    }
                    break;
                case QQL.FLOAT:
                    {
                    this.state = 146;
                    this.match(QQL.FLOAT);
                    }
                    break;
                case QQL.INTEGER:
                    {
                    this.state = 147;
                    this.match(QQL.INTEGER);
                    }
                    break;
                case QQL.DQUOT_STRING:
                case QQL.SQUOT_STRING:
                    {
                    this.state = 148;
                    this.literalString();
                    }
                    break;
                case QQL.TABLE:
                case QQL.STATS:
                case QQL.WHERE:
                case QQL.SORT:
                case QQL.EVAL:
                case QQL.REGEX:
                case QQL.FIELD:
                case QQL.TIMECHART:
                case QQL.UNPACK:
                    {
                    this.state = 149;
                    this.keyword();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 152;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1022) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 59) !== 0));
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
            this.state = 154;
            this.match(QQL.PIPE);
            this.state = 163;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.TABLE:
                {
                this.state = 155;
                this.tableCmd();
                }
                break;
            case QQL.STATS:
                {
                this.state = 156;
                this.statsCmd();
                }
                break;
            case QQL.WHERE:
                {
                this.state = 157;
                this.whereCmd();
                }
                break;
            case QQL.SORT:
                {
                this.state = 158;
                this.sortCmd();
                }
                break;
            case QQL.EVAL:
                {
                this.state = 159;
                this.evalCmd();
                }
                break;
            case QQL.REGEX:
                {
                this.state = 160;
                this.regexCmd();
                }
                break;
            case QQL.TIMECHART:
                {
                this.state = 161;
                this.timechartCmd();
                }
                break;
            case QQL.UNPACK:
                {
                this.state = 162;
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
            this.state = 165;
            this.match(QQL.TABLE);
            this.state = 166;
            this.tableColumn();
            this.state = 173;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 33555454) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 35) !== 0)) {
                {
                {
                this.state = 168;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 25) {
                    {
                    this.state = 167;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 170;
                this.tableColumn();
                }
                }
                this.state = 175;
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
            this.state = 176;
            this.identifierOrString();
            this.state = 179;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 177;
                this.match(QQL.AS);
                this.state = 178;
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
            this.state = 181;
            this.match(QQL.STATS);
            this.state = 182;
            this.aggregationFunction();
            this.state = 189;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 33555454) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 35) !== 0)) {
                {
                {
                this.state = 184;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 25) {
                    {
                    this.state = 183;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 186;
                this.aggregationFunction();
                }
                }
                this.state = 191;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 194;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 192;
                this.match(QQL.BY);
                this.state = 193;
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
            this.state = 196;
            this.identifierOrString();
            this.state = 202;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 26) {
                {
                this.state = 197;
                this.match(QQL.LPAREN);
                this.state = 199;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1022) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 35) !== 0)) {
                    {
                    this.state = 198;
                    this.identifierOrString();
                    }
                }

                this.state = 201;
                this.match(QQL.RPAREN);
                }
            }

            this.state = 206;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 204;
                this.match(QQL.AS);
                this.state = 205;
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
            this.state = 208;
            this.identifierOrString();
            this.state = 215;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 33555454) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 35) !== 0)) {
                {
                {
                this.state = 210;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 25) {
                    {
                    this.state = 209;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 212;
                this.identifierOrString();
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
    public whereCmd(): WhereCmdContext {
        let localContext = new WhereCmdContext(this.context, this.state);
        this.enterRule(localContext, 28, QQL.RULE_whereCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 218;
            this.match(QQL.WHERE);
            this.state = 219;
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
            this.state = 221;
            this.match(QQL.SORT);
            this.state = 222;
            this.sortColumn();
            this.state = 229;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 33555454) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 35) !== 0)) {
                {
                {
                this.state = 224;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 25) {
                    {
                    this.state = 223;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 226;
                this.sortColumn();
                }
                }
                this.state = 231;
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
            this.state = 232;
            this.identifierOrString();
            this.state = 234;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 15 || _la === 16) {
                {
                this.state = 233;
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
        this.enterRule(localContext, 34, QQL.RULE_evalCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 236;
            this.match(QQL.EVAL);
            this.state = 237;
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
            this.state = 239;
            this.identifierOrString();
            this.state = 240;
            this.match(QQL.EQUAL);
            this.state = 241;
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
            this.state = 243;
            this.match(QQL.REGEX);
            this.state = 247;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 7) {
                {
                this.state = 244;
                this.match(QQL.FIELD);
                this.state = 245;
                this.match(QQL.EQUAL);
                this.state = 246;
                this.identifierOrString();
                }
            }

            this.state = 249;
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
            this.state = 251;
            this.match(QQL.TIMECHART);
            this.state = 252;
            this.aggregationFunction();
            this.state = 259;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 33555454) !== 0) || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 35) !== 0)) {
                {
                {
                this.state = 254;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 25) {
                    {
                    this.state = 253;
                    this.match(QQL.COMMA);
                    }
                }

                this.state = 256;
                this.aggregationFunction();
                }
                }
                this.state = 261;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 265;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 28672) !== 0)) {
                {
                {
                this.state = 262;
                this.timechartParams();
                }
                }
                this.state = 267;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 270;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 268;
                this.match(QQL.BY);
                this.state = 269;
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
            this.state = 278;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.SPAN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 272;
                this.match(QQL.SPAN);
                this.state = 273;
                this.identifierOrString();
                }
                break;
            case QQL.TIMECOL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 274;
                this.match(QQL.TIMECOL);
                this.state = 275;
                this.identifierOrString();
                }
                break;
            case QQL.MAXGROUPS:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 276;
                this.match(QQL.MAXGROUPS);
                this.state = 277;
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
            this.state = 280;
            this.match(QQL.UNPACK);
            this.state = 281;
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
            this.state = 283;
            this.unitExpression();
            this.state = 287;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 32, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 284;
                    this.logicalTail();
                    }
                    }
                }
                this.state = 289;
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
            this.state = 294;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 290;
                this.match(QQL.AND);
                this.state = 291;
                this.logicalExpression();
                }
                break;
            case QQL.OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 292;
                this.match(QQL.OR);
                this.state = 293;
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
            this.state = 306;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.TABLE:
            case QQL.STATS:
            case QQL.WHERE:
            case QQL.SORT:
            case QQL.EVAL:
            case QQL.REGEX:
            case QQL.FIELD:
            case QQL.TIMECHART:
            case QQL.UNPACK:
            case QQL.TRUE:
            case QQL.FALSE:
            case QQL.NOT:
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
            case QQL.FLOAT:
            case QQL.INTEGER:
            case QQL.IDENTIFIER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 300;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 34, this.context) ) {
                case 1:
                    {
                    this.state = 296;
                    this.inArrayExpression();
                    }
                    break;
                case 2:
                    {
                    this.state = 297;
                    this.comparisonExpression();
                    }
                    break;
                case 3:
                    {
                    this.state = 298;
                    this.notExpression();
                    }
                    break;
                case 4:
                    {
                    this.state = 299;
                    this.functionExpression();
                    }
                    break;
                }
                }
                break;
            case QQL.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 302;
                this.match(QQL.LPAREN);
                this.state = 303;
                this.logicalExpression();
                this.state = 304;
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
            this.state = 308;
            this.match(QQL.NOT);
            this.state = 309;
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
            this.state = 311;
            this.factor();
            this.state = 312;
            this.match(QQL.IN);
            this.state = 313;
            this.match(QQL.LBRACKET);
            this.state = 314;
            this.factor();
            this.state = 319;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 25) {
                {
                {
                this.state = 315;
                this.match(QQL.COMMA);
                this.state = 316;
                this.factor();
                }
                }
                this.state = 321;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 322;
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
            this.state = 324;
            this.factor();
            this.state = 325;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & 125) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 326;
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
            this.state = 328;
            this.match(QQL.IDENTIFIER);
            this.state = 329;
            this.match(QQL.LPAREN);
            this.state = 331;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 67896318) !== 0) || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & 4033) !== 0)) {
                {
                this.state = 330;
                this.functionArgs();
                }
            }

            this.state = 333;
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
            this.state = 335;
            this.functionArg();
            this.state = 340;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 25) {
                {
                {
                this.state = 336;
                this.match(QQL.COMMA);
                this.state = 337;
                this.functionArg();
                }
                }
                this.state = 342;
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
            this.state = 347;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 343;
                this.factor();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 344;
                this.regexLiteral();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 345;
                this.logicalExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 346;
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
            this.state = 353;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 349;
                this.evalFunction();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 350;
                this.functionExpression();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 351;
                this.logicalExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 352;
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
            this.state = 375;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.IF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 355;
                this.match(QQL.IF);
                this.state = 356;
                this.match(QQL.LPAREN);
                this.state = 357;
                this.logicalExpression();
                this.state = 358;
                this.match(QQL.COMMA);
                this.state = 359;
                this.evalFunctionArg();
                this.state = 362;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 25) {
                    {
                    this.state = 360;
                    this.match(QQL.COMMA);
                    this.state = 361;
                    this.evalFunctionArg();
                    }
                }

                this.state = 364;
                this.match(QQL.RPAREN);
                }
                break;
            case QQL.CASE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 366;
                this.match(QQL.CASE);
                this.state = 367;
                this.match(QQL.LPAREN);
                this.state = 368;
                this.caseThen();
                this.state = 371;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 25) {
                    {
                    this.state = 369;
                    this.match(QQL.COMMA);
                    this.state = 370;
                    this.evalFunctionArg();
                    }
                }

                this.state = 373;
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
            this.state = 377;
            this.logicalExpression();
            this.state = 378;
            this.match(QQL.COMMA);
            this.state = 379;
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
            this.state = 381;
            this.calcTerm();
            this.state = 385;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 40 || _la === 41) {
                {
                {
                this.state = 382;
                this.calcAction();
                }
                }
                this.state = 387;
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
            this.state = 392;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.PLUS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 388;
                this.match(QQL.PLUS);
                this.state = 389;
                this.calcTerm();
                }
                break;
            case QQL.MINUS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 390;
                this.match(QQL.MINUS);
                this.state = 391;
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
            this.state = 394;
            this.calculateUnit();
            this.state = 398;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 42 || _la === 43) {
                {
                {
                this.state = 395;
                this.calcTermAction();
                }
                }
                this.state = 400;
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
            this.state = 405;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.MULTIPLY:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 401;
                this.match(QQL.MULTIPLY);
                this.state = 402;
                this.calculateUnit();
                }
                break;
            case QQL.DIVIDE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 403;
                this.match(QQL.DIVIDE);
                this.state = 404;
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
            this.state = 412;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.TABLE:
            case QQL.STATS:
            case QQL.WHERE:
            case QQL.SORT:
            case QQL.EVAL:
            case QQL.REGEX:
            case QQL.FIELD:
            case QQL.TIMECHART:
            case QQL.UNPACK:
            case QQL.TRUE:
            case QQL.FALSE:
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
            case QQL.FLOAT:
            case QQL.INTEGER:
            case QQL.IDENTIFIER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 407;
                this.factor();
                }
                break;
            case QQL.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 408;
                this.match(QQL.LPAREN);
                this.state = 409;
                this.calcExpression();
                this.state = 410;
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
            this.state = 420;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.DQUOT_STRING:
            case QQL.SQUOT_STRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 414;
                this.literalString();
                }
                break;
            case QQL.FLOAT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 415;
                this.match(QQL.FLOAT);
                }
                break;
            case QQL.INTEGER:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 416;
                this.match(QQL.INTEGER);
                }
                break;
            case QQL.IDENTIFIER:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 417;
                this.match(QQL.IDENTIFIER);
                }
                break;
            case QQL.TABLE:
            case QQL.STATS:
            case QQL.WHERE:
            case QQL.SORT:
            case QQL.EVAL:
            case QQL.REGEX:
            case QQL.FIELD:
            case QQL.TIMECHART:
            case QQL.UNPACK:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 418;
                this.keyword();
                }
                break;
            case QQL.TRUE:
            case QQL.FALSE:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 419;
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
            this.state = 422;
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
        this.enterRule(localContext, 84, QQL.RULE_literalString);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 424;
            _la = this.tokenStream.LA(1);
            if(!(_la === 45 || _la === 46)) {
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
            this.state = 426;
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
        try {
            this.state = 432;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQL.IDENTIFIER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 428;
                this.match(QQL.IDENTIFIER);
                }
                break;
            case QQL.DQUOT_STRING:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 429;
                this.match(QQL.DQUOT_STRING);
                }
                break;
            case QQL.SQUOT_STRING:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 430;
                this.match(QQL.SQUOT_STRING);
                }
                break;
            case QQL.TABLE:
            case QQL.STATS:
            case QQL.WHERE:
            case QQL.SORT:
            case QQL.EVAL:
            case QQL.REGEX:
            case QQL.FIELD:
            case QQL.TIMECHART:
            case QQL.UNPACK:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 431;
                this.keyword();
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
    public keyword(): KeywordContext {
        let localContext = new KeywordContext(this.context, this.state);
        this.enterRule(localContext, 90, QQL.RULE_keyword);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 434;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1022) !== 0))) {
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
        4,1,52,437,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,1,0,
        5,0,94,8,0,10,0,12,0,97,9,0,1,0,5,0,100,8,0,10,0,12,0,103,9,0,1,
        0,3,0,106,8,0,1,0,5,0,109,8,0,10,0,12,0,112,9,0,1,0,1,0,1,1,1,1,
        1,2,1,2,1,2,1,2,3,2,122,8,2,1,3,1,3,3,3,126,8,3,1,4,1,4,1,4,1,4,
        3,4,132,8,4,1,5,1,5,1,5,1,5,1,5,3,5,139,8,5,1,6,1,6,1,6,3,6,144,
        8,6,1,7,1,7,1,7,1,7,1,7,4,7,151,8,7,11,7,12,7,152,1,8,1,8,1,8,1,
        8,1,8,1,8,1,8,1,8,1,8,3,8,164,8,8,1,9,1,9,1,9,3,9,169,8,9,1,9,5,
        9,172,8,9,10,9,12,9,175,9,9,1,10,1,10,1,10,3,10,180,8,10,1,11,1,
        11,1,11,3,11,185,8,11,1,11,5,11,188,8,11,10,11,12,11,191,9,11,1,
        11,1,11,3,11,195,8,11,1,12,1,12,1,12,3,12,200,8,12,1,12,3,12,203,
        8,12,1,12,1,12,3,12,207,8,12,1,13,1,13,3,13,211,8,13,1,13,5,13,214,
        8,13,10,13,12,13,217,9,13,1,14,1,14,1,14,1,15,1,15,1,15,3,15,225,
        8,15,1,15,5,15,228,8,15,10,15,12,15,231,9,15,1,16,1,16,3,16,235,
        8,16,1,17,1,17,1,17,1,18,1,18,1,18,1,18,1,19,1,19,1,19,1,19,3,19,
        248,8,19,1,19,1,19,1,20,1,20,1,20,3,20,255,8,20,1,20,5,20,258,8,
        20,10,20,12,20,261,9,20,1,20,5,20,264,8,20,10,20,12,20,267,9,20,
        1,20,1,20,3,20,271,8,20,1,21,1,21,1,21,1,21,1,21,1,21,3,21,279,8,
        21,1,22,1,22,1,22,1,23,1,23,5,23,286,8,23,10,23,12,23,289,9,23,1,
        24,1,24,1,24,1,24,3,24,295,8,24,1,25,1,25,1,25,1,25,3,25,301,8,25,
        1,25,1,25,1,25,1,25,3,25,307,8,25,1,26,1,26,1,26,1,27,1,27,1,27,
        1,27,1,27,1,27,5,27,318,8,27,10,27,12,27,321,9,27,1,27,1,27,1,28,
        1,28,1,28,1,28,1,29,1,29,1,29,3,29,332,8,29,1,29,1,29,1,30,1,30,
        1,30,5,30,339,8,30,10,30,12,30,342,9,30,1,31,1,31,1,31,1,31,3,31,
        348,8,31,1,32,1,32,1,32,1,32,3,32,354,8,32,1,33,1,33,1,33,1,33,1,
        33,1,33,1,33,3,33,363,8,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,3,
        33,372,8,33,1,33,1,33,3,33,376,8,33,1,34,1,34,1,34,1,34,1,35,1,35,
        5,35,384,8,35,10,35,12,35,387,9,35,1,36,1,36,1,36,1,36,3,36,393,
        8,36,1,37,1,37,5,37,397,8,37,10,37,12,37,400,9,37,1,38,1,38,1,38,
        1,38,3,38,406,8,38,1,39,1,39,1,39,1,39,1,39,3,39,413,8,39,1,40,1,
        40,1,40,1,40,1,40,1,40,3,40,421,8,40,1,41,1,41,1,42,1,42,1,43,1,
        43,1,44,1,44,1,44,1,44,3,44,433,8,44,1,45,1,45,1,45,0,0,46,0,2,4,
        6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,
        50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,0,
        6,1,0,31,32,1,0,15,16,2,0,30,30,32,36,1,0,18,19,1,0,45,46,1,0,1,
        9,463,0,95,1,0,0,0,2,115,1,0,0,0,4,117,1,0,0,0,6,123,1,0,0,0,8,131,
        1,0,0,0,10,138,1,0,0,0,12,140,1,0,0,0,14,150,1,0,0,0,16,154,1,0,
        0,0,18,165,1,0,0,0,20,176,1,0,0,0,22,181,1,0,0,0,24,196,1,0,0,0,
        26,208,1,0,0,0,28,218,1,0,0,0,30,221,1,0,0,0,32,232,1,0,0,0,34,236,
        1,0,0,0,36,239,1,0,0,0,38,243,1,0,0,0,40,251,1,0,0,0,42,278,1,0,
        0,0,44,280,1,0,0,0,46,283,1,0,0,0,48,294,1,0,0,0,50,306,1,0,0,0,
        52,308,1,0,0,0,54,311,1,0,0,0,56,324,1,0,0,0,58,328,1,0,0,0,60,335,
        1,0,0,0,62,347,1,0,0,0,64,353,1,0,0,0,66,375,1,0,0,0,68,377,1,0,
        0,0,70,381,1,0,0,0,72,392,1,0,0,0,74,394,1,0,0,0,76,405,1,0,0,0,
        78,412,1,0,0,0,80,420,1,0,0,0,82,422,1,0,0,0,84,424,1,0,0,0,86,426,
        1,0,0,0,88,432,1,0,0,0,90,434,1,0,0,0,92,94,3,2,1,0,93,92,1,0,0,
        0,94,97,1,0,0,0,95,93,1,0,0,0,95,96,1,0,0,0,96,101,1,0,0,0,97,95,
        1,0,0,0,98,100,3,4,2,0,99,98,1,0,0,0,100,103,1,0,0,0,101,99,1,0,
        0,0,101,102,1,0,0,0,102,105,1,0,0,0,103,101,1,0,0,0,104,106,3,6,
        3,0,105,104,1,0,0,0,105,106,1,0,0,0,106,110,1,0,0,0,107,109,3,16,
        8,0,108,107,1,0,0,0,109,112,1,0,0,0,110,108,1,0,0,0,110,111,1,0,
        0,0,111,113,1,0,0,0,112,110,1,0,0,0,113,114,5,0,0,1,114,1,1,0,0,
        0,115,116,5,44,0,0,116,3,1,0,0,0,117,118,5,50,0,0,118,121,7,0,0,
        0,119,122,3,84,42,0,120,122,3,86,43,0,121,119,1,0,0,0,121,120,1,
        0,0,0,122,5,1,0,0,0,123,125,3,10,5,0,124,126,3,8,4,0,125,124,1,0,
        0,0,125,126,1,0,0,0,126,7,1,0,0,0,127,128,5,22,0,0,128,132,3,6,3,
        0,129,130,5,23,0,0,130,132,3,6,3,0,131,127,1,0,0,0,131,129,1,0,0,
        0,132,9,1,0,0,0,133,134,5,26,0,0,134,135,3,6,3,0,135,136,5,27,0,
        0,136,139,1,0,0,0,137,139,3,12,6,0,138,133,1,0,0,0,138,137,1,0,0,
        0,139,11,1,0,0,0,140,143,3,14,7,0,141,142,5,32,0,0,142,144,3,14,
        7,0,143,141,1,0,0,0,143,144,1,0,0,0,144,13,1,0,0,0,145,151,5,50,
        0,0,146,151,5,48,0,0,147,151,5,49,0,0,148,151,3,84,42,0,149,151,
        3,90,45,0,150,145,1,0,0,0,150,146,1,0,0,0,150,147,1,0,0,0,150,148,
        1,0,0,0,150,149,1,0,0,0,151,152,1,0,0,0,152,150,1,0,0,0,152,153,
        1,0,0,0,153,15,1,0,0,0,154,163,5,24,0,0,155,164,3,18,9,0,156,164,
        3,22,11,0,157,164,3,28,14,0,158,164,3,30,15,0,159,164,3,34,17,0,
        160,164,3,38,19,0,161,164,3,40,20,0,162,164,3,44,22,0,163,155,1,
        0,0,0,163,156,1,0,0,0,163,157,1,0,0,0,163,158,1,0,0,0,163,159,1,
        0,0,0,163,160,1,0,0,0,163,161,1,0,0,0,163,162,1,0,0,0,164,17,1,0,
        0,0,165,166,5,1,0,0,166,173,3,20,10,0,167,169,5,25,0,0,168,167,1,
        0,0,0,168,169,1,0,0,0,169,170,1,0,0,0,170,172,3,20,10,0,171,168,
        1,0,0,0,172,175,1,0,0,0,173,171,1,0,0,0,173,174,1,0,0,0,174,19,1,
        0,0,0,175,173,1,0,0,0,176,179,3,88,44,0,177,178,5,10,0,0,178,180,
        3,88,44,0,179,177,1,0,0,0,179,180,1,0,0,0,180,21,1,0,0,0,181,182,
        5,2,0,0,182,189,3,24,12,0,183,185,5,25,0,0,184,183,1,0,0,0,184,185,
        1,0,0,0,185,186,1,0,0,0,186,188,3,24,12,0,187,184,1,0,0,0,188,191,
        1,0,0,0,189,187,1,0,0,0,189,190,1,0,0,0,190,194,1,0,0,0,191,189,
        1,0,0,0,192,193,5,11,0,0,193,195,3,26,13,0,194,192,1,0,0,0,194,195,
        1,0,0,0,195,23,1,0,0,0,196,202,3,88,44,0,197,199,5,26,0,0,198,200,
        3,88,44,0,199,198,1,0,0,0,199,200,1,0,0,0,200,201,1,0,0,0,201,203,
        5,27,0,0,202,197,1,0,0,0,202,203,1,0,0,0,203,206,1,0,0,0,204,205,
        5,10,0,0,205,207,3,88,44,0,206,204,1,0,0,0,206,207,1,0,0,0,207,25,
        1,0,0,0,208,215,3,88,44,0,209,211,5,25,0,0,210,209,1,0,0,0,210,211,
        1,0,0,0,211,212,1,0,0,0,212,214,3,88,44,0,213,210,1,0,0,0,214,217,
        1,0,0,0,215,213,1,0,0,0,215,216,1,0,0,0,216,27,1,0,0,0,217,215,1,
        0,0,0,218,219,5,3,0,0,219,220,3,46,23,0,220,29,1,0,0,0,221,222,5,
        4,0,0,222,229,3,32,16,0,223,225,5,25,0,0,224,223,1,0,0,0,224,225,
        1,0,0,0,225,226,1,0,0,0,226,228,3,32,16,0,227,224,1,0,0,0,228,231,
        1,0,0,0,229,227,1,0,0,0,229,230,1,0,0,0,230,31,1,0,0,0,231,229,1,
        0,0,0,232,234,3,88,44,0,233,235,7,1,0,0,234,233,1,0,0,0,234,235,
        1,0,0,0,235,33,1,0,0,0,236,237,5,5,0,0,237,238,3,36,18,0,238,35,
        1,0,0,0,239,240,3,88,44,0,240,241,5,31,0,0,241,242,3,64,32,0,242,
        37,1,0,0,0,243,247,5,6,0,0,244,245,5,7,0,0,245,246,5,31,0,0,246,
        248,3,88,44,0,247,244,1,0,0,0,247,248,1,0,0,0,248,249,1,0,0,0,249,
        250,3,86,43,0,250,39,1,0,0,0,251,252,5,8,0,0,252,259,3,24,12,0,253,
        255,5,25,0,0,254,253,1,0,0,0,254,255,1,0,0,0,255,256,1,0,0,0,256,
        258,3,24,12,0,257,254,1,0,0,0,258,261,1,0,0,0,259,257,1,0,0,0,259,
        260,1,0,0,0,260,265,1,0,0,0,261,259,1,0,0,0,262,264,3,42,21,0,263,
        262,1,0,0,0,264,267,1,0,0,0,265,263,1,0,0,0,265,266,1,0,0,0,266,
        270,1,0,0,0,267,265,1,0,0,0,268,269,5,11,0,0,269,271,3,26,13,0,270,
        268,1,0,0,0,270,271,1,0,0,0,271,41,1,0,0,0,272,273,5,12,0,0,273,
        279,3,88,44,0,274,275,5,13,0,0,275,279,3,88,44,0,276,277,5,14,0,
        0,277,279,5,49,0,0,278,272,1,0,0,0,278,274,1,0,0,0,278,276,1,0,0,
        0,279,43,1,0,0,0,280,281,5,9,0,0,281,282,3,88,44,0,282,45,1,0,0,
        0,283,287,3,50,25,0,284,286,3,48,24,0,285,284,1,0,0,0,286,289,1,
        0,0,0,287,285,1,0,0,0,287,288,1,0,0,0,288,47,1,0,0,0,289,287,1,0,
        0,0,290,291,5,37,0,0,291,295,3,46,23,0,292,293,5,38,0,0,293,295,
        3,46,23,0,294,290,1,0,0,0,294,292,1,0,0,0,295,49,1,0,0,0,296,301,
        3,54,27,0,297,301,3,56,28,0,298,301,3,52,26,0,299,301,3,58,29,0,
        300,296,1,0,0,0,300,297,1,0,0,0,300,298,1,0,0,0,300,299,1,0,0,0,
        301,307,1,0,0,0,302,303,5,26,0,0,303,304,3,46,23,0,304,305,5,27,
        0,0,305,307,1,0,0,0,306,300,1,0,0,0,306,302,1,0,0,0,307,51,1,0,0,
        0,308,309,5,39,0,0,309,310,3,50,25,0,310,53,1,0,0,0,311,312,3,80,
        40,0,312,313,5,17,0,0,313,314,5,28,0,0,314,319,3,80,40,0,315,316,
        5,25,0,0,316,318,3,80,40,0,317,315,1,0,0,0,318,321,1,0,0,0,319,317,
        1,0,0,0,319,320,1,0,0,0,320,322,1,0,0,0,321,319,1,0,0,0,322,323,
        5,29,0,0,323,55,1,0,0,0,324,325,3,80,40,0,325,326,7,2,0,0,326,327,
        3,80,40,0,327,57,1,0,0,0,328,329,5,50,0,0,329,331,5,26,0,0,330,332,
        3,60,30,0,331,330,1,0,0,0,331,332,1,0,0,0,332,333,1,0,0,0,333,334,
        5,27,0,0,334,59,1,0,0,0,335,340,3,62,31,0,336,337,5,25,0,0,337,339,
        3,62,31,0,338,336,1,0,0,0,339,342,1,0,0,0,340,338,1,0,0,0,340,341,
        1,0,0,0,341,61,1,0,0,0,342,340,1,0,0,0,343,348,3,80,40,0,344,348,
        3,86,43,0,345,348,3,46,23,0,346,348,3,58,29,0,347,343,1,0,0,0,347,
        344,1,0,0,0,347,345,1,0,0,0,347,346,1,0,0,0,348,63,1,0,0,0,349,354,
        3,66,33,0,350,354,3,58,29,0,351,354,3,46,23,0,352,354,3,70,35,0,
        353,349,1,0,0,0,353,350,1,0,0,0,353,351,1,0,0,0,353,352,1,0,0,0,
        354,65,1,0,0,0,355,356,5,20,0,0,356,357,5,26,0,0,357,358,3,46,23,
        0,358,359,5,25,0,0,359,362,3,64,32,0,360,361,5,25,0,0,361,363,3,
        64,32,0,362,360,1,0,0,0,362,363,1,0,0,0,363,364,1,0,0,0,364,365,
        5,27,0,0,365,376,1,0,0,0,366,367,5,21,0,0,367,368,5,26,0,0,368,371,
        3,68,34,0,369,370,5,25,0,0,370,372,3,64,32,0,371,369,1,0,0,0,371,
        372,1,0,0,0,372,373,1,0,0,0,373,374,5,27,0,0,374,376,1,0,0,0,375,
        355,1,0,0,0,375,366,1,0,0,0,376,67,1,0,0,0,377,378,3,46,23,0,378,
        379,5,25,0,0,379,380,3,64,32,0,380,69,1,0,0,0,381,385,3,74,37,0,
        382,384,3,72,36,0,383,382,1,0,0,0,384,387,1,0,0,0,385,383,1,0,0,
        0,385,386,1,0,0,0,386,71,1,0,0,0,387,385,1,0,0,0,388,389,5,40,0,
        0,389,393,3,74,37,0,390,391,5,41,0,0,391,393,3,74,37,0,392,388,1,
        0,0,0,392,390,1,0,0,0,393,73,1,0,0,0,394,398,3,78,39,0,395,397,3,
        76,38,0,396,395,1,0,0,0,397,400,1,0,0,0,398,396,1,0,0,0,398,399,
        1,0,0,0,399,75,1,0,0,0,400,398,1,0,0,0,401,402,5,42,0,0,402,406,
        3,78,39,0,403,404,5,43,0,0,404,406,3,78,39,0,405,401,1,0,0,0,405,
        403,1,0,0,0,406,77,1,0,0,0,407,413,3,80,40,0,408,409,5,26,0,0,409,
        410,3,70,35,0,410,411,5,27,0,0,411,413,1,0,0,0,412,407,1,0,0,0,412,
        408,1,0,0,0,413,79,1,0,0,0,414,421,3,84,42,0,415,421,5,48,0,0,416,
        421,5,49,0,0,417,421,5,50,0,0,418,421,3,90,45,0,419,421,3,82,41,
        0,420,414,1,0,0,0,420,415,1,0,0,0,420,416,1,0,0,0,420,417,1,0,0,
        0,420,418,1,0,0,0,420,419,1,0,0,0,421,81,1,0,0,0,422,423,7,3,0,0,
        423,83,1,0,0,0,424,425,7,4,0,0,425,85,1,0,0,0,426,427,5,47,0,0,427,
        87,1,0,0,0,428,433,5,50,0,0,429,433,5,45,0,0,430,433,5,46,0,0,431,
        433,3,90,45,0,432,428,1,0,0,0,432,429,1,0,0,0,432,430,1,0,0,0,432,
        431,1,0,0,0,433,89,1,0,0,0,434,435,7,5,0,0,435,91,1,0,0,0,51,95,
        101,105,110,121,125,131,138,143,150,152,163,168,173,179,184,189,
        194,199,202,206,210,215,224,229,234,247,254,259,265,270,278,287,
        294,300,306,319,331,340,347,353,362,371,375,385,392,398,405,412,
        420,432
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
    public keyword(): KeywordContext[];
    public keyword(i: number): KeywordContext | null;
    public keyword(i?: number): KeywordContext[] | KeywordContext | null {
        if (i === undefined) {
            return this.getRuleContexts(KeywordContext);
        }

        return this.getRuleContext(i, KeywordContext);
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
    public keyword(): KeywordContext | null {
        return this.getRuleContext(0, KeywordContext);
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
    public keyword(): KeywordContext | null {
        return this.getRuleContext(0, KeywordContext);
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


export class KeywordContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TABLE(): antlr.TerminalNode | null {
        return this.getToken(QQL.TABLE, 0);
    }
    public STATS(): antlr.TerminalNode | null {
        return this.getToken(QQL.STATS, 0);
    }
    public WHERE(): antlr.TerminalNode | null {
        return this.getToken(QQL.WHERE, 0);
    }
    public SORT(): antlr.TerminalNode | null {
        return this.getToken(QQL.SORT, 0);
    }
    public EVAL(): antlr.TerminalNode | null {
        return this.getToken(QQL.EVAL, 0);
    }
    public REGEX(): antlr.TerminalNode | null {
        return this.getToken(QQL.REGEX, 0);
    }
    public FIELD(): antlr.TerminalNode | null {
        return this.getToken(QQL.FIELD, 0);
    }
    public TIMECHART(): antlr.TerminalNode | null {
        return this.getToken(QQL.TIMECHART, 0);
    }
    public UNPACK(): antlr.TerminalNode | null {
        return this.getToken(QQL.UNPACK, 0);
    }
    public override get ruleIndex(): number {
        return QQL.RULE_keyword;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitKeyword) {
            return visitor.visitKeyword(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
