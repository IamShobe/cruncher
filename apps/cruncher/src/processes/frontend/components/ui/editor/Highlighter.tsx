import styled from "@emotion/styled";
import React, { useMemo } from "react";
import { token } from "../system";

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
  ghostText?: string;
  ghostTextOffset?: number;
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
      Number.isNaN(endOffset)
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

type TooltipContent = { label: string; description: string };

export const getTooltipContent = (type: string, metadata?: string): TooltipContent | null => {
  switch (type) {
    case "keyword":
      return { label: "Keyword", description: "QQL language keyword" };
    case "column":
      return { label: "Column", description: "Reference to a field or column" };
    case "string":
      return { label: "String", description: "String literal value" };
    case "function":
      return { label: "Function", description: "Aggregation or transformation function" };
    case "booleanFunction":
      return { label: "Boolean Function", description: "Function returning a boolean" };
    case "number":
      return { label: "Number", description: "Numeric literal value" };
    case "operator":
      return { label: "Operator", description: "Comparison or logical operator" };
    case "regex":
      return { label: "Regex", description: "Regular expression pattern" };
    case "error":
      return { label: "Syntax Error", description: metadata ?? "Unexpected token" };
    case "param":
      return { label: "Parameter", description: "Query parameter name" };
    case "index":
      return { label: "Index Value", description: "Parameter or index value" };
    case "pipe":
      return { label: "Pipeline", description: "Separates pipeline commands" };
    case "datasource":
      return { label: "Datasource", description: "Data source selector" };
    case "identifier":
      return { label: "Identifier", description: "Field or token identifier" };
    case "comment":
      return { label: "Comment", description: "Ignored by the parser" };
    default:
      return null;
  }
};

const TokenSpan = styled.span`
  pointer-events: none;
`;

const GhostSpan = styled.span`
  opacity: 0.35;
  pointer-events: none;
`;

const renderChunks = (
  text: string,
  highlightData: HighlightData[],
) => {
  const nodes = splitTextToChunks(text, highlightData).map<React.ReactNode>(
    (chunk, index) => {
      if (typeof chunk === "string") {
        return chunk;
      }

      if (chunk.type === "ghost") {
        return <GhostSpan key={index}>{chunk.value}</GhostSpan>;
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
>(({ value, highlightData, ghostText, ghostTextOffset }, ref) => {
  const { displayText, displayHighlightData } = useMemo(() => {
    let text = value;
    if (text[text.length - 1] == "\n") {
      text += " ";
    }

    // Insert ghost text at the cursor offset and shift token offsets accordingly
    let data = highlightData;
    if (ghostText && ghostTextOffset !== undefined && ghostText.length > 0) {
      text =
        text.slice(0, ghostTextOffset) + ghostText + text.slice(ghostTextOffset);

      const ghostLen = ghostText.length;
      data = [
        ...highlightData.map((h) => {
          if (h.token.startOffset < ghostTextOffset) return h;
          return {
            ...h,
            token: {
              startOffset: h.token.startOffset + ghostLen,
              endOffset:
                h.token.endOffset !== undefined
                  ? h.token.endOffset + ghostLen
                  : undefined,
            },
          };
        }),
        {
          type: "ghost",
          token: {
            startOffset: ghostTextOffset,
            endOffset: ghostTextOffset + ghostLen - 1,
          },
        },
      ];
    }

    // Entity-encode after all text manipulation
    text = text
      .replace(new RegExp("&", "g"), "&amp;")
      .replace(new RegExp("<", "g"), "&lt;");

    return { displayText: text, displayHighlightData: data };
  }, [value, highlightData, ghostText, ghostTextOffset]);

  return (
    <StyledPre ref={ref}>{renderChunks(displayText, displayHighlightData)}</StyledPre>
  );
});
