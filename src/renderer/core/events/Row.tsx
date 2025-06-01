import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { parse } from "ansicolor";
import { useAtom } from "jotai";
import React, { useMemo } from "react";
import { formatDataTime } from "~lib/adapters/formatters";
import { asDateField, ProcessedData } from "~lib/adapters/logTypes";
import { isIndexOpen, openIndexesAtom } from "./state";

type DataRowProps = {
  row: ProcessedData;
  index: number;
};

const getColorFromObject = (object: ProcessedData["object"], columnName: string) => {
  const level = object[columnName]?.value;
  if (typeof level !== "string") {
    return "rgb(44, 175, 0)";
  }

  switch (level) {
    case "error":
      return "rgb(185, 31, 31)";
    case "warn":
      return "rgb(174, 158, 33)";
    default:
      return "rgb(44, 175, 0)";
  }
};

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  & ::selection {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

const StyledGutter = styled.div<{ row: ProcessedData }>`
  width: 6px;
  border-right: 1px solid rgb(49, 54, 63);
  background-color: ${({row}) => getColorFromObject(row.object, "level")}; // TODO: this needs to be configurable by user
  margin-right: 0.3rem;
`;

const DataRow: React.FC<DataRowProps> = ({ row, index }) => {
  const [openIndexes, setOpenIndexes] = useAtom(openIndexesAtom);
  const isOpen = useMemo(() => isIndexOpen(index), [index, openIndexes]);

  const setIsOpen = (value: boolean) => {
    if (value) {
      setOpenIndexes((prev) => [...prev, index]);
    } else {
      setOpenIndexes((prev) => prev.filter((i) => i !== index));
    }
  }

  return (
    <StyledRow>
      <StyledGutter row={row} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1
        }}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "row"
          }}
        >
          <div
            style={{
              width: 170,
            }}
          >
            {formatDataTime(asDateField(row.object._time).value)}
          </div>
          <div
            style={{
              flex: 1
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
                  {span.text}
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
