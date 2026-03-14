import { Badge, IconButton, Stack, Tabs } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { token } from "~components/ui/system";
import { Tooltip } from "~components/ui/tooltip";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  LuChartArea,
  LuChevronsDown,
  LuChevronsUp,
  LuLogs,
  LuTable,
} from "react-icons/lu";
import { msgExpandedByDefaultAtom } from "~features/searcher/data-displays/events/state";
import { isDateSelectorOpenAtom } from "~features/searcher/header/calendar/DateSelector";
import { queryEditorAtom } from "~features/searcher/header/Editor";
import DataLog from "~features/searcher/data-displays/events/DataLog";
import Header from "~features/searcher/header/Header";
import { searcherShortcuts, useShortcuts } from "~core/keymaps";
import {
  QueryState,
  useQueryActions,
  useQueryExecutedEffect,
} from "~core/search";
import {
  jobMetadataAtom,
  viewSelectedForQueryAtom,
} from "~core/store/queryState";
import { TableView } from "~features/searcher/data-displays/table/TableView";
import { EventsHistogram } from "~features/searcher/data-displays/events/EventsHistogram";
import { ViewChart } from "~features/searcher/data-displays/view/ViewChart";
import { TabsLineButtons } from "~features/searcher/TabsLineButtons";
import { isLiveModeAtom } from "~core/store/queryState";
import { isLoadingAtom, lastRanJobAtom } from "~core/search";
import { idleHintsEnabledAtom } from "~components/ui/editor/Editor";

const LogsToolbar = () => {
  const [expanded, setExpanded] = useAtom(msgExpandedByDefaultAtom);
  return (
    <Stack
      direction="row"
      alignItems="center"
      px={2}
      py={0.5}
      borderBottom={`1px solid ${token("colors.border.muted")}`}
      gap={1}
    >
      <Tooltip
        content={expanded ? "Collapse all messages" : "Expand all messages"}
        openDelay={300}
        portalled
      >
        <IconButton
          aria-label={
            expanded ? "Collapse all messages" : "Expand all messages"
          }
          size="2xs"
          variant="ghost"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? <LuChevronsUp /> : <LuChevronsDown />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const MainContainer = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* scrollbar-gutter: stable; */
  overflow: hidden;
`;

const onQueryExecuted = (_state: QueryState) => {};

export const Searcher: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>("logs");
  const jobStatus = useAtomValue(jobMetadataAtom);

  const hasTableView = jobStatus?.views.table !== undefined;
  const tableTotalRows = jobStatus?.views.table?.totalRows ?? 0;
  const eventsTotal = jobStatus?.views.events.total ?? 0;
  const hasViewChart = jobStatus?.views.view !== undefined;

  const editor = useAtomValue(queryEditorAtom);

  const queryActions = useQueryActions();
  const setDateSelectorIsOpen = useSetAtom(isDateSelectorOpenAtom);
  const [_isLiveMode, setIsLiveMode] = useAtom(isLiveModeAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const lastRanJob = useAtomValue(lastRanJobAtom);
  const setIdleHintsEnabled = useSetAtom(idleHintsEnabledAtom);

  const [viewSelectedForQuery, setViewSelectedForQuery] = useAtom(
    viewSelectedForQueryAtom,
  );

  const selectTab = (tab: string) => {
    setViewSelectedForQuery(true);
    setSelectedTab(tab);
  };

  useQueryExecutedEffect(onQueryExecuted);

  useEffect(() => {
    if (viewSelectedForQuery) {
      return; // do nothing
    }

    // otherwise, select the tab based on the data available
    if (jobStatus?.views.table === undefined) {
      setSelectedTab("logs");
    } else {
      setSelectedTab("table");
    }
  }, [jobStatus, viewSelectedForQuery]);

  useShortcuts(searcherShortcuts, (shortcut) => {
    switch (shortcut) {
      case "select-time":
        setDateSelectorIsOpen((prev) => !prev);
        break;
      case "query":
        setDateSelectorIsOpen(false);
        setTimeout(() => editor?.focus(), 0);
        break;
      case "copy-link":
        queryActions.copyCurrentShareLink();
        break;
      case "toggle-until-now":
        queryActions.toggleUntilNow();
        break;
      case "toggle-live-mode":
        if (!isLoading && lastRanJob) {
          setIsLiveMode((prev) => !prev);
        }
        break;
      case "toggle-idle-hints":
        setIdleHintsEnabled((prev) => !prev);
        break;
    }
  });

  return (
    <MainContainer id="cruncher-inner-root">
      <Header />
      <Tabs.Root
        lazyMount
        unmountOnExit
        value={selectedTab}
        css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        `}
        onValueChange={(e) => selectTab(e.value)}
      >
        <Tabs.List
          zIndex={10}
          alignItems="center"
          px={4}
          gap={1}
          css={css`
            background-color: ${token("colors.bg.subtle")};
            border-bottom: 1px solid ${token("colors.border")};
          `}
        >
          <Tabs.Trigger value="logs">
            <LuLogs /> Logs{" "}
            {eventsTotal > 0 && (
              <Badge colorPalette="indigo" variant="subtle">
                {eventsTotal}
              </Badge>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="table" disabled={!hasTableView}>
            <LuTable /> Table{" "}
            {tableTotalRows > 0 && (
              <Badge colorPalette="indigo" variant="subtle">
                {tableTotalRows}
              </Badge>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="view" disabled={!hasViewChart}>
            <LuChartArea /> View
          </Tabs.Trigger>
          <TabsLineButtons />
        </Tabs.List>
        <Tabs.Content
          value="logs"
          minH="0"
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          p={0}
        >
          <EventsHistogram />
          <LogsToolbar />
          <DataLog />
        </Tabs.Content>
        <Tabs.Content
          value="table"
          minH="0"
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          p={0}
        >
          {hasTableView && <TableView />}
        </Tabs.Content>
        <Tabs.Content value="view" minH="0" flex={1} overflow={"auto"} p={0}>
          <ViewChart />
        </Tabs.Content>
      </Tabs.Root>
      <div
        id="cruncher-popovers"
        css={css`
          z-index: 11;
        `}
      ></div>
    </MainContainer>
  );
};
