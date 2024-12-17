import { Badge, Tabs } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { LuChartArea, LuLogs, LuTable } from "react-icons/lu";
import { Provider } from "~components/ui/provider";
import { Tooltip } from "~components/ui/tooltip";
import { QueryProvider } from "./common/interface";
import { isDateSelectorOpen } from "./DateSelector";
import { queryEditorAtom } from "./Editor";
import DataLog from "./events/DataLog";
import Header from "./Header";
import { globalShortcuts } from "./keymaps";
import { getCruncherRoot } from "./shadowUtils";
import { dataViewModelAtom, eventsAtom } from "./store/queryState";
import { store } from "./store/store";
import { TableView } from "./table/TableView";
import { TimeChart } from "./TimeChart";
import { Toaster } from "react-hot-toast";

const MainContainer = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: rgb(17, 18, 23);
`;

type MainContentProps = {
  controller: QueryProvider;
};

const MainContentInner: React.FC<MainContentProps> = ({ controller }) => {
  const [selectedTab, setSelectedTab] = useState<string | null>("logs");
  const events = useAtomValue(eventsAtom);
  const dataViewModel = useAtomValue(dataViewModelAtom);
  const [, tableView] = dataViewModel ?? [undefined, undefined];

  const editor = useAtomValue(queryEditorAtom);

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
          <Tooltip content="TBD Not Implemented yet">
            <Tabs.Trigger value="view" disabled={true}>
              <LuChartArea /> View
            </Tabs.Trigger>
          </Tooltip>
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
          {tableView && (
            <TableView
              columns={tableView.columns}
              dataPoints={tableView.dataPoints}
            />
          )}
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
