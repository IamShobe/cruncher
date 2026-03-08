import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { token } from "~components/ui/system";
import { parse } from "ansicolor";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useMemo } from "react";
import { formatDataTime } from "@cruncher/adapter-utils/formatters";
import { asDateField, ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { getLogId, openIdsAtom, useIsLogOpen } from "./state";
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
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              width: 170,
              color: token("colors.fg.muted"),
              fontFamily: "monospace",
              fontSize: "0.75rem",
              flexShrink: 0,
              paddingTop: "1px",
            }}
          >
            {formatDataTime(asDateField(row.object._time).value, timezone)}
          </div>
          <div
            style={{
              flex: 1,
              color: token("colors.fg"),
            }}
          >
            {parse(row.message).spans.map((span, spanIndex) => {
              return (
                <span
                  key={spanIndex}
                  css={css`
                    ${span.css}
                  `}
                >
                  {highlightText(span.text, highlightItemQuery)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </StyledRow>
  );
};

export default DataRow;
