import { EmbeddedActionsParser, IToken, tokenMatcher, TokenType } from "chevrotain";
import {
  allTokens,
  And,
  As,
  Asc,
  AtDatasource,
  By,
  Case,
  CloseBrackets,
  Comma,
  Desc,
  Divide,
  DoubleQuotedString,
  Equal,
  Eval,
  False,
  GreaterThan,
  GreaterThanEqual,
  Identifier,
  If,
  In,
  Integer,
  IsEqual,
  LeftSquareBracket,
  LessThan,
  LessThanEqual,
  MaxGroups,
  Minus,
  Multiply,
  Not,
  NotEqual,
  OpenBrackets,
  Or,
  Pipe,
  Plus,
  Regex,
  RegexParamField,
  RegexPattern,
  RightSquareBracket,
  SearchAND as SearchANDToken,
  SearchOR as SearchORToken,
  SearchParamNotEqual,
  SingleQuotedString,
  Sort,
  Span,
  Stats,
  Table,
  TimeChart,
  TimeColumn,
  True,
  Unpack,
  Where,
} from "./tokens";
import type {
  AggregationFunction,
  AndExpression,
  CalcAction,
  CalcExpression,
  CalcTerm,
  CalcTermAction,
  CalculateUnit,
  ColumnRef,
  ComparisonExpression,
  ControllerIndexParam,
  Datasource,
  EvalCaseFunction,
  EvalCaseThen,
  EvalFunction,
  EvalFunctionArg,
  EvalIfFunction,
  FactorType,
  FunctionArg,
  FunctionExpression,
  HighlightData,
  InArrayExpression,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  LogicalExpression,
  NotExpression,
  Order,
  OrExpression,
  RegexLiteral,
  Search,
  SearchAND,
  SearchLiteral,
  SearchOR,
  SuggestionData,
  SuggetionType,
  TableColumn,
  UnitExpression,
} from "./types";
import {
  isNumeric,
  parseDoubleQuotedString,
  parseSingleQuotedString,
  unquoteBacktick,
} from "./helpers";

export class QQLParser extends EmbeddedActionsParser {
  private highlightData: HighlightData[] = [];
  private suggestionData: SuggestionData[] = [];

  constructor() {
    super(allTokens, {
      recoveryEnabled: false,
    });
    this.performSelfAnalysis();
  }

  private getNextPos(): number {
    const token = this.LA(1);
    return token.endOffset ?? token.startOffset ?? 0;
  }

  private addAutoCompleteType(
    suggestionType: SuggetionType,
    opts: { spacing?: number; disabled?: boolean } = {},
  ) {
    let obj: SuggestionData | undefined = undefined;
    this.ACTION(() => {
      const startPos =
        (this.LA(0).endColumn ?? this.LA(0).startColumn ?? 0) +
        (opts.spacing ?? 0);
      obj = {
        ...suggestionType,
        fromPosition: startPos,
        disabled: opts.disabled ?? false,
      };

      this.suggestionData.push(obj);
    });

    return {
      obj: obj,
      disable: () => {
        this.ACTION(() => {
          if (!obj) {
            return;
          }

          obj.disabled = true;
        });
      },
      resetStart: () => {
        this.ACTION(() => {
          if (!obj) {
            return;
          }

          obj.fromPosition =
            (this.LA(0).endColumn ?? this.LA(0).startColumn ?? 0) +
            (opts.spacing ?? 0);
          obj.disabled = false;
        });
      },
      closeAfter1: () => {
        this.ACTION(() => {
          if (!obj) {
            return;
          }
          obj.toPosition = this.getNextPos() + 1;
        });
      },
      closePreviousEnd: () => {
        this.ACTION(() => {
          if (!obj) {
            return;
          }
          obj.toPosition = this.LA(0).endOffset;
        });
      },
      close: () => {
        this.ACTION(() => {
          if (!obj) {
            return;
          }

          obj.toPosition = this.LA(1).startOffset;
        });
      },
      remove: () => {
        this.ACTION(() => {
          if (!obj) {
            return;
          }

          const idx = this.suggestionData.indexOf(obj);
          if (idx !== -1) {
            this.suggestionData.splice(idx, 1);
          }
        });
      },
    };
  }

  private addHighlightData(type: string, token: IToken) {
    this.highlightData.push({
      type: type,
      token: {
        startOffset: token.startOffset,
        endOffset: token.endOffset,
      },
    });
  }

  private consumeAndHighlight(tokenType: TokenType, highlightType: string): IToken {
    const token = this.CONSUME(tokenType);
    this.ACTION(() => this.addHighlightData(highlightType, token));
    return token;
  }

  public reset() {
    this.highlightData = [];
    this.suggestionData = [];
  }

  public getSuggestionData() {
    return this.suggestionData.filter((s) => !s.disabled);
  }

  public getHighlightData() {
    return this.highlightData;
  }

  public highlightComment = (token: IToken) => {
    this.addHighlightData("comment", token);
  };

  public query = this.RULE("query", () => {
    const controllerParams: ControllerIndexParam[] = [];

    const dataSources: Datasource[] = [];

    let datasourcesAutoComplete = this.addAutoCompleteType({
      type: "datasource",
    });
    datasourcesAutoComplete.closeAfter1();

    this.MANY1(() => {
      const datasource = this.SUBRULE(this.datasource);

      datasourcesAutoComplete = this.addAutoCompleteType({
        type: "datasource",
      });

      datasourcesAutoComplete.closeAfter1();

      dataSources.push(datasource);
    });

    datasourcesAutoComplete.close();

    let controllerParamsAutoComplete = this.addAutoCompleteType({
      type: "controllerParam",
    });

    controllerParamsAutoComplete.closeAfter1();

    this.MANY2(() => {
      const controllerParam = this.SUBRULE(this.controllerParam);

      controllerParamsAutoComplete = this.addAutoCompleteType({
        type: "controllerParam",
      });

      controllerParamsAutoComplete.closeAfter1();

      controllerParams.push(controllerParam);
    });

    controllerParamsAutoComplete.close();

    const search = this.SUBRULE(this.search, { ARGS: [false] });
    const restOfpipeline: ReturnType<typeof this.pipelineCommand>[] = [];

    this.MANY3(() => {
      this.CONSUME(Pipe);
      const pipelineItem = this.SUBRULE(this.pipelineCommand);
      restOfpipeline.push(pipelineItem);
    });

    return {
      type: "query",
      dataSources: dataSources,
      controllerParams: controllerParams,
      search: search,
      pipeline: restOfpipeline,
    } as const;
  });

  private addBooleanContextSemantics() {
    this.addAutoCompleteType({
      type: "column",
    }).closeAfter1();
    this.addAutoCompleteType({
      type: "booleanFunction",
    }).closeAfter1();
  }

  private pipelineCommand = this.RULE("pipelineCommand", () => {
    this.addAutoCompleteType({
      type: "keywords",
      keywords: [
        "table",
        "stats",
        "regex",
        "sort",
        "where",
        "timechart",
        "eval",
        "unpack",
      ],
    }).closeAfter1();

    const resp = this.OR<
      | ReturnType<typeof this.table>
      | ReturnType<typeof this.statsCommand>
      | ReturnType<typeof this.regex>
      | ReturnType<typeof this.unpack>
      | ReturnType<typeof this.sort>
      | ReturnType<typeof this.where>
      | ReturnType<typeof this.timeChart>
      | ReturnType<typeof this.evalCommand>
    >([
      { ALT: () => this.SUBRULE(this.table) },
      { ALT: () => this.SUBRULE(this.statsCommand) },
      { ALT: () => this.SUBRULE(this.regex) },
      { ALT: () => this.SUBRULE(this.unpack) },
      { ALT: () => this.SUBRULE(this.sort) },
      { ALT: () => this.SUBRULE(this.where) },
      { ALT: () => this.SUBRULE(this.timeChart) },
      { ALT: () => this.SUBRULE(this.evalCommand) },
    ]);

    return resp;
  });

  private search = this.RULE("search", (isRequired?: boolean): Search => {
    const parentRule = this.SUBRULE(this.searchFactor, { ARGS: [isRequired] });

    const tail = this.OPTION<SearchOR | SearchAND>(() => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.searchAndStatement) },
        { ALT: () => this.SUBRULE(this.searchOrStatement) },
      ]);
    });

    return {
      type: "search",
      left: parentRule,
      right: tail,
    } as const;
  });

  private timeChart = this.RULE("timeChart", () => {
    this.consumeAndHighlight(TimeChart, "keyword");

    const params = {
      span: undefined as string | undefined,
      timeColumn: undefined as string | undefined,
      maxGroups: undefined as number | undefined,
    };

    const keywordsLeft: Record<string, boolean> = {
      span: true,
      timeCol: true,
      maxGroups: true,
    };

    this.addAutoCompleteType({
      type: "params",
      keywords: Object.keys(keywordsLeft),
    }).closeAfter1();

    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            params.span = this.SUBRULE(this.timechartSpan);
          },
          GATE: () => !params.span,
        },
        {
          ALT: () => {
            params.timeColumn = this.SUBRULE(this.timechartTimeColumn);
          },
          GATE: () => !params.timeColumn,
        },
        {
          GATE: () => !params.maxGroups,
          ALT: () => {
            params.maxGroups = this.SUBRULE(this.timechartMaxGroups);
          },
        },
      ]);

      if (params.span) {
        delete keywordsLeft.span;
      }
      if (params.timeColumn) {
        delete keywordsLeft.timeCol;
      }
      if (params.maxGroups) {
        delete keywordsLeft.maxGroups;
      }

      this.addAutoCompleteType({
        type: "params",
        keywords: Object.keys(keywordsLeft),
      }).closeAfter1();
    });

    return {
      type: "timechart",
      ...this.addAggregationSyntax(),
      params: params,
    } as const;
  });

  private timechartSpan = this.RULE("timechartSpan", () => {
    this.consumeAndHighlight(Span, "param");

    this.CONSUME(Equal);

    const timerange = this.CONSUME(Identifier);
    this.ACTION(() => {
      this.addHighlightData("time", timerange);
    });

    return timerange.image;
  });

  private timechartMaxGroups = this.RULE("timechartMaxGroups", () => {
    this.consumeAndHighlight(MaxGroups, "param");

    this.CONSUME(Equal);

    return this.SUBRULE(this.integer);
  });

  private timechartTimeColumn = this.RULE("timechartTimeColumn", () => {
    this.consumeAndHighlight(TimeColumn, "param");

    this.CONSUME(Equal);

    this.addAutoCompleteType({
      type: "column",
    }).closeAfter1();

    return this.SUBRULE(this.columnName);
  });

  private evalCommand = this.RULE("evalCommand", () => {
    this.consumeAndHighlight(Eval, "keyword");

    const variableName = this.SUBRULE1(this.columnName);
    this.CONSUME(Equal);

    const expression = this.SUBRULE2(this.evalFunctionArg);

    return {
      type: "eval",
      variableName: variableName,
      expression: expression,
    } as const;
  });

  private evalFunction = this.RULE("evalFunction", (): EvalFunction => {
    return this.OR<EvalFunction>([
      { ALT: () => this.SUBRULE(this.evalCaseFunction) },
      { ALT: () => this.SUBRULE(this.evalIfFunction) },
    ]);
  });

  private evalIfFunction = this.RULE("evalIfFunction", (): EvalIfFunction => {
    this.consumeAndHighlight(If, "function");

    this.CONSUME(OpenBrackets);

    const condition = this.SUBRULE(this.logicalExpression);
    this.CONSUME1(Comma);

    const then = this.SUBRULE1(this.evalFunctionArg);
    this.CONSUME2(Comma);

    const elseCase = this.OPTION(() => {
      return this.SUBRULE2(this.evalFunctionArg);
    });

    this.CONSUME(CloseBrackets);

    return {
      type: "functionExpression",
      functionName: "if",
      condition: condition,
      then: then,
      else: elseCase,
    } as const;
  });

  private evalCaseFunction = this.RULE(
    "evalCaseFunction",
    (): EvalCaseFunction => {
      this.consumeAndHighlight(Case, "function");

      this.CONSUME(OpenBrackets);

      const cases: EvalCaseThen[] = [];
      const firstCase = this.SUBRULE(this.evalCaseStatement);
      cases.push(firstCase);

      this.MANY({
        DEF: () => {
          this.CONSUME1(Comma);
          const caseRule = this.SUBRULE2(this.evalCaseStatement);
          cases.push(caseRule);
        },
      });

      const elseCase = this.OPTION(() => {
        this.CONSUME2(Comma);
        return this.SUBRULE(this.evalFunctionArg);
      });

      this.CONSUME(CloseBrackets);

      return {
        type: "functionExpression",
        functionName: "case",
        cases: cases,
        elseCase: elseCase,
      } as const;
    },
  );

  private evalCaseStatement = this.RULE(
    "evalCaseStatement",
    (): EvalCaseThen => {
      const expression = this.SUBRULE(this.logicalExpression);
      this.CONSUME(Comma);
      const truethy = this.SUBRULE(this.evalFunctionArg);

      return {
        type: "functionExpression",
        functionName: "caseThen",
        expression: expression,
        truethy: truethy,
      };
    },
  );

  private evalFunctionArg = this.RULE(
    "evalFunctionArg",
    (): EvalFunctionArg => {
      return this.OR<EvalFunctionArg>({
        DEF: [
          { ALT: () => this.SUBRULE(this.evalFunction) },
          { ALT: () => this.SUBRULE(this.functionExpression) },
          { ALT: () => this.SUBRULE(this.calcExpression) },
          { ALT: () => this.SUBRULE(this.logicalExpression) },
        ],
        IGNORE_AMBIGUITIES: true,
      });
    },
  );

  private datasource = this.RULE("datasource", (): Datasource => {
    const token = this.consumeAndHighlight(AtDatasource, "datasource");

    // strip @ from the token
    const datasourceName = token.image.substring(1);

    return {
      type: "datasource",
      name: datasourceName,
    } as const;
  });

  private controllerParam = this.RULE(
    "controllerParam",
    (): ControllerIndexParam => {
      const token = this.consumeAndHighlight(Identifier, "param");

      const operator = this.OR<IToken>({
        DEF: [
          { ALT: () => this.CONSUME(SearchParamNotEqual) },
          { ALT: () => this.CONSUME(Equal) },
        ],
      });

      const autoCompleteValue = this.addAutoCompleteType({
        type: "paramValue",
        key: token.image,
      });

      const value = this.OR1<LiteralString | RegexLiteral>({
        DEF: [
          {
            ALT: () => {
              const value = this.SUBRULE(this.doubleQuotedString);
              return {
                type: "string",
                value: value,
              } satisfies LiteralString;
            },
          },
          {
            ALT: () => this.SUBRULE(this.regexLiteral),
          },
        ],
      });

      autoCompleteValue.closePreviousEnd();

      return {
        type: "controllerIndexParam",
        name: token.image,
        value: value,
        operator: operator.image,
      } as const;
    },
  );

  private searchFactor = this.RULE("searchFactor", (isRequired?: boolean) => {
    return this.OR<Search | SearchLiteral>([
      { ALT: () => this.SUBRULE(this.searchParenthesis) },
      { ALT: () => this.SUBRULE(this.searchLiteral, { ARGS: [isRequired] }) },
    ]);
  });

  private searchParenthesis = this.RULE("searchParenthesis", () => {
    this.CONSUME(OpenBrackets);
    const search = this.SUBRULE(this.search);
    this.CONSUME(CloseBrackets);

    return search;
  });

  private searchAndStatement = this.RULE(
    "searchAndStatement",
    (): SearchAND => {
      this.consumeAndHighlight(SearchANDToken, "keyword");

      return {
        type: "and",
        right: this.SUBRULE(this.search),
      };
    },
  );

  private searchOrStatement = this.RULE("searchOrStatement", (): SearchOR => {
    this.consumeAndHighlight(SearchORToken, "keyword");

    return {
      type: "or",
      right: this.SUBRULE(this.search),
    };
  });

  private searchLiteral = this.RULE(
    "searchLiteral",
    (required?: boolean): SearchLiteral => {
      const tokens: (string | number)[] = [];
      const isRequired = required ?? true;

      this.OR({
        DEF: [
          {
            GATE: () => !isRequired,
            ALT: () => {
              this.MANY(() => {
                tokens.push(this.SUBRULE1(this.literalSearchTerm));
              });
            },
          },
          {
            GATE: () => isRequired,
            ALT: () => {
              this.AT_LEAST_ONE(() => {
                tokens.push(this.SUBRULE2(this.literalSearchTerm));
              });
            },
          },
        ],
        ERR_MSG: "at least one search token",
      });

      return {
        type: "searchLiteral",
        tokens: tokens,
      };
    },
  );

  private literalSearchTerm = this.RULE("literalSearchTerm", () => {
    return this.OR<string | number>([
      { ALT: () => this.SUBRULE(this.doubleQuotedString) },
      { ALT: () => this.SUBRULE(this.integer) },
      { ALT: () => this.SUBRULE(this.identifier) },
    ]);
  });

  private where = this.RULE("where", () => {
    this.consumeAndHighlight(Where, "keyword");

    this.addBooleanContextSemantics();

    const expression = this.SUBRULE(this.logicalExpression);

    return {
      type: "where",
      expression: expression,
    } as const;
  });

  private logicalExpression = this.RULE(
    "logicalExpression",
    (): LogicalExpression => {
      const parentRule = this.SUBRULE(this.unitExpression);
      const tail = this.OPTION(() => {
        return this.OR([
          { ALT: () => this.SUBRULE(this.andExpression) },
          { ALT: () => this.SUBRULE(this.orExpression) },
        ]);
      });

      return {
        type: "logicalExpression",
        left: parentRule,
        right: tail,
      };
    },
  );

  private andExpression = this.RULE("andExpression", (): AndExpression => {
    this.consumeAndHighlight(And, "operator");

    this.addBooleanContextSemantics();

    const right = this.SUBRULE2(this.logicalExpression);

    return {
      type: "andExpression",
      right: right,
    } as const;
  });

  private orExpression = this.RULE("orExpression", (): OrExpression => {
    this.consumeAndHighlight(Or, "operator");

    this.addBooleanContextSemantics();

    const right = this.SUBRULE2(this.logicalExpression);

    return {
      type: "orExpression",
      right: right,
    } as const;
  });

  private parenthesisExpression = this.RULE("parenthesisExpression", () => {
    this.CONSUME(OpenBrackets);
    const expression = this.SUBRULE(this.logicalExpression);
    this.CONSUME(CloseBrackets);

    return expression;
  });

  private unitExpression = this.RULE("unitExpression", (): UnitExpression => {
    const result = this.OR<UnitExpression["value"]>({
      DEF: [
        { ALT: () => this.SUBRULE(this.inArrayStatement) },
        { ALT: () => this.SUBRULE(this.comparisonExpression) },
        { ALT: () => this.SUBRULE(this.notExpression) },
        { ALT: () => this.SUBRULE(this.functionExpression) },
        { ALT: () => this.SUBRULE(this.parenthesisExpression) },
      ],
    });

    return {
      type: "unitExpression",
      value: result,
    };
  });

  private notExpression = this.RULE("notExpression", (): NotExpression => {
    this.consumeAndHighlight(Not, "operator");

    const expression = this.SUBRULE(this.unitExpression);

    return {
      type: "notExpression",
      expression: expression,
    } as const;
  });

  private functionExpression = this.RULE(
    "functionExpression",
    (): FunctionExpression => {
      const args: ReturnType<typeof this.functionArgs>[] = [];
      const functionName = this.CONSUME(Identifier);
      this.addHighlightData("function", functionName);
      this.CONSUME(OpenBrackets);

      const columnAutocomplete = this.addAutoCompleteType({
        type: "column",
      });
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          args.push(this.SUBRULE(this.functionArgs));
        },
      });
      this.CONSUME(CloseBrackets);

      columnAutocomplete.close();

      return {
        type: "functionExpression",
        functionName: functionName.image,
        args: args,
      } as const;
    },
  );

  private functionArgs = this.RULE("functionArgs", (): FunctionArg => {
    return this.OR<FunctionArg>({
      DEF: [
        { ALT: () => this.SUBRULE(this.functionExpression) },
        { ALT: () => this.SUBRULE(this.factor) },
        { ALT: () => this.SUBRULE(this.logicalExpression) },
        { ALT: () => this.SUBRULE(this.regexLiteral) },
      ],
      IGNORE_AMBIGUITIES: true,
    });
  });

  private factor = this.RULE("factor", (): FactorType => {
    return this.OR([
      {
        ALT: (): ColumnRef => ({
          type: "columnRef",
          columnName: this.SUBRULE(this.columnName),
        }),
      },
      {
        ALT: (): LiteralNumber => ({
          type: "number",
          value: this.SUBRULE(this.integer),
        }),
      },
      {
        ALT: (): LiteralString => ({
          type: "string",
          value: this.SUBRULE(this.doubleQuotedString),
        }),
      },
      {
        ALT: (): LiteralBoolean => ({
          type: "boolean",
          value: this.SUBRULE(this.booleanLiteral),
        }),
      },
    ]);
  });

  private calcExpression = this.RULE("calcExpression", (): CalcExpression => {
    const left = this.SUBRULE(this.calcTermExpression);
    let tail: CalcAction[] | undefined = undefined;

    this.MANY(() => {
      const operator = this.OR([
        { ALT: () => this.CONSUME(Plus) },
        { ALT: () => this.CONSUME(Minus) },
      ]);

      const right = this.SUBRULE1(this.calcTermExpression);

      if (!tail) {
        tail = [];
      }

      tail.push({
        type: "calcAction",
        operator: operator.image,
        right: right,
      });
    });

    return {
      type: "calcExpression",
      left: left,
      tail: tail,
    } as const;
  });

  private calcTermExpression = this.RULE("calcTermExpression", (): CalcTerm => {
    const left = this.SUBRULE(this.calculateUnit);
    let tail: CalcTermAction[] | undefined = undefined;

    this.MANY(() => {
      const operator = this.OR([
        { ALT: () => this.CONSUME(Multiply) },
        { ALT: () => this.CONSUME(Divide) },
      ]);

      const right = this.SUBRULE1(this.calculateUnit);

      if (!tail) {
        tail = [];
      }

      tail.push({
        type: "calcTermAction",
        operator: operator.image,
        right: right,
      });
    });

    return {
      type: "calcTerm",
      left: left,
      tail: tail,
    };
  });

  private calculateUnit = this.RULE("calculateUnit", (): CalculateUnit => {
    const value = this.OR<CalculateUnit["value"]>([
      { ALT: () => this.SUBRULE(this.parenthesisCalcExpression) },
      { ALT: () => this.SUBRULE(this.factor) },
    ]);

    return {
      type: "calculateUnit",
      value: value,
    } as const;
  });

  private parenthesisCalcExpression = this.RULE(
    "parenthesisCalcExpression",
    (): CalcExpression => {
      this.CONSUME(OpenBrackets);
      const expression = this.SUBRULE(this.calcExpression);
      this.CONSUME(CloseBrackets);

      return expression;
    },
  );

  private inArrayStatement = this.RULE(
    "inArrayStatement",
    (): InArrayExpression => {
      const left = this.SUBRULE1(this.factor);

      this.consumeAndHighlight(In, "keyword");

      this.CONSUME(LeftSquareBracket);

      const values: FactorType[] = [];

      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          const value = this.SUBRULE2(this.factor);
          values.push(value);
        },
      });

      this.CONSUME(RightSquareBracket);

      return {
        type: "inArrayExpression",
        left: left,
        right: values,
      } as const;
    },
  );

  private comparisonExpression = this.RULE(
    "comparisonExpression",
    (): ComparisonExpression => {
      const left = this.SUBRULE(this.factor);

      const operator = this.OR2([
        { ALT: () => this.CONSUME(IsEqual) },
        { ALT: () => this.CONSUME(NotEqual) },
        { ALT: () => this.CONSUME(GreaterThanEqual) },
        { ALT: () => this.CONSUME(LessThanEqual) },
        { ALT: () => this.CONSUME(GreaterThan) },
        { ALT: () => this.CONSUME(LessThan) },
      ]);

      const right = this.SUBRULE2(this.factor);

      return {
        type: "comparisonExpression",
        left: left,
        operator: operator.image,
        right: right,
      } as const;
    },
  );

  private sort = this.RULE("sort", () => {
    this.consumeAndHighlight(Sort, "keyword");

    const columns: ReturnType<typeof this.sortRule>[] = [];

    const columnAutocomplete = this.addAutoCompleteType({
      type: "column",
    });

    this.AT_LEAST_ONE_SEP({
      DEF: () => {
        columnAutocomplete.closeAfter1();
        this.addAutoCompleteType({
          type: "column",
        }).closeAfter1();
        const result = this.SUBRULE(this.sortRule);
        columns.push(result);
      },
      SEP: Comma,
      ERR_MSG: "at least one column name",
    });

    columnAutocomplete.close();

    return {
      type: "sort",
      columns: columns,
    } as const;
  });

  private sortRule = this.RULE("sortRule", () => {
    const column = this.SUBRULE(this.columnName);

    this.addAutoCompleteType({
      type: "keywords",
      keywords: ["asc", "desc"],
    }).closeAfter1();
    const order: Order =
      this.OPTION(() => {
        const token = this.OR([
          { ALT: () => this.CONSUME(Asc) },
          { ALT: () => this.CONSUME(Desc) },
        ]);

        this.ACTION(() => {
          this.addHighlightData("keyword", token);
        });

        return token.image as Order;
      }) ?? "asc";

    return {
      name: column,
      order: order,
    } as const;
  });

  private regex = this.RULE("regex", () => {
    this.consumeAndHighlight(Regex, "keyword");

    let columnSelected: string | undefined = undefined;

    this.addAutoCompleteType({
      type: "params",
      keywords: ["field"],
    }).closeAfter1();

    this.OPTION(() => {
      const field = this.CONSUME(RegexParamField);
      this.ACTION(() => {
        this.addHighlightData("param", field);
      });
      this.CONSUME(Equal);

      this.addAutoCompleteType({
        type: "column",
      }).closeAfter1();
      const column = this.SUBRULE(this.columnName);

      columnSelected = column;
    });

    const pattern = this.SUBRULE(this.regexString);

    return this.ACTION(
      () =>
        ({
          type: "regex",
          columnSelected: columnSelected,
          pattern: pattern,
        }) as const,
    );
  });

  private unpack = this.RULE("unpack", () => {
    this.consumeAndHighlight(Unpack, "keyword");
    const columns: string[] = [];
    const autoComplete = this.addAutoCompleteType(
      {
        type: "column",
      },
      { spacing: 1 },
    ); // require a space after the column name

    this.AT_LEAST_ONE({
      DEF: () => {
        const column = this.SUBRULE(this.columnName);
        this.OPTION(() => this.CONSUME(Comma));
        columns.push(column);
      },
      ERR_MSG: "at least one column name",
    });
    autoComplete.close();
    return {
      type: "unpack",
      columns: columns,
    } as const;
  });

  private table = this.RULE("table", () => {
    this.consumeAndHighlight(Table, "keyword");

    const columns: TableColumn[] = [];

    const autoComplete = this.addAutoCompleteType(
      {
        type: "column",
      },
      { spacing: 1 },
    ); // require a space after the column name

    this.AT_LEAST_ONE({
      DEF: () => {
        const column = this.SUBRULE(this.columnName);
        const columnObj: TableColumn = {
          column: column,
          alias: undefined,
        };

        this.addAutoCompleteType(
          {
            type: "keywords",
            keywords: ["as"],
          },
          { spacing: 1 },
        ).closeAfter1();

        this.OPTION1(() => {
          const keyword = this.CONSUME(As);
          this.addHighlightData("keyword", keyword);

          const alias = this.SUBRULE2(this.columnName);
          columnObj.alias = alias;
        });
        this.OPTION2(() => this.CONSUME(Comma));
        columns.push(columnObj);
      },
      ERR_MSG: "at least one column name",
    });

    autoComplete.close();

    return {
      type: "table",
      columns: columns,
    } as const;
  });

  private statsCommand = this.RULE("statsCommand", () => {
    this.consumeAndHighlight(Stats, "keyword");

    return {
      type: "stats",
      ...this.addAggregationSyntax(),
    } as const;
  });

  private addAggregationSyntax = () => {
    const autoCompleteByKeyword = this.addAutoCompleteType(
      {
        type: "keywords",
        keywords: ["by"],
      },
      { spacing: 1, disabled: true },
    );

    let latestFunctionAutoComplete = this.addAutoCompleteType(
      {
        type: "function",
      },
      { spacing: 1 },
    );
    latestFunctionAutoComplete.closeAfter1();

    const columns: AggregationFunction[] = [];
    this.AT_LEAST_ONE({
      DEF: () => {
        autoCompleteByKeyword.disable();
        const func = this.SUBRULE(this.aggFunctionCall);
        const result: AggregationFunction = {
          ...func,
          alias: undefined,
        };

        this.addAutoCompleteType(
          {
            type: "keywords",
            keywords: ["as"],
          },
          { spacing: 1 },
        ).closeAfter1();

        this.OPTION1(() => {
          const keyword = this.CONSUME(As);
          this.addHighlightData("keyword", keyword);

          const alias = this.SUBRULE(this.columnName);
          result.alias = alias;
        });

        this.OPTION2(() => this.CONSUME(Comma));
        columns.push(result);

        // allow by auto complete only when there is at least one column
        autoCompleteByKeyword.resetStart();

        latestFunctionAutoComplete = this.addAutoCompleteType(
          {
            type: "function",
          },
          { spacing: 1 },
        );
        latestFunctionAutoComplete.closeAfter1();
      },
    });

    latestFunctionAutoComplete.close();

    autoCompleteByKeyword.close(); // close right after the by keyword
    const groupBy = this.OPTION3(() => {
      autoCompleteByKeyword.closeAfter1(); // close right after the by keyword
      return this.SUBRULE(this.groupByClause);
    });

    return {
      columns: columns,
      groupBy: groupBy,
    };
  };

  private groupByClause = this.RULE("groupByClause", () => {
    this.consumeAndHighlight(By, "keyword");

    const columns: string[] = [];
    const autoComplete = this.addAutoCompleteType(
      {
        type: "column",
      },
      { spacing: 1 },
    ); // require a space after the column name

    this.AT_LEAST_ONE({
      DEF: () => {
        const column = this.SUBRULE(this.columnName);
        this.OPTION(() => this.CONSUME(Comma));
        columns.push(column);
      },
      ERR_MSG: "at least one column name",
    });

    autoComplete.close();

    return columns;
  });

  private aggFunctionCall = this.RULE("functionCall", () => {
    const functionName = this.consumeAndHighlight(Identifier, "function");

    this.CONSUME(OpenBrackets);
    const autoComplete = this.addAutoCompleteType({
      type: "column",
    });
    const column = this.OPTION(() => this.SUBRULE(this.columnName));
    autoComplete.close();
    this.CONSUME(CloseBrackets);

    return {
      function: functionName.image,
      column: column,
    };
  });

  private columnName = this.RULE("columnName", (): string => {
    const token = this.OR([
      { ALT: () => this.CONSUME(Identifier) },
      { ALT: () => this.CONSUME(SingleQuotedString) },
    ]);

    return this.ACTION(() => {
      this.addHighlightData("column", token);
      return tokenMatcher(token, SingleQuotedString)
        ? parseSingleQuotedString(token.image)
        : token.image;
    });
  });

  private regexLiteral = this.RULE("regexLiteral", (): RegexLiteral => {
    const pattern = this.SUBRULE(this.regexString);

    return {
      type: "regex",
      pattern: pattern,
    } as const;
  });

  private regexString = this.RULE("regexString", (): string => {
    const token = this.CONSUME(RegexPattern);
    this.addHighlightData("regex", token);

    return this.ACTION(() => {
      return unquoteBacktick(token.image);
    });
  });

  private identifier = this.RULE("identifier", (): string | number => {
    const value = this.CONSUME(Identifier);
    // try to parse the value as a number
    if (isNumeric(value.image)) {
      this.addHighlightData("number", value);

      return parseInt(value.image, 10);
    }

    return value.image;
  });

  private integer = this.RULE("integer", (): number => {
    const token = this.CONSUME(Integer);

    return this.ACTION(() => {
      this.addHighlightData("number", token);

      return parseInt(token.image, 10);
    });
  });

  private doubleQuotedString = this.RULE("doubleQuotedString", (): string => {
    const token = this.CONSUME(DoubleQuotedString);

    return this.ACTION(() => {
      this.addHighlightData("string", token);
      return parseDoubleQuotedString(token.image);
    });
  });

  private booleanLiteral = this.RULE("booleanLiteral", (): boolean => {
    const token = this.OR([
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
    ]);

    return this.ACTION(() => {
      this.addHighlightData("boolean", token);

      return token.image === "true";
    });
  });
}

export type TimeChartParams = ReturnType<QQLParser["timeChart"]>["params"];
