import { expect, test } from "vitest";
import { parse } from "../index";

test("support eval assignment", () => {
  const result = parse(`hello world | eval column1 = column2`);

  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [
      {
        type: "eval",
        variableName: "column1",
        expression: {
          type: "calcExpression",
          left: {
            type: "calcTerm",
            left: {
              type: "calculateUnit",
              value: {
                type: "columnRef",
                columnName: "column2",
              },
            },
          },
        },
      },
    ],
  });
});

test("support eval calculation", () => {
  const result = parse(`hello world | eval column1 = column2 + 1`);

  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [
      {
        type: "eval",
        variableName: "column1",
        expression: {
          type: "calcExpression",
          left: {
            type: "calcTerm",
            left: {
              type: "calculateUnit",
              value: {
                type: "columnRef",
                columnName: "column2",
              },
            },
          },
          tail: [
            {
              type: "calcAction",
              operator: "+",
              right: {
                type: "calcTerm",
                left: {
                  type: "calculateUnit",
                  value: {
                    type: "number",
                    value: 1,
                  },
                },
              },
            },
          ],
        },
      },
    ],
  });
});

test("support eval calculation with multiple operators", () => {
  const result = parse(`hello world | eval column1 = column2 + 1 - 2 * 3 / 4`);

  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [
      {
        type: "eval",
        variableName: "column1",
        expression: {
          type: "calcExpression",
          left: {
            type: "calcTerm",
            left: {
              type: "calculateUnit",
              value: {
                type: "columnRef",
                columnName: "column2",
              },
            },
          },
          tail: [
            {
              type: "calcAction",
              operator: "+",
              right: {
                type: "calcTerm",
                left: {
                  type: "calculateUnit",
                  value: {
                    type: "number",
                    value: 1,
                  },
                },
              },
            },
            {
              type: "calcAction",
              operator: "-",
              right: {
                type: "calcTerm",
                left: {
                  type: "calculateUnit",
                  value: {
                    type: "number",
                    value: 2,
                  },
                },
                tail: [
                  {
                    type: "calcTermAction",
                    operator: "*",
                    right: {
                      type: "calculateUnit",
                      value: {
                        type: "number",
                        value: 3,
                      },
                    },
                  },
                  {
                    type: "calcTermAction",
                    operator: "/",
                    right: {
                      type: "calculateUnit",
                      value: {
                        type: "number",
                        value: 4,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  });
});

test("support eval command", () => {
  const result = parse(`hello world | eval column1 = if(column2 == 1, 1, 0)`);

  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [
      {
        type: "eval",
        variableName: "column1",
        expression: {
          type: "functionExpression",
          functionName: "if",
          condition: {
            type: "logicalExpression",
            left: {
              type: "unitExpression",
              value: {
                left: {
                  type: "columnRef",
                  columnName: "column2",
                },
                operator: "==",
                right: {
                  type: "number",
                  value: 1,
                },
                type: "comparisonExpression",
              },
            },
            right: undefined,
          },
          then: {
            type: "calcExpression",
            left: {
              type: "calcTerm",
              left: {
                type: "calculateUnit",
                value: {
                  type: "number",
                  value: 1,
                },
              },
            },
          },
          else: {
            type: "calcExpression",
            left: {
              type: "calcTerm",
              left: {
                type: "calculateUnit",
                value: {
                  type: "number",
                  value: 0,
                },
              },
            },
          },
        },
      },
    ],
  });
});

test("support for where command function", () => {
  const result = parse(`hello world | where isNotNull(column1)`);
  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              args: [
                {
                  type: "columnRef",
                  columnName: "column1",
                },
              ],
              functionName: "isNotNull",
              type: "functionExpression",
            },
          },
          right: undefined,
        },
      },
    ],
  });
});

test.each([
  ["&&", "andExpression"],
  ["||", "orExpression"],
])("support for where command logical operators %s", (operator, type) => {
  const result = parse(
    `hello world | where column1 == 1 ${operator} column2 == 2`,
  );
  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              left: {
                type: "columnRef",
                columnName: "column1",
              },
              operator: "==",
              right: {
                type: "number",
                value: 1,
              },
              type: "comparisonExpression",
            },
          },
          right: {
            type: type,
            right: {
              type: "logicalExpression",
              left: {
                type: "unitExpression",
                value: {
                  left: {
                    type: "columnRef",
                    columnName: "column2",
                  },
                  operator: "==",
                  right: {
                    type: "number",
                    value: 2,
                  },
                  type: "comparisonExpression",
                },
              },
              right: undefined,
            },
          },
        },
      },
    ],
  });
});

test("support for where command complex and", () => {
  const result = parse(`hello world | where column1 == 1 && column2 == 2`);
  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              left: {
                type: "columnRef",
                columnName: "column1",
              },
              operator: "==",
              right: {
                type: "number",
                value: 1,
              },
              type: "comparisonExpression",
            },
          },
          right: {
            type: "andExpression",
            right: {
              type: "logicalExpression",
              left: {
                type: "unitExpression",
                value: {
                  left: {
                    type: "columnRef",
                    columnName: "column2",
                  },
                  operator: "==",
                  right: {
                    type: "number",
                    value: 2,
                  },
                  type: "comparisonExpression",
                },
              },
              right: undefined,
            },
          },
        },
      },
    ],
  });
});

test("support for where notExpression", () => {
  const result = parse(`hello world | where !isNull(column1)`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              type: "notExpression",
              expression: {
                type: "unitExpression",
                value: {
                  type: "functionExpression",
                  functionName: "isNull",
                  args: [{ type: "columnRef", columnName: "column1" }],
                },
              },
            },
          },
          right: undefined,
        },
      },
    ],
  });
});

test("support for where inArrayStatement", () => {
  const result = parse(`hello world | where status in ["a", "b"]`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              type: "inArrayExpression",
              left: { type: "columnRef", columnName: "status" },
              right: [
                { type: "string", value: "a" },
                { type: "string", value: "b" },
              ],
            },
          },
          right: undefined,
        },
      },
    ],
  });
});

test("support for eval case function", () => {
  const result = parse(`hello world | eval s = case(x > 1, "big", "small")`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "eval",
        variableName: "s",
        expression: {
          type: "functionExpression",
          functionName: "case",
          cases: [
            {
              type: "functionExpression",
              functionName: "caseThen",
              expression: {
                type: "logicalExpression",
                left: {
                  type: "unitExpression",
                  value: {
                    type: "comparisonExpression",
                    left: { type: "columnRef", columnName: "x" },
                    operator: ">",
                    right: { type: "number", value: 1 },
                  },
                },
              },
              truethy: { type: "calcExpression" },
            },
          ],
          elseCase: { type: "calcExpression" },
        },
      },
    ],
  });
});

test("support for where parenthesisExpression", () => {
  const result = parse(`hello world | where (col1 == 1 && col2 == 2)`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              type: "logicalExpression",
              left: {
                type: "unitExpression",
                value: {
                  type: "comparisonExpression",
                  left: { type: "columnRef", columnName: "col1" },
                  operator: "==",
                  right: { type: "number", value: 1 },
                },
              },
              right: {
                type: "andExpression",
                right: {
                  type: "logicalExpression",
                  left: {
                    type: "unitExpression",
                    value: {
                      type: "comparisonExpression",
                      left: { type: "columnRef", columnName: "col2" },
                      operator: "==",
                      right: { type: "number", value: 2 },
                    },
                  },
                },
              },
            },
          },
          right: undefined,
        },
      },
    ],
  });
});

test("support for parenthesisCalcExpression in eval", () => {
  const result = parse(`hello world | eval x = (2 + 3) * 4`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "eval",
        variableName: "x",
        expression: {
          type: "calcExpression",
          left: {
            type: "calcTerm",
            left: {
              type: "calculateUnit",
              value: {
                type: "calcExpression",
                left: {
                  type: "calcTerm",
                  left: {
                    type: "calculateUnit",
                    value: { type: "number", value: 2 },
                  },
                },
                tail: [
                  {
                    type: "calcAction",
                    operator: "+",
                    right: {
                      type: "calcTerm",
                      left: {
                        type: "calculateUnit",
                        value: { type: "number", value: 3 },
                      },
                    },
                  },
                ],
              },
            },
            tail: [
              {
                type: "calcTermAction",
                operator: "*",
                right: {
                  type: "calculateUnit",
                  value: { type: "number", value: 4 },
                },
              },
            ],
          },
        },
      },
    ],
  });
});

test("eval if - no else branch", () => {
  const result = parse(`| eval col = if(x == 1, "yes")`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "eval",
        variableName: "col",
        expression: {
          type: "functionExpression",
          functionName: "if",
          condition: {
            type: "logicalExpression",
            left: {
              type: "unitExpression",
              value: {
                type: "comparisonExpression",
                left: { type: "columnRef", columnName: "x" },
                operator: "==",
                right: { type: "number", value: 1 },
              },
            },
          },
          then: { type: "calcExpression" },
          else: undefined,
        },
      },
    ],
  });
});

// In EVAL_MODE: if/case are keywords so can't be used as variable names.
// Keywords from other modes are plain identifiers in eval mode.
test("eval - 'span' (timechart keyword) as lhs variable name", () => {
  const result = parse(`| eval span = x + 1`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "eval",
        variableName: "span",
        expression: { type: "calcExpression" },
      },
    ],
  });
});

test("eval - 'asc' (sort keyword) as lhs variable name", () => {
  const result = parse(`| eval asc = x + 1`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "eval",
        variableName: "asc",
        expression: { type: "calcExpression" },
      },
    ],
  });
});

test("eval - 'by' (stats keyword) as lhs variable name", () => {
  const result = parse(`| eval by = x + 1`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "eval",
        variableName: "by",
        expression: { type: "calcExpression" },
      },
    ],
  });
});

test("where - if keyword as column name", () => {
  const result = parse(`| where if == 1`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              type: "comparisonExpression",
              left: { type: "columnRef", columnName: "if" },
              operator: "==",
              right: { type: "number", value: 1 },
            },
          },
        },
      },
    ],
  });
});

test("where - case keyword as column name", () => {
  const result = parse(`| where case == "foo"`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              type: "comparisonExpression",
              left: { type: "columnRef", columnName: "case" },
              operator: "==",
              right: { type: "string", value: "foo" },
            },
          },
        },
      },
    ],
  });
});

test("where - in keyword as column name via function", () => {
  const result = parse(`| where status in ["active", "pending"]`);
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              type: "inArrayExpression",
              left: { type: "columnRef", columnName: "status" },
              right: [
                { type: "string", value: "active" },
                { type: "string", value: "pending" },
              ],
            },
          },
        },
      },
    ],
  });
});

// ─── Arithmetic inside function arguments (regression test) ──────────────────

test("eval - function with calc expression arg: ceil(duration_ms / 1000)", () => {
  const result = parse(`| eval rounded_duration = ceil(duration_ms / 1000)`);
  expect(result.pipeline).toHaveLength(1);
  const cmd = result.pipeline[0] as any;
  expect(cmd.type).toBe("eval");
  expect(cmd.variableName).toBe("rounded_duration");
  expect(cmd.expression.type).toBe("functionExpression");
  expect(cmd.expression.functionName).toBe("ceil");
  expect(cmd.expression.args).toHaveLength(1);
  // The argument is a calcExpression for `duration_ms / 1000`
  const arg = cmd.expression.args[0];
  expect(arg.type).toBe("calcExpression");
  expect(arg.left.left.value).toMatchObject({
    type: "columnRef",
    columnName: "duration_ms",
  });
  expect(arg.left.tail).toHaveLength(1);
  expect(arg.left.tail[0]).toMatchObject({
    type: "calcTermAction",
    operator: "/",
    right: { type: "calculateUnit", value: { type: "number", value: 1000 } },
  });
});

test("eval - function with multiplication arg: floor(rate * 100)", () => {
  const result = parse(`| eval pct = floor(rate * 100)`);
  const cmd = result.pipeline[0] as any;
  expect(cmd.expression.functionName).toBe("floor");
  const arg = cmd.expression.args[0];
  expect(arg.type).toBe("calcExpression");
  expect(arg.left.tail[0].operator).toBe("*");
});

test("eval - function with addition arg: abs(a + b)", () => {
  const result = parse(`| eval out = abs(a + b)`);
  const cmd = result.pipeline[0] as any;
  expect(cmd.expression.functionName).toBe("abs");
  const arg = cmd.expression.args[0];
  expect(arg.type).toBe("calcExpression");
  expect(arg.tail[0].operator).toBe("+");
});

test("eval - simple column ref arg still works after grammar change: ceil(x)", () => {
  const result = parse(`| eval out = ceil(x)`);
  const cmd = result.pipeline[0] as any;
  expect(cmd.expression.functionName).toBe("ceil");
  // A simple column reference should unwrap to FactorType, not CalcExpression
  expect(cmd.expression.args[0]).toMatchObject({
    type: "columnRef",
    columnName: "x",
  });
});

test.each([["=="], ["!="], [">"], ["<"], [">="], ["<="]])(
  "test where command operators %s",
  (operator) => {
    const result = parse(`hello world | where column1 ${operator} 1`);
    expect(result).toMatchObject({
      dataSources: [],
      controllerParams: [],
      search: {
        type: "search",
        left: {
          type: "searchLiteral",
          tokens: ["hello", "world"],
        },
      },
      pipeline: [
        {
          type: "where",
          expression: {
            type: "logicalExpression",
            left: {
              type: "unitExpression",
              value: {
                left: {
                  type: "columnRef",
                  columnName: "column1",
                },
                operator: operator,
                right: {
                  type: "number",
                  value: 1,
                },
                type: "comparisonExpression",
              },
            },
            right: undefined,
          },
        },
      ],
    });
  },
);
