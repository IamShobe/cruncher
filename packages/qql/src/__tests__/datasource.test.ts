import { expect, test } from "vitest";
import { parse } from "../index";

test("support controller params", () => {
  const result = parse(
    `param1=\`abc\` param2=\`def\` third!=\`something\` hello world`,
  );
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
  const result = parse(`@dev hello world`);
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
  const result = parse(`@dev @prod hello world`);
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
