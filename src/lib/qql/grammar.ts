import { createToken, CustomPatternMatcherFunc, EmbeddedActionsParser, IToken, Lexer, tokenMatcher, TokenType } from "chevrotain";

const Identifier = createToken({ name: "Identifier", pattern: /[0-9\w][0-9\w\-]*/ });
const Integer = createToken({ name: "Integer", pattern: /0|[1-9]\d*(?!\w)/ });
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const Comment = createToken({ 
  name: "Comment", 
  pattern: /\/\/.*/, 
  line_breaks: false, 
  group: "singleLineComments",
 });

const Comma = createToken({ name: "Comma", pattern: /,/ });
const Pipe = createToken({ name: "Pipe", pattern: /\|/ });
const DoubleQoutedString = createToken({
  name: "DoubleQoutedString",
  pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/,
});

const OpenBrackets = createToken({ name: "OpenBrackets", pattern: /\(/ });
const CloseBrackets = createToken({ name: "CloseBrackets", pattern: /\)/ });
const Equal = createToken({ name: "Equal", pattern: /=/ });

const extractLastPipeline = (matchedTokens: IToken[]) => {
  let pipeRecognized = false;
  const result: IToken[] = [];
  for (let i = matchedTokens.length - 1; i >= 0; i--) {
    const token = matchedTokens[i];
    if (tokenMatcher(token, Pipe)) {
      pipeRecognized = true;
      break;
    }

    result.unshift(token);
  }

  if (!pipeRecognized) {
    return [];
  }

  return result;
}

const matchCommand = (pattern: RegExp): CustomPatternMatcherFunc => (text, offset, matchedTokens, _groups) => {
  if (matchedTokens.length < 1) {
    return null;
  }

  const lastMatchedToken = matchedTokens[matchedTokens.length - 1];
  if (!lastMatchedToken) {
    return null;
  }

  if (!tokenMatcher(lastMatchedToken, Pipe)) {
    return null;
  }

  // Note that just because we are using a custom token pattern
  // Does not mean we cannot implement it using JavaScript Regular Expressions...
  // get substring using offset
  const textSubstring = text.substring(offset);
  const execResult = pattern.exec(textSubstring);
  return execResult;
}

const matchKeywordOfSearch = (pattern: RegExp): CustomPatternMatcherFunc => (text, offset, matchedTokens, _groups) => {
  const pipeline = extractLastPipeline(matchedTokens);
  if (pipeline.length > 1) { // if there is a pipeline then it's not a search
    return null;
  }

  return pattern.exec(text.substring(offset));
}

const isMatchingCommand = (token: TokenType | TokenType[], matchedTokens: IToken[]) => {
  const pipeline = extractLastPipeline(matchedTokens);
  if (pipeline.length < 1) {
    return false;
  }

  // make sure it's stats command
  const command = pipeline[0];

  if (Array.isArray(token)) {
    return token.some((t) => tokenMatcher(command, t));
  }

  return tokenMatcher(command, token);
}

const matchKeywordOfCommand = (token: TokenType | TokenType[], pattern: RegExp): CustomPatternMatcherFunc => (text, offset, matchedTokens, _groups) => {
  if (!isMatchingCommand(token, matchedTokens)) {
    return null;
  }

  return pattern.exec(text.substring(offset));
}

// Commands
const Table = createToken({ name: "Table", pattern: matchCommand(/^table/), longer_alt: Identifier, line_breaks: false });

// Stats specific keywords
const Stats = createToken({ name: "Stats", pattern: matchCommand(/^stats/), longer_alt: Identifier, line_breaks: false });


// Regex specific
const Regex = createToken({ name: "Regex", pattern: matchCommand(/^regex/), longer_alt: Identifier, line_breaks: false });

const RegexPattern = createToken({ name: "RegexPattern", pattern: /`(?:[^\\`]|\\(?:[bfnrtv`\\/]|\.|u[0-9a-fA-F]{4}|\w|[\[\]\(\)\{\}]))*`/ });

const RegexParamField = createToken({ name: "RegexParamField", pattern: matchKeywordOfCommand(Regex, /^(field)/), longer_alt: Identifier, line_breaks: false });

// sort specific
const Sort = createToken({ name: "OrderBy", pattern: matchCommand(/^(sort)/), longer_alt: Identifier, line_breaks: false });

const Asc = createToken({ name: "Asc", pattern: matchKeywordOfCommand(Sort, /^(asc)/), longer_alt: Identifier, line_breaks: false });
const Desc = createToken({ name: "Desc", pattern: matchKeywordOfCommand(Sort, /^(desc)/), longer_alt: Identifier, line_breaks: false });


// Where command
const Where = createToken({ name: "Where", pattern: matchCommand(/^where/), longer_alt: Identifier, line_breaks: false });

const SearchOR = createToken({ name: "SearchOR", pattern: matchKeywordOfSearch(/^OR/), longer_alt: Identifier, line_breaks: false });
const SearchAND = createToken({ name: "SearchAND", pattern: matchKeywordOfSearch(/^AND/), longer_alt: Identifier, line_breaks: false });
const SearchParamNotEqual = createToken({ name: "SearchParamNotEqual", pattern: matchKeywordOfSearch(/^!=/), line_breaks: false });


// Eval command
const Eval = createToken({ name: "Eval", pattern: matchCommand(/^eval/), longer_alt: Identifier, line_breaks: false });
const Case = createToken({ name: "Case", pattern: matchKeywordOfCommand(Eval, /^case/), longer_alt: Identifier, line_breaks: false });
const If = createToken({ name: "If", pattern: matchKeywordOfCommand(Eval, /^if/), longer_alt: Identifier, line_breaks: false });

// Timechart command
const TimeChart = createToken({ name: "TimeChart", pattern: matchCommand(/^timechart/), longer_alt: Identifier, line_breaks: false });
const Span = createToken({ name: "Span", pattern: matchKeywordOfCommand(TimeChart, /^span/), longer_alt: Identifier, line_breaks: false });
const TimeColumn = createToken({ name: "TimeColumn", pattern: matchKeywordOfCommand(TimeChart, /^timeCol/), longer_alt: Identifier, line_breaks: false });
const MaxGroups = createToken({ name: "MaxGroups", pattern: matchKeywordOfCommand(TimeChart, /^maxGroups/), longer_alt: Identifier, line_breaks: false });

const By = createToken({ name: "By", pattern: matchKeywordOfCommand([Stats, TimeChart], /^(by)(?!\()/), longer_alt: Identifier, line_breaks: false });
const As = createToken({ name: "As", pattern: matchKeywordOfCommand([Table, Stats, TimeChart], /^(as)(?!\()/), longer_alt: Identifier, line_breaks: false });

const matchBooleanExpressionContext = (pattern: RegExp): CustomPatternMatcherFunc => (text, offset, matchedTokens, _groups) => {
  if (!isMatchingCommand([Where, Eval], matchedTokens)) {
    return null;
  }

  return pattern.exec(text.substring(offset));
}


const Plus = createToken({ name: "Plus", pattern: matchBooleanExpressionContext(/^\+/), line_breaks: false });
const Minus = createToken({ name: "Minus", pattern: matchBooleanExpressionContext(/^\-/), line_breaks: false });
const Divide = createToken({ name: "Divide", pattern: matchBooleanExpressionContext(/^\//), line_breaks: false });
const Multiply = createToken({ name: "Multiply", pattern: matchBooleanExpressionContext(/^\*/), line_breaks: false });


// TODO: those should be lexed only in boolean context
const GreaterThanEqual = createToken({ name: "GreaterThanEqual", pattern: matchBooleanExpressionContext(/^>=/), line_breaks: false });
const LessThanEqual = createToken({ name: "LessThanEqual", pattern: matchBooleanExpressionContext(/^<=/), line_breaks: false });
const GreaterThan = createToken({ name: "GreaterThan", pattern: matchBooleanExpressionContext(/^>/), line_breaks: false });
const LessThan = createToken({ name: "LessThan", pattern: matchBooleanExpressionContext(/^</), line_breaks: false });
const NotEqual = createToken({ name: "NotEqual", pattern: matchBooleanExpressionContext(/^!=/), line_breaks: false });
const IsEqual = createToken({ name: "IsEqual", pattern: matchBooleanExpressionContext(/^==/), line_breaks: false });
const And = createToken({ name: "BooleanAnd", pattern: matchBooleanExpressionContext(/^&&/), line_breaks: false });
const Or = createToken({ name: "BooleanOr", pattern: matchBooleanExpressionContext(/^\|\|/), line_breaks: false });
const Not = createToken({ name: "BooleanNot", pattern: matchBooleanExpressionContext(/^!/), line_breaks: false });
const In = createToken({ name: "In", pattern: matchBooleanExpressionContext(/^in/), line_breaks: false });

const True = createToken({ name: "True", pattern: matchBooleanExpressionContext(/^true/), line_breaks: false });
const False = createToken({ name: "False", pattern: matchBooleanExpressionContext(/^false/), line_breaks: false });


const LeftSquareBracket = createToken({ name: "LeftSquareBracket", pattern: matchBooleanExpressionContext(/^\[/), line_breaks: false });
const RightSquareBracket = createToken({ name: "RightSquareBracket", pattern:  matchBooleanExpressionContext(/^\]/), line_breaks: false });


// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
const allTokens = [
  WhiteSpace,
  Comment,
  DoubleQoutedString,
  RegexPattern,

  // Boolean context
  GreaterThanEqual,
  LessThanEqual,
  GreaterThan,
  LessThan,
  NotEqual,
  IsEqual,
  And,
  Or,
  Equal,
  Not,
  True,
  False,
  Plus,
  Minus,
  Multiply,
  Divide,
  In,

  // Syntax Tokens
  Comma,
  OpenBrackets,
  CloseBrackets,
  Pipe,
  LeftSquareBracket,
  RightSquareBracket,

  // "keywords" appear before the Identifier
  Table,
  Stats,
  Regex,
  Sort,
  Where,
  TimeChart,
  Eval,
  By,
  As,
  RegexParamField,
  Asc,
  Desc,
  Span,
  TimeColumn,
  MaxGroups,
  Case,
  If,

  // search keywords
  SearchParamNotEqual,
  SearchOR,
  SearchAND,

  Integer,
  Identifier,
];
export const QQLLexer = new Lexer(allTokens); // Quick Query Language

// parser needs to support:
// identifier1 identifier2
// parsed as:
// {
//     search: ["token1", "token2"],
// }

export function isNumeric(value: string) {
  return /^-?\d+(?:.\d+)?$/.test(value);
}

export type HighlightData = {
  type: string;
  token: {
    startOffset: number;
    endOffset: number | undefined;
  };
};

export type SuggetionType =
  | { type: "column" }
  | { type: "function" }
  | { type: "booleanFunction" }
  | { type: "controllerParam" }
  | { type: "paramValue", key: string }
  | { type: "keywords", keywords: string[] }
  | { type: "params", keywords: string[] };


export type SuggestionData = {
  fromPosition: number;
  toPosition?: number;
  disabled?: boolean;
} & SuggetionType;

// --------------------- Custom Grammar Types ---------------------

export type ControllerIndexParam = {
  type: "controllerIndexParam";
  name: string;
  value: string;
  operator: string;
}
export type Search = {
  type: "search";
  left: SearchLiteral | Search;
  right: SearchAND | SearchOR | undefined;
}

export type SearchLiteral = {
  type: "searchLiteral";
  tokens: (string | number)[];
}

export type SearchAND = {
  type: "and";
  right: Search;
}

export type SearchOR = {
  type: "or";
  right: Search;
}

export type TableColumn = {
  column: string;
  alias: string | undefined;
}

export type AggregationFunction = {
  function: string;
  column: string | undefined;
  alias: string | undefined;
}

export type Order = "asc" | "desc";

export type LogicalExpression = {
  type: "logicalExpression";
  left: UnitExpression;
  right: AndExpression | OrExpression | undefined;
}

export type AndExpression = {
  type: "andExpression";
  right: LogicalExpression;
}

export type OrExpression = {
  type: "orExpression";
  right: LogicalExpression;
}

export type UnitExpression = {
  type: "unitExpression";
  value: InArrayExpression | ComparisonExpression | NotExpression | FunctionExpression | LogicalExpression;
}

export type FunctionArg = FactorType | RegexLiteral | LogicalExpression;

export type FunctionExpression = {
  type: "functionExpression";
  functionName: string;
  args: FunctionArg[];
}

export type InArrayExpression = {
  type: "inArrayExpression";
  left: FactorType;
  right: FactorType[];
}

export type NotExpression = {
  type: "notExpression";
  expression: UnitExpression;
}

export type LiteralString = {
  type: "string";
  value: string;
}

export type LiteralNumber = {
  type: "number";
  value: number;
}

export type ColumnRef = {
  type: "columnRef";
  columnName: string;
}

export type LiteralBoolean = {
  type: "boolean";
  value: boolean;
}

export type RegexLiteral = {
  type: "regex";
  pattern: string;
}


export type FactorType = LiteralString | LiteralBoolean | LiteralNumber | ColumnRef;

export type ComparisonExpression = {
  type: "comparisonExpression";
  left: FactorType; // TODO: support for column name
  operator: string;
  right: FactorType; // TODO: support for column name
}


// Eval Specific
export type EvalCaseThen = {
  type: "functionExpression";
  functionName: "caseThen";
  expression: LogicalExpression;
  truethy: EvalFunctionArg;
}

export type EvalFunctionArg = FactorType | LogicalExpression | EvalFunction | CalcExpression | FunctionExpression;

export type EvalCaseFunction = {
  type: "functionExpression";
  functionName: "case";
  cases: EvalCaseThen[];
  elseCase: EvalFunctionArg | undefined;
}

export type EvalIfFunction = {
  type: "functionExpression";
  functionName: "if";
  condition: LogicalExpression;
  then: EvalFunctionArg;
  else: EvalFunctionArg | undefined;
}


export type EvalFunction =
  | EvalCaseFunction
  | EvalIfFunction
  ;

export type CalculateUnit = {
  type: "calculateUnit";
  value: FactorType | CalcExpression;
}

export type CalcTerm = {
  type: "calcTerm";
  left: CalculateUnit;
  tail: CalcTermAction[] | undefined;
}

export type CalcTermAction = {
  type: "calcTermAction";
  operator: string;
  right: CalculateUnit;
}

export type CalcExpression = {
  type: "calcExpression";
  left: CalcTerm;
  tail: CalcAction[] | undefined;
}

export type CalcAction = {
  type: "calcAction";
  operator: string;
  right: CalcTerm;
}


export class QQLParser extends EmbeddedActionsParser {
  private highlightData: HighlightData[] = [];
  private suggestionData: SuggestionData[] = [];

  constructor() {
    super(allTokens, {
      recoveryEnabled: false,
    });
    this.performSelfAnalysis();
  }

  private getNextPos() {
    let res = this.LA(1).endOffset
    if (res === undefined || Number.isNaN(res)) {
      res = this.LA(1).startOffset
    }

    return res;
  }

  private addAutoCompleteType(suggestionType: SuggetionType, opts: { spacing?: number, disabled?: boolean } = {}) {
    let obj: SuggestionData | undefined = undefined;
    this.ACTION(() => {
      const startPos = ((this.LA(0).endColumn ?? this.LA(0).startColumn ?? 0) + (opts.spacing ?? 0));
      obj = {
        ...suggestionType,
        fromPosition: startPos,
        disabled: opts.disabled ?? false,
      }

      this.suggestionData.push(obj);
    })

    return {
      obj: obj,
      disable: () => {
        this.ACTION(() => {
          if (!obj) {
            return
          }

          obj.disabled = true;
        })
      },
      resetStart: () => {
        this.ACTION(() => {
          if (!obj) {
            return
          }

          obj.fromPosition = ((this.LA(0).endColumn ?? this.LA(0).startColumn ?? 0) + (opts.spacing ?? 0));
          obj.disabled = false;
        })
      },
      closeAfter1: () => {
        this.ACTION(() => {
          if (!obj) {
            return
          }
          obj.toPosition = this.getNextPos() + 1;
        })
      },
      closePreviousEnd: () => {
        this.ACTION(() => {
          if (!obj) {
            return
          }
          obj.toPosition = this.LA(0).endOffset;
        });
      },
      close: () => {
        this.ACTION(() => {
          if (!obj) {
            return
          }

          obj.toPosition = this.LA(1).startOffset;
        })
      },
      remove: () => {
        this.ACTION(() => {
          if (!obj) {
            return
          }

          this.suggestionData.splice(this.suggestionData.indexOf(obj), 1);
        })
      }
    }
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
  }

  public query = this.RULE("query", () => {
    const controllerParams: ControllerIndexParam[] = [];

    let controllerParamsAutoComplete = this.addAutoCompleteType({
      type: "controllerParam",
    });

    controllerParamsAutoComplete.closeAfter1();

    this.MANY1(() => {
      const controllerParam = this.SUBRULE(this.controllerParam);

      controllerParamsAutoComplete = this.addAutoCompleteType({
        type: "controllerParam",
      });

      controllerParamsAutoComplete.closeAfter1();

      controllerParams.push(controllerParam);
    });

    controllerParamsAutoComplete.close();

    const search = this.SUBRULE(this.search, { ARGS: [false] });
    const pipeline: ReturnType<typeof this.pipelineCommand>[] = [];

    this.MANY2(() => {
      this.CONSUME(Pipe);
      const pipelineItem = this.SUBRULE(this.pipelineCommand);
      pipeline.push(pipelineItem);
    });

    return {
      controllerParams: controllerParams,
      search: search,
      pipeline: pipeline,
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
      keywords: ["table", "stats", "regex", "sort", "where", "timechart", "eval"],
    }).closeAfter1();

    const resp = this.OR<
      | ReturnType<typeof this.table>
      | ReturnType<typeof this.statsCommand>
      | ReturnType<typeof this.regex>
      | ReturnType<typeof this.sort>
      | ReturnType<typeof this.where>
      | ReturnType<typeof this.timeChart>
      | ReturnType<typeof this.evalCommand>
    >([
      { ALT: () => this.SUBRULE(this.table) },
      { ALT: () => this.SUBRULE(this.statsCommand) },
      { ALT: () => this.SUBRULE(this.regex) },
      { ALT: () => this.SUBRULE(this.sort) },
      { ALT: () => this.SUBRULE(this.where) },
      { ALT: () => this.SUBRULE(this.timeChart) },
      { ALT: () => this.SUBRULE(this.evalCommand) },
    ]);

    return resp;
  });

  private search = this.RULE("search", (isRequired?: boolean): Search => {
    const parentRule = this.SUBRULE(this.searchFactor, { ARGS: [isRequired] });

    const tail = this.OPTION<
      | SearchOR
      | SearchAND
    >(() => {
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
    const token = this.CONSUME(TimeChart);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });
    const gates = {
      hasSpan: false,
      hasTimeColumn: false,
    }

    const params = {
      span: undefined as string | undefined,
      timeColumn: undefined as string | undefined,
      maxGroups: undefined as number | undefined,
    }

    const keywordsLeft: Record<string, boolean> = {
      span: true,
      timeCol: true,
      maxGroups: true,
    };

    if (gates.hasSpan) {
      delete keywordsLeft.span;
    }
    if (gates.hasTimeColumn) {
      delete keywordsLeft.timeCol;
    }
    if (params.maxGroups) {
      delete keywordsLeft.maxGroups
    }

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
          GATE: () => !params.span
        },
        {
          ALT: () => {
            params.timeColumn = this.SUBRULE(this.timechartTimeColumn)
          },
          GATE: () => !params.timeColumn
        },
        {
          GATE: () => !params.maxGroups,
          ALT: () => {
            params.maxGroups = this.SUBRULE(this.timechartMaxGroups);
          }
        }
      ])

      if (gates.hasSpan) {
        delete keywordsLeft.span;
      }
      if (gates.hasTimeColumn) {
        delete keywordsLeft.timeCol;
      }
      if (params.maxGroups) {
        delete keywordsLeft.maxGroups
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
    const token = this.CONSUME(Span);
    this.ACTION(() => {
      this.addHighlightData("param", token);
    });

    this.CONSUME(Equal);

    const timerange = this.CONSUME(Identifier);
    this.ACTION(() => {
      this.addHighlightData("time", timerange);
    })

    return timerange.image;
  });

  private timechartMaxGroups = this.RULE("timechartMaxGroups", () => {
    const token = this.CONSUME(MaxGroups);
    this.ACTION(() => {
      this.addHighlightData("param", token);
    });

    this.CONSUME(Equal);

    return this.SUBRULE(this.integer);
  });

  private timechartTimeColumn = this.RULE("timechartTimeColumn", () => {
    const token = this.CONSUME(TimeColumn);
    this.ACTION(() => {
      this.addHighlightData("param", token);
    });

    this.CONSUME(Equal);

    this.addAutoCompleteType({
      type: "column"
    }).closeAfter1();

    return this.SUBRULE(this.columnName);
  });

  private evalCommand = this.RULE("evalCommand", () => {
    const token = this.CONSUME(Eval);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

    const variableName = this.CONSUME(Identifier);
    this.ACTION(() => {
      this.addHighlightData("column", variableName);
    });
    this.CONSUME(Equal);

    const expression = this.SUBRULE(this.evalFunctionArg);

    return {
      type: "eval",
      variableName: variableName.image,
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
    const token = this.CONSUME(If);
    this.ACTION(() => {
      this.addHighlightData("function", token);
    });

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
    } as const
  });

  private evalCaseFunction = this.RULE("evalCaseFunction", (): EvalCaseFunction => {
    const token = this.CONSUME(Case);
    this.ACTION(() => {
      this.addHighlightData("function", token);
    });

    this.CONSUME(OpenBrackets);

    const cases: EvalCaseThen[] = [];
    const firstCase = this.SUBRULE(this.evalCaseStatement);
    cases.push(firstCase);

    this.MANY({
      DEF: () => {
        this.CONSUME1(Comma);
        const caseRule = this.SUBRULE2(this.evalCaseStatement);
        cases.push(caseRule);
      }
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
  });

  private evalCaseStatement = this.RULE("evalCaseStatement", (): EvalCaseThen => {
    const expression = this.SUBRULE(this.logicalExpression);
    this.CONSUME(Comma);
    const truethy = this.SUBRULE(this.evalFunctionArg);

    return {
      type: "functionExpression",
      functionName: "caseThen",
      expression: expression,
      truethy: truethy,
    }
  });

  private evalFunctionArg = this.RULE("evalFunctionArg", (): EvalFunctionArg => {
    const arg = this.OR<EvalFunctionArg>({
      DEF: [
        { ALT: () => this.SUBRULE(this.functionExpression) },
        { ALT: () => this.SUBRULE(this.calcExpression) },
        { ALT: () => this.SUBRULE(this.logicalExpression) },
        { ALT: () => this.SUBRULE(this.evalFunction) },
      ],
      IGNORE_AMBIGUITIES: true, // TODO: think about this - collision between grammar of evalFunction and logicalExpression
    })

    return arg;
  });

  private controllerParam = this.RULE("controllerParam", (): ControllerIndexParam => {
    const token = this.CONSUME(Identifier);
    this.ACTION(() => {
      this.addHighlightData("param", token);
    });

    const operator = this.OR<IToken>({
      DEF: [
        { ALT: () => this.CONSUME(SearchParamNotEqual) },
        { ALT: () => this.CONSUME(Equal) },
      ]
    });

    const autoCompleteValue = this.addAutoCompleteType({
      type: "paramValue",
      key: token.image,
    });

    const value = this.SUBRULE(this.regexString);

    autoCompleteValue.closePreviousEnd();

    return {
      type: "controllerIndexParam",
      name: token.image,
      value: value,
      operator: operator.image,
    } as const;
  });

  private searchFactor = this.RULE("searchFactor", (isRequired?: boolean) => {
    return this.OR<
      | Search
      | SearchLiteral
    >([
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

  private searchAndStatement = this.RULE("searchAndStatement", (): SearchAND => {
    const token = this.CONSUME(SearchAND);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

    return {
      type: "and",
      right: this.SUBRULE(this.search),
    };
  });

  private searchOrStatement = this.RULE("searchOrStatement", (): SearchOR => {
    const token = this.CONSUME(SearchOR);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

    return {
      type: "or",
      right: this.SUBRULE(this.search),
    };
  });


  private searchLiteral = this.RULE("searchLiteral", (required?: boolean): SearchLiteral => {
    const tokens: (string | number)[] = [];
    const isRequired = required ?? true;
    this.OR({
      DEF: [
        {
          GATE: () => !isRequired,
          ALT: () => {
            this.MANY(() => {
              const token = this.SUBRULE1(this.literalSearchTerm);
              tokens.push(token);
            });
          }
        },
        {
          GATE: () => isRequired,
          ALT: () => {
            this.AT_LEAST_ONE(() => {
              const token = this.SUBRULE2(this.literalSearchTerm);
              tokens.push(token);
            });
          }
        },
      ],
      ERR_MSG: "at least one search token",
    })

    return {
      type: "searchLiteral",
      tokens: tokens,
    };
  });

  private literalSearchTerm = this.RULE("literalSearchTerm", () => {
    return this.OR<
      | string
      | number
    >([
      { ALT: () => this.SUBRULE(this.doubleQuotedString) },
      { ALT: () => this.SUBRULE(this.integer) },
      { ALT: () => this.SUBRULE(this.identifier) },
    ]);
  });

  private where = this.RULE("where", () => {
    const token = this.CONSUME(Where);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

    this.addBooleanContextSemantics();

    const expression = this.SUBRULE(this.logicalExpression);

    return {
      type: "where",
      expression: expression,
    } as const;
  });

  private logicalExpression = this.RULE("logicalExpression", (): LogicalExpression => {
    const parentRule = this.SUBRULE(this.unitExpression);
    const tail = this.OPTION(() => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.andExpression) },
        { ALT: () => this.SUBRULE(this.orExpression) },
      ]);
    })

    return {
      type: "logicalExpression",
      left: parentRule,
      right: tail,
    }
  });

  private andExpression = this.RULE("andExpression", (): AndExpression => {
    const token = this.CONSUME(And);
    this.ACTION(() => {
      this.addHighlightData("operator", token);
    });

    this.addBooleanContextSemantics();

    const right = this.SUBRULE2(this.logicalExpression);

    return {
      type: "andExpression",
      right: right,
    } as const;
  });

  private orExpression = this.RULE("orExpression", (): OrExpression => {
    const token = this.CONSUME(Or);
    this.ACTION(() => {
      this.addHighlightData("operator", token);
    });

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
    })

    return {
      type: "unitExpression",
      value: result,
    }
  })

  private notExpression = this.RULE("notExpression", (): NotExpression => {
    const token = this.CONSUME(Not);
    this.ACTION(() => {
      this.addHighlightData("operator", token);
    });

    const expression = this.SUBRULE(this.unitExpression);

    return {
      type: "notExpression",
      expression: expression,
    } as const;
  });

  private functionExpression = this.RULE("functionExpression", (): FunctionExpression => {
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
  });

  private functionArgs = this.RULE("functionArgs", (): FunctionArg => {
    return this.OR<FunctionArg>({
      DEF: [
        { ALT: () => this.SUBRULE(this.logicalExpression) },
        { ALT: () => this.SUBRULE(this.factor) },
        { ALT: () => this.SUBRULE(this.regexLiteral) },
      ],
    })
  });

  private factor = this.RULE("factor", (): FactorType => {
    return this.OR([
      {
        ALT: (): ColumnRef => ({
          type: "columnRef",
          columnName: this.SUBRULE(this.columnName)
        })
      },
      {
        ALT: (): LiteralNumber => ({
          type: "number",
          value: this.SUBRULE(this.integer)
        })
      },
      {
        ALT: (): LiteralString => ({
          type: "string",
          value: this.SUBRULE(this.doubleQuotedString)
        })
      },
      {
        ALT: (): LiteralBoolean => ({
          type: "boolean",
          value: this.SUBRULE(this.booleanLiteral)
        })
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
    })

    return {
      type: "calcTerm",
      left: left,
      tail: tail,
    }
  });
  
  private calculateUnit = this.RULE("calculateUnit", (): CalculateUnit => {
    const value = this.OR<CalculateUnit["value"]>([
      { ALT: () => this.SUBRULE(this.parathesisCalculateExpression) },
      { ALT: () => this.SUBRULE(this.factor) },
    ]);

    return {
      type: "calculateUnit",
      value: value,
    } as const;
  });

  private parathesisCalculateExpression = this.RULE("parathesisCalculateExpression", (): CalcExpression => {
    this.CONSUME(OpenBrackets);
    const expression = this.SUBRULE(this.calcExpression);
    this.CONSUME(CloseBrackets);

    return expression;
  });

  private inArrayStatement = this.RULE("inArrayStatement", (): InArrayExpression => {
    const left = this.SUBRULE1(this.factor);

    const token = this.CONSUME(In);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

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
  });

  private comparisonExpression = this.RULE("comparisonExpression", (): ComparisonExpression => {
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
  });


  private sort = this.RULE("sort", () => {
    const token = this.CONSUME(Sort);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

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
    const order: Order = this.OPTION(() => {
      const token = this.OR([
        { ALT: () => this.CONSUME(Asc) },
        { ALT: () => this.CONSUME(Desc) },
      ]);

      this.ACTION(() => {
        this.addHighlightData("keyword", token);
      });

      return token.image as Order;
    }) ?? 'asc';

    return {
      name: column,
      order: order,
    } as const;
  });

  private regex = this.RULE("regex", () => {
    const token = this.CONSUME(Regex);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

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
    })

    const pattern = this.SUBRULE(this.regexString);

    return this.ACTION(() => ({
      type: "regex",
      columnSelected: columnSelected,
      pattern: pattern,
    } as const));
  });

  private table = this.RULE("table", () => {
    const token = this.CONSUME(Table);

    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    })

    const columns: TableColumn[] = [];

    const autoComplete = this.addAutoCompleteType({
      type: "column",
    }, { spacing: 1 });  // require a space after the column name

    this.AT_LEAST_ONE({
      DEF: () => {
        const column = this.SUBRULE(this.columnName);
        const columnObj: TableColumn = {
          column: column,
          alias: undefined,
        }

        this.addAutoCompleteType({
          type: "keywords",
          keywords: ["as"],
        }, { spacing: 1 }).closeAfter1();

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
    })

    autoComplete.close();

    return {
      type: "table",
      columns: columns,
    } as const;
  });

  private statsCommand = this.RULE("statsCommand", () => {
    const token = this.CONSUME(Stats);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    })

    return {
      type: "stats",
      ...this.addAggregationSyntax(),
    } as const;
  });

  private addAggregationSyntax = () => {
    const autoCompleteByKeyword = this.addAutoCompleteType({
      type: "keywords",
      keywords: ["by"],
    }, { spacing: 1, disabled: true });

    let latestFunctionAutoComplete = this.addAutoCompleteType({
      type: "function",
    }, { spacing: 1 });
    latestFunctionAutoComplete.closeAfter1();

    const columns: AggregationFunction[] = [];
    this.AT_LEAST_ONE({
      DEF: () => {
        autoCompleteByKeyword.disable();
        const func = this.SUBRULE(this.aggFunctionCall);
        const result: AggregationFunction = {
          ...func,
          alias: undefined,
        }

        this.addAutoCompleteType({
          type: "keywords",
          keywords: ["as"],
        }, { spacing: 1 }).closeAfter1();

        this.OPTION1(() => {
          const keyword = this.CONSUME(As);
          this.addHighlightData("keyword", keyword);

          const alias = this.SUBRULE(this.columnName);
          result.alias = alias;
        })

        this.OPTION2(() => this.CONSUME(Comma));
        columns.push(result);

        // allow by auto complete only when there is at least one column
        autoCompleteByKeyword.resetStart();

        latestFunctionAutoComplete = this.addAutoCompleteType({
          type: "function",
        }, { spacing: 1 });
        latestFunctionAutoComplete.closeAfter1();
      },
    });

    latestFunctionAutoComplete.close();

    autoCompleteByKeyword.close(); // close right after the by keyword
    const groupBy = this.OPTION3(() => {
      autoCompleteByKeyword.closeAfter1(); // close right after the by keyword
      return this.SUBRULE(this.groupByClause)
    });

    return {
      columns: columns,
      groupBy: groupBy,
    };
  }

  private groupByClause = this.RULE("groupByClause", () => {
    const token = this.CONSUME(By);
    this.ACTION(() => {
      this.addHighlightData("keyword", token);
    });

    const columns: string[] = [];
    const autoComplete = this.addAutoCompleteType({
      type: "column",
    }, { spacing: 1 });  // require a space after the column name

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
    const functionName = this.CONSUME(Identifier);
    this.ACTION(() => {
      this.addHighlightData("function", functionName);
    });

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

  private columnName = this.RULE("columnName", () => {
    const column = this.CONSUME(Identifier);

    this.ACTION(() => {
      this.addHighlightData("column", column);
    });

    return column.image;
  });

  private regexLiteral = this.RULE("regexLiteral", (): RegexLiteral => {
    const pattern = this.SUBRULE(this.regexString);

    return {
      type: "regex",
      pattern: pattern,
    } as const;
  });

  private regexString = this.RULE("regexString", () => {
    const token = this.CONSUME(RegexPattern);
    this.addHighlightData("regex", token);

    return this.ACTION(() => {
      return unqouteBacktick(token.image);
    });
  });


  private identifier = this.RULE("identifier", () => {
    const value = this.CONSUME(Identifier);
    // try to parse the value as a number
    if (isNumeric(value.image)) {
      this.addHighlightData("number", value);

      return parseInt(value.image, 10);
    }

    return value.image;
  });

  private integer = this.RULE("integer", () => {
    const token = this.CONSUME(Integer);

    return this.ACTION(() => {
      this.addHighlightData("number", token);

      return parseInt(token.image, 10);
    });
  });

  private doubleQuotedString = this.RULE("doubleQuotedString", () => {
    const token = this.CONSUME(DoubleQoutedString);

    return this.ACTION(() => {
      this.addHighlightData("string", token);

      // replace new line characters with escape sequences
      const value = token.image.replace(/\n/g, "\\n");
      // remove the double quotes from the string
      return JSON.parse(value);
    });
  });

  private booleanLiteral = this.RULE("booleanLiteral", () => {
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

// remove backticks from the string
// if backtick is escaped, then keep it
const unqouteBacktick = (input: string) => {
  return input.replace(/\\`/g, "`").slice(1, -1);
}