import {
  Badge,
  Box,
  Grid,
  HStack,
  Heading,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LuActivity,
  LuTriangleAlert,
  LuCpu,
  LuDatabase,
  LuHash,
  LuLayers,
  LuMemoryStick,
  LuPuzzle,
  LuRows3,
} from "react-icons/lu";
import { token } from "~components/ui/system";
import { useInitializedController } from "~core/search";
import { formatBytes, HistoryCard, type HistoryEntry } from "./-_shared";

export const Route = createFileRoute("/engine-status")({
  component: EngineStatusPage,
});

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m < 60) return remS > 0 ? `${m}m ${remS}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
}

const StatTile = styled.div`
  background: ${token("colors.bg.subtle")};
  border: 1px solid ${token("colors.border")};
  border-radius: ${token("radii.md")};
  padding: ${token("spacing.3")} ${token("spacing.4")};
  display: flex;
  flex-direction: column;
  gap: ${token("spacing.1")};
`;

const ComponentCard = styled.div`
  background: ${token("colors.bg.subtle")};
  border: 1px solid ${token("colors.border")};
  border-radius: ${token("radii.md")};
  padding: ${token("spacing.3")} ${token("spacing.4")};
  display: flex;
  flex-direction: column;
  gap: ${token("spacing.2")};
  min-width: 220px;
`;

const StaleAlert = styled.div`
  background: ${token("colors.bg.subtle")};
  border: 1px solid ${token("colors.border.emphasized")};
  border-left: 3px solid ${token("colors.orange.400")};
  border-radius: ${token("radii.md")};
  padding: ${token("spacing.2")} ${token("spacing.4")};
  display: flex;
  align-items: center;
  gap: ${token("spacing.2")};
  margin-bottom: ${token("spacing.4")};
`;

function activeTaskToHistoryEntry(t: {
  taskId: string;
  searchTerm: string;
  searchProfile: string;
  status: string;
  createdAt: number;
  error: string | null;
  subtaskIds: string[];
  cachedRowCount: number;
  cachedBytes: number;
}): HistoryEntry {
  return {
    id: t.taskId,
    searchTerm: t.searchTerm,
    searchProfile: t.searchProfile,
    status: t.status,
    createdAt: t.createdAt,
    completedAt: null,
    rowCount: null,
    diskBytes: null,
    subtaskIds: t.subtaskIds,
    fromTime: null,
    toTime: null,
    memoryRows: t.cachedRowCount > 0 ? t.cachedRowCount : undefined,
    memoryBytes: t.cachedBytes > 0 ? t.cachedBytes : undefined,
  };
}

function EngineStatusPage() {
  const controller = useInitializedController();
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["engineStatus"],
    queryFn: () => controller.getEngineStatus(),
    refetchInterval: 500,
  });

  if (isLoading || !data) {
    return (
      <Box p={6}>
        <Text color="fg.muted">Loading engine status…</Text>
      </Box>
    );
  }

  const now = Date.now();
  const runningTasks = data.activeTasks.filter((t) => t.status === "running");
  const failedTasks = data.activeTasks.filter((t) => t.status === "failed");
  const staleTasks = data.activeTasks.filter(
    (t) => t.status === "running" && now - t.lastActivityAt > 60_000,
  );
  const totalSubtasks = data.activeTasks.reduce(
    (s, t) => s + t.subTaskCount,
    0,
  );

  // Which profiles are currently running tasks
  const activeProfiles = new Set(runningTasks.map((t) => t.searchProfile));

  // Which plugin instances are linked to active profiles
  const activeInstances = new Set<string>();
  for (const sp of data.searchProfiles) {
    if (activeProfiles.has(sp.name)) {
      sp.instances.forEach((i) => activeInstances.add(i));
    }
  }

  const totalCachedBytes = data.activeTasks.reduce(
    (s, t) => s + t.cachedBytes,
    0,
  );

  const lastUpdated =
    dataUpdatedAt > 0
      ? `Updated ${formatDuration(now - dataUpdatedAt)} ago`
      : "";

  return (
    <Box p={6} flex={1} overflow="auto">
      {/* Header */}
      <HStack justify="space-between" mb={5}>
        <HStack gap={2}>
          <LuActivity size={16} />
          <Heading size="md">Engine Status</Heading>
        </HStack>
        {lastUpdated && (
          <Text fontSize="xs" color="fg.subtle">
            {lastUpdated}
          </Text>
        )}
      </HStack>

      {/* Stale tasks alert */}
      {staleTasks.length > 0 && (
        <StaleAlert>
          <LuTriangleAlert size={14} color={token("colors.orange.500")} />
          <Text fontSize="sm" color="orange.600">
            {staleTasks.length} running task
            {staleTasks.length > 1 ? "s" : ""} with no activity for &gt;60s:{" "}
            <Text as="span" fontFamily="mono" fontSize="xs">
              {staleTasks.map((t) => t.taskId.slice(0, 8)).join(", ")}
            </Text>
          </Text>
        </StaleAlert>
      )}

      {/* Stat tiles */}
      <Grid
        templateColumns="repeat(auto-fill, minmax(140px, 1fr))"
        gap={3}
        mb={6}
      >
        <StatTile>
          <Text fontSize="xs" color="fg.muted">
            Loaded Tasks
          </Text>
          <HStack gap={2} align="baseline">
            <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
              {data.activeTaskCount}
            </Text>
            {runningTasks.length > 0 && (
              <Badge size="xs" colorPalette="green" variant="subtle">
                {runningTasks.length} running
              </Badge>
            )}
            {failedTasks.length > 0 && (
              <Badge size="xs" colorPalette="red" variant="subtle">
                {failedTasks.length} failed
              </Badge>
            )}
          </HStack>
        </StatTile>

        <StatTile>
          <Text fontSize="xs" color="fg.muted">
            Subtasks
          </Text>
          <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
            {totalSubtasks}
          </Text>
        </StatTile>

        <StatTile>
          <Text fontSize="xs" color="fg.muted">
            Loaded Plugins
          </Text>
          <HStack gap={2} align="baseline">
            <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
              {data.initializedPlugins.length}
            </Text>
            {activeInstances.size > 0 && (
              <Badge size="xs" colorPalette="green" variant="subtle">
                {activeInstances.size} in use
              </Badge>
            )}
          </HStack>
        </StatTile>

        <StatTile>
          <Text fontSize="xs" color="fg.muted">
            Search Profiles
          </Text>
          <HStack gap={2} align="baseline">
            <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
              {data.searchProfiles.length}
            </Text>
            {activeProfiles.size > 0 && (
              <Badge size="xs" colorPalette="green" variant="subtle">
                {activeProfiles.size} active
              </Badge>
            )}
          </HStack>
        </StatTile>

        <StatTile>
          <HStack gap={1} color="fg.muted" mb={1}>
            <LuDatabase size={11} />
            <Text fontSize="xs">Total Disk</Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
            {data.totalDiskBytes != null
              ? formatBytes(data.totalDiskBytes)
              : "—"}
          </Text>
        </StatTile>

        <StatTile>
          <HStack gap={1} color="fg.muted" mb={1}>
            <LuMemoryStick size={11} />
            <Text fontSize="xs">In-Memory</Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
            {totalCachedBytes > 0 ? formatBytes(totalCachedBytes) : "—"}
          </Text>
        </StatTile>

        <StatTile>
          <HStack gap={1} color="fg.muted" mb={1}>
            <LuHash size={11} />
            <Text fontSize="xs">Total Queries</Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
            {data.historyStats.totalQueryCount.toLocaleString()}
          </Text>
        </StatTile>

        <StatTile>
          <HStack gap={1} color="fg.muted" mb={1}>
            <LuRows3 size={11} />
            <Text fontSize="xs">Rows Ingested</Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
            {data.historyStats.totalRowCount.toLocaleString()}
          </Text>
        </StatTile>
      </Grid>

      {/* Components */}
      <Box mb={6}>
        <HStack mb={3} gap={2}>
          <LuCpu size={14} />
          <Heading size="sm">Components</Heading>
        </HStack>
        <HStack gap={3} align="stretch">
          <ComponentCard>
            <HStack justify="space-between">
              <HStack gap={2}>
                <LuDatabase size={13} />
                <Text fontSize="sm" fontWeight="medium">
                  DuckDB Worker
                </Text>
              </HStack>
              <Badge
                size="xs"
                colorPalette={data.workerStats.isDead ? "red" : "green"}
                variant="subtle"
              >
                {data.workerStats.isDead ? "Crashed" : "Healthy"}
              </Badge>
            </HStack>
            <HStack gap={4} fontSize="xs" color="fg.muted">
              <Text>
                In-flight:{" "}
                <Text as="span" fontWeight="semibold" color="fg">
                  {data.workerStats.inflightOps}
                </Text>
              </Text>
              <Text>
                Queued:{" "}
                <Text as="span" fontWeight="semibold" color="fg">
                  {data.workerStats.pendingOps}
                </Text>
              </Text>
              <Text>
                Total ops:{" "}
                <Text as="span" fontWeight="semibold" color="fg">
                  {data.workerStats.totalOpsDispatched.toLocaleString()}
                </Text>
              </Text>
            </HStack>
          </ComponentCard>
        </HStack>
      </Box>

      {/* Active Tasks */}
      <Box mb={6}>
        <HStack mb={3} gap={2}>
          <LuActivity size={14} />
          <Heading size="sm">Loaded Tasks</Heading>
          {data.activeTaskCount > 0 && (
            <Badge size="xs" variant="outline">
              {data.activeTaskCount}
            </Badge>
          )}
        </HStack>
        {data.activeTasks.length === 0 ? (
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor="border"
            bg="bg.subtle"
            textAlign="center"
          >
            <Text color="fg.muted" fontSize="sm">
              No active tasks
            </Text>
          </Box>
        ) : (
          <Stack gap={3}>
            {data.activeTasks.map((t) => (
              <HistoryCard key={t.taskId} entry={activeTaskToHistoryEntry(t)} />
            ))}
          </Stack>
        )}
      </Box>

      {/* Loaded Plugins */}
      <Box mb={6}>
        <HStack mb={3} gap={2}>
          <LuPuzzle size={14} />
          <Heading size="sm">Loaded Plugins</Heading>
        </HStack>
        {data.initializedPlugins.length === 0 ? (
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor="border"
            bg="bg.subtle"
            textAlign="center"
          >
            <Text color="fg.muted" fontSize="sm">
              No plugins loaded
            </Text>
          </Box>
        ) : (
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Instance</Table.ColumnHeader>
                <Table.ColumnHeader>Plugin</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
                <Table.ColumnHeader>Activity</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.initializedPlugins.map((p) => {
                const isActive = activeInstances.has(p.name);
                return (
                  <Table.Row key={p.id}>
                    <Table.Cell fontWeight="medium">
                      <HStack gap={2}>
                        <Box
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg={isActive ? "green.500" : "gray.400"}
                          flexShrink={0}
                        />
                        <Text>{p.name}</Text>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell
                      color="fg.muted"
                      fontFamily="mono"
                      fontSize="xs"
                    >
                      {p.pluginRef}
                    </Table.Cell>
                    <Table.Cell color="fg.muted" fontSize="sm">
                      {p.description || "—"}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        size="xs"
                        colorPalette={isActive ? "green" : "gray"}
                        variant="subtle"
                      >
                        {isActive ? "in use" : "idle"}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Box>

      {/* Search Profiles */}
      <Box mb={6}>
        <HStack mb={3} gap={2}>
          <LuLayers size={14} />
          <Heading size="sm">Search Profiles</Heading>
        </HStack>
        {data.searchProfiles.length === 0 ? (
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor="border"
            bg="bg.subtle"
            textAlign="center"
          >
            <Text color="fg.muted" fontSize="sm">
              No search profiles configured
            </Text>
          </Box>
        ) : (
          <Stack gap={2}>
            {data.searchProfiles.map((sp) => {
              const isActive = activeProfiles.has(sp.name);
              const profileRunning = runningTasks.filter(
                (t) => t.searchProfile === sp.name,
              ).length;
              return (
                <Box
                  key={sp.name}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={isActive ? "green.500" : "border"}
                  bg="bg.subtle"
                >
                  <HStack mb={2} justify="space-between">
                    <HStack gap={2}>
                      <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg={isActive ? "green.500" : "gray.400"}
                        flexShrink={0}
                      />
                      <Text fontWeight="medium" fontSize="sm">
                        {sp.name}
                      </Text>
                    </HStack>
                    {isActive && (
                      <Badge size="xs" colorPalette="green" variant="subtle">
                        {profileRunning} running task
                        {profileRunning !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </HStack>
                  <HStack gap={2} flexWrap="wrap">
                    {sp.instances.map((inst) => {
                      const instActive = activeInstances.has(inst);
                      return (
                        <Badge
                          key={inst}
                          variant="subtle"
                          colorPalette={instActive ? "green" : "blue"}
                          size="sm"
                        >
                          {inst}
                        </Badge>
                      );
                    })}
                  </HStack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
