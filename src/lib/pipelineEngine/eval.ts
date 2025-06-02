import { DisplayResults } from "~lib/displayTypes";
import { asNumberField, Field, isNumberField, NumberField } from "~lib/adapters/logTypes";
import { CalcAction, CalcExpression, CalcTerm, CalcTermAction, CalculateUnit, EvalCaseFunction, EvalFunction, EvalFunctionArg, EvalIfFunction, FunctionExpression } from "~lib/qql/grammar";
import { Context, isBooleanFunction, processBooleanFunctionExpression, processFactor, processLogicalExpression } from "./logicalExpression";


export const processEval = (data: DisplayResults, variableName: string, expression: EvalFunctionArg): DisplayResults => {
    const { events, table } = data;
    const dataPoints = table ? table.dataPoints : events.data;

    for (const dataPoint of dataPoints) {
        const context: Context = {
            data: dataPoint,
        };

        const result: Field = processEvalFunctionArg(expression, context);

        dataPoint.object[variableName] = result; // we modify the data in place - this is fine because we use immer to create a new object
    }

    return {
        events,
        table: table,
        view: undefined,
    }
}

const processEvalFunctionArg = (expression: EvalFunctionArg, context: Context): Field => {
    switch (expression.type) {
        case "number":
            return { type: "number", value: expression.value };

        case "string":
            return { type: "string", value: expression.value };

        case "boolean":
            return { type: "boolean", value: expression.value };

        case "columnRef":
            return context.data.object[expression.columnName];

        case "functionExpression":
            if (!isEvalFunction(expression)) {
                return processFunction(expression, context);
            }

            return processEvalFunctionExpression(expression, context);

        case "logicalExpression":
            return {
                type: "boolean",
                value: processLogicalExpression(expression, context),
            }
        case "calcExpression":
            return processCalcExpression(expression, context);

        default:
            // @ts-expect-error - this should never happen
            throw new Error(`Unsupported expression type: ${expression.type}`);
    }
}

const processFunction = (expression: FunctionExpression, context: Context): Field => {
    if (isBooleanFunction(expression.functionName)) {
        return {
            type: "boolean",
            value: processBooleanFunctionExpression(expression, context),
        }
    }

    throw new Error(`Unsupported function: ${expression.functionName}`);
}

const isEvalFunction = (expression: unknown): expression is EvalFunction => {
    if (typeof expression !== "object" || expression === null) {
        return false;
    }

    if (!("functionName" in expression)) {
        return false;
    }

    if (!("type" in expression)) {
        return false;
    }

    const type = expression.type;
    if (type !== "functionExpression") {
        return false;
    }

    return expression.functionName === "case" || expression.functionName === "if";
}

const processEvalFunctionExpression = (expression: EvalFunction, context: Context): Field => {
    switch (expression.functionName) {
        case "case":
            return processEvalCaseFunction(expression, context);

        case "if":
            return processEvalIfFunction(expression, context);

        default:
            // @ts-expect-error - this should never happen
            throw new Error(`Unsupported function: ${expression.functionName}`);
    }
}

const processEvalCaseFunction = (expression: EvalCaseFunction, context: Context): Field => {
    for (const currCase of expression.cases) {
        if (!processLogicalExpression(currCase.expression, context)) {
            continue;
        }

        return processEvalFunctionArg(currCase.truethy, context);
    }

    if (!expression.elseCase) {
        return undefined;
    }

    return processEvalFunctionArg(expression.elseCase, context);
}

const processEvalIfFunction = (expression: EvalIfFunction, context: Context): Field => {
    if (processLogicalExpression(expression.condition, context)) {
        return processEvalFunctionArg(expression.then, context);
    }

    if (!expression.else) {
        return undefined;
    }

    return processEvalFunctionArg(expression.else, context);
}


const processCalcExpression = (expression: CalcExpression, context: Context): Field => {
    const left = processCalcTerm(expression.left, context);

    if (!expression.tail) {
        return left;
    }

    return processCalcExpressionTail(left, expression.tail, context);
}

const processCalcExpressionTail = (left: Field, tail: CalcAction[], context: Context): Field => {
    let result = left;

    if (!isNumberField(result)) {
        return undefined;
    }
    result = processNumberCalcExpressionTail(result, tail, context);

    return result;
}

const processNumberCalcExpressionTail = (left: NumberField, tail: CalcAction[], context: Context): NumberField => {
    const result = left;

    for (const action of tail) {
        const right = processCalcTerm(action.right, context);
        const rightNumberField = asNumberField(right);
        if (rightNumberField.errors) {
            throw new Error(`Invalid type received can't process this action: ${rightNumberField.errors.join(",")} - on action: ${JSON.stringify(action.right)}`);
        }

        switch (action.operator) {
            case "+":
                result.value += rightNumberField.value;
                break;

            case "-":
                result.value -= rightNumberField.value;
                break;

            default:
                throw new Error(`Unsupported action operator: ${action.operator}`);
        }
    }

    return result;
}

const processCalcTerm = (term: CalcTerm, context: Context): Field => {
    const left = processCalcUnit(term.left, context);

    if (!term.tail) {
        return left;
    }

    return processCalcTermTail(left, term.tail, context);
}

const processCalcTermTail = (left: Field, tail: CalcTermAction[], context: Context): Field => {
    let result = left;

    if (!isNumberField(result)) {
        return undefined;
    }
    result = processNumberCalcTermTail(result, tail, context);

    return result;
}

const processNumberCalcTermTail = (left: NumberField, tail: CalcTermAction[], context: Context): NumberField => {
    const result = left;

    for (const action of tail) {
        const right = processCalcUnit(action.right, context);
        const rightNumberField = asNumberField(right);
        if (rightNumberField.errors) {
            throw new Error(`Invalid type received can't process this action: ${rightNumberField.errors.join(",")} - on action: ${JSON.stringify(action.right)}`);
        }

        switch (action.operator) {
            case "*":
                result.value *= rightNumberField.value;
                break;

            case "/":
                result.value /= rightNumberField.value;
                break;

            default:
                throw new Error(`Unsupported action operator: ${action.operator}`);
        }
    }

    return result;
}

const processCalcUnit = (unit: CalculateUnit, context: Context): Field => {
    switch (unit.value.type) {
        case "calcExpression":
            return processCalcExpression(unit.value, context);
        default: {
            const value = processFactor(unit.value, context);
            if (!value) {
                return value;
            }

            return {
                type: value.type,
                value: value.value,
            } as Field;
        }
    }
}
