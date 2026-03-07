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
            this.state = 93;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 46) {
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
            if (((((_la - 27)) & ~0x1F) === 0 && ((1 << (_la - 27)) & 28311553) !== 0)) {
                {
                this.state = 102;
                this.search();
                }
            }

            this.state = 108;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 25) {
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
            this.match(QQLParser.EOF);
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
            this.state = 113;
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
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 115;
            this.match(QQLParser.IDENTIFIER);
            this.state = 116;
            _la = this.tokenStream.LA(1);
            if(!(_la === 31 || _la === 33)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 119;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.DQUOT_STRING:
            case QQLParser.SQUOT_STRING:
                {
                this.state = 117;
                this.literalString();
                }
                break;
            case QQLParser.REGEX_PATTERN:
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
        this.enterRule(localContext, 6, QQLParser.RULE_search);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 121;
            this.searchTerm();
            this.state = 123;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 23 || _la === 24) {
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
        this.enterRule(localContext, 8, QQLParser.RULE_searchTail);
        try {
            this.state = 129;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.SEARCH_AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 125;
                this.match(QQLParser.SEARCH_AND);
                this.state = 126;
                this.search();
                }
                break;
            case QQLParser.SEARCH_OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 127;
                this.match(QQLParser.SEARCH_OR);
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
        this.enterRule(localContext, 10, QQLParser.RULE_searchTerm);
        try {
            this.state = 136;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 131;
                this.match(QQLParser.LPAREN);
                this.state = 132;
                this.search();
                this.state = 133;
                this.match(QQLParser.RPAREN);
                }
                break;
            case QQLParser.DQUOT_STRING:
            case QQLParser.SQUOT_STRING:
            case QQLParser.INTEGER:
            case QQLParser.IDENTIFIER:
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
        this.enterRule(localContext, 12, QQLParser.RULE_searchFactor);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 138;
            this.searchLiteral();
            this.state = 141;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 33) {
                {
                this.state = 139;
                this.match(QQLParser.NOT_EQUAL);
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
        this.enterRule(localContext, 14, QQLParser.RULE_searchLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 146;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                this.state = 146;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case QQLParser.IDENTIFIER:
                    {
                    this.state = 143;
                    this.match(QQLParser.IDENTIFIER);
                    }
                    break;
                case QQLParser.INTEGER:
                    {
                    this.state = 144;
                    this.match(QQLParser.INTEGER);
                    }
                    break;
                case QQLParser.DQUOT_STRING:
                case QQLParser.SQUOT_STRING:
                    {
                    this.state = 145;
                    this.literalString();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 148;
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
        this.enterRule(localContext, 16, QQLParser.RULE_pipelineCommand);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 150;
            this.match(QQLParser.PIPE);
            this.state = 159;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.TABLE:
                {
                this.state = 151;
                this.tableCmd();
                }
                break;
            case QQLParser.STATS:
                {
                this.state = 152;
                this.statsCmd();
                }
                break;
            case QQLParser.WHERE:
                {
                this.state = 153;
                this.whereCmd();
                }
                break;
            case QQLParser.SORT:
                {
                this.state = 154;
                this.sortCmd();
                }
                break;
            case QQLParser.EVAL:
                {
                this.state = 155;
                this.evalCmd();
                }
                break;
            case QQLParser.REGEX:
                {
                this.state = 156;
                this.regexCmd();
                }
                break;
            case QQLParser.TIMECHART:
                {
                this.state = 157;
                this.timechartCmd();
                }
                break;
            case QQLParser.UNPACK:
                {
                this.state = 158;
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
        this.enterRule(localContext, 18, QQLParser.RULE_tableCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 161;
            this.match(QQLParser.TABLE);
            this.state = 162;
            this.tableColumn();
            this.state = 169;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & 39845889) !== 0)) {
                {
                {
                this.state = 164;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 26) {
                    {
                    this.state = 163;
                    this.match(QQLParser.COMMA);
                    }
                }

                this.state = 166;
                this.tableColumn();
                }
                }
                this.state = 171;
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
        this.enterRule(localContext, 20, QQLParser.RULE_tableColumn);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 172;
            this.identifierOrString();
            this.state = 175;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9) {
                {
                this.state = 173;
                this.match(QQLParser.AS);
                this.state = 174;
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
        this.enterRule(localContext, 22, QQLParser.RULE_statsCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 177;
            this.match(QQLParser.STATS);
            this.state = 178;
            this.aggregationFunction();
            this.state = 185;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & 39845889) !== 0)) {
                {
                {
                this.state = 180;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 26) {
                    {
                    this.state = 179;
                    this.match(QQLParser.COMMA);
                    }
                }

                this.state = 182;
                this.aggregationFunction();
                }
                }
                this.state = 187;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 190;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 188;
                this.match(QQLParser.BY);
                this.state = 189;
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
        this.enterRule(localContext, 24, QQLParser.RULE_aggregationFunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 192;
            this.identifierOrString();
            this.state = 198;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 27) {
                {
                this.state = 193;
                this.match(QQLParser.LPAREN);
                this.state = 195;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 47)) & ~0x1F) === 0 && ((1 << (_la - 47)) & 19) !== 0)) {
                    {
                    this.state = 194;
                    this.identifierOrString();
                    }
                }

                this.state = 197;
                this.match(QQLParser.RPAREN);
                }
            }

            this.state = 202;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9) {
                {
                this.state = 200;
                this.match(QQLParser.AS);
                this.state = 201;
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
        this.enterRule(localContext, 26, QQLParser.RULE_groupby);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 204;
            this.identifierOrString();
            this.state = 211;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & 39845889) !== 0)) {
                {
                {
                this.state = 206;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 26) {
                    {
                    this.state = 205;
                    this.match(QQLParser.COMMA);
                    }
                }

                this.state = 208;
                this.identifierOrString();
                }
                }
                this.state = 213;
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
        this.enterRule(localContext, 28, QQLParser.RULE_whereCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 214;
            this.match(QQLParser.WHERE);
            this.state = 215;
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
        this.enterRule(localContext, 30, QQLParser.RULE_sortCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 217;
            this.match(QQLParser.SORT);
            this.state = 218;
            this.sortColumn();
            this.state = 225;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & 39845889) !== 0)) {
                {
                {
                this.state = 220;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 26) {
                    {
                    this.state = 219;
                    this.match(QQLParser.COMMA);
                    }
                }

                this.state = 222;
                this.sortColumn();
                }
                }
                this.state = 227;
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
        this.enterRule(localContext, 32, QQLParser.RULE_sortColumn);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 228;
            this.identifierOrString();
            this.state = 230;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 15 || _la === 16) {
                {
                this.state = 229;
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
        this.enterRule(localContext, 34, QQLParser.RULE_evalCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 232;
            this.match(QQLParser.EVAL);
            this.state = 233;
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
        this.enterRule(localContext, 36, QQLParser.RULE_evalExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 235;
            this.identifierOrString();
            this.state = 236;
            this.match(QQLParser.EQUAL);
            this.state = 237;
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
        this.enterRule(localContext, 38, QQLParser.RULE_regexCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 239;
            this.match(QQLParser.REGEX);
            this.state = 240;
            this.match(QQLParser.FIELD);
            this.state = 241;
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
        this.enterRule(localContext, 40, QQLParser.RULE_timechartCmd);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 243;
            this.match(QQLParser.TIMECHART);
            this.state = 244;
            this.aggregationFunction();
            this.state = 251;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & 39845889) !== 0)) {
                {
                {
                this.state = 246;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 26) {
                    {
                    this.state = 245;
                    this.match(QQLParser.COMMA);
                    }
                }

                this.state = 248;
                this.aggregationFunction();
                }
                }
                this.state = 253;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 257;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14336) !== 0)) {
                {
                {
                this.state = 254;
                this.timechartParams();
                }
                }
                this.state = 259;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 262;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 260;
                this.match(QQLParser.BY);
                this.state = 261;
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
        this.enterRule(localContext, 42, QQLParser.RULE_timechartParams);
        try {
            this.state = 270;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.SPAN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 264;
                this.match(QQLParser.SPAN);
                this.state = 265;
                this.identifierOrString();
                }
                break;
            case QQLParser.TIMECOL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 266;
                this.match(QQLParser.TIMECOL);
                this.state = 267;
                this.identifierOrString();
                }
                break;
            case QQLParser.MAXGROUPS:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 268;
                this.match(QQLParser.MAXGROUPS);
                this.state = 269;
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
        this.enterRule(localContext, 44, QQLParser.RULE_unpackCmd);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 272;
            this.match(QQLParser.UNPACK);
            this.state = 273;
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
        this.enterRule(localContext, 46, QQLParser.RULE_logicalExpression);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 275;
            this.unitExpression();
            this.state = 279;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 31, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 276;
                    this.logicalTail();
                    }
                    }
                }
                this.state = 281;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 31, this.context);
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
        this.enterRule(localContext, 48, QQLParser.RULE_logicalTail);
        try {
            this.state = 286;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.AND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 282;
                this.match(QQLParser.AND);
                this.state = 283;
                this.logicalExpression();
                }
                break;
            case QQLParser.OR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 284;
                this.match(QQLParser.OR);
                this.state = 285;
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
        this.enterRule(localContext, 50, QQLParser.RULE_unitExpression);
        try {
            this.state = 298;
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
                this.state = 292;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 33, this.context) ) {
                case 1:
                    {
                    this.state = 288;
                    this.inArrayExpression();
                    }
                    break;
                case 2:
                    {
                    this.state = 289;
                    this.comparisonExpression();
                    }
                    break;
                case 3:
                    {
                    this.state = 290;
                    this.notExpression();
                    }
                    break;
                case 4:
                    {
                    this.state = 291;
                    this.functionExpression();
                    }
                    break;
                }
                }
                break;
            case QQLParser.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 294;
                this.match(QQLParser.LPAREN);
                this.state = 295;
                this.logicalExpression();
                this.state = 296;
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
        this.enterRule(localContext, 52, QQLParser.RULE_notExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 300;
            this.match(QQLParser.NOT);
            this.state = 301;
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
        this.enterRule(localContext, 54, QQLParser.RULE_inArrayExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 303;
            this.factor();
            this.state = 304;
            this.match(QQLParser.IN);
            this.state = 305;
            this.match(QQLParser.LBRACKET);
            this.state = 306;
            this.factor();
            this.state = 311;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 307;
                this.match(QQLParser.COMMA);
                this.state = 308;
                this.factor();
                }
                }
                this.state = 313;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 314;
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
        this.enterRule(localContext, 56, QQLParser.RULE_comparisonExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 316;
            this.factor();
            this.state = 317;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 63) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 318;
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
        this.enterRule(localContext, 58, QQLParser.RULE_functionExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 320;
            this.match(QQLParser.IDENTIFIER);
            this.state = 321;
            this.match(QQLParser.LPAREN);
            this.state = 323;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 135004160) !== 0) || ((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & 3969) !== 0)) {
                {
                this.state = 322;
                this.functionArgs();
                }
            }

            this.state = 325;
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
        this.enterRule(localContext, 60, QQLParser.RULE_functionArgs);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 327;
            this.functionArg();
            this.state = 332;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 328;
                this.match(QQLParser.COMMA);
                this.state = 329;
                this.functionArg();
                }
                }
                this.state = 334;
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
        this.enterRule(localContext, 62, QQLParser.RULE_functionArg);
        try {
            this.state = 339;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 38, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 335;
                this.factor();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 336;
                this.regexLiteral();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 337;
                this.logicalExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 338;
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
        this.enterRule(localContext, 64, QQLParser.RULE_evalFunctionArg);
        try {
            this.state = 345;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 341;
                this.evalFunction();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 342;
                this.functionExpression();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 343;
                this.logicalExpression();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 344;
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
        this.enterRule(localContext, 66, QQLParser.RULE_evalFunction);
        let _la: number;
        try {
            this.state = 367;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.IF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 347;
                this.match(QQLParser.IF);
                this.state = 348;
                this.match(QQLParser.LPAREN);
                this.state = 349;
                this.logicalExpression();
                this.state = 350;
                this.match(QQLParser.COMMA);
                this.state = 351;
                this.evalFunctionArg();
                this.state = 354;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 26) {
                    {
                    this.state = 352;
                    this.match(QQLParser.COMMA);
                    this.state = 353;
                    this.evalFunctionArg();
                    }
                }

                this.state = 356;
                this.match(QQLParser.RPAREN);
                }
                break;
            case QQLParser.CASE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 358;
                this.match(QQLParser.CASE);
                this.state = 359;
                this.match(QQLParser.LPAREN);
                this.state = 360;
                this.caseThen();
                this.state = 363;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 26) {
                    {
                    this.state = 361;
                    this.match(QQLParser.COMMA);
                    this.state = 362;
                    this.evalFunctionArg();
                    }
                }

                this.state = 365;
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
    public caseThen(): CaseThenContext {
        let localContext = new CaseThenContext(this.context, this.state);
        this.enterRule(localContext, 68, QQLParser.RULE_caseThen);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 369;
            this.logicalExpression();
            this.state = 370;
            this.match(QQLParser.COMMA);
            this.state = 371;
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
        this.enterRule(localContext, 70, QQLParser.RULE_calcExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 373;
            this.calcTerm();
            this.state = 377;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 41 || _la === 42) {
                {
                {
                this.state = 374;
                this.calcAction();
                }
                }
                this.state = 379;
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
        this.enterRule(localContext, 72, QQLParser.RULE_calcAction);
        try {
            this.state = 384;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.PLUS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 380;
                this.match(QQLParser.PLUS);
                this.state = 381;
                this.calcTerm();
                }
                break;
            case QQLParser.MINUS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 382;
                this.match(QQLParser.MINUS);
                this.state = 383;
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
        this.enterRule(localContext, 74, QQLParser.RULE_calcTerm);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 386;
            this.calculateUnit();
            this.state = 390;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 43 || _la === 44) {
                {
                {
                this.state = 387;
                this.calcTermAction();
                }
                }
                this.state = 392;
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
        this.enterRule(localContext, 76, QQLParser.RULE_calcTermAction);
        try {
            this.state = 397;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.MULTIPLY:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 393;
                this.match(QQLParser.MULTIPLY);
                this.state = 394;
                this.calculateUnit();
                }
                break;
            case QQLParser.DIVIDE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 395;
                this.match(QQLParser.DIVIDE);
                this.state = 396;
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
        this.enterRule(localContext, 78, QQLParser.RULE_calculateUnit);
        try {
            this.state = 404;
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
                this.state = 399;
                this.factor();
                }
                break;
            case QQLParser.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 400;
                this.match(QQLParser.LPAREN);
                this.state = 401;
                this.calcExpression();
                this.state = 402;
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
        this.enterRule(localContext, 80, QQLParser.RULE_factor);
        try {
            this.state = 410;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QQLParser.DQUOT_STRING:
            case QQLParser.SQUOT_STRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 406;
                this.literalString();
                }
                break;
            case QQLParser.INTEGER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 407;
                this.match(QQLParser.INTEGER);
                }
                break;
            case QQLParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 408;
                this.match(QQLParser.IDENTIFIER);
                }
                break;
            case QQLParser.TRUE:
            case QQLParser.FALSE:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 409;
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
        this.enterRule(localContext, 82, QQLParser.RULE_literalBoolean);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 412;
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
        this.enterRule(localContext, 84, QQLParser.RULE_literalString);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 414;
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
        this.enterRule(localContext, 86, QQLParser.RULE_regexLiteral);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 416;
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
    public identifierOrString(): IdentifierOrStringContext {
        let localContext = new IdentifierOrStringContext(this.context, this.state);
        this.enterRule(localContext, 88, QQLParser.RULE_identifierOrString);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 418;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 47)) & ~0x1F) === 0 && ((1 << (_la - 47)) & 19) !== 0))) {
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
        4,1,53,421,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
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
        1,7,4,7,147,8,7,11,7,12,7,148,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,
        8,3,8,160,8,8,1,9,1,9,1,9,3,9,165,8,9,1,9,5,9,168,8,9,10,9,12,9,
        171,9,9,1,10,1,10,1,10,3,10,176,8,10,1,11,1,11,1,11,3,11,181,8,11,
        1,11,5,11,184,8,11,10,11,12,11,187,9,11,1,11,1,11,3,11,191,8,11,
        1,12,1,12,1,12,3,12,196,8,12,1,12,3,12,199,8,12,1,12,1,12,3,12,203,
        8,12,1,13,1,13,3,13,207,8,13,1,13,5,13,210,8,13,10,13,12,13,213,
        9,13,1,14,1,14,1,14,1,15,1,15,1,15,3,15,221,8,15,1,15,5,15,224,8,
        15,10,15,12,15,227,9,15,1,16,1,16,3,16,231,8,16,1,17,1,17,1,17,1,
        18,1,18,1,18,1,18,1,19,1,19,1,19,1,19,1,20,1,20,1,20,3,20,247,8,
        20,1,20,5,20,250,8,20,10,20,12,20,253,9,20,1,20,5,20,256,8,20,10,
        20,12,20,259,9,20,1,20,1,20,3,20,263,8,20,1,21,1,21,1,21,1,21,1,
        21,1,21,3,21,271,8,21,1,22,1,22,1,22,1,23,1,23,5,23,278,8,23,10,
        23,12,23,281,9,23,1,24,1,24,1,24,1,24,3,24,287,8,24,1,25,1,25,1,
        25,1,25,3,25,293,8,25,1,25,1,25,1,25,1,25,3,25,299,8,25,1,26,1,26,
        1,26,1,27,1,27,1,27,1,27,1,27,1,27,5,27,310,8,27,10,27,12,27,313,
        9,27,1,27,1,27,1,28,1,28,1,28,1,28,1,29,1,29,1,29,3,29,324,8,29,
        1,29,1,29,1,30,1,30,1,30,5,30,331,8,30,10,30,12,30,334,9,30,1,31,
        1,31,1,31,1,31,3,31,340,8,31,1,32,1,32,1,32,1,32,3,32,346,8,32,1,
        33,1,33,1,33,1,33,1,33,1,33,1,33,3,33,355,8,33,1,33,1,33,1,33,1,
        33,1,33,1,33,1,33,3,33,364,8,33,1,33,1,33,3,33,368,8,33,1,34,1,34,
        1,34,1,34,1,35,1,35,5,35,376,8,35,10,35,12,35,379,9,35,1,36,1,36,
        1,36,1,36,3,36,385,8,36,1,37,1,37,5,37,389,8,37,10,37,12,37,392,
        9,37,1,38,1,38,1,38,1,38,3,38,398,8,38,1,39,1,39,1,39,1,39,1,39,
        3,39,405,8,39,1,40,1,40,1,40,1,40,3,40,411,8,40,1,41,1,41,1,42,1,
        42,1,43,1,43,1,44,1,44,1,44,0,0,45,0,2,4,6,8,10,12,14,16,18,20,22,
        24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,
        68,70,72,74,76,78,80,82,84,86,88,0,6,2,0,31,31,33,33,1,0,15,16,1,
        0,32,37,1,0,18,19,1,0,47,48,2,0,47,48,51,51,440,0,93,1,0,0,0,2,113,
        1,0,0,0,4,115,1,0,0,0,6,121,1,0,0,0,8,129,1,0,0,0,10,136,1,0,0,0,
        12,138,1,0,0,0,14,146,1,0,0,0,16,150,1,0,0,0,18,161,1,0,0,0,20,172,
        1,0,0,0,22,177,1,0,0,0,24,192,1,0,0,0,26,204,1,0,0,0,28,214,1,0,
        0,0,30,217,1,0,0,0,32,228,1,0,0,0,34,232,1,0,0,0,36,235,1,0,0,0,
        38,239,1,0,0,0,40,243,1,0,0,0,42,270,1,0,0,0,44,272,1,0,0,0,46,275,
        1,0,0,0,48,286,1,0,0,0,50,298,1,0,0,0,52,300,1,0,0,0,54,303,1,0,
        0,0,56,316,1,0,0,0,58,320,1,0,0,0,60,327,1,0,0,0,62,339,1,0,0,0,
        64,345,1,0,0,0,66,367,1,0,0,0,68,369,1,0,0,0,70,373,1,0,0,0,72,384,
        1,0,0,0,74,386,1,0,0,0,76,397,1,0,0,0,78,404,1,0,0,0,80,410,1,0,
        0,0,82,412,1,0,0,0,84,414,1,0,0,0,86,416,1,0,0,0,88,418,1,0,0,0,
        90,92,3,2,1,0,91,90,1,0,0,0,92,95,1,0,0,0,93,91,1,0,0,0,93,94,1,
        0,0,0,94,99,1,0,0,0,95,93,1,0,0,0,96,98,3,4,2,0,97,96,1,0,0,0,98,
        101,1,0,0,0,99,97,1,0,0,0,99,100,1,0,0,0,100,103,1,0,0,0,101,99,
        1,0,0,0,102,104,3,6,3,0,103,102,1,0,0,0,103,104,1,0,0,0,104,108,
        1,0,0,0,105,107,3,16,8,0,106,105,1,0,0,0,107,110,1,0,0,0,108,106,
        1,0,0,0,108,109,1,0,0,0,109,111,1,0,0,0,110,108,1,0,0,0,111,112,
        5,0,0,1,112,1,1,0,0,0,113,114,5,46,0,0,114,3,1,0,0,0,115,116,5,51,
        0,0,116,119,7,0,0,0,117,120,3,84,42,0,118,120,3,86,43,0,119,117,
        1,0,0,0,119,118,1,0,0,0,120,5,1,0,0,0,121,123,3,10,5,0,122,124,3,
        8,4,0,123,122,1,0,0,0,123,124,1,0,0,0,124,7,1,0,0,0,125,126,5,23,
        0,0,126,130,3,6,3,0,127,128,5,24,0,0,128,130,3,6,3,0,129,125,1,0,
        0,0,129,127,1,0,0,0,130,9,1,0,0,0,131,132,5,27,0,0,132,133,3,6,3,
        0,133,134,5,28,0,0,134,137,1,0,0,0,135,137,3,12,6,0,136,131,1,0,
        0,0,136,135,1,0,0,0,137,11,1,0,0,0,138,141,3,14,7,0,139,140,5,33,
        0,0,140,142,3,14,7,0,141,139,1,0,0,0,141,142,1,0,0,0,142,13,1,0,
        0,0,143,147,5,51,0,0,144,147,5,50,0,0,145,147,3,84,42,0,146,143,
        1,0,0,0,146,144,1,0,0,0,146,145,1,0,0,0,147,148,1,0,0,0,148,146,
        1,0,0,0,148,149,1,0,0,0,149,15,1,0,0,0,150,159,5,25,0,0,151,160,
        3,18,9,0,152,160,3,22,11,0,153,160,3,28,14,0,154,160,3,30,15,0,155,
        160,3,34,17,0,156,160,3,38,19,0,157,160,3,40,20,0,158,160,3,44,22,
        0,159,151,1,0,0,0,159,152,1,0,0,0,159,153,1,0,0,0,159,154,1,0,0,
        0,159,155,1,0,0,0,159,156,1,0,0,0,159,157,1,0,0,0,159,158,1,0,0,
        0,160,17,1,0,0,0,161,162,5,1,0,0,162,169,3,20,10,0,163,165,5,26,
        0,0,164,163,1,0,0,0,164,165,1,0,0,0,165,166,1,0,0,0,166,168,3,20,
        10,0,167,164,1,0,0,0,168,171,1,0,0,0,169,167,1,0,0,0,169,170,1,0,
        0,0,170,19,1,0,0,0,171,169,1,0,0,0,172,175,3,88,44,0,173,174,5,9,
        0,0,174,176,3,88,44,0,175,173,1,0,0,0,175,176,1,0,0,0,176,21,1,0,
        0,0,177,178,5,2,0,0,178,185,3,24,12,0,179,181,5,26,0,0,180,179,1,
        0,0,0,180,181,1,0,0,0,181,182,1,0,0,0,182,184,3,24,12,0,183,180,
        1,0,0,0,184,187,1,0,0,0,185,183,1,0,0,0,185,186,1,0,0,0,186,190,
        1,0,0,0,187,185,1,0,0,0,188,189,5,10,0,0,189,191,3,26,13,0,190,188,
        1,0,0,0,190,191,1,0,0,0,191,23,1,0,0,0,192,198,3,88,44,0,193,195,
        5,27,0,0,194,196,3,88,44,0,195,194,1,0,0,0,195,196,1,0,0,0,196,197,
        1,0,0,0,197,199,5,28,0,0,198,193,1,0,0,0,198,199,1,0,0,0,199,202,
        1,0,0,0,200,201,5,9,0,0,201,203,3,88,44,0,202,200,1,0,0,0,202,203,
        1,0,0,0,203,25,1,0,0,0,204,211,3,88,44,0,205,207,5,26,0,0,206,205,
        1,0,0,0,206,207,1,0,0,0,207,208,1,0,0,0,208,210,3,88,44,0,209,206,
        1,0,0,0,210,213,1,0,0,0,211,209,1,0,0,0,211,212,1,0,0,0,212,27,1,
        0,0,0,213,211,1,0,0,0,214,215,5,3,0,0,215,216,3,46,23,0,216,29,1,
        0,0,0,217,218,5,4,0,0,218,225,3,32,16,0,219,221,5,26,0,0,220,219,
        1,0,0,0,220,221,1,0,0,0,221,222,1,0,0,0,222,224,3,32,16,0,223,220,
        1,0,0,0,224,227,1,0,0,0,225,223,1,0,0,0,225,226,1,0,0,0,226,31,1,
        0,0,0,227,225,1,0,0,0,228,230,3,88,44,0,229,231,7,1,0,0,230,229,
        1,0,0,0,230,231,1,0,0,0,231,33,1,0,0,0,232,233,5,5,0,0,233,234,3,
        36,18,0,234,35,1,0,0,0,235,236,3,88,44,0,236,237,5,31,0,0,237,238,
        3,64,32,0,238,37,1,0,0,0,239,240,5,6,0,0,240,241,5,14,0,0,241,242,
        3,86,43,0,242,39,1,0,0,0,243,244,5,7,0,0,244,251,3,24,12,0,245,247,
        5,26,0,0,246,245,1,0,0,0,246,247,1,0,0,0,247,248,1,0,0,0,248,250,
        3,24,12,0,249,246,1,0,0,0,250,253,1,0,0,0,251,249,1,0,0,0,251,252,
        1,0,0,0,252,257,1,0,0,0,253,251,1,0,0,0,254,256,3,42,21,0,255,254,
        1,0,0,0,256,259,1,0,0,0,257,255,1,0,0,0,257,258,1,0,0,0,258,262,
        1,0,0,0,259,257,1,0,0,0,260,261,5,10,0,0,261,263,3,26,13,0,262,260,
        1,0,0,0,262,263,1,0,0,0,263,41,1,0,0,0,264,265,5,11,0,0,265,271,
        3,88,44,0,266,267,5,12,0,0,267,271,3,88,44,0,268,269,5,13,0,0,269,
        271,5,50,0,0,270,264,1,0,0,0,270,266,1,0,0,0,270,268,1,0,0,0,271,
        43,1,0,0,0,272,273,5,8,0,0,273,274,3,88,44,0,274,45,1,0,0,0,275,
        279,3,50,25,0,276,278,3,48,24,0,277,276,1,0,0,0,278,281,1,0,0,0,
        279,277,1,0,0,0,279,280,1,0,0,0,280,47,1,0,0,0,281,279,1,0,0,0,282,
        283,5,38,0,0,283,287,3,46,23,0,284,285,5,39,0,0,285,287,3,46,23,
        0,286,282,1,0,0,0,286,284,1,0,0,0,287,49,1,0,0,0,288,293,3,54,27,
        0,289,293,3,56,28,0,290,293,3,52,26,0,291,293,3,58,29,0,292,288,
        1,0,0,0,292,289,1,0,0,0,292,290,1,0,0,0,292,291,1,0,0,0,293,299,
        1,0,0,0,294,295,5,27,0,0,295,296,3,46,23,0,296,297,5,28,0,0,297,
        299,1,0,0,0,298,292,1,0,0,0,298,294,1,0,0,0,299,51,1,0,0,0,300,301,
        5,40,0,0,301,302,3,50,25,0,302,53,1,0,0,0,303,304,3,80,40,0,304,
        305,5,17,0,0,305,306,5,29,0,0,306,311,3,80,40,0,307,308,5,26,0,0,
        308,310,3,80,40,0,309,307,1,0,0,0,310,313,1,0,0,0,311,309,1,0,0,
        0,311,312,1,0,0,0,312,314,1,0,0,0,313,311,1,0,0,0,314,315,5,30,0,
        0,315,55,1,0,0,0,316,317,3,80,40,0,317,318,7,2,0,0,318,319,3,80,
        40,0,319,57,1,0,0,0,320,321,5,51,0,0,321,323,5,27,0,0,322,324,3,
        60,30,0,323,322,1,0,0,0,323,324,1,0,0,0,324,325,1,0,0,0,325,326,
        5,28,0,0,326,59,1,0,0,0,327,332,3,62,31,0,328,329,5,26,0,0,329,331,
        3,62,31,0,330,328,1,0,0,0,331,334,1,0,0,0,332,330,1,0,0,0,332,333,
        1,0,0,0,333,61,1,0,0,0,334,332,1,0,0,0,335,340,3,80,40,0,336,340,
        3,86,43,0,337,340,3,46,23,0,338,340,3,58,29,0,339,335,1,0,0,0,339,
        336,1,0,0,0,339,337,1,0,0,0,339,338,1,0,0,0,340,63,1,0,0,0,341,346,
        3,66,33,0,342,346,3,58,29,0,343,346,3,46,23,0,344,346,3,70,35,0,
        345,341,1,0,0,0,345,342,1,0,0,0,345,343,1,0,0,0,345,344,1,0,0,0,
        346,65,1,0,0,0,347,348,5,20,0,0,348,349,5,27,0,0,349,350,3,46,23,
        0,350,351,5,26,0,0,351,354,3,64,32,0,352,353,5,26,0,0,353,355,3,
        64,32,0,354,352,1,0,0,0,354,355,1,0,0,0,355,356,1,0,0,0,356,357,
        5,28,0,0,357,368,1,0,0,0,358,359,5,21,0,0,359,360,5,27,0,0,360,363,
        3,68,34,0,361,362,5,26,0,0,362,364,3,64,32,0,363,361,1,0,0,0,363,
        364,1,0,0,0,364,365,1,0,0,0,365,366,5,28,0,0,366,368,1,0,0,0,367,
        347,1,0,0,0,367,358,1,0,0,0,368,67,1,0,0,0,369,370,3,46,23,0,370,
        371,5,26,0,0,371,372,3,64,32,0,372,69,1,0,0,0,373,377,3,74,37,0,
        374,376,3,72,36,0,375,374,1,0,0,0,376,379,1,0,0,0,377,375,1,0,0,
        0,377,378,1,0,0,0,378,71,1,0,0,0,379,377,1,0,0,0,380,381,5,41,0,
        0,381,385,3,74,37,0,382,383,5,42,0,0,383,385,3,74,37,0,384,380,1,
        0,0,0,384,382,1,0,0,0,385,73,1,0,0,0,386,390,3,78,39,0,387,389,3,
        76,38,0,388,387,1,0,0,0,389,392,1,0,0,0,390,388,1,0,0,0,390,391,
        1,0,0,0,391,75,1,0,0,0,392,390,1,0,0,0,393,394,5,43,0,0,394,398,
        3,78,39,0,395,396,5,44,0,0,396,398,3,78,39,0,397,393,1,0,0,0,397,
        395,1,0,0,0,398,77,1,0,0,0,399,405,3,80,40,0,400,401,5,27,0,0,401,
        402,3,70,35,0,402,403,5,28,0,0,403,405,1,0,0,0,404,399,1,0,0,0,404,
        400,1,0,0,0,405,79,1,0,0,0,406,411,3,84,42,0,407,411,5,50,0,0,408,
        411,5,51,0,0,409,411,3,82,41,0,410,406,1,0,0,0,410,407,1,0,0,0,410,
        408,1,0,0,0,410,409,1,0,0,0,411,81,1,0,0,0,412,413,7,3,0,0,413,83,
        1,0,0,0,414,415,7,4,0,0,415,85,1,0,0,0,416,417,5,49,0,0,417,87,1,
        0,0,0,418,419,7,5,0,0,419,89,1,0,0,0,49,93,99,103,108,119,123,129,
        136,141,146,148,159,164,169,175,180,185,190,195,198,202,206,211,
        220,225,230,246,251,257,262,270,279,286,292,298,311,323,332,339,
        345,354,363,367,377,384,390,397,404,410
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
    public EOF(): antlr.TerminalNode {
        return this.getToken(QQLParser.EOF, 0)!;
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
    public EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.EQUAL, 0);
    }
    public NOT_EQUAL(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.NOT_EQUAL, 0);
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
    public searchTerm(): SearchTermContext {
        return this.getRuleContext(0, SearchTermContext)!;
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


export class SearchTermContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.LPAREN, 0);
    }
    public search(): SearchContext | null {
        return this.getRuleContext(0, SearchContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QQLParser.RPAREN, 0);
    }
    public searchFactor(): SearchFactorContext | null {
        return this.getRuleContext(0, SearchFactorContext);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_searchTerm;
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
        return this.getToken(QQLParser.NOT_EQUAL, 0);
    }
    public override get ruleIndex(): number {
        return QQLParser.RULE_searchFactor;
    }
    public override accept<Result>(visitor: QQLVisitor<Result>): Result | null {
        if (visitor.visitSearchFacto