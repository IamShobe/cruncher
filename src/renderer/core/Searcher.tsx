import { Badge, Tabs } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { LuChartArea, LuLogs, LuTable } from "react-icons/lu";
import { isDateSelectorOpenAtom } from "./DateSelector";
import { queryEditorAtom } from "./Editor";
import DataLog from "./events/DataLog";
import Header from "./Header";
import { searcherShortcuts, useShortcuts } from "./keymaps";
import {
  getShareLink,
  QueryState,
  useQueryActions,
  useQueryExecutedEffect
} from "./search";
import {
  jobMetadataAtom,
  viewSelectedForQueryAtom
} from "./store/queryState";
import { TimeChart } from "./TimeChart";
import { ViewChart } from "./view/ViewChart";
import { TableView } from "./table/TableView";

const MainContainer = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* scrollbar-gutter: stable; */
  overflow: hidden;
`;

const onQueryExecuted = (state: QueryState) => {
  console.log("Query state updated:", state);

  console.log("shareable link:", getShareLink(state));
};

export type SearcherProps = {};

export const Searcher: React.FC<SearcherProps> = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>("logs");
  const jobStatus = useAtomValue(jobMetadataAtom);

  const hasTableView = jobStatus?.views.table !== undefined;
  const tableTotalRows = jobStatus?.views.table?.totalRows ?? 0;
  const eventsTotal = jobStatus?.views.events.total ?? 0;
  const hasViewChart = jobStatus?.views.view !== undefined;

  const editor = useAtomValue(queryEditorAtom);

  const queryActions = useQueryActions();
  const setDateSelectorIsOpen = useSetAtom(isDateSelectorOpenAtom);

  const [viewSelectedForQuery, setViewSelectedForQuery] = useAtom(
    viewSelectedForQueryAtom
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
        <Tabs.List zIndex={10}>
          <Tabs.Trigger value="logs">
            <LuLogs /> Logs{" "}
            {eventsTotal > 0 && <Badge>{eventsTotal}</Badge>}
          </Tabs.Trigger>
          <Tabs.Trigger value="table" disabled={!hasTableView}>
            <LuTable /> Table{" "}
            {tableTotalRows > 0 && <Badge>{tableTotalRows}</Badge>}
          </Tabs.Trigger>
          <Tabs.Trigger value="view" disabled={!hasViewChart}>
            <LuChartArea /> View
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="logs"
          minH="0"
          flex={1}
          display={"flex"}
          flexDirection={"column"}
        >
          <TimeChart />
          <DataLog />
        </Tabs.Content>
        <Tabs.Content
          value="table"
          minH="0"
          flex={1}
          display={"flex"}
          flexDirection={"column"}
        >
          {hasTableView && (
            <TableView/>
          )}
        </Tabs.Content>
        <Tabs.Content value="view" minH="0" flex={1} overflow={"auto"}>
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
