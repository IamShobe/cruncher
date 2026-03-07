import { expect, test } from "vitest";
import { parse, QQLParserError } from "../index";

test("table command", () => {
  expect(parse(`hello world | table column1`)).toMatchObject({
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
  expect(parse(`hello world | table 'column1'`)).toMatchObject({
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
  const result = parse(`hello world | table column1 as something`);
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
  expect(() => parse(`hello world | table `)).toThrow(QQLParserError);
});

test("table command multiple columns", () => {
  expect(parse(
    `hello world | table column1, column2, column3`,
  )).toMatchObject({
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
  expect(parse(`hello world | table column1 column2`)).toMatchObject({
    type: "query",
    pipeline: [
      {
        type: "table",
        columns: [
          { column: "column1", alias: undefined },
          { column: "column2", alias: undefined },
        ],
      },
    ],
  });
});

test("support for stats command basic", () => {
  expect(parse(`hello world | stats count()`)).toMatchObject({
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
        aggregationFunctions: [
          {
            function: "count",
            column: undefined,
          },
        ],
      },
    ],
  });
});

test("support for stats command alias", () => {
  expect(parse(`hello world | stats count() as cnt`)).toMatchObject({
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
        aggregationFunctions: [
          {
            function: "count",
            alias: "cnt",
          },
        ],
      },
    ],
  });
});

test("support for stats group by", () => {
  expect(parse(`hello world | stats count() by category`)).toMatchObject({
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
        aggregationFunctions: [
          {
            function: "count",
          },
        ],
        groupby: ["category"],
      },
    ],
  });
});

test("support for regex command (no column)", () => {
  expect(parse("hello world | regex `test.+`")).toMatchObject({
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
        type: "regex",
        columnSelected: undefined,
        pattern: {
          type: "regex",
          pattern: "test.+",
        },
      },
    ],
  });
});

test("support for regex - escaping", () => {
  expect(parse("hello world | regex `test\\`escaped`")).toMatchObject({
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
        type: "regex",
        columnSelected: undefined,
        pattern: {
          type: "regex",
          pattern: "test`escaped",
        },
      },
    ],
  });
});

test("support for regex command with field= column specifier", () => {
  expect(parse("hello world | regex field=message `^[0-9]+$`")).toMatchObject({
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
        type: "regex",
        columnSelected: "message",
        pattern: {
          type: "regex",
          pattern: "^[0-9]+$",
        },
      },
    ],
  });
});

test("support for sort command", () => {
  expect(parse(`hello world | sort column1`)).toMatchObject({
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
        type: "sort",
        columns: [
          {
            column: "column1",
            order: "asc",
          },
        ],
      },
    ],
  });
});

test("support for sort desc command", () => {
  expect(parse(`hello world | sort column1 desc`)).toMatchObject({
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
        type: "sort",
        columns: [
          {
            column: "column1",
            order: "desc",
          },
        ],
      },
    ],
  });
});

test("support for sort desc multiple", () => {
  expect(parse(`hello world | sort column1 desc, column2 asc`))
    .toMatchObject({
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
          type: "sort",
          columns: [
            {
              column: "column1",
              order: "desc",
            },
            {
              column: "column2",
              order: "asc",
            },
          ],
        },
      ],
    });
});

test("support timechart command", () => {
  expect(parse(`hello world | timechart count()`)).toMatchObject({
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
        type: "timechart",
        aggregationFunctions: [
          {
            function: "count",
          },
        ],
      },
    ],
  });
});

test("support timechart span param", () => {
  expect(parse(`hello world | timechart count() span 5m`)).toMatchObject({
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
        type: "timechart",
        aggregationFunctions: [
          {
            function: "count",
          },
        ],
        params: {
          span: "5m",
        },
      },
    ],
  });
});

test("support timechart maxGroups param", () => {
  expect(parse(`hello world | timechart count() maxGroups 10`))
    .toMatchObject({
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
          type: "timechart",
          aggregationFunctions: [
            {
              function: "count",
            },
          ],
          params: {
            maxGroups: 10,
          },
        },
      ],
    });
});

test("support timechart timeCol param", () => {
  expect(parse(`hello world | timechart count() timeCol timestamp`))
    .toMatchObject({
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
          type: "timechart",
          aggregationFunctions: [
            {
              function: "count",
            },
          ],
          params: {
            timeCol: "timestamp",
          },
        },
      ],
    });
});

test("regex command with field= and quoted column", () => {
  expect(parse('hello world | regex field="my.field" `^ERROR`')).toMatchObject({
    pipeline: [
      {
        type: "regex",
        columnSelected: "my.field",
        pattern: { type: "regex", pattern: "^ERROR" },
      },
    ],
  });
});

test("regex command with field= and dot-notation column", () => {
  expect(parse("hello world | regex field=kubernetes.pod_name `^web`")).toMatchObject({
    pipeline: [
      {
        type: "regex",
        columnSelected: "kubernetes.pod_name",
        pattern: { type: "regex", pattern: "^web" },
      },
    ],
  });
});

test("table command with dot-notation column", () => {
  expect(parse("hello world | table kubernetes.pod_name")).toMatchObject({
    pipeline: [
      {
        type: "table",
        columns: [{ column: "kubernetes.pod_name", alias: undefined }],
      },
    ],
  });
});

test("where command with FLOAT comparison", () => {
  expect(parse("hello world | where score == 3.14")).toMatchObject({
    pipeline: [
      {
        type: "where",
        expression: {
          type: "logicalExpression",
          left: {
            type: "unitExpression",
            value: {
              type: "comparisonExpression",
              left: { type: "columnRef", columnName: "score" },
              operator: "==",
              right: { type: "float", value: 3.14 },
            },
          },
        },
      },
    ],
  });
});

test("support timechart group by", () => {
  expect(parse(`hello world | timechart count() by category`)).toMatchObject({
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
        type: "timechart",
        aggregationFunctions: [
          {
            function: "count",
          },
        ],
        groupby: ["category"],
      },
    ],
  });
});
