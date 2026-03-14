import {
  Box,
  Button,
  HStack,
  Heading,
  IconButton,
  Input,
  NumberInput,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuArrowDown, LuArrowUp, LuRefreshCw } from "react-icons/lu";
import { Tooltip } from "~components/ui/tooltip";
import {
  pendingNavigationUrlAtom,
  useInitializedController,
} from "~core/search";
import { useApplicationStore } from "~core/store/appStore";
import { HistoryCard } from "./-_shared";

export const Route = createFileRoute("/history")({
  component: QueryHistoryPage,
});

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

type SortBy = "createdAt" | "completedAt" | "diskBytes" | "rowCount" | "status";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "completedAt", label: "Duration" },
  { value: "diskBytes", label: "Disk" },
  { value: "rowCount", label: "Rows" },
  { value: "status", label: "Status" },
];

function QueryHistoryPage() {
  const controller = useInitializedController();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [, setPendingUrl] = useAtom(pendingNavigationUrlAtom);
  const generalSettings = useApplicationStore((s) => s.generalSettings);
  const updateGeneralSettings = useApplicationStore(
    (s) => s.updateGeneralSettings,
  );
  const maxHistoryEntries = generalSettings?.maxHistoryEntries ?? 100;

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleSort = (field: SortBy) => {
    if (field === sortBy) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const handleMaxHistoryChange = useCallback(
    async (value: number) => {
      const entries = value <= 0 ? null : value;
      updateGeneralSettings({ maxHistoryEntries: entries });
      await controller.setGeneralSettings(
        generalSettings?.liveInterval ?? "5s",
        generalSettings?.maxLogs ?? 100000,
        generalSettings?.liveAutoStopMinutes ?? 30,
        generalSettings?.timezone ?? "local",
        entries,
      );
      queryClient.invalidateQueries({ queryKey: ["queryHistory"] });
    },
    [controller, generalSettings, queryClient, updateGeneralSettings],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: loadedTasks } = useQuery({
    queryKey: ["loadedTaskIds"],
    queryFn: () => controller.getLoadedTaskIds(),
    refetchInterval: 3000,
  });
  const mountedSet = new Set((loadedTasks ?? []).map((t) => t.id));
  const liveSet = new Set(
    (loadedTasks ?? []).filter((t) => t.isLive).map((t) => t.id),
  );

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["queryHistory", debouncedSearch, sortBy, sortDir],
    queryFn: ({ pageParam = 0 }) =>
      controller.getQueryHistory(
        PAGE_SIZE,
        pageParam as number,
        debouncedSearch || undefined,
        sortBy,
        sortDir,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((sum, p) => sum + p.entries.length, 0);
      return fetched < lastPage.total ? fetched : undefined;
    },
    refetchInterval: 5000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRunAgain = useCallback(
    async (
      searchTerm: string,
      searchProfile: string,
      fromTime: number | null,
      toTime: number | null,
    ) => {
      const params = new URLSearchParams();
      params.set("searchQuery", searchTerm);
      if (searchProfile) params.set("profile", searchProfile);
      if (fromTime != null) params.set("startTime", String(fromTime));
      if (toTime != null) params.set("endTime", String(toTime));
      const url = `cruncher://main?${params.toString()}`;
      setPendingUrl(url);
      await navigate({ to: "/" });
    },
    [setPendingUrl, navigate],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await controller.deleteHistoryEntry(id);
      queryClient.invalidateQueries({ queryKey: ["queryHistory"] });
    },
    [controller, queryClient],
  );

  const handleClearAll = useCallback(async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    await controller.clearQueryHistory();
    queryClient.invalidateQueries({ queryKey: ["queryHistory"] });
    setClearConfirm(false);
  }, [clearConfirm, controller, queryClient]);

  const allEntries = data?.pages.flatMap((p) => p.entries) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
      minH={0}
      overflow="hidden"
    >
      {/* Sticky header */}
      <Box px={6} pt={6} pb={3} flexShrink={0}>
        <Stack direction="row" justify="space-between" align="center" mb={4}>
          <Heading size="lg">Query History</Heading>
          <Stack direction="row" align="center" gap={3}>
            <Stack direction="row" align="center" gap={2}>
              <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                Max entries (0=∞):
              </Text>
              <NumberInput.Root
                value={String(maxHistoryEntries ?? 0)}
                min={0}
                step={100}
                width="24"
                size="xs"
                onValueChange={(e) => handleMaxHistoryChange(Number(e.value))}
              >
                <NumberInput.Input />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </Stack>
            <Button
              size="sm"
              colorPalette={clearConfirm ? "red" : "gray"}
              variant="outline"
              onClick={handleClearAll}
              onBlur={() => setClearConfirm(false)}
            >
              {clearConfirm ? "Confirm Clear All?" : "Clear All"}
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" gap={2} align="center">
          <Input
            placeholder="Search history… (live)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="sm"
            maxW="400px"
          />
          {searchInput && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchInput("")}
            >
              Clear
            </Button>
          )}
          <Tooltip content="Refresh">
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Refresh history"
              loading={isFetching && !isFetchingNextPage}
              onClick={() => refetch()}
            >
              <LuRefreshCw />
            </IconButton>
          </Tooltip>
          {data && (
            <Text fontSize="xs" color="fg.muted">
              {total} {total === 1 ? "entry" : "entries"}
            </Text>
          )}
        </Stack>

        <HStack gap={1} flexWrap="wrap" mt={2}>
          <Text fontSize="xs" color="fg.subtle" mr={1}>
            Sort:
          </Text>
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.value;
            return (
              <Button
                key={opt.value}
                size="xs"
                variant={active ? "subtle" : "ghost"}
                colorPalette={active ? "blue" : "gray"}
                onClick={() => handleSort(opt.value)}
              >
                {opt.label}
                {active &&
                  (sortDir === "desc" ? <LuArrowDown /> : <LuArrowUp />)}
              </Button>
            );
          })}
        </HStack>
      </Box>

      {/* Scrollable content */}
      <Box flex={1} minH={0} overflowY="auto" px={6} pb={6}>
        {isLoading ? (
          <Text color="fg.muted">Loading…</Text>
        ) : allEntries.length === 0 ? (
          <Box py={12} textAlign="center">
            <Text color="fg.muted">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : "No query history yet. Run a search to get started."}
            </Text>
          </Box>
        ) : (
          <>
            <Stack gap={3}>
              {allEntries.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onRunAgain={handleRunAgain}
                  onDelete={handleDelete}
                  isMounted={mountedSet.has(entry.id)}
                  isLive={liveSet.has(entry.id)}
                />
              ))}
            </Stack>

            {/* Infinite scroll sentinel */}
            <Box ref={sentinelRef} py={2} textAlign="center">
              {isFetchingNextPage && (
                <Text fontSize="xs" color="fg.muted">
                  Loading more…
                </Text>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
