import { expect, test } from "vitest";
import { QQLLexer, QQLParser } from "../grammar";

test("support controller params", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    `param1=\`abc\` param2=\`def\` third!=\`something\` hello world`,
  );
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toMatchObject({
    dataSources: [],
    controllerParams: [
      {
        name: "param1",
        value: { type: "regex", pattern: "abc" },
        type: "controllerIndexParam",
        operator: "=",
      },
      {
        name: "param2",
        value: { type: "regex", pattern: "def" },
        type: "controllerIndexParam",
        operator: "=",
      },
      {
        name: "third",
        value: { type: "regex", pattern: "something" },
        type: "controllerIndexParam",
        operator: "!=",
      },
    ],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [],
  });
});

test("support datasource", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`@dev hello world`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toMatchObject({
    dataSources: [
      {
        type: "datasource",
        name: "dev",
      },
    ],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [],
  });
});

test("support multiple datasources", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`@dev @prod hello world`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  const result = parser.query();
  expect(result).toMatchObject({
    dataSources: [
      {
        type: "datasource",
        name: "dev",
      },
      {
        type: "datasource",
        name: "prod",
      },
    ],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "world"],
      },
    },
    pipeline: [],
  });
});
