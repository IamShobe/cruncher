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

test("sort - explicit asc modifier", () => {
  expect(parse(`| sort column1 asc`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [{ column: "column1", order: "asc" }],
      },
    ],
  });
});

test("sort - explicit asc on multiple columns", () => {
  expect(parse(`| sort col1 asc, col2 asc`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [
          { column: "col1", order: "asc" },
          { column: "col2", order: "asc" },
        ],
      },
    ],
  });
});

test("sort - mixed asc and desc", () => {
  expect(parse(`| sort col1 asc, col2 desc, col3`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [
          { column: "col1", order: "asc" },
          { column: "col2", order: "desc" },
          { column: "col3", order: "asc" },
        ],
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

// In SORT_MODE: asc/desc are keywords, so they can't be column names.
// Keywords from OTHER modes are plain identifiers in sort mode.
test("sort - 'by' (stats keyword) used as column name", () => {
  expect(parse(`| sort by`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [{ column: "by", order: "asc" }],
      },
    ],
  });
});

test("sort - 'span' (timechart keyword) used as column name", () => {
  expect(parse(`| sort span`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [{ column: "span", order: "asc" }],
      },
    ],
  });
});

test("sort - 'if' (eval keyword) used as column name", () => {
  expect(parse(`| sort if`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [{ column: "if", order: "asc" }],
      },
    ],
  });
});

test("sort - 'if' column sorted descending", () => {
  expect(parse(`| sort if desc`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [{ column: "if", order: "desc" }],
      },
    ],
  });
});

test("sort - multiple columns including keyword-named columns", () => {
  expect(parse(`| sort span asc, by desc`)).toMatchObject({
    pipeline: [
      {
        type: "sort",
        columns: [
          { column: "span", order: "asc" },
          { column: "by", order: "desc" },
        ],
      },
    ],
  });
});

test("timechart - all params combined", () => {
  expect(
    parse(`| timechart count() span 5m timeCol timestamp maxGroups 10`),
  ).toMatchObject({
    pipeline: [
      {
        type: "timechart",
        aggregationFunctions: [{ function: "count" }],
        params: { span: "5m", timeCol: "timestamp", maxGroups: 10 },
      },
    ],
  });
});

test("timechart - all params with groupby", () => {
  expect(
    parse(`| timechart count() span 1h maxGroups 5 by service`),
  ).toMatchObject({
    pipeline: [
      {
        type: "timechart",
        aggregationFunctions: [{ function: "count" }],
        params: { span: "1h", maxGroups: 5 },
        groupby: ["service"],
      },
    ],
  });
});

test("timechart - span used as identifier in table", () => {
  expect(parse(`| table span, timeCol, maxGroups`)).toMatchObject({
    pipeline: [
      {
        type: "table",
        columns: [
          { column: "span", alias: undefined },
          { column: "timeCol", alias: undefined },
          { column: "maxGroups", alias: undefined },
        ],
      },
    ],
  });
});

// In STATS_MODE: by/as are keywords. Keywords from other modes are identifiers.
test("stats - 'span' (timechart keyword) used as group-by column name", () => {
  expect(parse(`| stats count() by span`)).toMatchObject({
    pipeline: [
      {
        type: "stats",
        aggregationFunctions: [{ function: "count" }],
        groupby: ["span"],
      },
    ],
  });
});

test("stats - 'if' (eval keyword) used as agg function alias", () => {
  expect(parse(`| stats count() as if`)).toMatchObject({
    pipeline: [
      {
        type: "stats",
        aggregationFunctions: [{ function: "count", alias: "if" }],
      },
    ],
  });
});
