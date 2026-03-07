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
  | { type: "paramValue"; key: string }
  | { type: "keywords"; keywords: string[] }
  | { type: "params"; keywords: string[] }
  | { type: "datasource" };

export type SuggestionData = {
  fromPosition: number;
  toPosition?: number;
  disabled?: boolean;
} & SuggetionType;

// --------------------- Custom Grammar Types ---------------------

export type ControllerIndexParam = {
  type: "controllerIndexParam";
  name: string;
  value: LiteralString | RegexLiteral;
  operator: string;
};
export type Search = {
  type: "search";
  left: SearchLiteral | Search;
  right: SearchAND | SearchOR | undefined;
};

export type SearchLiteral = {
  type: "searchLiteral";
  tokens: (string | number)[];
};

export type SearchAND = {
  type: "and";
  right: Search;
};

export type SearchOR = {
  type: "or";
  right: Search;
};

export type TableColumn = {
  column: string;
  alias: string | undefined;
};

export type AggregationFunction = {
  function: string;
  column: string | undefined;
  alias: string | undefined;
};

export type Order = "asc" | "desc";

export type LogicalExpression = {
  type: "logicalExpression";
  left: UnitExpression;
  right: AndExpression | OrExpression | undefined;
};

export type AndExpression = {
  type: "andExpression";
  right: LogicalExpression;
};

export type OrExpression = {
  type: "orExpression";
  right: LogicalExpression;
};

export type UnitExpression = {
  type: "unitExpression";
  value:
    | InArrayExpression
    | ComparisonExpression
    | NotExpression
    | FunctionExpression
    | LogicalExpression;
};

export type FunctionArg =
  | FactorType
  | RegexLiteral
  | LogicalExpression
  | FunctionExpression;

export type FunctionExpression = {
  type: "functionExpression";
  functionName: string;
  args: FunctionArg[];
};

export type InArrayExpression = {
  type: "inArrayExpression";
  left: FactorType;
  right: FactorType[];
};

export type NotExpression = {
  type: "notExpression";
  expression: UnitExpression;
};

export type LiteralString = {
  type: "string";
  value: string;
};

export type LiteralNumber = {
  type: "number";
  value: number;
};

export type ColumnRef = {
  type: "columnRef";
  columnName: string;
};

export type LiteralBoolean = {
  type: "boolean";
  value: boolean;
};

export type RegexLiteral = {
  type: "regex";
  pattern: string;
};

export type FactorType =
  | LiteralString
  | LiteralBoolean
  | LiteralNumber
  | ColumnRef;

export type ComparisonExpression = {
  type: "comparisonExpression";
  left: FactorType; // TODO: support for column name
  operator: string;
  right: FactorType; // TODO: support for column name
};

// Eval Specific
export type EvalCaseThen = {
  type: "functionExpression";
  functionName: "caseThen";
  expression: LogicalExpression;
  truethy: EvalFunctionArg;
};

export type EvalFunctionArg =
  | FactorType
  | LogicalExpression
  | EvalFunction
  | CalcExpression
  | FunctionExpression;

export type EvalCaseFunction = {
  type: "functionExpression";
  functionName: "case";
  cases: EvalCaseThen[];
  elseCase: EvalFunctionArg | undefined;
};

export type EvalIfFunction = {
  type: "functionExpression";
  functionName: "if";
  condition: LogicalExpression;
  then: EvalFunctionArg;
  else: EvalFunctionArg | undefined;
};

export type EvalFunction = EvalCaseFunction | EvalIfFunction;

export type CalculateUnit = {
  type: "calculateUnit";
  value: FactorType | CalcExpression;
};

export type CalcTerm = {
  type: "calcTerm";
  left: CalculateUnit;
  tail: CalcTermAction[] | undefined;
};

export type CalcTermAction = {
  type: "calcTermAction";
  operator: string;
  right: CalculateUnit;
};

export type CalcExpression = {
  type: "calcExpression";
  left: CalcTerm;
  tail: CalcAction[] | undefined;
};

export type CalcAction = {
  type: "calcAction";
  operator: string;
  right: CalcTerm;
};

export type Datasource = {
  type: "datasource";
  name: string;
};
