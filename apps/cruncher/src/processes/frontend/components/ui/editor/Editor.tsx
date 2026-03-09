import styled from "@emotion/styled";
import { token } from "../system";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  Badge,
  Box,
  Code,
  HStack,
  Icon,
  IconButton,
  Popover,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from "~components/presets/Tooltip";
import { Portal } from "~components/ui/portal";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useIdle } from "react-use";

import { AutoCompleter, compareSuggestions, Suggestion } from "./AutoCompleter";
import {
  HighlightData,
  LuExternalLink,
  TextHighlighter,
  TooltipContent,
  getTooltipContent,
} from "./Highlighter";
import { LuBug, LuLightbulb, LuLightbulbOff } from "react-icons/lu";
import { searcherShortcuts } from "~core/keymaps";
import { Coordinates, getCaretCoordinates } from "./getCoordinates";

export const idleHintsEnabledAtom = atomWithStorage(
  "cruncher:idleHintsEnabled",
  true,
);

const POPOVER_POSITIONING = { placement: "bottom" } as const;

const EditorWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  position: relative;
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

  & pre {
    z-index: 1;
  }

  & textarea {
    z-index: 2;
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
  onCopyAst?: () => void;
};

export const Editor = React.forwardRef<HTMLTextAreaElement, EditorProps>(
  (
    { value, onChange, suggestions, popperRoot, highlightData, onCopyAst },
    ref,
  ) => {
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
        zIndex: 9999,
      };
    }, [referenceElement, pos]);

    const [cursorPosition, setCursorPosition] = useState(value.length);
    const [isCompleterOpen, setIsCompleterOpen] = useState(false);

    const [hoveredCompletionItem, setHoveredCompletionItem] = useState<
      number | undefined
    >(undefined);
    const [hasInteractedWithMenu, setHasInteractedWithMenu] = useState(false);

    const ctrlSpaceOpenRef = useRef(false);

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
        if (
          suggestion.toPosition &&
          !ctrlSpaceOpenRef.current &&
          cursorPosition > suggestion.toPosition
        )
          continue;

        results.add(suggestion);
      }

      return Array.from(results)
        .filter((suggestion) => {
          if (!writtenWord) return true;
          // For quoted values like `"main"`, match the inner text when the user
          // hasn't typed the opening quote yet, or the full value when they have.
          const valueToMatch =
            suggestion.value.startsWith('"') && !writtenWord.startsWith('"')
              ? suggestion.value.slice(1, -1)
              : suggestion.value;
          return valueToMatch.startsWith(writtenWord);
        })
        .sort(compareSuggestions);
    }, [suggestions, cursorPosition, writtenWord]);

    const acceptCompletion = () => {
      let startPos = cursorPosition - writtenWord.length;
      const insertText = filteredSuggestions[hoveredCompletionItem ?? 0].value;
      // Avoid double-quoting: if the user already typed the opening `"` and
      // the completion also starts with `"`, roll back one extra character.
      if (
        startPos > 0 &&
        value[startPos - 1] === '"' &&
        insertText.startsWith('"')
      ) {
        startPos -= 1;
      }
      const endPos = startPos + insertText.length;
      onChange(
        value.slice(0, startPos) + insertText + value.slice(cursorPosition),
      );
      // set cursor position to end of the word
      setTimeout(() => {
        if (referenceElement) {
          referenceElement.selectionEnd = endPos;
        }
      }, 0);

      ctrlSpaceOpenRef.current = false;
      setIsCompleterOpen(false);
      setHasInteractedWithMenu(false);
    };

    const advanceHoveredItem = () => {
      setHoveredCompletionItem((prev) => {
        const current = prev ?? -1;
        return current === filteredSuggestions.length - 1 ? 0 : current + 1;
      });
    };

    const retreatHoveredItem = () => {
      setHoveredCompletionItem((prev) => {
        const current = prev ?? filteredSuggestions.length;
        return current === 0 ? filteredSuggestions.length - 1 : current - 1;
      });
    };

    const ghostTextInfo = useMemo(() => {
      if (!isCompleterOpen || filteredSuggestions.length === 0)
        return undefined;
      const suggestion = filteredSuggestions[hoveredCompletionItem ?? 0];
      if (!suggestion) return undefined;

      const sv = suggestion.value;
      let ghost: string;
      if (sv.startsWith('"') && !writtenWord.startsWith('"')) {
        // Suggestion is quoted but user hasn't typed the opening quote yet.
        // Nothing typed: show the full quoted value (the `"` will be inserted too).
        // Some chars typed: show the inner suffix + closing quote.
        if (writtenWord.length === 0) {
          ghost = sv;
        } else {
          ghost = sv.slice(1, -1).slice(writtenWord.length) + '"';
        }
      } else {
        ghost = sv.slice(writtenWord.length);
      }

      if (!ghost) return undefined;
      return { text: ghost, offset: cursorPosition };
    }, [
      isCompleterOpen,
      filteredSuggestions,
      hoveredCompletionItem,
      writtenWord,
      cursorPosition,
    ]);

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [tokenContent, setTokenContent] = useState<TooltipContent | null>(
      null,
    );
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const openTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const dismissAutoHintTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const isAutoHintRef = useRef(false);
    const [idleHintsEnabled, setIdleHintsEnabled] =
      useAtom(idleHintsEnabledAtom);

    // Kept in refs so timer callbacks always see the latest values without
    // needing to be recreated on every render.
    const highlightDataRef = useRef(highlightData);
    const idleHintsEnabledRef = useRef(idleHintsEnabled);
    idleHintsEnabledRef.current = idleHintsEnabled;
    highlightDataRef.current = highlightData;
    const cursorPosRef = useRef(cursorPosition);
    cursorPosRef.current = cursorPosition;
    const referenceElementRef = useRef<HTMLTextAreaElement | null>(null);
    referenceElementRef.current = referenceElement;
    const isFocusedRef = useRef(false);

    useEffect(
      () => () => {
        clearTimeout(closeTimerRef.current);
        clearTimeout(openTimerRef.current);
        clearTimeout(dismissAutoHintTimerRef.current);
      },
      [],
    );

    const anchorStyle = useMemo((): CSSProperties => {
      if (!anchorRect)
        return {
          position: "fixed",
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          pointerEvents: "none",
          opacity: 0,
        };
      return {
        position: "fixed",
        left: anchorRect.left,
        top: anchorRect.top,
        width: anchorRect.width,
        height: anchorRect.height,
        pointerEvents: "none",
        opacity: 0,
      };
    }, [anchorRect]);

    const scheduleClose = useCallback(() => {
      closeTimerRef.current = setTimeout(() => setPopoverOpen(false), 400);
    }, []);

    const cancelClose = useCallback(() => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(dismissAutoHintTimerRef.current);
    }, []);

    const cancelOpen = useCallback(() => {
      clearTimeout(openTimerRef.current);
    }, []);

    const showHintAtCursor = useCallback(() => {
      if (!idleHintsEnabledRef.current) return;
      const cursor = cursorPosRef.current;
      const hd = highlightDataRef.current;
      const el = referenceElementRef.current;
      if (!el || !hd.length) return;

      const sorted = [...hd].sort(
        (a, b) => a.token.startOffset - b.token.startOffset,
      );
      const token =
        sorted.find(
          (h) =>
            cursor >= h.token.startOffset &&
            cursor <= (h.token.endOffset ?? h.token.startOffset),
        ) ??
        [...sorted].reverse().find((h) => h.token.startOffset < cursor) ??
        sorted.find((h) => h.token.startOffset > cursor);

      if (!token) return;
      const content = getTooltipContent(token.type, token.metadata);
      if (!content) return;

      const tokenMid = Math.floor(
        (token.token.startOffset +
          (token.token.endOffset ?? token.token.startOffset)) /
          2,
      );
      const caretPos = getCaretCoordinates(el, tokenMid);
      const textareaRect = el.getBoundingClientRect();
      const rect = new DOMRect(
        textareaRect.left + caretPos.left - el.scrollLeft,
        textareaRect.top + caretPos.top - el.scrollTop,
        1,
        caretPos.height,
      );
      cancelOpen();
      cancelClose();
      setAnchorRect(rect);
      setTokenContent(content);
      setPopoverOpen(true);
      isAutoHintRef.current = true;
    }, [cancelOpen, cancelClose]);

    const dismissAutoHint = useCallback(() => {
      if (isAutoHintRef.current) {
        setPopoverOpen(false);
        isAutoHintRef.current = false;
      }
    }, []);

    const isIdle = useIdle(2_000);

    useEffect(() => {
      if (isIdle && isFocusedRef.current) {
        clearTimeout(dismissAutoHintTimerRef.current);
        showHintAtCursor();
      } else {
        dismissAutoHintTimerRef.current = setTimeout(dismissAutoHint, 600);
      }
    }, [isIdle, showHintAtCursor, dismissAutoHint]);

    const handlePopoverOpenChange = useCallback(
      ({ open }: { open: boolean }) => {
        setPopoverOpen(open);
      },
      [],
    );

    const getInitialFocusEl = useCallback(
      () => referenceElementRef.current,
      [],
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!preElement.current) return;
        const spans =
          preElement.current.querySelectorAll<HTMLElement>("[data-token-type]");
        for (const span of spans) {
          const rect = span.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            const type = span.getAttribute("data-token-type") ?? "";
            const metadata =
              span.getAttribute("data-token-metadata") ?? undefined;
            const content = getTooltipContent(type, metadata);
            if (content) {
              cancelClose();
              const isSameToken =
                anchorRect?.left === rect.left && anchorRect?.top === rect.top;
              if (!isSameToken || !popoverOpen) {
                cancelOpen();
                setAnchorRect(rect);
                setTokenContent(content);
                openTimerRef.current = setTimeout(
                  () => setPopoverOpen(true),
                  700,
                );
              }
            } else {
              cancelOpen();
            }
            return;
          }
        }
        // Mouse is over a non-token area inside the textarea — cancel any
        // pending open but leave an already-open popover alone so the user
        // can move toward it without it closing.
        cancelOpen();
      },
      [cancelClose, cancelOpen, popoverOpen, anchorRect],
    );

    const [isEditorHovered, setIsEditorHovered] = useState(false);

    const syncScroll = () => {
      if (!referenceElement || !preElement.current) return;

      preElement.current.scrollTop = referenceElement.scrollTop;
      preElement.current.scrollLeft = referenceElement.scrollLeft;
    };

    return (
      <EditorWrapper
        onMouseEnter={() => setIsEditorHovered(true)}
        onMouseLeave={() => setIsEditorHovered(false)}
      >
        <TextareaCustom
          placeholder={ghostTextInfo ? "" : "Type your query here..."}
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
              ctrlSpaceOpenRef.current = false;
              setIsCompleterOpen(false);
              setHasInteractedWithMenu(false);
            }
            if (e.key === " " && e.ctrlKey) {
              ctrlSpaceOpenRef.current = true;
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
          }}
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            dismissAutoHint();
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            cancelOpen();
            scheduleClose();
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

            const isCharAdded =
              e.target.value.length > value.length &&
              !["\n", " "].includes(char);

            // Also open on space if there are suggestions that start exactly at
            // the new cursor position (e.g. after a complete controller param).
            const isSpaceAdded =
              e.target.value.length > value.length && char === " ";
            const hasFreshSuggestions =
              isSpaceAdded &&
              suggestions.some((s) => s.fromPosition === selectionStart);

            dismissAutoHint();
            onChange(e.target.value);
            setCursorPosition(e.currentTarget.selectionStart);
            if (!isCharAdded && !hasFreshSuggestions) {
              ctrlSpaceOpenRef.current = false;
            }
            setIsCompleterOpen(isCharAdded || hasFreshSuggestions);
            setHoveredCompletionItem(undefined);
            setHasInteractedWithMenu(false);

            setPos(
              getCaretCoordinates(
                referenceElement,
                e.currentTarget.selectionStart,
              ),
            );
          }}
        />
        <TextHighlighter
          value={value}
          highlightData={highlightData}
          ref={preElement}
          ghostText={ghostTextInfo?.text}
          ghostTextOffset={ghostTextInfo?.offset}
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
        <Popover.Root
          open={popoverOpen}
          onOpenChange={handlePopoverOpenChange}
          positioning={POPOVER_POSITIONING}
          closeOnInteractOutside={false}
          initialFocusEl={getInitialFocusEl}
          lazyMount
          unmountOnExit
        >
          <Popover.Trigger asChild>
            <div style={anchorStyle} />
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                <Popover.Arrow />
                <Popover.Body>
                  {tokenContent && (
                    <>
                      <HStack gap="2" mb="2" align="center">
                        <Icon
                          as={tokenContent.icon}
                          boxSize="4"
                          color="fg.muted"
                        />
                        <Text fontWeight="semibold" fontSize="sm" color="fg">
                          {tokenContent.label}
                        </Text>
                        {tokenContent.badge && (
                          <Badge size="sm" variant="subtle" colorPalette="blue">
                            {tokenContent.badge}
                          </Badge>
                        )}
                        {tokenContent.docsUrl && (
                          <Tooltip text="Open documentation" openDelay={400}>
                            <IconButton
                              aria-label="Open documentation"
                              size="2xs"
                              variant="ghost"
                              colorPalette="blue"
                              ms="auto"
                              onClick={() =>
                                window.electronAPI.openExternal(
                                  tokenContent.docsUrl!,
                                )
                              }
                            >
                              <Icon as={LuExternalLink} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </HStack>
                      {tokenContent.syntax && (
                        <Box mb="2">
                          <Code
                            fontSize="xs"
                            px="2"
                            py="1"
                            borderRadius="md"
                            display="block"
                            whiteSpace="pre-wrap"
                            colorPalette="gray"
                          >
                            {tokenContent.syntax}
                          </Code>
                        </Box>
                      )}
                      <Text fontSize="sm" color="fg.muted" lineHeight="1.5">
                        {tokenContent.description}
                      </Text>
                    </>
                  )}
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 3,
            display: "flex",
            gap: 2,
          }}
        >
          {onCopyAst && isEditorHovered && (
            <Tooltip text="Copy AST (debug)" position="left">
              <IconButton
                aria-label="Copy AST (debug)"
                size="2xs"
                variant="ghost"
                onClick={onCopyAst}
              >
                <LuBug />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip
            text={idleHintsEnabled ? "Idle hints on" : "Idle hints off"}
            shortcut={searcherShortcuts.getAlias("toggle-idle-hints")}
            position="left"
          >
            <IconButton
              aria-label={
                idleHintsEnabled ? "Disable idle hints" : "Enable idle hints"
              }
              size="2xs"
              variant="ghost"
              colorPalette={idleHintsEnabled ? "yellow" : "gray"}
              onClick={() => setIdleHintsEnabled((v) => !v)}
            >
              {idleHintsEnabled ? <LuLightbulb /> : <LuLightbulbOff />}
            </IconButton>
          </Tooltip>
        </div>
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
