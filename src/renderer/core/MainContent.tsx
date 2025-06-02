import { Badge, ProgressCircle, Tabs } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Provider as JotaiProvider, useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { LuChartArea, LuLogs, LuTable } from "react-icons/lu";
import { Provider } from "~components/ui/provider";
import { isDateSelectorOpen } from "./DateSelector";
import { queryEditorAtom } from "./Editor";
import DataLog from "./events/DataLog";
import Header from "./Header";
import { globalShortcuts } from "./keymaps";
import { getShareLink, setup, subscribeToQueryExecuted } from "./search";
import { getCruncherRoot } from "./shadowUtils";
import {
  dataViewModelAtom,
  eventsAtom,
  viewSelectedForQueryAtom
} from "./store/queryState";
import { store } from "./store/store";
import { TableView } from "./table/TableView";
import { TimeChart } from "./TimeChart";
import { ViewChart } from "./view/ViewChart";

const MainContainer = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: rgb(17, 18, 23);
  /* scrollbar-gutter: stable; */
  overflow: hidden;
`;

type MainContentProps = {
};

const MainContentInner: React.FC<MainContentProps> = ({ }) => {
  const [selectedTab, setSelectedTab] = useState<string | null>("logs");
  const events = useAtomValue(eventsAtom);
  const { table: tableView, view: viewChart } = useAtomValue(dataViewModelAtom);

  const editor = useAtomValue(queryEditorAtom);

  const [isInitialized, setIsInitialized] = useState(false);

  const [viewSelectedForQuery, setViewSelectedForQuery] = useAtom(
    viewSelectedForQueryAtom
  );

  const selectTab = (tab: string) => {
    setViewSelectedForQuery(true);
    setSelectedTab(tab);
  };

  useEffect(() => {
    const unsub = subscribeToQueryExecuted((state) => {
      console.log("Query state updated:", state);

      console.log("shareable link:", getShareLink(state));
    })
    
    setup().then(() => {
      setIsInitialized(true);
    });

    return () => {
      unsub();
    };
  }, []);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const root = getCruncherRoot();
      if (!root) {
        return;
      }

      if (globalShortcuts.isPressed(e, "select-time")) {
        e.preventDefault();
        store.set(isDateSelectorOpen, (prev) => !prev);
      } else if (globalShortcuts.isPressed(e, "query")) {
        e.preventDefault();
        store.set(isDateSelectorOpen, false);
        // required to focus on the input after the tab is changed
        setTimeout(() => editor?.focus(), 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [editor]);

  if (!isInitialized) {
    return (
      <MainContainer
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ProgressCircle.Root value={null} size="lg">
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Circle>
        </ProgressCircle.Root>
      </MainContainer>
    );
  }

  return (
    <MainContainer id="cruncher-inner-root">
      <Toaster
        toastOptions={{
          style: {
            zIndex: 1000,
          },
          duration: 10000,
        }}
      />
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

const MainContent: React.FC<MainContentProps> = (props) => {
  return (
    <Provider>
      <JotaiProvider store={store}>
        <MainContentInner {...props} />
      </JotaiProvider>
    </Provider>
  );
};

export default MainContent;
