import { Card } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { token } from "../system";
import { useEffect, useRef } from "react";
import { AiOutlineFunction } from "react-icons/ai";
import {
  VscSymbolKeyword,
  VscSymbolNamespace,
  VscSymbolParameter,
  VscSymbolVariable,
} from "react-icons/vsc";

export type Suggestion = {
  type: "keyword" | "function" | "variable" | "param" | "controllerParam";
  value: string;
  fromPosition: number;
  toPosition?: number;
};

const SUGGESTION_PRIORITY: Partial<Record<Suggestion["type"], number>> = {
  keyword: 0,
  function: 1,
  param: 2,
  controllerParam: 3,
  variable: 4,
};

export const compareSuggestions = (a: Suggestion, b: Suggestion): number => {
  const pa = SUGGESTION_PRIORITY[a.type] ?? 99;
  const pb = SUGGESTION_PRIORITY[b.type] ?? 99;
  return pa - pb;
};

export type AutoCompleterProps = {
  suggestions: Suggestion[];
  hoveredItem?: number;
};

const SUGGESTION_COLOR: Record<Suggestion["type"], string> = {
  keyword: token("colors.syntax.keyword"),
  function: token("colors.syntax.function"),
  variable: token("colors.syntax.column"),
  param: token("colors.syntax.param"),
  controllerParam: token("colors.syntax.param"),
};

const getSuggestionIcon = (suggestion: Suggestion) => {
  switch (suggestion.type) {
    case "keyword":
      return <VscSymbolKeyword />;
    case "function":
      return <AiOutlineFunction />;
    case "variable":
      return <VscSymbolVariable />;
    case "param":
      return <VscSymbolParameter />;
    case "controllerParam":
      return <VscSymbolNamespace />;
  }
};


export const AutoCompleter = ({
  suggestions,
  hoveredItem,
}: AutoCompleterProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // scroll to hovered item
  useEffect(() => {
    if (!scrollerRef.current || hoveredItem === undefined) return;

    const element = scrollerRef.current.children[hoveredItem];
    if (!element) return;
    element.scrollIntoView();
  }, [hoveredItem]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card.Root
      width="200px"
      overflow="hidden"
      zIndex={1}
      bg="bg.muted"
      borderWidth="1px"
      borderColor="border"
      color="fg"
    >
      <Card.Body
        ref={scrollerRef}
        padding="0"
        fontSize="sm"
        lineHeight={1}
        overflow="auto"
        maxH={100}
      >
        {suggestions
          .map((suggestion, index) => (
            <span
              css={css`
                padding: 0.2rem 0.6rem;
                display: flex;
                gap: 5px;
                ${
                  hoveredItem === index &&
                  css`
                    background-color: ${token("colors.accent.subtle")};
                    color: ${token("colors.accent.muted")};
                  `
                }
              `}
              key={index}
            >
              <span
                css={css`
                  flex-shrink: 0;
                  color: ${SUGGESTION_COLOR[suggestion.type]};
                `}
              >
                {getSuggestionIcon(suggestion)}
              </span>
              {suggestion.value}
            </span>
          ))}
      </Card.Body>
    </Card.Root>
  );
};
