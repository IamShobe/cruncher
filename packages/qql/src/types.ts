export type HighlightType =
  | "keyword"
  | "operator"
  | "string"
  | "column"
  | "function"
  | "identifier"
  | "number"
  | "datasource"
  | "regex"
  | "comment"
  | "time"
  | "param"
  | "boolean"
  | "index"
  | "pipe";

export type HighlightData = {
  type: HighlightType;
  metadata?: string;
  token: {
    startOffset: number;
    endOffset: number | undefined;
  };
};

export type SuggetionType =
  | { type: "column" }
  | { type: "function" }
  | { type: "booleanFunction" }
  | { type: "controllerParam"; excludeKeys?: string[] }
  | { type: "paramValue"; key: string }
  | { type: "keywords"; keywords: string[] }
  | { type: "params"; keywords: string[] }
  | { type: "datasource" };

export type SuggestionData = {
  fromPosition: number;
  toPosition?: number;
  disabled?: boolean;
} & SuggetionType;

// --------------------- Parser Error Contract ---------------------

export type QQLParserErrorDetail = {
  line: number;
  column: number;
  message: string;
  token: { startOffset: number; endOffset: number | undefined };
};

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

// Argument inside an aggregation function. May be a plain field name
// (e.g. `avg(latency)`) or a single-level nested function call (e.g. `avg(abs(latency))`).
export type AggFunctionArg = {
  function: string;
  column: string | undefined;
};

export type AggregationFunction = {
  function: string;
  column: string | undefined; // plain field name arg, e.g. `avg(latency)`
  columnExpression: AggFunctionArg | undefined; // nested function arg, e.g. `avg(abs(latency))`
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
    | LogicalExpression
    | FactorType; // bare factor used as a truthy boolean, e.g. `if(field, ...)`
};

export type FunctionArg =
  | FactorType
  | RegexLiteral
  | LogicalExpression
  | FunctionExpression
  | CalcExpression;

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

export type LiteralFloat = {
  type: "float";
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
  | LiteralFloat
  | ColumnRef
  | FunctionExpression; // e.g. lower(x) used as a comparison operand

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

// --------------------- Pipeline Command Types ---------------------

export type SortColumnRef = { column: string; order: Order };

export type TableCmd = {
  type: "table";
  columns: TableColumn[];
};

export type StatsCmd = {
  type: "stats";
  aggregationFunctions: AggregationFunction[];
  groupby: string[] | undefined;
};

export type WhereCmd = {
  type: "where";
  expression: LogicalExpression;
};

export type SortCmd = {
  type: "sort";
  columns: SortColumnRef[];
};

export type EvalCmd = {
  type: "eval";
  variableName: string;
  expression: EvalFunctionArg;
};

export type RegexCmd = {
  type: "regex";
  columnSelected: string | undefined;
  pattern: RegexLiteral;
};

export type TimechartParams = {
  span?: string;
  timeCol?: string;
  maxGroups?: number;
};

export type TimechartCmd = {
  type: "timechart";
  aggregationFunctions: AggregationFunction[];
  params: TimechartParams;
  groupby: string[] | undefined;
};

export type UnpackCmd = {
  type: "unpack";
  field: string;
};

export type PipelineCommand =
  | TableCmd
  | StatsCmd
  | WhereCmd
  | SortCmd
  | EvalCmd
  | RegexCmd
  | TimechartCmd
  | UnpackCmd;

export type QueryNode = {
  type: "query";
  dataSources: Datasource[];
  controllerParams: ControllerIndexParam[];
  search: Search;
  pipeline: PipelineCommand[];
};
