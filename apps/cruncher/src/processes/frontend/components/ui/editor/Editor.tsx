import styled from "@emotion/styled";
import { token } from "../system";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AutoCompleter, Suggestion } from "./AutoCompleter";
import { HighlightData, TextHighlighter } from "./Highlighter";
import { Coordinates, getCaretCoordinates } from "./getCoordinates";

const EditorWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  gap: 0;
  height: 130px;

  & pre,
  & textarea {
    grid-area: 1 / 1 / 2 / 2;
    /* overflow: hidden; */
    white-space: pre-wrap;
    overflow: auto;

    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      "system-ui",
      "Segoe UI",
      Roboto,
      "Helvetica Neue",
      Arial,
      "Noto Sans",
      sans-serif,
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Noto Color Emoji";
    border: 1px solid ${token("colors.border")};
    word-spacing: 0;
    letter-spacing: normal;
    /* font-size: 14px; */
    outline: 0;
    padding: 8px;
    -webkit-appearance: none;
    -moz-appearance: none;
    -ms-appearance: none;
    appearance: none;
    text-align: start;
    border-radius: var(--chakra-radii-l2);
    --focus-color: var(--chakra-colors-color-palette-focus-ring);
    --error-color: var(--chakra-colors-border-error);
    font-size: var(--chakra-font-sizes-md);
    line-height: 1.25rem;
    scroll-padding-bottom: var(--chakra-spacing-2);
    background: var(--chakra-colors-transparent);
    --bg-currentcolor: var(--chakra-colors-transparent);
    border-width: 1px;
    border-color: ${token("colors.border")};
    --focus-ring-color: var(--chakra-colors-color-palette-focus-ring);
  }
`;

const TokenTooltipPopup = styled.div`
  position: fixed;
  background-color: ${token("colors.bg")};
  border: 1px solid ${token("colors.border")};
  border-radius: ${token("radii.md")};
  padding: ${token("spacing.2")} ${token("spacing.3")};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 1001;
  max-width: 240px;
`;

const TokenTooltipType = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${token("colors.fg.muted")};
`;

const TokenTooltipDescription = styled.div`
  font-size: 0.8rem;
  color: ${token("colors.fg")};
  margin-top: ${token("spacing.1")};
`;

type TooltipContent = { label: string; description: string };

const getTooltipContent = (type: string, metadata?: string): TooltipContent | null => {
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

type HoveredToken = {
  type: string;
  metadata?: string;
  tokenCenterX: number;
  tokenBottom: number;
};

const TextareaCustom = styled.textarea`
  color: transparent;
  resize: none;

  width: 100%;
  min-width: 0;
  position: relative;

  background-color: transparent;
  border: none;
  caret-color: ${token("colors.fg")};

  &:focus-visible {
    outline-offset: 0px;
    outline-width: var(--focus-ring-width, 1px);
    outline-color: var(--focus-ring-color);
    outline-style: var(--focus-ring-style, solid);
    border-color: var(--focus-ring-color);
  }
`;

export type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: Suggestion[];
  highlightData: HighlightData[];
  popperRoot: Element | undefined | null;
};

export const Editor = React.forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ value, onChange, suggestions, popperRoot, highlightData }, ref) => {
    const [referenceElement, setReferenceElement] =
      React.useState<HTMLTextAreaElement | null>(null);

    const preElement = React.useRef<HTMLPreElement | null>(null);

    useEffect(() => {
      if (!referenceElement || !ref) return;

      referenceElement.setAttribute("spellcheck", "false");

      if (typeof ref === "function") {
        ref(referenceElement);
      } else {
        ref.current = referenceElement;
      }
    }, [referenceElement, ref]);

    const [pos, setPos] = useState<Coordinates>({
      top: 0,
      left: 0,
      height: 0,
    });

    const popperStyle = useMemo((): React.CSSProperties => {
      if (!referenceElement) return { display: "none" };
      const rect = referenceElement.getBoundingClientRect();
      return {
        position: "fixed",
        left: rect.left + pos.left,
        top: rect.top + pos.top + 20,
        zIndex: 1000,
      };
    }, [referenceElement, pos]);

    const [cursorPosition, setCursorPosition] = useState(value.length);
    const [isCompleterOpen, setIsCompleterOpen] = useState(false);
    const [hoveredToken, setHoveredToken] = useState<HoveredToken | null>(null);
    const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!preElement.current) {
          setHoveredToken(null);
          return;
        }
        const { clientX, clientY } = e;
        const spans =
          preElement.current.querySelectorAll<HTMLElement>(
            "span[data-token-type]",
          );
        for (const span of spans) {
          const rect = span.getBoundingClientRect();
          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            const type = span.dataset.tokenType!;
            const metadata = span.dataset.tokenMeta;
            if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
            tooltipTimerRef.current = setTimeout(() => {
              setHoveredToken({
                type,
                metadata,
                tokenCenterX: rect.left + rect.width / 2,
                tokenBottom: rect.bottom,
              });
            }, 400);
            return;
          }
        }
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
        setHoveredToken(null);
      },
      [],
    );

    const handleMouseLeave = useCallback(() => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      setHoveredToken(null);
    }, []);

    const [hoveredCompletionItem, setHoveredCompletionItem] =
      useState<number>(0);
    const [hasInteractedWithMenu, setHasInteractedWithMenu] = useState(false);

    const writtenWord = useMemo(() => {
      const text = value.slice(0, cursorPosition);
      const lastSpace = text.lastIndexOf(" ");
      let word = text.slice(lastSpace + 1, cursorPosition);
      // trim everything before special characters [a-zA-Z0-9_]
      const specialCharIndex = lastIndexOfRegex(word, /[^a-zA-Z0-9_\-]/);
      if (specialCharIndex !== -1) {
        word = word.slice(specialCharIndex + 1);
      }

      return word;
    }, [cursorPosition, value]);

    const filteredSuggestions = useMemo(() => {
      const results = new Set<Suggestion>();
      for (const suggestion of suggestions) {
        // filter suggestions based on cursor position
        if (cursorPosition < suggestion.fromPosition) continue;
        if (suggestion.toPosition && cursorPosition > suggestion.toPosition)
          continue;

        results.add(suggestion);
      }

      return Array.from(results).filter((suggestion) =>
        writtenWord ? suggestion.value.startsWith(writtenWord) : true,
      );
    }, [suggestions, cursorPosition, writtenWord]);

    const acceptCompletion = () => {
      const startPos = cursorPosition - writtenWord.length;
      const endPos =
        startPos + filteredSuggestions[hoveredCompletionItem].value.length;
      onChange(
        value.slice(0, startPos) +
          filteredSuggestions[hoveredCompletionItem].value +
          value.slice(cursorPosition),
      );
      // set cursor position to end of the word
      setTimeout(() => {
        if (referenceElement) {
          referenceElement.selectionEnd = endPos;
        }
      }, 0);

      setIsCompleterOpen(false);
      setHasInteractedWithMenu(false);
    };

    const advanceHoveredItem = () => {
      setHoveredCompletionItem((prev) => {
        if (prev === filteredSuggestions.length - 1) {
          return 0;
        }

        return prev + 1;
      });
    };

    const retreatHoveredItem = () => {
      setHoveredCompletionItem((prev) => {
        if (prev === 0) {
          return filteredSuggestions.length - 1;
        }

        return prev - 1;
      });
    };

    const syncScroll = () => {
      if (!referenceElement || !preElement.current) return;

      preElement.current.scrollTop = referenceElement.scrollTop;
      preElement.current.scrollLeft = referenceElement.scrollLeft;
    };

    return (
      <EditorWrapper>
        <TextHighlighter
          value={value}
          highlightData={highlightData}
          ref={preElement}
        />
        <TextareaCustom
          placeholder="Type your query here..."
          value={value}
          ref={setReferenceElement}
          data-1p-ignore="disabled"
          data-enable-grammarly="false"
          style={{
            position: "relative",
          }}
          onKeyDown={(e) => {
            // TODO move it to shortcuts system
            // if key is esc - close completer
            if (e.key === "Escape") {
              setIsCompleterOpen(false);
              setHasInteractedWithMenu(false);
            }
            if (e.key === " " && e.ctrlKey) {
              setIsCompleterOpen(true);
            }
            // if key is Tab - disable default behavior
            if (e.key === "Tab") {
              e.preventDefault();
            }

            if (isCompleterOpen && filteredSuggestions.length > 0) {
              // if open and down arrow - move selection down
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHasInteractedWithMenu(true);
                advanceHoveredItem();
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHasInteractedWithMenu(true);
                retreatHoveredItem();
              }

              if (e.key === "Enter" && hasInteractedWithMenu) {
                e.preventDefault();
                acceptCompletion();
              }

              // if key is Tab - accept completion
              if (e.key === "Tab") {
                acceptCompletion();
              }

              if (e.key === "Tab" && e.shiftKey) {
                e.preventDefault();
                retreatHoveredItem();
              } else if (e.key == "Tab") {
                e.preventDefault();
                advanceHoveredItem();
              }
            }

            setCursorPosition(e.currentTarget.selectionStart);
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onInput={() => {
            syncScroll();
          }}
          onScroll={() => {
            syncScroll();
          }}
          onChange={(e) => {
            if (!referenceElement) return;

            // check if char is in not \n
            const selectionStart = e.currentTarget.selectionStart;
            const char = e.target.value[selectionStart - 1]; // this is the char that was added

            const isCharAdded =
              e.target.value.length > value.length &&
              !["\n", " "].includes(char);

            onChange(e.target.value);
            setCursorPosition(e.currentTarget.selectionStart);
            setIsCompleterOpen(isCharAdded);
            setHoveredCompletionItem(0);
            setHasInteractedWithMenu(false);

            setPos(
              getCaretCoordinates(
                referenceElement,
                e.currentTarget.selectionStart,
              ),
            );
          }}
        />
        {isCompleterOpen &&
          popperRoot &&
          createPortal(
            <div style={popperStyle}>
              <AutoCompleter
                suggestions={filteredSuggestions}
                hoveredItem={hoveredCompletionItem}
              />
            </div>,
            popperRoot,
          )}
        {hoveredToken &&
          popperRoot &&
          (() => {
            const content = getTooltipContent(
              hoveredToken.type,
              hoveredToken.metadata,
            );
            if (!content) return null;
            return createPortal(
              <TokenTooltipPopup
                style={{
                  left: hoveredToken.tokenCenterX,
                  top: hoveredToken.tokenBottom + 4,
                  transform: "translateX(-50%)",
                }}
              >
                <TokenTooltipType>{content.label}</TokenTooltipType>
                <TokenTooltipDescription>{content.description}</TokenTooltipDescription>
              </TokenTooltipPopup>,
              popperRoot,
            );
          })()}
      </EditorWrapper>
    );
  },
);

const lastIndexOfRegex = (word: string, regex: RegExp): number => {
  const match = word.search(regex);
  if (match === -1) return -1;

  const nextWord = word.slice(match + 1);
  if (regex.test(nextWord)) {
    return match + lastIndexOfRegex(nextWord, regex) + 1;
  }

  return match;
};
