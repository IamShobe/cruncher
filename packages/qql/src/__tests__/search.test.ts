import { expect, test } from "vitest";
import { QQLLexer, QQLParser } from "../grammar";

test("parser hello world", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize("hello world this is awesome");
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: ["hello", "world", "this", "is", "awesome"],
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
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(
    "(hello world OR something) AND (another OR statement)",
  );
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
    },
  });
});

test("string", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`"hello world" token2 token3`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: ["hello world", "token2", "token3"],
    },
  });
});

test("integer", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`123 token`);
  expect(lexer.errors).toEqual([]);
  parser.input = lexer.tokens;
  expect(parser.query().search).toEqual({
    type: "search",
    left: {
      type: "searchLiteral",
      tokens: [123, "token"],
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
      tokens: ["hello world", "token2", "token3 hey there"],
    },
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
      tokens: [`hello world "nested" string`, "token2"],
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
      tokens: [`hello world \nsomething`, "token2"],
    },
  });
});

test("parsing uuid as string", () => {
  const parser = new QQLParser();

  const lexer = QQLLexer.tokenize(`hello 76e191f8-8ab6-4db7-9895-c1b6d188106c`);
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
        tokens: ["hello", "76e191f8-8ab6-4db7-9895-c1b6d188106c"],
      },
    },
    pipeline: [],
  });
});
