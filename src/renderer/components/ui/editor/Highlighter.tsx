import styled from "@emotion/styled";
import React, { useMemo } from "react";

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
  highlightData: HighlightData[]
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
      return { color: "rgb(105, 105, 177)" };

    case "column":
      return { color: "rgb(105, 177, 105)" };

    case "string":
      return { color: "rgb(177, 105, 105)" };

    case "function":
      return { color: "rgb(177, 105, 177)" };
    
    case "booleanFunction":
      return { color: "rgb(177, 177, 105)" };

    case "error":
      return { color: "red", textDecoration: "wavy underline red" };

    case "param":
      return { color: "rgb(105, 177, 177)" };
    
    case "comment":
      return { color: "rgb(173, 196, 176)" };
  }

  return { color: "gray" };
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
    }
  );

  if (render.length === 0) {
    return text;
  }

  return render.reduce((prev, curr) => [prev, curr]);
};

export const TextHighlighter = React.forwardRef<HTMLPreElement, HighlighterProps>(({ value, highlightData }, ref) => {
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

  return <StyledPre ref={ref}>{renderChunks(textToRender, highlightData)}</StyledPre>;
});
