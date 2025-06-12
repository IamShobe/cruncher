import styled from "@emotion/styled";
import type React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ProgressBar, ProgressRoot } from "~components/ui/progress";

import {
  Box,
  Circle,
  Float,
  IconButton,
  MenuSeparator,
  Select,
  Spinner,
  Stack,
  createListCollection,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { generateCsv, mkConfig } from "export-to-csv";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { CiExport } from "react-icons/ci";
import {
  LuClipboardCopy,
  LuDownload,
  LuLink,
  LuSearch,
  LuSearchX,
  LuSigma,
} from "react-icons/lu";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "~components/ui/menu";
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { DateType } from "~lib/dateUtils";
import { DateSelector, isDateSelectorOpenAtom } from "./DateSelector";
import { SettingsDrawer } from "./drawer/Drawer";
import { Editor } from "./Editor";
import {
  createShortcutsHandler,
  headerShortcuts,
  searcherShortcuts,
} from "./keymaps";
import { notifySuccess } from "./notifyError";
import {
  FormValues,
  isLoadingAtom,
  isQuerySuccessAtom,
  queryEndTimeAtom,
  queryStartTimeAtom,
  useQueryActions,
  useRunQuery,
} from "./search";
import { endFullDateAtom, startFullDateAtom } from "./store/dateState";
import { dataViewModelAtom, searchQueryAtom } from "./store/queryState";
import { useApplicationStore } from "./store/store";
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

type HeaderProps = {};

const Header: React.FC<HeaderProps> = ({}) => {
  const isLoading = useAtomValue(isLoadingAtom);

  const [searchValue, setSearchValue] = useAtom(searchQueryAtom);
  const selectedStartTime = useAtomValue(startFullDateAtom);
  const selectedEndTime = useAtomValue(endFullDateAtom);

  // query execution props
  const isQuerySuccess = useAtomValue(isQuerySuccessAtom);
  const queryStartTime = useAtomValue(queryStartTimeAtom);
  const queryEndTime = useAtomValue(queryEndTimeAtom);
  const setDateSelectorOpen = useSetAtom(isDateSelectorOpenAtom);
  const runQuery = useRunQuery();
  const { abortRunningQuery } = useQueryActions();

  const { handleSubmit } = useForm<FormValues>({
    values: {
      searchTerm: searchValue,
      fromTime: selectedStartTime,
      toTime: selectedEndTime,
    },
  });

  const onSubmit =
    (isForced: boolean): SubmitHandler<FormValues> =>
    async () => {
      await runQuery(isForced);
    };

  const onHeaderKeyDown = createShortcutsHandler(
    headerShortcuts,
    (shortcut) => {
      switch (shortcut) {
        case "search":
          setDateSelectorOpen(false);
          handleSubmit(onSubmit(true))();
          break;
        case "re-evaluate":
          setDateSelectorOpen(false);
          handleSubmit(onSubmit(false))();
          break;
      }
    }
  );

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
          <ProgressBar borderRadius={0} />
        </ProgressRoot>
      </LoaderHolder>
      <StyledHeader
        onSubmit={handleSubmit(onSubmit(false))}
        onKeyDown={onHeaderKeyDown}
      >
        <Stack direction="column" gap={2} flex={1}>
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
        </Stack>
        <SearchBarButtons
          isLoading={isLoading}
          onForceSubmit={() => handleSubmit(onSubmit(true))()}
          onTerminateSearch={() =>
            abortRunningQuery("Search terminated by user")
          }
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
  const endTime = useAtomValue(endFullDateAtom);
  const startTime = useAtomValue(startFullDateAtom);
  const isRelativeTimeSelected = useMemo(() => {
    return endTime === DateType.Now || startTime === DateType.Now;
  }, [endTime, startTime]);

  return (
    <ButtonsHolder>
      <Stack gap={3}>
        <DateSelector />
        <Stack direction="row">
          <Stack>
            <Stack gap={3} direction="row">
              <Box position="relative">
                <Tooltip
                  content={
                    <span>
                      Process Pipeline {!isRelativeTimeSelected && "Only"}{" "}
                      <Shortcut
                        keys={headerShortcuts.getAlias("re-evaluate")}
                      />
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
                    <LuSigma />
                  </IconButton>
                </Tooltip>
                {isRelativeTimeSelected && (
                  <Tooltip
                    content={
                      <span>
                        Relative time is selected, full refresh is required!
                      </span>
                    }
                    showArrow
                    contentProps={{ css: { "--tooltip-bg": "tomato" } }}
                  >
                    <Float placement="top-end">
                      <Circle size="3" bg="red" color="white"></Circle>
                    </Float>
                  </Tooltip>
                )}
              </Box>
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
                      Search{" "}
                      <Shortcut keys={headerShortcuts.getAlias("search")} />
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
          <ProviderSelector />
        </Stack>
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
  const { table: tableView } = useAtomValue(dataViewModelAtom);

  const { copyCurrentShareLink } = useQueryActions();

  const isDisabled = tableView === undefined;

  const dataAsArray = () => {
    if (tableView === undefined) {
      throw new Error("Table view is undefined");
    }

    return tableView.dataPoints.map((row) => {
      const result: Record<string, unknown> = {};
      for (const key in row.object) {
        result[key] = row.object[key]?.value;
      }

      return result;
    });
  };

  const getCSVValue = () => {
    const data = dataAsArray();

    // @ts-expect-error - generateCsv expects a config object
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
    notifySuccess("CSV copied to clipboard");
  };

  const getJson = () => {
    const data = dataAsArray();

    return JSON.stringify(data);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(getJson());
    notifySuccess("JSON copied to clipboard");
  };

  const downloadJson = () => {
    const filename = `data-export-${new Date().toISOString()}.json`;
    downloadFile(filename, getJson(), "application/json");
  };

  return (
    <Stack gap={3} direction="row">
      <MenuRoot lazyMount unmountOnExit>
        <MenuTrigger disabled={isDisabled}>
          <Tooltip
            content={<span>Export</span>}
            showArrow
            positioning={{ placement: "bottom" }}
          >
            <IconButton
              aria-label="Export"
              size="2xs"
              variant="surface"
              as={"div"}
              disabled={isDisabled}
            >
              <CiExport />
            </IconButton>
          </Tooltip>
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
      <Tooltip
        content={
          <span>
            Copy External Link{" "}
            <Shortcut keys={searcherShortcuts.getAlias("copy-link")} />
          </span>
        }
        showArrow
        positioning={{ placement: "bottom" }}
      >
        <IconButton
          aria-label="Copy Shareable Link"
          size="2xs"
          variant="surface"
          onClick={copyCurrentShareLink}
        >
          <LuLink />
        </IconButton>
      </Tooltip>
      <SettingsDrawer />
    </Stack>
  );
};

const ProviderSelector = () => {
  const selectedInstanceId = useApplicationStore(
    (state) => state.selectedInstanceId
  );
  const setSelectedInstanceId = useApplicationStore(
    (state) => state.setSelectedInstanceId
  );
  const initializedInstances = useApplicationStore(
    (state) => state.initializedInstances
  );
  const supportedPlugins = useApplicationStore(
    (state) => state.supportedPlugins
  );
  const isSelectionLoading = useApplicationStore(
    (state) => state.isSelectionLoading
  );

  const instances = useMemo(() => {
    return createListCollection({
      items: initializedInstances.map((instance) => {
        const plugin = supportedPlugins.find(
          (p) => p.ref === instance.pluginRef
        );

        return {
          value: instance.id,
          label: instance.name + (plugin ? ` (${plugin.name})` : ""),
        };
      }),
    });
  }, [initializedInstances, supportedPlugins]);
  return (
    <Select.Root
      size="xs"
      collection={instances}
      value={selectedInstanceId ? [selectedInstanceId] : []}
      onValueChange={(value) => setSelectedInstanceId(value.items[0].value)}
      disabled={isSelectionLoading}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
        </Select.Trigger>
        <Select.IndicatorGroup>
          {isSelectionLoading && (
            <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
          )}
          <Select.Indicator />
          {/* <Select.ClearTrigger /> */}
        </Select.IndicatorGroup>
      </Select.Control>

      <Select.Positioner>
        <Select.Content>
          {instances.items.map((instance) => (
            <Select.Item item={instance} key={instance.value}>
              {instance.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
};

export default Header;
