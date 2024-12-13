import { expect, test } from "vitest";
import { QQLLexer, QQLParser } from "./grammar";

test("parser hello world", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize("hello world this is awesome");
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual([
    "hello",
    "world",
    "this",
    "is",
    "awesome",
  ]);
});

test("string", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world" token2 token3`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual(["hello world", "token2", "token3"]);
});

test("integer", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`123 token`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual([123, "token"]);
});

test("multiple strings", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world" token2 "token3 hey there"`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual([
    "hello world",
    "token2",
    "token3 hey there",
  ]);
});

test("nested strings", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world \\"nested\\" string" token2`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual([
    `hello world "nested" string`,
    "token2",
  ]);
});

test("table command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | table column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "table",
        columns: ["column1"],
      },
    ],
  });
});

test("table command no columns", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | table `);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  parser.query();
  expect(parser.errors).length(1);
  expect(parser.errors[0].message).toEqual(
    "Expecting: at least one column name\nbut found: ''",
  );
});

test("table command multiple columns", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    `hello world | table column1, column2, column3`,
  );
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "table",
        columns: ["column1", "column2", "column3"],
      },
    ],
  });
});

test("table command multiple columns no comma", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    `hello world | table column1 column2 column3`,
  );
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "table",
        columns: ["column1", "column2", "column3"],
      },
    ],
  });
});

test("parsing uuid as string", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello 76e191f8-8ab6-4db7-9895-c1b6d188106c`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    search: ["hello", "76e191f8-8ab6-4db7-9895-c1b6d188106c"],
    pipeline: [],
  });
})

test("support for stats command basic", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | stats count()`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "stats",
        columns: [
          {
            function: "count",
            column: undefined,
          }
        ],
        groupBy: undefined,
      },
    ],
  });
})


test("support for stats group by", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | stats count() by column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "stats",
        columns: [
          {
            function: "count",
            column: undefined,
          }
        ],
        groupBy: ["column1"],
      },
    ],
  });
})

test("support for regex command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | regex \`pattern\``);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "regex",
        pattern: "pattern",
      },
    ],
  });
})

test("support for regex command with column", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | regex field=abc \`pattern\``);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "regex",
        columnSelected: "abc",
        pattern: "pattern",
      },
    ],
  });
})

test("support for sort command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | sort column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "sort",
        columns: [
          { name: "column1", order: "asc" }
        ]
      },
    ],
  });
})

test("support for sort desc command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | sort column1 desc`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "sort",
        columns: [
          { name: "column1", order: "desc" }
        ]
      },
    ],
  });
})

test("support for sort desc multiple", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | sort column1 desc, column2 asc`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
    pipeline: [
      {
        type: "sort",
        columns: [
          { name: "column1", order: "desc" },
          { name: "column2", order: "asc" }
        ]
      },
    ],
  });
})

test("support for where command function", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | where isNotNull(column1)`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
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
            }
          },
          right: undefined,
        },
      },
    ],
  });
})

test.each([
  ["&&", "andExpression"],
  ["||", "orExpression"],
])("support for where command logical operators %s", (operator, type) => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | where column1 == 1 ${operator} column2 == 2`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
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
                columnName: "column1"
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
            }
          },
        },
      },
    ],
  });
});

// test("support for where command complex and", () => {
//   const parser = new QQLParser();

//   const lexer = QQLLexer.tokenize(`hello world | where column1 == 1 && column2 == 2`);
//   expect(lexer.errors).toEqual([]);
//   parser.input = lexer.tokens;
//   const result = parser.query();
//   expect(result).toEqual({
//     search: ["hello", "world"],
//     pipeline: [
//       {
//         type: "where",
//         expression: {
//           type: "logicalExpression",
//           left: {
//             type: "unitExpression",
//             value: {
//               left: "column1",
//               operator: "==",
//               right: "1",
//               type: "comparisonExpression",
//             },
//           },
//           right: {
//             type: "andExpression",
//             right: {
//               type: "logicalExpression",
//               left: {
//                 type: "unitExpression",
//                 value: {
//                   left: "column2",
//                   operator: "==",
//                   right: "2",
//                   type: "comparisonExpression",
//                 },
//               },
//               right: undefined,
//             }
//           },
//         },
//       },
//     ],
//   });
// });


test.each([
  ["=="],
  ["!="],
  [">"],
  ["<"],
  [">="],
  ["<="],
])("test where command operators %s", (operator) => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | where column1 ${operator} 1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    search: ["hello", "world"],
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
});
