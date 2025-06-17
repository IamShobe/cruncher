import { Search, SearchAND, SearchOR, SearchLiteral } from "~lib/qql/grammar";

export type SearchTreeCallback<T> = (item: string) => T;

export interface SearchTreeBuilder<T> {
  buildAnd(
    left: SearchTreeCallback<T>,
    search: SearchAND
  ): SearchTreeCallback<T>;
  buildOr(left: SearchTreeCallback<T>, search: SearchOR): SearchTreeCallback<T>;
  buildLiteral(searchLiteral: SearchLiteral): SearchTreeCallback<T>;
}

export function buildSearchTreeCallback<T>(
  searchTerm: Search,
  builder: SearchTreeBuilder<T>
): SearchTreeCallback<T> {
  const left = searchTerm.left;
  const right = searchTerm.right;

  let leftCallback: SearchTreeCallback<T>;
  switch (left.type) {
    case "search":
      leftCallback = buildSearchTreeCallback(left, builder);
      break;
    case "searchLiteral":
      leftCallback = builder.buildLiteral(left);
      break;
  }

  if (!right) {
    return leftCallback;
  }

  switch (right.type) {
    case "and":
      return builder.buildAnd(leftCallback, right);
    case "or":
      return builder.buildOr(leftCallback, right);
  }
}

export const booleanSearchTreeBuilder: SearchTreeBuilder<boolean> = {
  buildAnd: (leftCallback, search) => {
    return (item) => {
      const leftRes = leftCallback(item);
      if (!leftRes) return false;
      const rightRes = buildSearchTreeCallback(
        search.right,
        booleanSearchTreeBuilder
      )(item);
      return rightRes;
    };
  },
  buildOr: (leftCallback, search) => {
    return (item) => {
      const leftRes = leftCallback(item);
      if (leftRes) return true;
      const rightRes = buildSearchTreeCallback(
        search.right,
        booleanSearchTreeBuilder
      )(item);
      return rightRes;
    };
  },
  buildLiteral: (searchLiteral) => {
    if (searchLiteral.tokens.length === 0) {
      return () => true;
    }
    return (searchTerm) =>
      searchLiteral.tokens.every((token) => {
        return searchTerm.toLowerCase().includes(String(token).toLowerCase());
      });
  },
};

export type BooleanSearchCallback = (item: string) => boolean;

export const buildDoesLogMatchCallback = (
  searchTerm: Search
): BooleanSearchCallback => {
  return buildSearchTreeCallback(searchTerm, booleanSearchTreeBuilder);
};
