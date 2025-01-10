import { Badge, Tabs } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { LuChartArea, LuLogs, LuTable } from "react-icons/lu";
import { Provider } from "~components/ui/provider";
import { Tooltip } from "~components/ui/tooltip";
import { QueryProvider } from "./common/interface";
import { isDateSelectorOpen } from "./DateSelector";
import { queryEditorAtom } from "./Editor";
import DataLog from "./events/DataLog";
import Header from "./Header";
import { globalShortcuts } from "./keymaps";
import {
  isLoadingAtom,
  runQuery,
  setup,
} from "./search";
import { getCruncherRoot } from "./shadowUtils";
import {
  endFullDateAtom,
  FullDate,
  startFullDateAtom,
} from "./store/dateState";
import {
  dataViewModelAtom,
  eventsAtom,
  searchQueryAtom,
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

type QueryExecuted = {
  query: string;
  startTime: FullDate;
  endTime: FullDate;
}

type MainContentProps = {
  controller: QueryProvider;
  initialStartTime?: FullDate;
  initialEndTime?: FullDate;
  initialQuery?: string;

  callbacks?: {
    onQueryChange?: (query: string) => void;
    onStartDateSelectChange?: (start: FullDate | undefined) => void;
    onEndDateSelectChange?: (end: FullDate | undefined) => void;
    onQueryExecuted?: (query: QueryExecuted) => void;
  };
};

const MainContentInner: React.FC<MainContentProps> = ({
  controller,
  initialStartTime,
  initialEndTime,
  initialQuery,
  callbacks,
}) => {
  const [selectedTab, setSelectedTab] = useState<string | null>("logs");
  const events = useAtomValue(eventsAtom);
  const { table: tableView, view: viewChart } = useAtomValue(dataViewModelAtom);

  const editor = useAtomValue(queryEditorAtom);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialStartTime !== undefined) {
      store.set(startFullDateAtom, initialStartTime);
    }

    if (initialEndTime !== undefined) {
      store.set(endFullDateAtom, initialEndTime);
    }

    if (initialQuery !== undefined) {
      store.set(searchQueryAtom, initialQuery);
    }

    const searchQueryUnsubscriber = callbacks?.onQueryChange
      ? store.sub(searchQueryAtom, () => {
          const currValue = store.get(searchQueryAtom);
          callbacks.onQueryChange?.(currValue);
        })
      : undefined;
    const startDateUnsubscriber = callbacks?.onStartDateSelectChange
      ? store.sub(startFullDateAtom, () => {
          const currValue = store.get(startFullDateAtom);
          callbacks.onStartDateSelectChange?.(currValue);
        })
      : undefined;
    const endDateUnsubscriber = callbacks?.onEndDateSelectChange
      ? store.sub(endFullDateAtom, () => {
          const currValue = store.get(endFullDateAtom);
          callbacks.onEndDateSelectChange?.(currValue);
        })
      : undefined;

    const lastExecutedQueryUnsubscriber = callbacks?.onQueryExecuted
      ? store.sub(isLoadingAtom, () => {
          const currStartDate = store.get(startFullDateAtom)!; // it's impossible to be undefined
          const currEndDate = store.get(endFullDateAtom)!; // it's impossible to be undefined
          const currQuery = store.get(searchQueryAtom);

          callbacks.onQueryExecuted?.({
            query: currQuery,
            startTime: currStartDate,
            endTime: currEndDate,
          });
        })
      : undefined;

    setup(controller).then(() => {
      setIsInitialized(true);
      if (
        initialQuery !== undefined &&
        initialStartTime !== undefined &&
        initialEndTime !== undefined
      ) {
        // execute the query
        runQuery(
          controller,
          {
            searchTerm: store.get(searchQueryAtom),
            fromTime: store.get(startFullDateAtom),
            toTime: store.get(endFullDateAtom),
          },
          true
        );
      }
    });

    return () => {
      searchQueryUnsubscriber?.();
      startDateUnsubscriber?.();
      endDateUnsubscriber?.();
      lastExecutedQueryUnsubscriber?.();
    };
  }, []);

  useEffect(() => {
    if (tableView === undefined) {
      setSelectedTab("logs");
    } else {
      setSelectedTab("table");
    }
  }, [tableView]);

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
    return null; // TODO: replace with loader
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
      <Header controller={controller} />
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
        onValueChange={(e) => setSelectedTab(e.value)}
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
