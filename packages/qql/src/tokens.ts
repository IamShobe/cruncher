import {
  createToken,
  CustomPatternMatcherFunc,
  IToken,
  Lexer,
  tokenMatcher,
  TokenType,
} from "chevrotain";

export const Identifier = createToken({
  name: "Identifier",
  pattern: /[0-9\w][0-9\w\-]*/,
});
export const Integer = createToken({ name: "Integer", pattern: /0|[1-9]\d*(?!\w)/ });
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

export const Comment = createToken({
  name: "Comment",
  pattern: /\/\/.*/,
  line_breaks: false,
  group: "singleLineComments",
});

export const Comma = createToken({ name: "Comma", pattern: /,/ });
export const Pipe = createToken({ name: "Pipe", pattern: /\|/ });
export const DoubleQuotedString = createToken({
  name: "DoubleQuotedString",
  pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/,
});
export const SingleQuotedString = createToken({
  name: "SingleQuotedString",
  pattern: /'(?:[^\\']|\\(?:[bfnrtv'\\/]|u[0-9a-fA-F]{4}))*'/,
});
export const AtDatasource = createToken({
  name: "AtDatasource",
  pattern: /@([a-zA-Z_][0-9a-zA-Z_-]*)/,
  longer_alt: Identifier,
  line_breaks: false,
});

export const OpenBrackets = createToken({ name: "OpenBrackets", pattern: /\(/ });
export const CloseBrackets = createToken({ name: "CloseBrackets", pattern: /\)/ });
export const Equal = createToken({ name: "Equal", pattern: /=/ });

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
};

const matchCommand =
  (pattern: RegExp): CustomPatternMatcherFunc =>
  (text, offset, matchedTokens, _groups) => {
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
  };

const matchKeywordOfSearch =
  (pattern: RegExp): CustomPatternMatcherFunc =>
  (text, offset, matchedTokens, _groups) => {
    const pipeline = extractLastPipeline(matchedTokens);
    if (pipeline.length > 1) {
      // if there is a pipeline then it's not a search
      return null;
    }

    return pattern.exec(text.substring(offset));
  };

const isMatchingCommand = (
  token: TokenType | TokenType[],
  matchedTokens: IToken[],
) => {
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
};

const matchKeywordOfCommand =
  (token: TokenType | TokenType[], pattern: RegExp): CustomPatternMatcherFunc =>
  (text, offset, matchedTokens, _groups) => {
    if (!isMatchingCommand(token, matchedTokens)) {
      return null;
    }

    return pattern.exec(text.substring(offset));
  };

// Commands
export const Table = createToken({
  name: "Table",
  pattern: matchCommand(/^table/),
  longer_alt: Identifier,
  line_breaks: false,
});

// Stats specific keywords
export const Stats = createToken({
  name: "Stats",
  pattern: matchCommand(/^stats/),
  longer_alt: Identifier,
  line_breaks: false,
});

// Regex specific
export const Regex = createToken({
  name: "Regex",
  pattern: matchCommand(/^regex/),
  longer_alt: Identifier,
  line_breaks: false,
});

// unpack
export const Unpack = createToken({
  name: "Unpack",
  pattern: matchCommand(/^unpack/),
  longer_alt: Identifier,
  line_breaks: false,
});

export const RegexPattern = createToken({
  name: "RegexPattern",
  pattern:
    /`(?:[^\\`]|\\(?:[bfnrtv`\\/]|\.|u[0-9a-fA-F]{4}|\w|[\[\]\(\)\{\}]))*`/,
});

export const RegexParamField = createToken({
  name: "RegexParamField",
  pattern: matchKeywordOfCommand(Regex, /^(field)/),
  longer_alt: Identifier,
  line_breaks: false,
});

// sort specific
export const Sort = createToken({
  name: "OrderBy",
  pattern: matchCommand(/^(sort)/),
  longer_alt: Identifier,
  line_breaks: false,
});

export const Asc = createToken({
  name: "Asc",
  pattern: matchKeywordOfCommand(Sort, /^(asc)/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const Desc = createToken({
  name: "Desc",
  pattern: matchKeywordOfCommand(Sort, /^(desc)/),
  longer_alt: Identifier,
  line_breaks: false,
});

// Where command
export const Where = createToken({
  name: "Where",
  pattern: matchCommand(/^where/),
  longer_alt: Identifier,
  line_breaks: false,
});

export const SearchOR = createToken({
  name: "SearchOR",
  pattern: matchKeywordOfSearch(/^OR/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const SearchAND = createToken({
  name: "SearchAND",
  pattern: matchKeywordOfSearch(/^AND/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const SearchParamNotEqual = createToken({
  name: "SearchParamNotEqual",
  pattern: matchKeywordOfSearch(/^!=/),
  line_breaks: false,
});

// Eval command
export const Eval = createToken({
  name: "Eval",
  pattern: matchCommand(/^eval/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const Case = createToken({
  name: "Case",
  pattern: matchKeywordOfCommand(Eval, /^case/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const If = createToken({
  name: "If",
  pattern: matchKeywordOfCommand(Eval, /^if/),
  longer_alt: Identifier,
  line_breaks: false,
});

// Timechart command
export const TimeChart = createToken({
  name: "TimeChart",
  pattern: matchCommand(/^timechart/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const Span = createToken({
  name: "Span",
  pattern: matchKeywordOfCommand(TimeChart, /^span/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const TimeColumn = createToken({
  name: "TimeColumn",
  pattern: matchKeywordOfCommand(TimeChart, /^timeCol/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const MaxGroups = createToken({
  name: "MaxGroups",
  pattern: matchKeywordOfCommand(TimeChart, /^maxGroups/),
  longer_alt: Identifier,
  line_breaks: false,
});

export const By = createToken({
  name: "By",
  pattern: matchKeywordOfCommand([Stats, TimeChart], /^(by)(?!\()/),
  longer_alt: Identifier,
  line_breaks: false,
});
export const As = createToken({
  name: "As",
  pattern: matchKeywordOfCommand([Table, Stats, TimeChart], /^(as)(?!\()/),
  longer_alt: Identifier,
  line_breaks: false,
});

const matchBooleanExpressionContext =
  (pattern: RegExp): CustomPatternMatcherFunc =>
  (text, offset, matchedTokens, _groups) => {
    if (!isMatchingCommand([Where, Eval], matchedTokens)) {
      return null;
    }

    return pattern.exec(text.substring(offset));
  };

export const Plus = createToken({
  name: "Plus",
  pattern: matchBooleanExpressionContext(/^\+/),
  line_breaks: false,
});
export const Minus = createToken({
  name: "Minus",
  pattern: matchBooleanExpressionContext(/^\-/),
  line_breaks: false,
});
export const Divide = createToken({
  name: "Divide",
  pattern: matchBooleanExpressionContext(/^\//),
  line_breaks: false,
});
export const Multiply = createToken({
  name: "Multiply",
  pattern: matchBooleanExpressionContext(/^\*/),
  line_breaks: false,
});

// TODO: those should be lexed only in boolean context
export const GreaterThanEqual = createToken({
  name: "GreaterThanEqual",
  pattern: matchBooleanExpressionContext(/^>=/),
  line_breaks: false,
});
export const LessThanEqual = createToken({
  name: "LessThanEqual",
  pattern: matchBooleanExpressionContext(/^<=/),
  line_breaks: false,
});
export const GreaterThan = createToken({
  name: "GreaterThan",
  pattern: matchBooleanExpressionContext(/^>/),
  line_breaks: false,
});
export const LessThan = createToken({
  name: "LessThan",
  pattern: matchBooleanExpressionContext(/^</),
  line_breaks: false,
});
export const NotEqual = createToken({
  name: "NotEqual",
  pattern: matchBooleanExpressionContext(/^!=/),
  line_breaks: false,
});
export const IsEqual = createToken({
  name: "IsEqual",
  pattern: matchBooleanExpressionContext(/^==/),
  line_breaks: false,
});
export const And = createToken({
  name: "BooleanAnd",
  pattern: matchBooleanExpressionContext(/^&&/),
  line_breaks: false,
});
export const Or = createToken({
  name: "BooleanOr",
  pattern: matchBooleanExpressionContext(/^\|\|/),
  line_breaks: false,
});
export const Not = createToken({
  name: "BooleanNot",
  pattern: matchBooleanExpressionContext(/^!/),
  line_breaks: false,
});
export const In = createToken({
  name: "In",
  pattern: matchBooleanExpressionContext(/^in/),
  line_breaks: false,
});

export const True = createToken({
  name: "True",
  pattern: matchBooleanExpressionContext(/^true/),
  line_breaks: false,
});
export const False = createToken({
  name: "False",
  pattern: matchBooleanExpressionContext(/^false/),
  line_breaks: false,
});

export const LeftSquareBracket = createToken({
  name: "LeftSquareBracket",
  pattern: matchBooleanExpressionContext(/^\[/),
  line_breaks: false,
});
export const RightSquareBracket = createToken({
  name: "RightSquareBracket",
  pattern: matchBooleanExpressionContext(/^\]/),
  line_breaks: false,
});

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
export const allTokens = [
  WhiteSpace,
  Comment,
  DoubleQuotedString,
  SingleQuotedString,
  RegexPattern,
  AtDatasource,

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
  Unpack,
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
