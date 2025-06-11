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
  useQueryActions,
  useQueryExecutedEffect
} from "./search";
import {
  dataViewModelAtom,
  eventsAtom,
  viewSelectedForQueryAtom
} from "./store/queryState";
import { QueryState } from "./store/store";
import { TableView } from "./table/TableView";
import { TimeChart } from "./TimeChart";
import { ViewChart } from "./view/ViewChart";

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

export type SearcherProps = {
};

export const Searcher: React.FC<SearcherProps> = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>("logs");
  const events = useAtomValue(eventsAtom);
  const { table: tableView, view: viewChart } = useAtomValue(dataViewModelAtom);

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
    if (tableView === undefined) {
      setSelectedTab("logs");
    } else {
      setSelectedTab("table");
    }
  }, [tableView, viewSelectedForQuery]);

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
            {events.data.length > 0 && <Badge>{events.data.length}</Badge>}
          </Tabs.Trigger>
          <Tabs.Trigger value="table" disabled={tableView === undefined}>
            <LuTable /> Table{" "}
            {tableView && tableView.dataPoints.length > 0 && (
              <Badge>{tableView.dataPoints.length}</Badge>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="view" disabled={viewChart === undefined}>
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
          {tableView !== undefined && (
            <TableView
              columns={tableView.columns}
              dataPoints={tableView.dataPoints}
            />
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
