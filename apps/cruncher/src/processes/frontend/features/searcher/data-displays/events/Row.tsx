import { IconButton } from "@chakra-ui/react";
import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { token } from "~components/ui/system";
import { Tooltip } from "~components/ui/tooltip";
import { parse } from "ansicolor";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { formatDataTime } from "@cruncher/adapter-utils/formatters";
import { asDateField, ProcessedData } from "@cruncher/adapter-utils/logTypes";
import {
  getLogId,
  msgExpandedByDefaultAtom,
  openIdsAtom,
  useIsLogOpen,
} from "./state";
import { highlightItemQueryAtom } from "~core/search";
import { highlightText } from "~core/utils/highlight";
import { newLogSinceAtom, timezoneAtom } from "~core/store/liveState";

type DataRowProps = {
  row: ProcessedData;
};

const getColorFromObject = (
  object: ProcessedData["object"],
  columnName: string,
) => {
  const level = object[columnName]?.value;
  if (typeof level !== "string") {
    return token("colors.log.default");
  }

  switch (level) {
    case "error":
      return token("colors.log.error");
    case "warn":
      return token("colors.log.warn");
    default:
      return token("colors.log.default");
  }
};

const newLogHighlight = keyframes`
  0%   { background-color: ${token("colors.teal.subtle")}; }
  100% { background-color: transparent; }
`;

const StyledRow = styled.div<{ $isNew?: boolean }>`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid ${token("colors.border.muted")};
  &:hover {
    background-color: ${token("colors.bg.subtle")};
  }
  & ::selection {
    background-color: ${token("colors.accent.subtle")};
  }
  ${({ $isNew }) =>
    $isNew &&
    css`
      animation: ${newLogHighlight} 2s ease-out forwards;
    `}
`;

const StyledGutter = styled.div<{ row: ProcessedData }>`
  width: 4px;
  background-color: ${({ row }) =>
    getColorFromObject(
      row.object,
      "level",
    )}; // TODO: this needs to be configurable by user
  flex-shrink: 0;
  margin-right: 0.4rem;
  opacity: 0.85;
`;

const DataRow: React.FC<DataRowProps> = ({ row }) => {
  const logId = getLogId(row);
  const setOpenIds = useSetAtom(openIdsAtom);
  const isLogOpen = useIsLogOpen();
  const isOpen = useMemo(() => isLogOpen(logId), [logId, isLogOpen]);
  // null = follow global default; true/false = user explicitly toggled this row
  const [localOverride, setLocalOverride] = useState<boolean | null>(null);
  const globalExpanded = useAtomValue(msgExpandedByDefaultAtom);
  const msgExpanded = localOverride ?? globalExpanded;
  const [isClamped, setIsClamped] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure clamping from a permanently-clamped hidden div so isClamped stays
  // accurate regardless of whether the row is currently expanded or not.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const check = () => setIsClamped(el.scrollHeight > el.clientHeight);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    check();
    return () => observer.disconnect();
  }, []);

  const highlightItemQuery = useAtomValue(highlightItemQueryAtom);
  const newLogSince = useAtomValue(newLogSinceAtom);
  const timezone = useAtomValue(timezoneAtom);
  const logTime = asDateField(row.object._time).value;
  const isNew = newLogSince !== null && logTime > newLogSince;

  const setIsOpen = (value: boolean) => {
    if (value) {
      setOpenIds((prev) => [...prev, logId]);
    } else {
      setOpenIds((prev) => prev.filter((id) => id !== logId));
    }
  };

  return (
    <StyledRow $isNew={isNew}>
      <StyledGutter row={row} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Left column: timestamp */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 170,
            flexShrink: 0,
            cursor: "pointer",
            color: token("colors.fg.muted"),
            fontFamily: "monospace",
            fontSize: "0.75rem",
          }}
        >
          {formatDataTime(asDateField(row.object._time).value, timezone)}
        </div>

        {/* Right column: message + inline expand button */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          {/* Hidden always-clamped div — used only to measure if text exceeds 3 lines.
              Stays clamped regardless of expand state so isClamped is always accurate. */}
          <div
            ref={measureRef}
            aria-hidden
            style={{
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              top: 0,
              left: 0,
              right: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {row.message}
          </div>

          <div
            onClick={() => setIsOpen(!isOpen)}
            style={{
              cursor: "pointer",
              color: token("colors.fg"),
              wordBreak: "break-word",
              overflowWrap: "break-word",
              width: "100%",
              ...(msgExpanded
                ? undefined
                : {
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }),
            }}
          >
            {parse(row.message).spans.map((span, spanIndex) => (
              <span
                key={spanIndex}
                css={css`
                  ${span.css}
                `}
              >
                {highlightText(span.text, highlightItemQuery)}
              </span>
            ))}
          </div>

          {isClamped && (
            <Tooltip
              content={msgExpanded ? "Show less" : "Show more"}
              openDelay={300}
              portalled
            >
              <IconButton
                size="2xs"
                variant="ghost"
                aria-label={msgExpanded ? "Show less" : "Show more"}
                color="fg.subtle"
                h="14px"
                w="14px"
                minW="unset"
                minH="unset"
                onClick={() =>
                  setLocalOverride((prev) => !(prev ?? globalExpanded))
                }
              >
                {msgExpanded ? <LuChevronUp /> : <LuChevronDown />}
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </StyledRow>
  );
};

export default DataRow;
