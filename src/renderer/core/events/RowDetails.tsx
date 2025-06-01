import { Box, IconButton } from "@chakra-ui/react";
import { css } from "@emotion/react";
import React, { useMemo } from "react";
import {
  LuAArrowUp,
  LuClipboardCopy,
  LuEllipsisVertical,
} from "react-icons/lu";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "~components/ui/menu";
import { asDisplayString, Field, ProcessedData } from "../../../lib/adapters/logTypes";
import { searchQueryAtom } from "../store/queryState";
import { isIndexOpen, openIndexesAtom } from "./state";
import { useAtom } from "jotai";
import { store } from "~core/store/store";

import {VscSymbolArray, VscSymbolBoolean, VscSymbolClass, VscSymbolNumeric, VscSymbolString} from "react-icons/vsc";
import {CiCalendarDate} from "react-icons/ci";
import {GrStatusUnknown} from "react-icons/gr";

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
  const [openIndexes] = useAtom(openIndexesAtom);
  const isOpen = useMemo(() => isIndexOpen(index), [index, openIndexes]);
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
      {Object.entries(row.object).map(([key, value]) => {
        return <RowDetail key={key} rowKey={key} rowValue={value} />;
      })}
    </div>
  );
};

const getRowIcon = (row: Field) => {
  if (!row) return null

  switch (row.type) {
    case "string":
      return <VscSymbolString />
    case "number":
      return <VscSymbolNumeric />
    case "array":
      return <VscSymbolArray />
    case "object":
      return <VscSymbolClass />
    case "date":
      return <CiCalendarDate />
    case "boolean":
      return <VscSymbolBoolean />
    
    default:
      return <GrStatusUnknown />
  }
}

export const RowDetail: React.FC<DataRowProps> = ({ rowKey, rowValue }) => {
  const [isOpen, setIsOpen] = React.useState(false);

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
        {rowKey}
        <IconButton
          size={"2xs"}
          variant="ghost"
          onClick={() => {
            const value = store.get(searchQueryAtom);
            store.set(searchQueryAtom, value + ` ${rowKey}`);
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
        <span css={css`
          white-space: pre-wrap;
          word-break: break-all;
          line-height: 1.5;
        `}>{asDisplayString(rowValue)}</span>
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
      <MenuRoot open={isOpen} lazyMount unmountOnExit>
        <MenuTrigger asChild>
          <IconButton
            size={"2xs"}
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
          >
            <LuEllipsisVertical />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <MenuItem
            value="copy-value"
            onClick={() => {
              navigator.clipboard.writeText(asDisplayString(rowValue));
              setIsOpen(false);
            }}
            cursor={"pointer"}
          >
            <LuClipboardCopy />
            <Box flex="1">Copy Value</Box>
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </div>
  );
};
