import {
  asNumberField,
  asStringField,
  BooleanField,
  Field,
  isNotDefined,
  NumberField,
  ProcessedData,
  StringField,
} from "~lib/adapters/logTypes";
import {
  AndExpression,
  ColumnRef,
  ComparisonExpression,
  FactorType,
  FunctionArg,
  FunctionExpression,
  InArrayExpression,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  LogicalExpression,
  NotExpression,
  OrExpression,
  RegexLiteral,
  UnitExpression,
} from "~lib/qql/grammar";
import { product } from "~lib/utils";

export type Context = {
  data: ProcessedData;
};

export const processLogicalExpression = (
  logicalExpression: LogicalExpression,
  context: Context,
): boolean => {
  const { left, right } = logicalExpression;

  const leftResult = processUnitExpression(left, context);
  if (!right) {
    return leftResult;
  }

  switch (right.type) {
    case "andExpression":
      return processAndExpression(right, leftResult, context);
    case "orExpression":
      return processOrExpression(right, leftResult, context);
    default:
      throw new Error("Invalid logical expression type");
  }
};

const processUnitExpression = (
  unitExpression: UnitExpression,
  context: Context,
): boolean => {
  const { value } = unitExpression;
  switch (value.type) {
    case "logicalExpression":
      return processLogicalExpression(value, context);
    case "comparisonExpression":
      return processComparisonExpression(value, context);
    case "notExpression":
      return processNotExpression(value, context);
    case "functionExpression":
      if (!isBooleanFunction(value.functionName)) {
        throw new Error(
          `Function \`${value.functionName}\` is not supported in this context!`,
        );
      }

      return processBooleanFunctionExpression(value, context);
    case "inArrayExpression":
      return processInArrayExpression(value, context);

    default:
      throw new Error("Invalid unit expression type");
  }
};

export const processInArrayExpression = (
  inArrayExpression: InArrayExpression,
  context: Context,
): boolean => {
  const { left, right } = inArrayExpression;
  const leftValue = processFieldValue(context, left);
  const rightValues = right.map((r) => processFieldValue(context, r));

  return rightValues.some(
    (rightValue) => leftValue?.value === rightValue?.value,
  );
};

export const isStringFunction = (
  functionName: string,
): functionName is SupportedStringFunction => {
  return SUPPORTED_STRING_FUNCTIONS.includes(
    functionName as SupportedStringFunction,
  );
};

export const SUPPORTED_STRING_FUNCTIONS = [
  "lower",
  "upper",
  "trim",
  "length",
] as const;

export type SupportedStringFunction =
  (typeof SUPPORTED_STRING_FUNCTIONS)[number];

export const processStringFunctionExpression = (
  functionExpression: FunctionExpression,
  context: Context,
): string => {
  const { functionName, args } = functionExpression;

  switch (functionName) {
    case "lower":
      return processSingleArgFunction(args, context, (a) =>
        asStringField(a).value.toLowerCase(),
      );
    case "upper":
      return processSingleArgFunction(args, context, (a) =>
        asStringField(a).value.toUpperCase(),
      );
    case "trim":
      return processSingleArgFunction(args, context, (a) =>
        asStringField(a).value.trim(),
      );
    default:
      throw new Error(`Function \`${functionName}\` is not supported!`);
  }
};

export const SUPPORTED_NUMBER_FUNCTIONS = [
  "abs",
  "round",
  "ceil",
  "floor",
  "length",
] as const;

export type SupportedNumberFunction =
  (typeof SUPPORTED_NUMBER_FUNCTIONS)[number];

export const isNumberFunction = (
  functionName: string,
): functionName is SupportedNumberFunction => {
  return SUPPORTED_NUMBER_FUNCTIONS.includes(
    functionName as SupportedNumberFunction,
  );
};

export const processNumberFunctionExpression = (
  functionExpression: FunctionExpression,
  context: Context,
): number => {
  const { functionName, args } = functionExpression;
  switch (functionName as SupportedNumberFunction) {
    case "abs":
      return processSingleArgFunction(args, context, (a) =>
        Math.abs(asNumberField(a).value),
      );
    case "round":
      return processSingleArgFunction(args, context, (a) =>
        Math.round(asNumberField(a).value),
      );
    case "ceil":
      return processSingleArgFunction(args, context, (a) =>
        Math.ceil(asNumberField(a).value),
      );
    case "floor":
      return processSingleArgFunction(args, context, (a) =>
        Math.floor(asNumberField(a).value),
      );
    case "length":
      return processSingleArgFunction(
        args,
        context,
        (a) => asStringField(a).value.length,
      );
    default:
      throw new Error(`Function \`${functionName}\` is not supported!`);
  }
};

export const isBooleanFunction = (
  functionName: string,
): functionName is SupportedBooleanFunction => {
  return SUPPORTED_BOOLEAN_FUNCTIONS.includes(
    functionName as SupportedBooleanFunction,
  );
};

export const SUPPORTED_BOOLEAN_FUNCTIONS = [
  "contains",
  "startsWith",
  "endsWith",
  "match",
  "isNull",
  "isNotNull",
] as const;
export type SupportedBooleanFunction =
  (typeof SUPPORTED_BOOLEAN_FUNCTIONS)[number];

export const processBooleanFunctionExpression = (
  functionExpression: FunctionExpression,
  context: Context,
): boolean => {
  const { functionName, args } = functionExpression;

  switch (functionName as SupportedBooleanFunction) {
    case "contains":
      return processContainsFunction(args, context);
    case "startsWith":
      return processStartsWithFunction(args, context);
    case "endsWith":
      return processEndsWithFunction(args, context);
    case "match":
      return matches(args, context);
    case "isNotNull":
      return processSingleArgFunction(args, context, (a) => !isNotDefined(a));
    case "isNull":
      return processSingleArgFunction(args, context, isNotDefined);
    default:
      console.warn("Unsuported function: ", functionName, args, context);
      throw new Error(`Function \`${functionName}\` is not supported!`);
  }
};

const processSingleArgFunction = <T>(
  args: FunctionArg[],
  context: Context,
  func: (a: Field) => T,
): T => {
  if (args.length !== 1) {
    throw new Error(
      "Invalid number of arguments for function - expected exactly 1",
    );
  }

  const [arg] = args;
  const argValue = processFieldValue(context, arg);

  return func(argValue);
};

const processStringFunction = (
  args: FunctionArg[],
  context: Context,
  func: (a: string, b: string) => boolean,
): boolean => {
  assertFunctionSignature(args, ["string|columnRef", "string|columnRef"]);
  const [left, right] = args;
  assertArgOfTypeString(left);
  assertArgOfTypeString(right);

  const leftValue = processFieldValue(context, left);
  const rightValue = processFieldValue(context, right);

  return func(leftValue.value, rightValue.value);
};

function assertArgOfTypeRegex(arg: FunctionArg): asserts arg is RegexLiteral {
  if (arg.type !== "regex") {
    throw new Error("Expected a regex argument");
  }
}

function assertArgOfTypeString(arg: FunctionArg): asserts arg is LiteralString {
  if (arg.type !== "string" && arg.type !== "columnRef") {
    throw new Error("Expected a string argument");
  }
}

const assertFunctionSignature = (
  args: FunctionArg[],
  expectedArgTypes: string[],
): void => {
  if (args.length !== expectedArgTypes.length) {
    throw new Error(
      `Invalid number of arguments for function - expected ${expectedArgTypes.length}`,
    );
  }

  const got: string[] = [];
  for (const arg of args) {
    got.push(arg.type);
  }

  const possibilities: string[][] = [];
  expectedArgTypes.forEach((expectedArgType) => {
    const possibleTypes = expectedArgType.split("|");
    possibilities.push(possibleTypes);
  });

  const combinations = product(possibilities);
  for (const combination of combinations) {
    if (combination.join(",") === got.join(",")) {
      // has a match!
      return;
    }
  }

  throw new Error(
    `Invalid argument types for function - expected: (${expectedArgTypes.join(",")}), got (${got.join(",")})`,
  );
};

const matches = (args: FunctionArg[], context: Context): boolean => {
  assertFunctionSignature(args, ["string|columnRef", "regex"]);
  const [left, right] = args;
  assertArgOfTypeString(left);
  assertArgOfTypeRegex(right);

  const leftValue = processFieldValue(context, left);
  const rightValue = processFieldValue(context, right);

  const regex = new RegExp(rightValue.value);
  return regex.test(leftValue.value);
};

const processStartsWithFunction = (
  args: FunctionArg[],
  context: Context,
): boolean => {
  return processStringFunction(args, context, (a, b) => a.startsWith(b));
};

const processEndsWithFunction = (
  args: FunctionArg[],
  context: Context,
): boolean => {
  return processStringFunction(args, context, (a, b) => a.endsWith(b));
};

const processContainsFunction = (
  args: FunctionArg[],
  context: Context,
): boolean => {
  return processStringFunction(args, context, (a, b) => a.includes(b));
};

const processComparisonExpression = (
  comparisonExpression: ComparisonExpression,
  context: Context,
): boolean => {
  const { left, right, operator } = comparisonExpression;
  const leftValue = processFieldValue(context, left);
  const rightValue = processFieldValue(context, right);

  if (isNotDefined(leftValue)) {
    return handleValueIsUndefined(rightValue, operator);
  }

  if (isNotDefined(rightValue)) {
    return handleValueIsUndefined(leftValue, operator);
  }

  switch (operator) {
    case "==":
      return leftValue.value === rightValue.value;
    case "!=":
      return leftValue.value !== rightValue.value;
    case ">":
      return leftValue.value > rightValue.value;
    case "<":
      return leftValue.value < rightValue.value;
    case ">=":
      return leftValue.value >= rightValue.value;
    case "<=":
      return leftValue.value <= rightValue.value;
    default:
      throw new Error("Invalid comparison operator");
  }
};

const handleValueIsUndefined = (fieldValue: Field, operator: string) => {
  switch (operator) {
    case "==":
      return isNotDefined(fieldValue);
    case "!=":
      return !isNotDefined(fieldValue);
    default:
      return false;
  }
};

function processFieldValue(context: Context, field: LiteralString): StringField;
function processFieldValue(context: Context, field: LiteralNumber): NumberField;
function processFieldValue(context: Context, field: RegexLiteral): StringField;
function processFieldValue(context: Context, field: ColumnRef): Field;
function processFieldValue(
  context: Context,
  field: LiteralBoolean,
): BooleanField;
function processFieldValue(
  context: Context,
  field: LogicalExpression,
): BooleanField;
function processFieldValue(context: Context, field: FunctionArg): Field;

function processFieldValue(context: Context, field: FunctionArg): Field {
  switch (field.type) {
    case "regex":
      return {
        type: "string",
        value: field.pattern,
      };

    case "logicalExpression":
      return {
        type: "boolean",
        value: processLogicalExpression(field, context),
      };

    case "functionExpression":
      return processFunctionExpression(field, context);

    default:
      return processFactor(field, context);
  }
}

export function processFunctionExpression(
  expression: FunctionExpression,
  context: Context,
): Field {
  if (isStringFunction(expression.functionName)) {
    return {
      type: "string",
      value: processStringFunctionExpression(expression, context),
    };
  } else if (isBooleanFunction(expression.functionName)) {
    return {
      type: "boolean",
      value: processBooleanFunctionExpression(expression, context),
    };
  } else if (isNumberFunction(expression.functionName)) {
    return {
      type: "number",
      value: processNumberFunctionExpression(expression, context),
    };
  }

  throw new Error(`Unsupported function: ${expression.functionName}`);
}

export function processFactor(field: FactorType, context: Context): Field {
  switch (field.type) {
    case "number":
      return {
        type: "number",
        value: field.value,
      };
    case "string":
      return {
        type: "string",
        value: field.value,
      };
    case "columnRef":
      return context.data.object[field.columnName];

    case "boolean":
      return {
        type: "boolean",
        value: field.value,
      };

    default:
      throw new Error("Invalid field type");
  }
}

const processNotExpression = (
  notExpression: NotExpression,
  context: Context,
): boolean => {
  const { expression } = notExpression;
  return !processUnitExpression(expression, context);
};

const processAndExpression = (
  andExpression: AndExpression,
  left: boolean,
  context: Context,
): boolean => {
  const { right } = andExpression;
  return left && processLogicalExpression(right, context);
};

const processOrExpression = (
  orExpression: OrExpression,
  left: boolean,
  context: Context,
): boolean => {
  const { right } = orExpression;
  return left || processLogicalExpression(right, context);
};
