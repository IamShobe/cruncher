import styled from "@emotion/styled";
import React, { useMemo } from "react";
import { token } from "../system";

const StyledPre = styled.pre`
  /* background-color: #f8f8f8; */
`;

export type HighlightData = {
  type: string;
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

const renderChunks = (text: string, highlightData: HighlightData[]) => {
  const render = splitTextToChunks(text, highlightData).map<React.ReactNode>(
    (chunk, index) => {
      if (typeof chunk === "string") {
        return chunk;
      }

      const style = typeToStyle(chunk.type);

      return (
        <span key={index} style={style}>
          {chunk.value}
        </span>
      );
    },
  );

  if (render.length === 0) {
    return text;
  }

  return render.reduce((prev, curr) => [prev, curr]);
};

export const TextHighlighter = React.forwardRef<
  HTMLPreElement,
  HighlighterProps
>(({ value, highlightData }, ref) => {
  const textToRender = useMemo(() => {
    let text = value;
    if (text[text.length - 1] == "\n") {
      // If the last character is a newline character
      text += " "; // Add a placeholder space character to the final line
    }
    // Update code
    return text
      .replace(new RegExp("&", "g"), "&")
      .replace(new RegExp("<", "g"), "<"); /* Global RegExp */
  }, [value]);

  return (
    <StyledPre ref={ref}>{renderChunks(textToRender, highlightData)}</StyledPre>
  );
});
