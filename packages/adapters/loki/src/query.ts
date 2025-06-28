import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import {
  buildSearchTreeCallback,
  SearchTreeBuilder,
} from "@cruncher/qql/searchTree";

import regexEscape from "regex-escape";

export const LIMIT = 5000;

export type LokiLabelFilter = {
  key: string;
  operator: string;
  value: string;
};

type SearchPattern = string;

const andStatementPattern = (literal: string, literal2: string) => {
  return `(?:${literal}.*${literal2}|${literal2}.*${literal})`;
};

const searchPatternTreeBuilder: SearchTreeBuilder<SearchPattern> = {
  buildAnd: (leftCallback, search) => {
    return (item) => {
      const leftRes = leftCallback(item);
      const rightRes = buildSearchTreeCallback(
        search.right,
        searchPatternTreeBuilder,
      )(item);
      return andStatementPattern(leftRes, rightRes);
    };
  },
  buildOr: (leftCallback, search) => {
    return (item) => {
      const leftRes = leftCallback(item);
      const rightRes = buildSearchTreeCallback(
        search.right,
        searchPatternTreeBuilder,
      )(item);
      return `(?:${leftRes}|${rightRes})`;
    };
  },
  buildLiteral: (searchLiteral) => {
    if (searchLiteral.tokens.length === 0) {
      return () => "";
    }
    return () =>
      searchLiteral.tokens
        .map((token) => regexEscape(String(token)))
        .reduce((res, current) => {
          if (res === "") {
            return current;
          }
          return andStatementPattern(res, current);
        }, "");
  },
};

const buildSearchPattern = (searchTerm: Search): SearchPattern => {
  return buildSearchTreeCallback(searchTerm, searchPatternTreeBuilder)("");
};

const escapeQuotes = (str: string) => {
  return str.replace(/"/g, '"');
};

const escapeBackslash = (str: string) => {
  return str.replace(/\\/g, "\\\\");
};

const composeLabelFilter = (
  filter: LokiLabelFilter[],
  controllerParams: ControllerIndexParam[],
) => {
  const filters: string[] = [];
  filter.forEach((f) => {
    filters.push(`${f.key}${f.operator}"${f.value}"`);
  });

  controllerParams.forEach((param) => {
    let operator = "=~";
    switch (param.operator) {
      case "=":
        operator = "=~";
        break;
      case "!=":
        operator = "!~";
        break;
      default:
        throw new Error(`Invalid operator - ${param.operator}`);
    }

    const value =
      param.value.type === "string" ? param.value.value : param.value.pattern;

    filters.push(
      `${param.name}${operator}"${escapeQuotes(escapeBackslash(value))}"`,
    );
  });

  return `{ ${filters.join(", ")} }`;
};

export const buildExpression = (
  baseFilter: LokiLabelFilter[],
  controllerParams: ControllerIndexParam[],
  search: Search,
  filterExtensions?: string[],
) => {
  const terms = [composeLabelFilter(baseFilter, controllerParams)];

  const pattern = buildSearchPattern(search);

  const fullPattern = escapeQuotes(escapeBackslash(pattern));
  console.log("fullPattern", fullPattern);

  terms.push(`|~ "${fullPattern}"`);

  terms.push("| json");

  if (filterExtensions) {
    terms.push(...(filterExtensions ?? []));
  }

  return terms.join("\n");
};
