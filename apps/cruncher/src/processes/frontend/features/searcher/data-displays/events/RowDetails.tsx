import { Box, IconButton, Menu } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { token } from "~components/ui/system";
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
import { getLogId, useIsLogOpen } from "./state";

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
import { Portal } from "~components/ui/portal";
import { notifyError, notifySuccess } from "~core/notifyError";
import { highlightText } from "~core/utils/highlight";

type DataRowProps = {
  rowKey: string;
  rowValue: Field;
};

export const RowDetails = ({ row }: { row: ProcessedData }) => {
  const logId = getLogId(row);
  const isLogOpen = useIsLogOpen();
  const isOpen = useMemo(() => isLogOpen(logId), [logId, isLogOpen]);
  if (!isOpen) {
    return null;
  }

  return (
    <div
      css={css`
        margin: 0 0 0 4px;
        background-color: ${token("colors.bg.subtle")};
        border-left: 2px solid ${token("colors.border")};
        border-bottom: 1px solid ${token("colors.border")};
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
  const displayString = asDisplayString(rowValue);

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        padding: 0.2rem 0.8rem;
        line-height: 1.5;
        border-bottom: 1px solid ${token("colors.border.muted")};
        &:hover {
          background-color: ${token("colors.bg.emphasized")};
        }
      `}
    >
      <div
        css={css`
          color: ${token("colors.fg.muted")};
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
          {highlightText(displayString, highlightItemQuery)}
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
      <Menu.Root lazyMount unmountOnExit positioning={{ strategy: "fixed" }}>
        <Menu.Trigger asChild>
          <IconButton size={"2xs"} variant="ghost">
            <LuEllipsisVertical />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item
                value="copy-value"
                onClick={() => {
                  navigator.clipboard
                    .writeText(asDisplayString(rowValue))
                    .then(() => notifySuccess("Copied to clipboard"))
                    .catch((e) =>
                      notifyError("Failed to copy to clipboard", e),
                    );
                }}
                cursor={"pointer"}
              >
                <LuClipboardCopy />
                <Box flex="1">Copy Value</Box>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </div>
  );
};
