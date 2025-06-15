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
  lastRanJobAtom,
  queryEndTimeAtom,
  queryStartTimeAtom,
  searchProfilesSelector,
  selectedSearchProfileIndexAtom,
  useInitializedController,
  useQueryActions,
  useRunQuery,
  useSelectedSearchProfile,
} from "./search";
import { ApplicationStore, useApplicationStore } from "./store/appStore";
import { endFullDateAtom, startFullDateAtom } from "./store/dateState";
import { jobMetadataAtom, searchQueryAtom } from "./store/queryState";
import { Timer } from "./Timer";
import { SearchProfileRef } from "src/engineV2/types";
import type { ValueChangeDetails } from "node_modules/@chakra-ui/react/dist/types/components/select/namespace";

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

const Header: React.FC<HeaderProps> = () => {
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
  const controller = useInitializedController();
  const task = useAtomValue(lastRanJobAtom);
  const batchCompleteStatus = useAtomValue(jobMetadataAtom);
  const isDisabled = batchCompleteStatus?.views.table === undefined;

  const { copyCurrentShareLink } = useQueryActions();

  const exportData = async (format: "csv" | "json") => {
    if (!task) {
      throw new Error("No task available for export");
    }

    return await controller.exportTableResults(task.id, format);
  };

  const downloadCsv = async () => {
    const csvValue = await exportData("csv");
    const filename = `data-export-${new Date().toISOString()}.csv`;
    downloadFile(filename, csvValue.payload, csvValue.contentType);
  };

  const copyCsv = async () => {
    const csvValue = await exportData("csv");
    navigator.clipboard.writeText(csvValue.payload);
    notifySuccess("CSV copied to clipboard");
  };

  const copyJson = async () => {
    const jsonValue = await exportData("json");
    navigator.clipboard.writeText(jsonValue.payload);
    notifySuccess("JSON copied to clipboard");
  };

  const downloadJson = async () => {
    const jsonValue = await exportData("json");
    const filename = `data-export-${new Date().toISOString()}.json`;
    downloadFile(filename, jsonValue.payload, jsonValue.contentType);
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

const createSearchProfileIsLoadingSelector = (
  profileRef: SearchProfileRef
): ((state: ApplicationStore) => boolean) => {
  return (state: ApplicationStore) => {
    const profile = state.searchProfiles.find(
      (profile) => profile.name === profileRef
    );
    if (!profile) {
      return true;
    }

    return profile.instances.some((instance) => {
      return state.datasets[instance]?.status === "loading";
    });
  };
};

const ProviderSelector = () => {
  const setSearchProfileIndex = useSetAtom(selectedSearchProfileIndexAtom);
  const selectedSearchProfile = useSelectedSearchProfile();
  const isSelectedLoading = useApplicationStore(
    createSearchProfileIsLoadingSelector(selectedSearchProfile?.name)
  );

  const initializedSearchProfiles = useApplicationStore(searchProfilesSelector);
  const initializeProfileDatasets = useApplicationStore((state) => state.initializeProfileDatasets);

  const instances = useMemo(() => {
    return createListCollection({
      items: initializedSearchProfiles.map((profile) => {
        return {
          value: profile.name,
          label: profile.name,
        };
      }),
    });
  }, [initializedSearchProfiles]);

  const onSelect = (details: ValueChangeDetails) => {
    if (details.items.length === 0) {
      setSearchProfileIndex(0);
      return;
    }

    const index = instances.items.findIndex(
      (item) => item.value === details.items[0].value
    );
    if (index === -1) {
      throw new Error(
        `Selected instance with value ${details.items[0].value} not found in instances list.`
      );
    }

    setSearchProfileIndex(index);
    const selectedProfile = initializedSearchProfiles[index];
    initializeProfileDatasets(selectedProfile.name); 
  };

  return (
    <Select.Root
      size="xs"
      collection={instances}
      value={selectedSearchProfile ? [selectedSearchProfile.name] : []}
      onValueChange={onSelect}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
        </Select.Trigger>
        <Select.IndicatorGroup>
          {isSelectedLoading && (
            <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
          )}
          <Select.Indicator />
          {/* <Select.ClearTrigger /> */}
        </Select.IndicatorGroup>
      </Select.Control>

      <Select.Positioner>
        <Select.Content>
          {instances.items.map((item) => (
            <InstanceSelectItem item={item} key={item.value} />
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
};

const InstanceSelectItem: React.FC<{
  item: {
    value: SearchProfileRef;
    label: string;
  };
}> = ({ item }) => {
  const isLoading = useApplicationStore(
    createSearchProfileIsLoadingSelector(item.value)
  );

  return (
    <Select.Item item={item} key={item.value}>
      {item.label}
      {isLoading ? (
        <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
      ) : (
        <Select.ItemIndicator />
      )}
    </Select.Item>
  );
};

export default Header;
