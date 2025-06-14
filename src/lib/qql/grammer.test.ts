import { expect, test } from "vitest";
import { QQLLexer, QQLParser } from "./grammar";

test("parser hello world", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize("hello world this is awesome");
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [
        "hello",
        "world",
        "this",
        "is",
        "awesome",
      ],
    },
  });
});

test("search term with or statements", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize("hello world OR something");
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [
        "hello",
        "world",
      ],
    },
    right: {
      type: "or",
      right: {
        type: "search",
        left: {
          type: "searchLiteral",
          tokens: ["something"],
        },
      }
    }
  });
});

test("search term with or and and statements complex", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize("(hello world OR something) AND (another OR statement)");
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;

  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
      right: {
        type: "or",
        right: {
          type: "search",
          left: {
            type: "searchLiteral",
            tokens: ["something"],
          },
        },
      },
    },
    right: {
      type: "and",
      right: {
        type: "search",
        left: {
          type: "search",
          left: {
            type: "searchLiteral",
            tokens: ["another"],
          },
          right: {
            type: "or",
            right: {
              type: "search",
              left: {
                type: "searchLiteral",
                tokens: ["statement"],
              },
            },
          },
        },
      },
    }
  });
});

test("string", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world" token2 token3`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({ type: "search", left: { type: "searchLiteral", tokens: ["hello world", "token2", "token3"] } });
});

test("integer", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`123 token`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search", left: {
      type: "searchLiteral",
      tokens: [123, "token"]
    },
  });
});

test("multiple strings", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world" token2 "token3 hey there"`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [
        "hello world",
        "token2",
        "token3 hey there",
      ],
    }
  });
});

test("nested strings", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world \\"nested\\" string" token2`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [
        `hello world "nested" string`,
        "token2",
      ],
    },
  });
});

test("strings with newlines", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world \nsomething" token2`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [
        `hello world \nsomething`,
        "token2",
      ],
    },
  });
});


test("table command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | table column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [
      {
        type: "table",
        columns: [{
          column: "column1",
          alias: undefined,
        }],
      },
    ],
  });
});

test("table command - alias", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | table column1 as something`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [
      {
        type: "table",
        columns: [{
          column: "column1",
          alias: "something",
        }],
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [
      {
        type: "table",
        columns: [
          {
            column: "column1"
          },
          {
            column: "column2"
          },
          {
            column: "column3"
          },
        ],
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [
      {
        type: "table",
        columns: [
          {
            column: "column1"
          },
          {
            column: "column2"
          },
          {
            column: "column3"
          },
        ],
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search", left: {
        type: "searchLiteral",
        tokens: ["hello", "76e191f8-8ab6-4db7-9895-c1b6d188106c"],
      },
    },
    pipeline: [],
  });
})

test("support for stats command basic", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | stats count()`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
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
});


test("support for stats command alias", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | stats avg(column1) as avg_column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toEqual({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [
      {
        type: "stats",
        columns: [
          {
            function: "avg",
            column: "column1",
            alias: "avg_column1",
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [
      {
        type: "regex",
        pattern: "pattern",
      },
    ],
  });
})


test("support for regex - escaping", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | regex \`\\d\\.\\d+\``);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [
      {
        type: "regex",
        pattern: "\\d\\.\\d+",
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
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
});

test("support timechart command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | timechart count()`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
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
        type: "timechart",
        params: {
          span: undefined,
          timeCol: undefined,
        },
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
});

test("support eval assignment", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | eval column1 = column2`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();

  expect(result).toEqual({
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
        }
      },
    ],
  });
});

test("support eval calculation", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | eval column1 = column2 + 1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();

  expect(result).toEqual({
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
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | eval column1 = column2 + 1 - 2 * 3 / 4`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();

  expect(result).toEqual({
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
        }
      },
    ],
  });
});

test("support eval command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | eval column1 = if(column2 == 1, 1, 0)`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();

  expect(result).toEqual({
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

test("support timechart group by", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | timechart count() by customer, status`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
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
        type: "timechart",
        params: {
          span: undefined,
          timeCol: undefined,
        },
        columns: [
          {
            function: "count",
            column: undefined,
          }
        ],
        groupBy: ["customer", "status"],
      },
    ],
  });
});

test("support controller params", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`param1=\`abc\` param2=\`def\` third!=\`something\` hello world`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    dataSources: [],
    controllerParams: [
      { name: "param1", value: { type: "regex", pattern: "abc" }, type: "controllerIndexParam", operator: "=" },
      { name: "param2", value: { type: "regex", pattern: "def" }, type: "controllerIndexParam", operator: "=" },
      { name: "third", value: { type: "regex", pattern: "something" }, type: "controllerIndexParam", operator: "!=" },
    ],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [],
  });
})

test("support datasource", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`@dev hello world`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    dataSources: [{
      type: "datasource",
      name: "dev",
    }],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [],
  });
})

test("support multiple datasources", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`@dev @prod hello world`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    dataSources: [{
      type: "datasource",
      name: "dev",
    }, {
      type: "datasource",
      name: "prod",
    }],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
      },
    },
    pipeline: [],
  });
})

test("support for where command function", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | where isNotNull(column1)`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
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
})

test("support for where command complex and", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | where column1 == 1 && column2 == 2`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toEqual({
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
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
            }
          },
        },
      },
    ],
  });
});


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
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: [
          "hello",
          "world",
        ],
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
});
