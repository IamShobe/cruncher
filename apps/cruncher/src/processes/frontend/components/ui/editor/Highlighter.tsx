import styled from "@emotion/styled";
import React, { useMemo } from "react";
import { token } from "../system";
import {
  LuTable2,
  LuChartBar,
  LuFilter,
  LuArrowUpDown,
  LuSquareFunction,
  LuRegex,
  LuChartLine,
  LuPackageOpen,
  LuHash,
  LuType,
  LuToggleLeft,
  LuCode,
  LuGitBranchPlus,
  LuDatabase,
  LuTriangleAlert,
  LuSettings2,
  LuTag,
  LuSplit,
  LuExternalLink,
} from "react-icons/lu";

export { LuExternalLink };

const StyledPre = styled.pre`
  pointer-events: none;
`;

export type HighlightData = {
  type: string;
  metadata?: string;
  token: {
    startOffset: number;
    endOffset: number | undefined;
  };
};

export type HighlighterProps = {
  value: string;
  highlightData: HighlightData[];
};

type HighlightedText = {
  type: string;
  value: string;
  metadata?: string;
};

export const splitTextToChunks = (
  text: string,
  highlightData: HighlightData[],
) => {
  const result: (string | HighlightedText)[] = [];

  // sort highlight data by start offset
  highlightData.sort((a, b) => a.token.startOffset - b.token.startOffset);

  let currentIndex = 0;
  highlightData.forEach((data) => {
    const { startOffset, endOffset } = data.token;

    if (
      startOffset === undefined ||
      Number.isNaN(startOffset) ||
      endOffset === undefined ||
      Number.isNaN(endOffset) ||
      endOffset < startOffset
    ) {
      return;
    }

    // Skip spans that fall within already-processed range
    if (currentIndex > startOffset) {
      return;
    }

    // Add the text before the token (if any)
    if (currentIndex < startOffset) {
      result.push(text.slice(currentIndex, startOffset));
    }

    // Add the token text
    result.push({
      type: data.type,
      value: text.slice(startOffset, (endOffset ?? startOffset) + 1),
      metadata: data.metadata,
    });

    // Update the current index to the end of the token
    currentIndex = (endOffset ?? startOffset) + 1;
  });

  // Add any remaining text after the last token
  if (currentIndex < text.length) {
    result.push(text.slice(currentIndex));
  }

  return result;
};

const typeToStyle = (type: string) => {
  switch (type) {
    case "keyword":
      return { color: token("colors.syntax.keyword") };

    case "column":
      return { color: token("colors.syntax.column") };

    case "string":
      return { color: token("colors.syntax.string") };

    case "function":
      return { color: token("colors.syntax.function") };

    case "booleanFunction":
      return { color: token("colors.syntax.boolean") };

    case "number":
      return { color: token("colors.syntax.number") };

    case "operator":
      return { color: token("colors.syntax.operator") };

    case "regex":
      return { color: token("colors.syntax.regex") };

    case "error":
      return {
        color: token("colors.log.error"),
        textDecoration: `wavy underline ${token("colors.log.error")}`,
      };

    case "param":
      return { color: token("colors.syntax.param") };

    case "index":
      return { color: token("colors.syntax.index") };

    case "pipe":
      return { color: token("colors.syntax.pipe") };

    case "comment":
      return { color: token("colors.syntax.comment") };
  }

  return { color: token("colors.syntax.default") };
};

export type TooltipContent = {
  icon: React.ElementType;
  label: string;
  badge?: string;
  syntax?: string;
  description: string;
  docsUrl?: string;
};

const DOCS_BASE = "https://cruncher.iamshobe.com";

const COMMAND_DOCS: Record<string, Omit<TooltipContent, "icon">> = {
  "cmd:table": {
    label: "table",
    badge: "Command",
    syntax: "table <col> [as <alias>], ...",
    description:
      "Selects and reorders columns in the result set. Use `as` to rename a column.",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/table/`,
  },
  "cmd:stats": {
    label: "stats",
    badge: "Command",
    syntax: "stats <fn>(<col>) [as <alias>] [by <col>, ...]",
    description:
      "Aggregates results using functions like count, sum, avg, min, max. Group with `by`.",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/stats/`,
  },
  "cmd:where": {
    label: "where",
    badge: "Command",
    syntax: "where <expression>",
    description:
      "Filters events by a boolean expression. Supports ==, !=, <, >, and, or, not, in(...).",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/where/`,
  },
  "cmd:sort": {
    label: "sort",
    badge: "Command",
    syntax: "sort <col> [asc|desc], ...",
    description:
      "Orders results by one or more columns. Default order is ascending.",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/sort/`,
  },
  "cmd:eval": {
    label: "eval",
    badge: "Command",
    syntax: "eval <name> = <expression>",
    description:
      "Creates or overwrites a field using an expression, arithmetic, or if/case logic.",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/eval/`,
  },
  "cmd:regex": {
    label: "regex",
    badge: "Command",
    syntax: "regex [<field> =] `<pattern>`",
    description:
      "Filters events where a field matches a regular expression. Omit the field to match against the raw event.",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/regex/`,
  },
  "cmd:timechart": {
    label: "timechart",
    badge: "Command",
    syntax: "timechart [span=<interval>] <fn>(<col>) [by <col>]",
    description:
      "Aggregates events over time buckets for charting. Use `span` to control the bucket size.",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/timechart/`,
  },
  "cmd:unpack": {
    label: "unpack",
    badge: "Command",
    syntax: "unpack <field>",
    description:
      "Expands a JSON object stored in a field, promoting its keys as top-level fields.",
    docsUrl: `${DOCS_BASE}/qql-reference/commands/unpack/`,
  },
};

export const getTooltipContent = (
  type: string,
  metadata?: string,
): TooltipContent | null => {
  // Command keywords with rich per-command docs
  if (type === "keyword" && metadata && metadata.startsWith("cmd:")) {
    const doc = COMMAND_DOCS[metadata];
    if (doc) return { icon: COMMAND_ICONS[metadata] ?? LuCode, ...doc };
  }

  switch (type) {
    case "keyword":
      return {
        icon: LuCode,
        label: "Keyword",
        description: "A QQL language keyword that controls query structure.",
      };
    case "column":
      return {
        icon: LuTag,
        label: "Column",
        description: "Reference to a field or column in the event data.",
      };
    case "string":
      return {
        icon: LuType,
        label: "String",
        description: "A quoted string literal value.",
      };
    case "function":
      return {
        icon: LuSquareFunction,
        label: "Function",
        description:
          "An aggregation or transformation function (e.g. count, sum, avg).",
      };
    case "booleanFunction":
      return {
        icon: LuToggleLeft,
        label: "Boolean Function",
        description: "A function that returns true or false.",
      };
    case "number":
      return {
        icon: LuHash,
        label: "Number",
        description: "A numeric literal value (integer or float).",
      };
    case "operator":
      return {
        icon: LuGitBranchPlus,
        label: "Operator",
        description:
          "A comparison (==, !=, <, >) or logical (and, or, not) operator.",
      };
    case "regex":
      return {
        icon: LuRegex,
        label: "Regex",
        description: "A regular expression pattern enclosed in backticks.",
      };
    case "error":
      return {
        icon: LuTriangleAlert,
        label: "Syntax Error",
        description: metadata ?? "Unexpected token — check your query syntax.",
      };
    case "param":
      return {
        icon: LuSettings2,
        label: "Parameter",
        description:
          "A controller parameter that filters the data source (e.g. index=main).",
      };
    case "index":
      return {
        icon: LuSettings2,
        label: "Index Value",
        description: "The value of a controller parameter.",
      };
    case "pipe":
      return {
        icon: LuSplit,
        label: "Pipeline",
        description:
          "Separates pipeline commands. Each command transforms the results of the previous.",
      };
    case "datasource":
      return {
        icon: LuDatabase,
        label: "Datasource",
        description: "Selects the data source to query (prefixed with @).",
      };
    case "identifier":
      return {
        icon: LuTag,
        label: "Identifier",
        description: "A bare word used as a field name or search token.",
      };
    case "comment":
      return {
        icon: LuCode,
        label: "Comment",
        description: "Ignored by the parser. Use // to start a comment.",
      };
    default:
      return null;
  }
};

const COMMAND_ICONS: Record<string, React.ElementType> = {
  "cmd:table": LuTable2,
  "cmd:stats": LuChartBar,
  "cmd:where": LuFilter,
  "cmd:sort": LuArrowUpDown,
  "cmd:eval": LuSquareFunction,
  "cmd:regex": LuRegex,
  "cmd:timechart": LuChartLine,
  "cmd:unpack": LuPackageOpen,
};

const TokenSpan = styled.span`
  pointer-events: none;
`;

const renderChunks = (text: string, highlightData: HighlightData[]) => {
  const nodes = splitTextToChunks(text, highlightData).map<React.ReactNode>(
    (chunk, index) => {
      if (typeof chunk === "string") {
        return chunk;
      }

      const style = typeToStyle(chunk.type);

      return (
        <TokenSpan
          key={index}
          style={style}
          data-token-type={chunk.type}
          data-token-metadata={chunk.metadata}
        >
          {chunk.value}
        </TokenSpan>
      );
    },
  );

  if (nodes.length === 0) return text;
  return nodes.reduce((prev, curr) => [prev, curr]);
};

export const TextHighlighter = React.forwardRef<
  HTMLPreElement,
  HighlighterProps
>(({ value, highlightData }, ref) => {
  const displayText = useMemo(() => {
    let text = value;
    if (text[text.length - 1] == "\n") {
      text += " ";
    }
    return text;
  }, [value]);

  return (
    <StyledPre ref={ref}>{renderChunks(displayText, highlightData)}</StyledPre>
  );
});
