import { Box, IconButton, Menu } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useMemo } from "react";
import {
  LuAArrowUp,
  LuClipboardCopy,
  LuEllipsisVertical,
} from "react-icons/lu";
import {
  asDisplayString,
  Field,
  ProcessedData,
} from "@cruncher/adapter-utils/logTypes";
import { searchQueryAtom } from "~core/store/queryState";
import { useIsIndexOpen } from "./state";

import { CiCalendarDate } from "react-icons/ci";
import { GrStatusUnknown } from "react-icons/gr";
import {
  VscSymbolArray,
  VscSymbolBoolean,
  VscSymbolClass,
  VscSymbolNumeric,
  VscSymbolString,
} from "react-icons/vsc";
import { highlightItemQueryAtom } from "~core/search";
import { highlightText } from "~core/utils/highlight";

type DataRowProps = {
  rowKey: string;
  rowValue: Field;
};

export const RowDetails = ({
  row,
  index,
}: {
  row: ProcessedData;
  index: number;
}) => {
  const isIndexOpen = useIsIndexOpen();
  const isOpen = useMemo(() => isIndexOpen(index), [index, isIndexOpen]);
  if (!isOpen) {
    return null;
  }

  return (
    <div
      css={css`
        margin: 0.3rem 0.6rem;
        background-color: rgb(24, 24, 24);
      `}
    >
      {Object.entries(row.object)
        .sort(sortByKey)
        .map(([key, value]) => {
          return <RowDetail key={key} rowKey={key} rowValue={value} />;
        })}
    </div>
  );
};

const sortByKey = (a: [string, Field], b: [string, Field]) => {
  return a[0].localeCompare(b[0]);
};

const getRowIcon = (row: Field) => {
  if (!row) return null;

  switch (row.type) {
    case "string":
      return <VscSymbolString />;
    case "number":
      return <VscSymbolNumeric />;
    case "array":
      return <VscSymbolArray />;
    case "object":
      return <VscSymbolClass />;
    case "date":
      return <CiCalendarDate />;
    case "boolean":
      return <VscSymbolBoolean />;

    default:
      return <GrStatusUnknown />;
  }
};

export const RowDetail: React.FC<DataRowProps> = ({ rowKey, rowValue }) => {
  const setSearchQuery = useSetAtom(searchQueryAtom);
  const highlightItemQuery = useAtomValue(highlightItemQueryAtom);
  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        padding: 0.1rem 0.6rem;
        line-height: 1;
        &:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
      `}
    >
      <div
        css={css`
          color: rgb(139, 142, 149);
          margin-right: 0.3rem;
          width: 15rem;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        `}
      >
        <span
          css={css`
            white-space: pre-wrap;
            word-break: break-all;
          `}
        >
          {highlightText(rowKey, highlightItemQuery)}
        </span>
        <IconButton
          size={"2xs"}
          variant="ghost"
          onClick={() => {
            setSearchQuery((prev) => prev + ` ${rowKey}`);
          }}
        >
          <LuAArrowUp />
        </IconButton>
      </div>
      <div
        css={css`
          flex: 1;
          display: flex;
          align-items: center;
          gap: 5px;
        `}
      >
        <span>{getRowIcon(rowValue)}</span>
        <span
          css={css`
            white-space: pre-wrap;
            word-break: break-all;
            line-height: 1.5;
          `}
        >
          {highlightText(asDisplayString(rowValue), highlightItemQuery)}
        </span>
      </div>
      {/* <PopoverRoot
                      size="sm"
                      positioning={{ placement: "bottom-start" }}
                    >
                      <PopoverTrigger asChild>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverBody>
                          Value: {value} is of type {typeof value}
                        </PopoverBody>
                      </PopoverContent>
                    </PopoverRoot>*/}
      <Menu.Root lazyMount unmountOnExit>
        <Menu.Trigger asChild>
          <IconButton size={"2xs"} variant="ghost">
            <LuEllipsisVertical />
          </IconButton>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            value="copy-value"
            onClick={() => {
              navigator.clipboard.writeText(asDisplayString(rowValue));
            }}
            cursor={"pointer"}
          >
            <LuClipboardCopy />
            <Box flex="1">Copy Value</Box>
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </div>
  );
};
