import { Box, IconButton, Stack } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { atom, createStore, Provider, useAtom } from "jotai";
import { VscAdd, VscClose } from "react-icons/vsc";
import { UrlNavigationSchema } from "src/plugins_engine/protocol_out";
import { v4 as uuidv4 } from "uuid";
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { parseDate } from "~lib/dateUtils";
import { Searcher } from "./Searcher";
import { searcherGlobalShortcuts, useShortcuts } from "./keymaps";
import { runQueryForStore, useMessageEvent, useQueryProvider } from "./search";
import { endFullDateAtom, startFullDateAtom } from "./store/dateState";
import { QuerySpecificContext, searchQueryAtom } from "./store/queryState";

const createNewTab = () => {
  return {
    store: createStore(),
    label: "New Search",
    key: uuidv4(),
  };
};

type Tab = {
  store: ReturnType<typeof createStore>;
  label: string;
  key: string;
};

const tabsAtom = atom<Tab[]>([createNewTab()]);
const selectedAtom = atom(0);

export const useTabs = () => {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [selectedTab, setSelectedTab] = useAtom(selectedAtom);

  const addTab = () => {
    const createdTab = createNewTab();
    setTabs((prev) => [...prev, createdTab]);

    return {
      index: tabs.length,
      createdTab: createdTab,
    };
  };

  const getNextAvailableTab = (tabIndex: number) => {
    if (tabIndex === 0) {
      if (tabs.length === 1) {
        throw new Error("No next tab available, only one tab exists");
      }

      const nextTab = tabs[1];
      return nextTab;
    }

    const nextTab = tabs[tabIndex - 1];
    if (!nextTab) {
      throw new Error(`No next tab available for index ${tabIndex}`);
    }

    return nextTab;
  };

  const removeTab = (key: string) => {
    if (tabs.length === 1) {
      console.warn("Cannot remove the last tab, at least one tab must remain");
      return;
    }

    const selectedTabInfo = tabs[selectedTab];
    const originalTabIndex = tabs.findIndex((tab) => tab.key === key);
    if (originalTabIndex === -1) {
      console.warn(`Tab with key ${key} not found, cannot remove`);
      return;
    }

    const newTabs = tabs.filter((tab) => tab.key !== key);

    setTabs(newTabs);
    if (selectedTab === originalTabIndex) {
      const tab = getNextAvailableTab(originalTabIndex);
      const tabIndex = newTabs.findIndex((t) => t.key === tab.key);
      setSelectedTab(tabIndex);
    } else {
      const newSelectedIndex = newTabs.findIndex(
        (tab) => tab.key === selectedTabInfo.key
      );
      setSelectedTab(newSelectedIndex);
    }
  };

  return { tabs, addTab, removeTab, selectedTab, setSelectedTab };
};

export const SearcherWrapper = () => {
  // TODO: Implement tab selection logic
  const { tabs, addTab, removeTab, selectedTab, setSelectedTab } = useTabs();
  const controller = useQueryProvider();

  useMessageEvent(UrlNavigationSchema, {
    callback: async (urlNavigationMessage) => {
      console.log("URL Navigation message received:", urlNavigationMessage);

      const parsedUrl = new URL(urlNavigationMessage.payload.url);

      const startFullDate = parsedUrl.searchParams.get("startTime");
      const endFullDate = parsedUrl.searchParams.get("endTime");
      const searchQuery = parsedUrl.searchParams.get("searchQuery");
      const initialStartTime = parseDate(startFullDate) ?? undefined;
      const initialEndTime = parseDate(endFullDate) ?? undefined;
      const initialQuery = searchQuery || "";

      console.log("Parsed URL parameters:", {
        startFullDate: initialStartTime,
        endFullDate: initialEndTime,
        searchQuery: initialQuery,
      });

      // create new tab
      const createdTab = addTab();

      const store = createdTab.createdTab.store;

      store.set(searchQueryAtom, initialQuery);
      store.set(startFullDateAtom, initialStartTime);
      store.set(endFullDateAtom, initialEndTime);
      setSelectedTab(createdTab.index);
      runQueryForStore(controller, createdTab.createdTab.store, true);
    },
  });

  useShortcuts(searcherGlobalShortcuts, (shortcut) => {
    switch (shortcut) {
      case "create-new-tab": {
        const created = addTab();
        setSelectedTab(created.index);
        break;
      }
      case "close-tab":
        if (tabs.length > 1) {
          removeTab(tabs[selectedTab].key);
        }
        break;
    }
  });

  const selectedTabInfo = tabs[selectedTab];

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      position="relative"
      width="100%"
      minW={"0"}
    >
      <div
        css={css`
          padding: 0;
          overflow-x: scroll;
          overflow-y: hidden;
          box-sizing: border-box;
          width: 100%;
          gap: 0;
          /* scrollbar-gutter: stable; */
          /* scrollbar-color: rgba(255, 255, 255, 0.2) transparent; */

          &::-webkit-scrollbar {
            height: 4px;
          }
          &::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
          }
        `}
      >
        <Stack direction="row" gap={0} alignItems="center">
          {tabs.map((tab, index) => (
            <Stack
              direction="row"
              key={tab.key}
              css={css`
                padding: 0.5rem;
                color: ${selectedTab === index ? "white" : "gray"};
                background-color: ${selectedTab === index
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent"};
                border-top: ${selectedTab === index
                  ? "4px solid #3182ce"
                  : "4px solid transparent"};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                min-width: 0;
                gap: 0.5rem;
                border-radius: 0;
                transition: background-color 0.2s ease-in-out;
                &:focus,
                &:focus-visible {
                  outline: none;
                  background-color: rgba(255, 255, 255, 0.1);
                }
                &:focus-visible {
                  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.6);
                }
                &:active {
                  background-color: rgba(255, 255, 255, 0.2);
                }
                &:active,
                &:focus,
                &:focus-visible,
                &:hover {
                  background-color: rgba(255, 255, 255, 0.1);
                }
              `}
              onClick={() => setSelectedTab(index)}
            >
              <span>{tab.label}</span>
              <Tooltip
                content={
                  <span>
                    Close {selectedTab === index && ("Active")} Tab{" "}
                    {selectedTab === index && (
                      <Shortcut keys={searcherGlobalShortcuts.getAlias("close-tab")} />
                    )}
                  </span>
                }
                showArrow
                positioning={{
                  placement: "bottom",
                }}
              >
                <IconButton
                  size="2xs"
                  variant="ghost"
                  aria-label="Close tab"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent the button click from selecting the tab
                    removeTab(tab.key);
                  }}
                >
                  <VscClose />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
          <Tooltip
            content={
              <span>
                Add Tab{" "}
                <Shortcut keys={searcherGlobalShortcuts.getAlias("create-new-tab")} />
              </span>
            }
            showArrow
            positioning={{
              placement: "bottom",
            }}
          >
            <IconButton
              size="2xs"
              variant="surface"
              aria-label="Create new tab"
              onClick={() => {
                const created = addTab();
                setSelectedTab(created.index);
              }}
              margin={2}
            >
              <VscAdd />
            </IconButton>
          </Tooltip>
        </Stack>
      </div>
      {selectedTabInfo && (
        <QuerySpecificContext.Provider value={selectedTabInfo.store}>
          <Provider store={selectedTabInfo.store}>
            <Searcher key={selectedTabInfo.key} />
          </Provider>
        </QuerySpecificContext.Provider>
      )}
    </Box>
  );
};
