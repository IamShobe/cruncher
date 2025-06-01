import styled from "@emotion/styled";
import type React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ProgressBar, ProgressRoot } from "~components/ui/progress";

import { IconButton, MenuSeparator, Stack } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { generateCsv, mkConfig } from "export-to-csv";
import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";
import { CiExport } from "react-icons/ci";
import {
  LuClipboardCopy,
  LuDownload,
  LuSearch,
  LuSearchCode,
  LuSearchX,
} from "react-icons/lu";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "~components/ui/menu";
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { QueryProvider } from "./common/interface";
import { DateSelector, isDateSelectorOpen } from "./DateSelector";
import { Editor } from "./Editor";
import { headerShortcuts } from "./keymaps";
import { abortRunningQuery, FormValues, isLoadingAtom, isQuerySuccessAtom, queryEndTimeAtom, queryStartTimeAtom, runQuery } from "./search";
import {
  endFullDateAtom,
  startFullDateAtom
} from "./store/dateState";
import {
  dataViewModelAtom,
  searchQueryAtom
} from "./store/queryState";
import { store } from "./store/store";
import { Timer } from "./Timer";

const StyledHeader = styled.form`
  display: flex;
  gap: 0.4rem;
  flex-direction: row;
  padding: 0.3rem;

  // add media
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QueryContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
`;

const ButtonsHolder = styled.div`
  display: flex;
`;

const LoaderHolder = styled.div`
  display: flex;
  flex-direction: column;
  /* padding: 0 0.9rem; */
  height: 5px;
`;

type HeaderProps = {
  controller: QueryProvider;
};


const Header: React.FC<HeaderProps> = ({ controller }) => {
  const isLoading = useAtomValue(isLoadingAtom);

  const [searchValue, setSearchValue] = useAtom(searchQueryAtom);
  const selectedStartTime = useAtomValue(startFullDateAtom);
  const selectedEndTime = useAtomValue(endFullDateAtom);

  // query execution props
  const isQuerySuccess = useAtomValue(isQuerySuccessAtom);
  const queryStartTime = useAtomValue(queryStartTimeAtom);
  const queryEndTime = useAtomValue(queryEndTimeAtom);

  const { handleSubmit } = useForm<FormValues>({
    values: {
      searchTerm: searchValue,
      fromTime: selectedStartTime,
      toTime: selectedEndTime,
    },
  });

  const onSubmit =
    (isForced: boolean): SubmitHandler<FormValues> =>
    async (values) => {
      await runQuery(controller, values, isForced);
    };

  const onHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (headerShortcuts.isPressed(e, "search")) {
      e.preventDefault();
      store.set(isDateSelectorOpen, false);
      handleSubmit(onSubmit(true))();
    } else if (headerShortcuts.isPressed(e, "re-evaluate")) {
      e.preventDefault();
      store.set(isDateSelectorOpen, false);
      handleSubmit(onSubmit(false))();
    }
  };

  const loaderValue = isLoading ? null : 100;
  const loaderColor = useMemo(() => {
    if (isLoading) {
      return "gray" as const;
    }

    if (isQuerySuccess) {
      return "green" as const;
    }

    return "red" as const;
  }, [isLoading, isQuerySuccess]);

  return (
    <>
      <LoaderHolder>
        <ProgressRoot
          value={loaderValue}
          variant="subtle"
          size="xs"
          colorPalette={loaderColor}
        >
          <ProgressBar />
        </ProgressRoot>
      </LoaderHolder>
      <StyledHeader
        onSubmit={handleSubmit(onSubmit(false))}
        onKeyDown={onHeaderKeyDown}
      >
        <QueryContainer>
          <div
            css={css`
              flex: 1;
            `}
          >
            <Editor value={searchValue} onChange={setSearchValue} />
          </div>
          <Timer
            startTime={queryStartTime}
            endTime={queryEndTime}
            isLoading={isLoading}
          />
        </QueryContainer>
        <SearchBarButtons
          isLoading={isLoading}
          onForceSubmit={() => handleSubmit(onSubmit(true))()}
          onTerminateSearch={() => abortRunningQuery("Search terminated by user")}
        />
      </StyledHeader>
    </>
  );
};

type SearchBarButtonsProps = {
  isLoading: boolean;
  onForceSubmit: () => void;
  onTerminateSearch: () => void;
};

const SearchBarButtons: React.FC<SearchBarButtonsProps> = ({
  isLoading,
  onForceSubmit,
  onTerminateSearch,
}) => {
  return (
    <ButtonsHolder>
      <Stack gap={3}>
        <DateSelector />
        <Stack gap={3} direction="row">
          <Tooltip
            content={
              <span>
                Re-evaluate{" "}
                <Shortcut keys={headerShortcuts.getAlias("re-evaluate")} />
              </span>
            }
            showArrow
            positioning={{
              placement: "bottom",
            }}
          >
            <IconButton
              aria-label="Re-evalutate"
              type="submit"
              disabled={isLoading}
            >
              <LuSearchCode />
            </IconButton>
          </Tooltip>
          {isLoading ? (
            <Tooltip
              content={<span>Terminate Search</span>}
              showArrow
              positioning={{
                placement: "bottom",
              }}
            >
              <IconButton
                aria-label="Terminate database"
                onClick={() => onTerminateSearch()}
              >
                <LuSearchX />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip
              content={
                <span>
                  Search <Shortcut keys={headerShortcuts.getAlias("search")} />
                </span>
              }
              showArrow
              positioning={{
                placement: "bottom",
              }}
            >
              <IconButton
                aria-label="Search database"
                onClick={() => onForceSubmit()}
              >
                <LuSearch />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <MiniButtons />
      </Stack>
    </ButtonsHolder>
  );
};

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const downloadFile = (filename: string, data: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const MiniButtons = () => {
  const {table: tableView} = useAtomValue(dataViewModelAtom);

  const isDisabled = tableView === undefined;

  const dataAsArray = () => {
    if (tableView === undefined) {
      throw new Error("Table view is undefined");
    }

    return tableView.dataPoints.map((row) => {
      const result: Record<string, any> = {};
      for (const key in row.object) {
        result[key] = row.object[key]?.value;
      }

      return result;
    });
  };

  const getCSVValue = () => {
    const data = dataAsArray();

    return generateCsv(csvConfig)(data) as unknown as string;
  };

  const downloadCsv = () => {
    const csvValue = getCSVValue();
    const filename = `data-export-${new Date().toISOString()}.csv`;
    downloadFile(filename, csvValue, "text/csv");
  };

  const copyCsv = () => {
    const csvValue = getCSVValue();
    navigator.clipboard.writeText(csvValue);
  };

  const getJson = () => {
    const data = dataAsArray();

    return JSON.stringify(data);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(getJson());
  };

  const downloadJson = () => {
    const filename = `data-export-${new Date().toISOString()}.json`;
    downloadFile(filename, getJson(), "application/json");
  };

  return (
    <Stack gap={3} direction="row">
      <MenuRoot lazyMount unmountOnExit>
        <MenuTrigger asChild disabled={isDisabled}>
          <IconButton aria-label="Export" size="2xs" variant="surface">
            <CiExport />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="json-copy" cursor="pointer" onClick={copyJson}>
            <LuClipboardCopy /> Copy JSON
          </MenuItem>
          <MenuItem value="csv-copy" cursor="pointer" onClick={copyCsv}>
            <LuClipboardCopy /> Copy CSV
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            value="json-download"
            cursor="pointer"
            onClick={downloadJson}
          >
            <LuDownload /> Download JSON
          </MenuItem>
          <MenuItem value="csv-download" cursor="pointer" onClick={downloadCsv}>
            <LuDownload /> Download CSV
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Stack>
  );
};

export default Header;
