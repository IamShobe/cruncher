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
  expression: EvalFunctionArg | null;
};

export type RegexCmd = {
  type: "regex";
  columnSelected: string | undefined;
  pattern: RegexLiteral | null;
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

// --------------------- Visitor Result Union ---------------------

export type ASTNode =
  | QueryNode
  | Datasource
  | ControllerIndexParam
  | Search
  | SearchLiteral
  | SearchAND
  | SearchOR
  | PipelineCommand
  | TableColumn
  | AggregationFunction
  | SortColumnRef
  | LogicalExpression
  | AndExpression
  | OrExpression
  | UnitExpression
  | NotExpression
  | InArrayExpression
  | ComparisonExpression
  | FunctionExpression
  | EvalCaseThen
  | CalcExpression
  | CalcAction
  | CalcTerm
  | CalcTermAction
  | CalculateUnit
  | FactorType
  | RegexLiteral
  | TimechartParams
  | string[];
