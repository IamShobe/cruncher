import { Collapsible, Field, Menu } from "@chakra-ui/react";
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
  Wrap,
  createListCollection,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { ValueChangeDetails } from "node_modules/@chakra-ui/react/dist/types/components/select/namespace";
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
import { SearchProfileRef } from "../../../../server/engineV2/types";
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { DateType } from "~lib/dateUtils";
import { DateSelector, isDateSelectorOpenAtom } from "./calendar/DateSelector";
import { SettingsDrawer } from "~features/searcher/header/settings-drawer/Drawer";
import { Editor } from "./Editor";
import {
  createShortcutsHandler,
  headerShortcuts,
  searcherShortcuts,
} from "../../../core/keymaps";
import { notifySuccess } from "../../../core/notifyError";
import {
  FormValues,
  isHeaderOpenAtom,
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
} from "../../../core/search";
import {
  ApplicationStore,
  useApplicationStore,
} from "../../../core/store/appStore";
import {
  endFullDateAtom,
  startFullDateAtom,
} from "../../../core/store/dateState";
import {
  jobMetadataAtom,
  searchQueryAtom,
} from "../../../core/store/queryState";
import { Timer } from "./Timer";
import { MiniIconButton } from "~components/presets/IconButton";

const StyledHeader = styled.form`
  display: flex;
  gap: 0.4rem;
  flex-direction: row;
  padding: 1rem 1rem 0.3rem 1rem;

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
  const isHeaderOpen = useAtomValue(isHeaderOpenAtom);

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
    },
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
      <Collapsible.Root open={isHeaderOpen}>
        <Collapsible.Content>
          <StyledHeader
            onSubmit={handleSubmit(onSubmit(false))}
            onKeyDown={onHeaderKeyDown}
          >
            <Stack direction="column" gap={3} flex={1}>
              <SearchBarButtons
                isLoading={isLoading}
                onForceSubmit={() => handleSubmit(onSubmit(true))()}
                onTerminateSearch={() =>
                  abortRunningQuery("Search terminated by user")
                }
              />
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
          </StyledHeader>
        </Collapsible.Content>
      </Collapsible.Root>
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
      <Wrap gap={2} alignItems="center" flex={1}>
        <Stack direction="row" gap={2} alignItems="center">
          <MainSearchButton
            isLoading={isLoading}
            onTerminateSearch={onTerminateSearch}
            onForceSubmit={onForceSubmit}
          />
          <ReEvaluateButton isLoading={isLoading} />
        </Stack>
        <DateSelector />
        <MiniButtons />
        <Box ml="auto">
          <ProviderSelector />
        </Box>
      </Wrap>
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
  return (
    <Stack gap={3} direction="row" alignItems="center" p={1.5}>
      <ExportButton />
      <CopyShareLinkButton />
      <SettingsDrawer />
    </Stack>
  );
};

const createSearchProfileIsLoadingSelector = (
  profileRef: SearchProfileRef,
): ((state: ApplicationStore) => boolean) => {
  return (state: ApplicationStore) => {
    if (state.hasError || state.searchProfiles.length === 0) {
      return false;
    }

    const profile = state.searchProfiles.find(
      (profile) => profile.name === profileRef,
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
    createSearchProfileIsLoadingSelector(
      selectedSearchProfile?.name ?? ("" as SearchProfileRef),
    ),
  );

  const hasError = useApplicationStore((state) => state.hasError);

  const initializedSearchProfiles = useApplicationStore(searchProfilesSelector);
  const initializeProfileDatasets = useApplicationStore(
    (state) => state.initializeProfileDatasets,
  );

  const profiles = useMemo(() => {
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

    const index = profiles.items.findIndex(
      (item) => item.value === details.items[0].value,
    );
    if (index === -1) {
      throw new Error(
        `Selected instance with value ${details.items[0].value} not found in instances list.`,
      );
    }

    setSearchProfileIndex(index);
    const selectedProfile = initializedSearchProfiles[index];
    initializeProfileDatasets(selectedProfile.name);
  };

  return (
    <Field.Root>
      <Select.Root
        size="xs"
        minW={"200px"}
        maxW={"300px"}
        collection={profiles}
        value={selectedSearchProfile ? [selectedSearchProfile.name] : []}
        onValueChange={onSelect}
        disabled={hasError || initializedSearchProfiles.length === 0}
      >
        <Select.HiddenSelect />
        <Tooltip
          content={<span>Select Search Profile</span>}
          showArrow
          positioning={{ placement: "bottom" }}
        >
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText
                placeholder={
                  initializedSearchProfiles.length === 0
                    ? "No Search Profiles"
                    : "Select Search Profile"
                }
              />
            </Select.Trigger>
            <Select.IndicatorGroup>
              {isSelectedLoading && (
                <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
              )}
              <Select.Indicator />
              {/* <Select.ClearTrigger /> */}
            </Select.IndicatorGroup>
          </Select.Control>
        </Tooltip>

        <Select.Positioner>
          <Select.Content>
            {profiles.items.map((item) => (
              <InstanceSelectItem item={item} key={item.value} />
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </Field.Root>
  );
};

const InstanceSelectItem: React.FC<{
  item: {
    value: SearchProfileRef;
    label: string;
  };
}> = ({ item }) => {
  const isLoading = useApplicationStore(
    createSearchProfileIsLoadingSelector(item.value),
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

const MainSearchButton: React.FC<SearchBarButtonsProps> = ({
  isLoading,
  onTerminateSearch,
  onForceSubmit,
}) => {
  return (
    <>
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
    </>
  );
};

const ReEvaluateButton: React.FC<{
  isLoading: boolean;
}> = ({ isLoading }) => {
  const endTime = useAtomValue(endFullDateAtom);
  const startTime = useAtomValue(startFullDateAtom);
  const isRelativeTimeSelected = useMemo(() => {
    return endTime === DateType.Now || startTime === DateType.Now;
  }, [endTime, startTime]);

  return (
    <Box position="relative">
      <Tooltip
        content={
          <span>
            Process Pipeline {!isRelativeTimeSelected && "Only"}{" "}
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
          <LuSigma />
        </IconButton>
      </Tooltip>
      {isRelativeTimeSelected && (
        <Tooltip
          content={
            <span>Relative time is selected, full refresh is required!</span>
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
  );
};

export const ExportButton: React.FC<{
  isDisabled?: boolean;
}> = () => {
  const controller = useInitializedController();
  const task = useAtomValue(lastRanJobAtom);
  const batchCompleteStatus = useAtomValue(jobMetadataAtom);
  const isDisabled = batchCompleteStatus?.views.table === undefined;

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
    <Menu.Root lazyMount unmountOnExit>
      <Menu.Trigger disabled={isDisabled}>
        <MiniIconButton tooltip="Export" as="div" disabled={isDisabled}>
          <CiExport />
        </MiniIconButton>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item value="json-copy" cursor="pointer" onClick={copyJson}>
          <LuClipboardCopy /> Copy JSON
        </Menu.Item>
        <Menu.Item value="csv-copy" cursor="pointer" onClick={copyCsv}>
          <LuClipboardCopy /> Copy CSV
        </Menu.Item>
        <MenuSeparator />
        <Menu.Item
          value="json-download"
          cursor="pointer"
          onClick={downloadJson}
        >
          <LuDownload /> Download JSON
        </Menu.Item>
        <Menu.Item value="csv-download" cursor="pointer" onClick={downloadCsv}>
          <LuDownload /> Download CSV
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
};

export const CopyShareLinkButton: React.FC = () => {
  const { copyCurrentShareLink } = useQueryActions();
  return (
    <MiniIconButton
      tooltip="Copy External Link"
      tooltipShortcut={searcherShortcuts.getAlias("copy-link")}
      onClick={copyCurrentShareLink}
    >
      <LuLink />
    </MiniIconButton>
  );
};

export default Header;
