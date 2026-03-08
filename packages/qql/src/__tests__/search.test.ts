import { expect, test } from "vitest";
import { parse } from "../index";

test("empty input", () => {
  expect(parse("")).toMatchObject({
    type: "query",
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: { type: "searchLiteral", tokens: [] },
      right: undefined,
    },
    pipeline: [],
  });
});

test("parser hello world", () => {
  expect(parse("hello world this is awesome").search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: ["hello", "world", "this", "is", "awesome"],
    },
  });
});

test("search term with or statements", () => {
  expect(parse("hello world OR something").search).toEqual({
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
  });
});

test("search term with or and and statements complex", () => {
  expect(
    parse("(hello world OR something) AND (another OR statement)").search,
  ).toEqual({
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
    },
  });
});

test("string", () => {
  expect(parse(`"hello world" token2 token3`).search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: ["hello world", "token2", "token3"],
    },
  });
});

test("integer", () => {
  expect(parse(`123 token`).search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [123, "token"],
    },
  });
});

test("multiple strings", () => {
  expect(parse(`"hello world" token2 "token3 hey there"`).search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: ["hello world", "token2", "token3 hey there"],
    },
  });
});

test("nested strings", () => {
  expect(parse(`"hello world \\"nested\\" string" token2`).search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [`hello world "nested" string`, "token2"],
    },
  });
});

test("strings with newlines", () => {
  expect(parse(`"hello world \nsomething" token2`).search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [`hello world \nsomething`, "token2"],
    },
  });
});

test("parsing uuid as string", () => {
  expect(parse(`hello 76e191f8-8ab6-4db7-9895-c1b6d188106c`)).toMatchObject({
    type: "query",
    dataSources: [],
    controllerParams: [],
    search: {
      type: "search",
      left: {
        type: "searchLiteral",
        tokens: ["hello", "76e191f8-8ab6-4db7-9895-c1b6d188106c"],
      },
    },
    pipeline: [],
  });
});
