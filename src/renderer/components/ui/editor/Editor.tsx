import styled from "@emotion/styled";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { usePopper } from "react-popper";
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
    border: 1px solid #d2d6dc;
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
    border-color: var(--chakra-colors-border);
    --focus-ring-color: var(--chakra-colors-color-palette-focus-ring);
  }
`;

const TextareaCustom = styled.textarea`
  color: transparent;
  resize: none;

  width: 100%;
  min-width: 0;
  position: relative;

  background-color: transparent;
  border: none;
  caret-color: #fff;

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

export const Editor = React.forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange, suggestions, popperRoot, highlightData }, ref) => {
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

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      { name: "offset", options: { offset: [pos.left, -100 + pos.top] } },
    ],
  });

  const [cursorPosition, setCursorPosition] = useState(value.length);
  const [isCompleterOpen, setIsCompleterOpen] = useState(false);

  const [hoveredCompletionItem, setHoveredCompletionItem] = useState<number>(0);

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
      writtenWord ? suggestion.value.startsWith(writtenWord) : true
    );
  }, [suggestions, cursorPosition, writtenWord]);

  const acceptCompletion = () => {
    const startPos = cursorPosition - writtenWord.length;
    const endPos = startPos + filteredSuggestions[hoveredCompletionItem].value.length;
    onChange(
      value.slice(0, startPos) +
        filteredSuggestions[hoveredCompletionItem].value +
        value.slice(cursorPosition)
    );
    // set cursor position to end of the word
    setTimeout(() => {
      if (referenceElement) {
        referenceElement.selectionEnd = endPos;
      }
    }, 0)

    setIsCompleterOpen(false);
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
  }

  return (
    <EditorWrapper>
      <TextHighlighter value={value} highlightData={highlightData} ref={preElement}/>
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
              advanceHoveredItem();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              retreatHoveredItem();
            }

            if (e.key === "Enter") {
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

          const isCharAdded = e.target.value.length > value.length && !["\n", " "].includes(char);

          onChange(e.target.value);
          setCursorPosition(e.currentTarget.selectionStart);
          setIsCompleterOpen(isCharAdded);
          setHoveredCompletionItem(0);

          setPos(
            getCaretCoordinates(
              referenceElement,
              e.currentTarget.selectionStart
            )
          );
        }}
      />
      {isCompleterOpen &&
        popperRoot &&
        createPortal(
          <div
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <AutoCompleter
              suggestions={filteredSuggestions}
              hoveredItem={hoveredCompletionItem}
            />
          </div>,
          popperRoot
        )}
    </EditorWrapper>
  );
});



const lastIndexOfRegex = (word: string, regex: RegExp): number => {
  const match = word.search(regex);
  if (match === -1) return -1;
  
  const nextWord = word.slice(match + 1);
  if (regex.test(nextWord)) {
    return match + lastIndexOfRegex(nextWord, regex) + 1;
  }

  return match;
}
