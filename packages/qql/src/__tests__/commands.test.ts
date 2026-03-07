import { expect, test } from "vitest";
import { QQLLexer, QQLParser } from "../grammar";

test("table command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | table column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toMatchObject({
    type: "query",
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
        type: "table",
        columns: [
          {
            column: "column1",
            alias: undefined,
          },
        ],
      },
    ],
  });
});

test("table command - column with quotes", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | table 'column1'`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toMatchObject({
    type: "query",
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
        type: "table",
        columns: [
          {
            column: "column1",
            alias: undefined,
          },
        ],
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
  expect(result).toMatchObject({
    type: "query",
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
        type: "table",
        columns: [
          {
            column: "column1",
            alias: "something",
          },
        ],
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
  expect(parser.errors).toHaveLength(1);
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
  expect(parser.query()).toMatchObject({
    type: "query",
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
        type: "table",
        columns: [
          {
            column: "column1",
          },
          {
            column: "column2",
          },
          {
            column: "column3",
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
  expect(parser.query()).toMatchObject({
    type: "query",
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
        type: "table",
        columns: [
          {
            column: "column1",
          },
          {
            column: "column2",
          },
          {
            column: "column3",
          },
        ],
      },
    ],
  });
});

test("support for stats command basic", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | stats count()`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toMatchObject({
    type: "query",
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
        type: "stats",
        columns: [
          {
            function: "count",
            column: undefined,
          },
        ],
        groupBy: undefined,
      },
    ],
  });
});

test("support for stats command alias", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    `hello world | stats avg(column1) as avg_column1`,
  );
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toMatchObject({
    type: "query",
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
        type: "stats",
        columns: [
          {
            function: "avg",
            column: "column1",
            alias: "avg_column1",
          },
        ],
        groupBy: undefined,
      },
    ],
  });
});

test("support for stats group by", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | stats count() by column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query()).toMatchObject({
    type: "query",
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
        type: "stats",
        columns: [
          {
            function: "count",
            column: undefined,
          },
        ],
        groupBy: ["column1"],
      },
    ],
  });
});

test("support for regex command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | regex \`pattern\``);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
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
        type: "regex",
        pattern: "pattern",
      },
    ],
  });
});

test("support for regex - escaping", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | regex \`\\d\\.\\d+\``);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
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
        type: "regex",
        pattern: "\\d\\.\\d+",
      },
    ],
  });
});

test("support for regex command with column", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | regex field=abc \`pattern\``);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
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
        type: "regex",
        columnSelected: "abc",
        pattern: "pattern",
      },
    ],
  });
});

test("support for sort command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | sort column1`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
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
        type: "sort",
        columns: [{ name: "column1", order: "asc" }],
      },
    ],
  });
});

test("support for sort desc command", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | sort column1 desc`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
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
        type: "sort",
        columns: [{ name: "column1", order: "desc" }],
      },
    ],
  });
});

test("support for sort desc multiple", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    `hello world | sort column1 desc, column2 asc`,
  );
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
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
        type: "sort",
        columns: [
          { name: "column1", order: "desc" },
          { name: "column2", order: "asc" },
        ],
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
        type: "timechart",
        params: {
          span: undefined,
          // ignore timeCol/timeColumn differences
        },
        columns: [
          {
            function: "count",
            column: undefined,
          },
        ],
        groupBy: undefined,
      },
    ],
  });
});

test("support timechart span param", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | timechart span=1h count()`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "timechart",
        params: {
          span: "1h",
          timeColumn: undefined,
          maxGroups: undefined,
        },
        columns: [{ function: "count", column: undefined }],
      },
    ],
  });
});

test("support timechart maxGroups param", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello world | timechart maxGroups=10 count()`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "timechart",
        params: {
          span: undefined,
          maxGroups: 10,
        },
        columns: [{ function: "count", column: undefined }],
      },
    ],
  });
});

test("support timechart timeCol param", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    `hello world | timechart timeCol=timestamp count()`,
  );
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toMatchObject({
    pipeline: [
      {
        type: "timechart",
        params: {
          span: undefined,
          timeColumn: "timestamp",
          maxGroups: undefined,
        },
        columns: [{ function: "count", column: undefined }],
      },
    ],
  });
});

test("support timechart group by", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    `hello world | timechart count() by customer, status`,
  );
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
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
        type: "timechart",
        params: {
          span: undefined,
          // ignore timeCol/timeColumn differences
        },
        columns: [
          {
            function: "count",
            column: undefined,
          },
        ],
        groupBy: ["customer", "status"],
      },
    ],
  });
});
