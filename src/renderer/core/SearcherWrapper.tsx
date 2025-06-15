import { Box, IconButton, Stack } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { atom, createStore, Provider, useAtom, useAtomValue } from "jotai";
import React, { useState } from "react";
import { VscAdd, VscClose } from "react-icons/vsc";
import { UrlNavigationSchema } from "src/plugins_engine/protocolOut";
import { v4 as uuidv4 } from "uuid";
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { parseDate } from "~lib/dateUtils";
import { createSignal, Signal } from "~lib/utils";
import { Searcher } from "./Searcher";
import { searcherGlobalShortcuts, useShortcuts } from "./keymaps";
import { notifyError } from "./notifyError";
import {
  appStoreAtom,
  lastRanJobAtom,
  runQueryForStore,
  selectedSearchProfileIndexAtom,
  useMessageEvent
} from "./search";
import { appStore } from "./store/appStore";
import { endFullDateAtom, startFullDateAtom } from "./store/dateState";
import {
  QuerySpecificContext,
  searchQueryAtom,
  tabNameAtom,
} from "./store/queryState";

const createNewTab = (label?: string) => {
  const store = createStore();
  const tabLabel = label || "New Search";
  store.set(tabNameAtom, tabLabel);
  return {
    store,
    readySignal: createSignal<void>(),
    key: uuidv4(),
  };
};

type Tab = {
  store: ReturnType<typeof createStore>;
  readySignal: Signal<void>;
  key: string;
};

const tabsAtom = atom<Tab[]>([createNewTab()]);
const selectedAtom = atom(0);

export const useTabs = () => {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [selectedTab, setSelectedTab] = useAtom(selectedAtom);

  const addTab = (label?: string) => {
    const createdTab = createNewTab(label);
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

  const removeTab = async (key: string) => {
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
    const deletedTab = tabs[originalTabIndex];
    const controller = deletedTab.store.get(appStoreAtom).controller;
    const lastRanJob = deletedTab.store.get(lastRanJobAtom);
    console.log(
      `Removing tab with key ${key}, last ran job was ${lastRanJob?.id}`
    );
    if (lastRanJob) {
      controller.releaseResources(lastRanJob.id);
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

  const renameTab = (key: string, newLabel: string) => {
    const tab = tabs.find((tab) => tab.key === key);
    if (!tab) {
      notifyError(
        `Tab with key ${key} not found`,
        new Error(`Tab with key ${key} not found`)
      );
      return;
    }

    tab.store.set(tabNameAtom, newLabel || "New Search");
  };

  return { tabs, addTab, removeTab, selectedTab, setSelectedTab, renameTab };
};

const useInitializeAtoms = (tab: Tab) => {
  // this force initializes atoms in the store
  useAtomValue(appStoreAtom, {store: tab.store});
  tab.readySignal.signal();
}

export const SearcherWrapper = () => {
  // TODO: Implement tab selection logic
  const { tabs, addTab, removeTab, selectedTab, setSelectedTab } = useTabs();

  useMessageEvent(UrlNavigationSchema, {
    callback: async (urlNavigationMessage) => {
      console.log("URL Navigation message received:", urlNavigationMessage);

      const parsedUrl = new URL(urlNavigationMessage.payload.url);
      const tabName = parsedUrl.searchParams.get("name") || "New Search";
      const startFullDate = parsedUrl.searchParams.get("startTime");
      const endFullDate = parsedUrl.searchParams.get("endTime");
      const searchQuery = parsedUrl.searchParams.get("searchQuery");
      const selectedProfile = parsedUrl.searchParams.get("profile");
      const initialStartTime = parseDate(startFullDate) ?? undefined;
      const initialEndTime = parseDate(endFullDate) ?? undefined;
      const initialQuery = searchQuery || "";

      console.log("Parsed URL parameters:", {
        startFullDate: initialStartTime,
        endFullDate: initialEndTime,
        searchQuery: initialQuery,
        profile: selectedProfile,
        tabName,
      });

      // create new tab with label from URL
      const createdTab = addTab(tabName);

      const querySpecificStore = createdTab.createdTab.store;

      querySpecificStore.set(searchQueryAtom, initialQuery);
      querySpecificStore.set(startFullDateAtom, initialStartTime);
      querySpecificStore.set(endFullDateAtom, initialEndTime);

      if (selectedProfile) {
        // for backward compatibility
        const instances = appStore.getState().initializedInstances;
        const selectedInstanceIndex = instances.findIndex(
          (instance) => instance.name === selectedProfile
        );
        if (selectedInstanceIndex === -1) {
          notifyError(
            `Profile \"${selectedProfile}\" not found. Please select a valid profile.`,
            new Error(`Profile \"${selectedProfile}\" not found.`)
          );
        }

        querySpecificStore.set(
          selectedSearchProfileIndexAtom,
          selectedInstanceIndex
        );
      }
      setSelectedTab(createdTab.index);
      await createdTab.createdTab.readySignal.wait({
        timeout: 5000,
      });
      await runQueryForStore(createdTab.createdTab.store, true);
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

  // Tab bar rendering
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
            <DisplayTab key={tab.key} tab={tab} index={index} />
          ))}
          <Tooltip
            content={
              <span>
                Add Tab{" "}
                <Shortcut
                  keys={searcherGlobalShortcuts.getAlias("create-new-tab")}
                />
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

const DisplayTab: React.FC<{
  tab: Tab;
  index: number;
}> = ({ tab, index }) => {
  const { removeTab, selectedTab, setSelectedTab, renameTab } = useTabs();
  const [editingTabKey, setEditingTabKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  useInitializeAtoms(tab);

  const onTabRename = (key: string, newLabel: string) => {
    if (!newLabel || newLabel.trim() === "") {
      notifyError(
        "Tab name cannot be empty",
        new Error("Tab name cannot be empty")
      );
      return;
    }
    renameTab(key, newLabel);
    setEditingTabKey(null);
  };

  return (
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
      onDoubleClick={() => {
        setEditingTabKey(tab.key);
        const label = tab.store.get(tabNameAtom);
        setEditingValue(label);
      }}
    >
      {editingTabKey === tab.key ? (
        <input
          autoFocus
          value={editingValue}
          style={{
            width: Math.max(80, editingValue.length * 8),
            background: "rgba(0,0,0,0.3)",
            color: "white",
            border: "1px solid #3182ce",
            borderRadius: 4,
            padding: "2px 6px",
          }}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={() => onTabRename(tab.key, editingValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onTabRename(tab.key, editingValue);
            } else if (e.key === "Escape") {
              setEditingTabKey(null);
            }
          }}
        />
      ) : (
        <span>{tab.store.get(tabNameAtom)}</span>
      )}
      <Tooltip
        content={
          <span>
            Close {selectedTab === index && "Active"} Tab{" "}
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
            e.stopPropagation();
            removeTab(tab.key);
          }}
        >
          <VscClose />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
