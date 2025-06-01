import { ControllerIndexParam, Search, SearchAND, SearchLiteral, SearchOR } from "~lib/qql/grammar";

import regexEscape from "regex-escape";
import { GrafanaLabelFilter } from "./types";

export const LIMIT = 5000;

type SearchPattern = string;

const andStatementPattern = (literal: string, literal2: string) => {
  return `(?:${literal}.*${literal2}|${literal2}.*${literal})`;
}

const buildSearchAndPattern = (leftPattern: SearchPattern, search: SearchAND) => {
    const leftRes = leftPattern

    const rightRes = buildSearchPattern(search.right);

    return andStatementPattern(leftRes, rightRes);
}

const buildSearchOrPattern = (leftPattern: SearchPattern, search: SearchOR) => {

  const leftRes = leftPattern;

  const rightRes = buildSearchPattern(search.right);

  return `(?:${leftRes}|${rightRes})`;
}

const buildSearchLiteralCallback = (searchLiteral: SearchLiteral) => {
  if (searchLiteral.tokens.length === 0) {
    return "";
  }

  return searchLiteral.tokens.map((token) => regexEscape(String(token))).reduce((res, current) => {
    if (res === "") {
      return current
    }

    return andStatementPattern(res, current);
  }, "");
}


const buildSearchPattern = (searchTerm: Search) => {
  const left = searchTerm.left;
  const right = searchTerm.right;

  let leftPattern: SearchPattern;
  switch (left.type) {
    case "search":
      leftPattern = buildSearchPattern(left);
      break;
    case "searchLiteral":
      leftPattern = buildSearchLiteralCallback(left);
      break;
  }

  if (!right) {
    return leftPattern;
  }

  let rightCallback: SearchPattern;
  switch (right.type) {
    case "and":
      rightCallback = buildSearchAndPattern(leftPattern, right);
      break;
    case "or":
      rightCallback = buildSearchOrPattern(leftPattern, right);
      break;
  }

  return rightCallback;
}

const escapeQuotes = (str: string) => {
  return str.replace(/"/g, "\"");
}

const escapeBackslash = (str: string) => {
  return str.replace(/\\/g, "\\\\");
}

const composeLabelFilter = (filter: GrafanaLabelFilter[], controllerParams: ControllerIndexParam[]) => {
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

    filters.push(`${param.name}${operator}"${escapeQuotes(escapeBackslash(param.value))}"`);
  });

  return `{ ${filters.join(", ")} }`;
};

const buildExpression = (baseFilter: GrafanaLabelFilter[], controllerParams: ControllerIndexParam[], search: Search, filterExtensions?: string[]) => {
  const terms = [
    composeLabelFilter(baseFilter, controllerParams),
  ];

  const pattern = buildSearchPattern(search);

  const fullPattern = escapeQuotes(escapeBackslash(pattern));
  console.log("fullPattern", fullPattern);

  terms.push(`|~ "${fullPattern}"`);

  terms.push(
    "| json",
  );

  if (filterExtensions) {
    terms.push(...(filterExtensions ?? []));
  }

  return terms.join("\n");
};

export const buildQuery = (uid: string, baseFilter: GrafanaLabelFilter[], controllerParams: ControllerIndexParam[], search: Search, fromTime: Date, toTime: Date, filterExtensions?: string[]) => {
  return {
    queries: [
      {
        refId: "A",
        expr: buildExpression(baseFilter, controllerParams, search, filterExtensions),
        queryType: "range",
        datasource: {
          type: "loki",
          uid: uid,
        },
        editorMode: "code",
        maxLines: LIMIT,
        step: "",
        legendFormat: "",
        datasourceId: 7,
        intervalMs: 60000,
        maxDataPoints: 1002,
      },
    ],
    from: fromTime.getTime().toString(),
    to: toTime.getTime().toString(),
  };
};
