import styled from "@emotion/styled";
import { token } from "../system";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebouncer } from "@tanstack/react-pacer";
import { createPortal } from "react-dom";
import {
  Badge,
  Box,
  Code,
  HStack,
  Icon,
  IconButton,
  Menu,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from "~components/presets/Tooltip";
import { Portal } from "~components/ui/portal";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useIdle, useLatest } from "react-use";

import {
  AutoCompleter,
  compareSuggestions,
  fuzzyMatch,
  Suggestion,
} from "./AutoCompleter";
import {
  HighlightData,
  LuExternalLink,
  TextHighlighter,
  TooltipContent,
  getTooltipContent,
} from "./Highlighter";
import { LuBug, LuLightbulb, LuLightbulbOff } from "react-icons/lu";
import {
  headerShortcuts,
  searcherShortcuts,
  useResolvedShortcuts,
} from "~core/keymaps";
import { Coordinates, getCaretCoordinates } from "./getCoordinates";
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  FloatingArrow,
} from "@floating-ui/react";
import { autoUpdate } from "@floating-ui/dom";
import type { VirtualElement } from "@floating-ui/dom";

export const idleHintsEnabledAtom = atomWithStorage(
  "cruncher:idleHintsEnabled",
  true,
);

const ARROW_HEIGHT = 7; // FloatingArrow default tip height

const HintCard = styled.div`
  background: ${token("colors.bg.panel")};
  border: 1px solid ${token("colors.border")};
  border-radius: ${token("radii.md")};
  padding: ${token("spacing.4")};
  max-width: 280px;
  min-width: 160px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  position: relative;
`;

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

    useEffect(() => {
      if (!referenceElement) return;
      setPos(
        getCaretCoordinates(
          referenceElement,
          referenceElement.selectionStart ?? 0,
        ),
      );
    }, [referenceElement]);

    const [pos, setPos] = useState<Coordinates>({
      top: 0,
      left: 0,
      height: 0,
    });

    const posRef = useLatest(pos);

    const caretVirtualEl = useMemo<VirtualElement>(
      () => ({
        getBoundingClientRect() {
          const el = referenceElementRef.current;
          if (!el) return new DOMRect();
          const rect = el.getBoundingClientRect();
          const p = posRef.current;
          const lineHeight =
            p.height || parseFloat(getComputedStyle(el).lineHeight) || 16;
          return new DOMRect(
            rect.left + p.left - el.scrollLeft,
            rect.top + p.top - el.scrollTop,
            0,
            lineHeight,
          );
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const {
      refs,
      floatingStyles,
      update: updateFloating,
    } = useFloating({
      strategy: "fixed",
      placement: "bottom-start",
      middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    });

    const updateFloatingRef = useLatest(updateFloating);

    useEffect(() => {
      refs.setReference(caretVirtualEl);
    }, [refs, caretVirtualEl]);

    const [cursorPosition, setCursorPosition] = useState(value.length);
    const [isCompleterOpen, setIsCompleterOpen] = useState(false);

    useEffect(() => {
      if (isCompleterOpen) updateFloatingRef.current();
    }, [pos, isCompleterOpen, updateFloatingRef]);

    useEffect(() => {
      const floating = refs.floating.current;
      if (!isCompleterOpen || !floating) return;
      return autoUpdate(caretVirtualEl, floating, updateFloatingRef.current);
    }, [isCompleterOpen, refs.floating, caretVirtualEl, updateFloatingRef]);

    const [hoveredCompletionItem, setHoveredCompletionItem] = useState<
      number | undefined
    >(undefined);
    const [hasInteractedWithMenu, setHasInteractedWithMenu] = useState(false);

    const ctrlSpaceOpenRef = useRef(false);
    const resolvedHeaderShortcuts = useResolvedShortcuts(headerShortcuts);
    const resolvedSearcherShortcuts = useResolvedShortcuts(searcherShortcuts);

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
      const results = new Map<string, Suggestion>();
      for (const suggestion of suggestions) {
        // filter suggestions based on cursor position
        if (cursorPosition < suggestion.fromPosition) continue;
        if (suggestion.toPosition && cursorPosition > suggestion.toPosition)
          continue;

        const key = `${suggestion.type}:${suggestion.value}`;
        if (!results.has(key)) results.set(key, suggestion);
      }

      return Array.from(results.values())
        .flatMap((suggestion) => {
          if (!writtenWord) return [{ suggestion, score: 0 }];
          const valueToMatch =
            suggestion.value.startsWith('"') && !writtenWord.startsWith('"')
              ? suggestion.value.slice(1, -1)
              : suggestion.value;
          const match = fuzzyMatch(valueToMatch, writtenWord);
          if (!match.matched) return [];
          let score = 0;
          if (valueToMatch.startsWith(writtenWord)) score += 100;
          for (let i = 1; i < match.indices.length; i++) {
            if (match.indices[i] === match.indices[i - 1] + 1) score += 1;
          }
          if (match.indices.length > 0) score -= match.indices[0];
          return [{ suggestion, score }];
        })
        .sort((a, b) => {
          const priorityDiff = compareSuggestions(a.suggestion, b.suggestion);
          if (priorityDiff !== 0) return priorityDiff;
          return b.score - a.score;
        })
        .map((entry) => entry.suggestion);
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

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [tokenContent, setTokenContent] = useState<TooltipContent | null>(
      null,
    );
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const isAutoHintRef = useRef(false);
    const [idleHintsEnabled, setIdleHintsEnabled] =
      useAtom(idleHintsEnabledAtom);

    // Kept in refs so timer callbacks always see the latest values without
    // needing to be recreated on every render.
    const highlightDataRef = useLatest(highlightData);
    const idleHintsEnabledRef = useLatest(idleHintsEnabled);
    const cursorPosRef = useLatest(cursorPosition);
    const referenceElementRef = useLatest(referenceElement);
    const anchorRectRef = useLatest(anchorRect);
    const isFocusedRef = useRef(false);

    const dismissAutoHint = useCallback(() => {
      if (isAutoHintRef.current) {
        setPopoverOpen(false);
        isAutoHintRef.current = false;
      }
    }, []);

    const closeDebouncer = useDebouncer(() => setPopoverOpen(false), {
      wait: 400,
    });
    const openDebouncer = useDebouncer(() => setPopoverOpen(true), {
      wait: 700,
    });
    const dismissHintDebouncer = useDebouncer(dismissAutoHint, { wait: 600 });

    // useDebouncer returns a new object each render (useMemo with unstable state),
    // so we hold stable refs to break the useCallback/useEffect dependency cascade.
    const closeDebouncerRef = useLatest(closeDebouncer);
    const openDebouncerRef = useLatest(openDebouncer);
    const dismissHintDebouncerRef = useLatest(dismissHintDebouncer);
    const popoverOpenRef = useLatest(popoverOpen);

    const hintVirtualEl = useMemo<VirtualElement>(
      () => ({
        getBoundingClientRect: () => anchorRectRef.current ?? new DOMRect(),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const arrowRef = useRef<SVGSVGElement>(null);

    const {
      refs: hintRefs,
      floatingStyles: hintFloatingStyles,
      update: updateHintFloating,
      context: hintContext,
    } = useFloating({
      strategy: "fixed",
      placement: "bottom",
      middleware: [
        offset(ARROW_HEIGHT + 4),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        arrow({ element: arrowRef }),
      ],
    });

    const updateHintFloatingRef = useLatest(updateHintFloating);

    useEffect(() => {
      hintRefs.setReference(hintVirtualEl);
    }, [hintRefs, hintVirtualEl]);

    useEffect(() => {
      if (popoverOpen) updateHintFloatingRef.current();
    }, [anchorRect, popoverOpen, updateHintFloatingRef]);

    useEffect(() => {
      const floating = hintRefs.floating.current;
      if (!popoverOpen || !floating) return;
      return autoUpdate(hintVirtualEl, floating, updateHintFloatingRef.current);
    }, [popoverOpen, hintRefs.floating, hintVirtualEl, updateHintFloatingRef]);

    const scheduleClose = useCallback(
      () => closeDebouncerRef.current.maybeExecute(),
      [closeDebouncerRef],
    );

    const cancelClose = useCallback(() => {
      closeDebouncerRef.current.cancel();
      dismissHintDebouncerRef.current.cancel();
    }, [closeDebouncerRef, dismissHintDebouncerRef]);

    const cancelOpen = useCallback(
      () => openDebouncerRef.current.cancel(),
      [openDebouncerRef],
    );

    const showHintAtCursor = useCallback(() => {
      if (!idleHintsEnabledRef.current) return;
      if (popoverOpenRef.current && !isAutoHintRef.current) return;
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
    }, [
      cancelOpen,
      cancelClose,
      highlightDataRef,
      cursorPosRef,
      idleHintsEnabledRef,
      referenceElementRef,
      popoverOpenRef,
    ]);

    const isIdle = useIdle(2_000);

    useEffect(() => {
      if (isIdle && isFocusedRef.current) {
        dismissHintDebouncerRef.current.cancel();
        showHintAtCursor();
      } else {
        dismissHintDebouncerRef.current.maybeExecute();
      }
    }, [isIdle, showHintAtCursor, dismissHintDebouncerRef]);

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
                openDebouncerRef.current.maybeExecute();
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
      [cancelClose, cancelOpen, openDebouncerRef, popoverOpen, anchorRect],
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
              ctrlSpaceOpenRef.current = false;
              setIsCompleterOpen(false);
              setHasInteractedWithMenu(false);
            }
            if (resolvedHeaderShortcuts.isPressed(e, "trigger-autocomplete")) {
              e.preventDefault();
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

              if (e.key === "Tab" && e.shiftKey) {
                e.preventDefault();
                retreatHoveredItem();
              } else if (e.key === "Tab") {
                acceptCompletion();
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
          onSelect={(e) => {
            const selStart = e.currentTarget.selectionStart;
            setCursorPosition(selStart);
            setPos(getCaretCoordinates(e.currentTarget, selStart));
          }}
          onInput={() => {
            syncScroll();
          }}
          onScroll={() => {
            syncScroll();
            if (isCompleterOpen) updateFloatingRef.current();
          }}
          onChange={(e) => {
            if (!referenceElement) return;

            // check if char is in not \n
            const selectionStart = e.currentTarget.selectionStart;
            const char = e.target.value[selectionStart - 1]; // this is the char that was added

            const isCharAdded =
              e.target.value.length > value.length &&
              !["\n", " "].includes(char);

            // Also open on space if there are any active suggestions at the new
            // cursor position (fromPosition <= cursor <= toPosition).
            const isSpaceAdded =
              e.target.value.length > value.length && char === " ";
            const hasFreshSuggestions =
              isSpaceAdded &&
              suggestions.some(
                (s) =>
                  s.fromPosition <= selectionStart &&
                  (s.toPosition == null || selectionStart <= s.toPosition),
              );

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
        />
        {isCompleterOpen &&
          popperRoot &&
          createPortal(
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: 9999 }}
            >
              <AutoCompleter
                suggestions={filteredSuggestions}
                hoveredItem={hoveredCompletionItem}
                writtenWord={writtenWord}
              />
            </div>,
            popperRoot,
          )}
        {popoverOpen && tokenContent && (
          <Portal>
            <HintCard
              ref={hintRefs.setFloating}
              style={{ ...hintFloatingStyles, zIndex: 9999 }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              role="tooltip"
            >
              <FloatingArrow
                ref={arrowRef}
                context={hintContext}
                fill={token("colors.bg.panel")}
                stroke={token("colors.border")}
                strokeWidth={1}
              />
              <HStack gap="2" mb="2" align="center">
                <Icon as={tokenContent.icon} boxSize="4" color="fg.muted" />
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
                        window.electronAPI.openExternal(tokenContent.docsUrl!)
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
            </HintCard>
          </Portal>
        )}
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
          {isEditorHovered && (
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <IconButton aria-label="Debug menu" size="2xs" variant="ghost">
                  <LuBug />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      value="copy-highlight"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          JSON.stringify(highlightData, null, 2),
                        )
                      }
                    >
                      Copy Highlight information
                    </Menu.Item>
                    {onCopyAst && (
                      <Menu.Item value="copy-ast" onClick={onCopyAst}>
                        Copy AST
                      </Menu.Item>
                    )}
                    <Menu.Item
                      value="copy-suggestions"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          JSON.stringify(suggestions, null, 2),
                        )
                      }
                    >
                      Copy Suggestion information
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}
          <Tooltip
            text={idleHintsEnabled ? "Idle hints on" : "Idle hints off"}
            shortcut={resolvedSearcherShortcuts.getAlias("toggle-idle-hints")}
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
