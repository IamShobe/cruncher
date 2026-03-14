import {
  Badge,
  Box,
  Button,
  IconButton,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { allData } from "@cruncher/qql";
import {
  TextHighlighter,
  type HighlightData,
} from "~components/ui/editor/Highlighter";
import { token } from "~components/ui/system";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LuChevronDown,
  LuChevronRight,
  LuMemoryStick,
  LuPlay,
  LuTrash2,
} from "react-icons/lu";
import { useInitializedController } from "~core/search";
import { Tooltip } from "~components/ui/tooltip";
import type { AdapterLock } from "@cruncher/server-shared";

export const STATUS_COLORS: Record<string, string> = {
  running: "green",
  completed: "blue",
  failed: "red",
  canceled: "gray",
  interrupted: "orange",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      colorPalette={STATUS_COLORS[status] ?? "gray"}
      size="sm"
      variant="subtle"
    >
      {status}
    </Badge>
  );
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatTimestamp(ms: number | null): string {
  if (ms == null) return "—";
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const QueryBlock = styled.div`
  background: ${token("colors.bg.subtle")};
  border: 1px solid ${token("colors.border")};
  border-left: 3px solid ${token("colors.border.emphasized")};
  border-radius: ${token("radii.md")};
  padding: ${token("spacing.2")} ${token("spacing.3")};
  overflow-x: auto;
  font-size: 12px;
`;

export const MetaDot = () => (
  <Text as="span" fontSize="xs" color="fg.subtle" mx={1}>
    ·
  </Text>
);

const SEARCH_TERM_COLLAPSE_THRESHOLD = 80;

export type SubtaskWithChunks = {
  id: string;
  adapterLock: AdapterLock;
  status: string;
  rowCount: number | null;
  diskBytes: number | null;
  fromTime: number | null;
  toTime: number | null;
  createdAt: number;
  fromDedup: boolean;
  dataDir?: string;
  chunks: {
    id: string;
    chunkPath: string;
    rowCount: number;
    diskBytes: number | null;
    minTime: number | null;
    maxTime: number | null;
    fromCache?: boolean;
  }[];
};

function ChunkList({ chunks }: { chunks: SubtaskWithChunks["chunks"] }) {
  return (
    <Box pl={6} py={1} borderLeft="2px solid" borderColor="border" ml={6}>
      {chunks.map((chunk) => (
        <Box
          key={chunk.id}
          display="flex"
          gap={4}
          fontSize="xs"
          color="fg.muted"
          py="2px"
          fontFamily="mono"
          alignItems="center"
        >
          <Text flexShrink={0}>{chunk.chunkPath}</Text>
          {chunk.fromCache && (
            <Badge
              flexShrink={0}
              size="xs"
              colorPalette="teal"
              variant="subtle"
            >
              cached
            </Badge>
          )}
          <Text flexShrink={0}>{chunk.rowCount.toLocaleString()} rows</Text>
          <Text flexShrink={0}>{formatBytes(chunk.diskBytes)}</Text>
          <Text flexShrink={0} whiteSpace="nowrap">
            {formatTimestamp(chunk.minTime)} – {formatTimestamp(chunk.maxTime)}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

export function SubtaskRow({ subtask }: { subtask: SubtaskWithChunks }) {
  const [expanded, setExpanded] = useState(false);
  const hasChunks = subtask.chunks.length > 0;
  const fromCache = subtask.fromDedup;
  const dataMinTime = hasChunks
    ? subtask.chunks.reduce<number | null>(
        (acc, c) =>
          c.minTime != null && (acc == null || c.minTime < acc)
            ? c.minTime
            : acc,
        null,
      )
    : null;
  const dataMaxTime = hasChunks
    ? subtask.chunks.reduce<number | null>(
        (acc, c) =>
          c.maxTime != null && (acc == null || c.maxTime > acc)
            ? c.maxTime
            : acc,
        null,
      )
    : null;

  return (
    <>
      <Table.Row>
        <Table.Cell py={1} w="6">
          {hasChunks && (
            <IconButton
              size="2xs"
              variant="ghost"
              aria-label={expanded ? "Collapse chunks" : "Expand chunks"}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <LuChevronDown /> : <LuChevronRight />}
            </IconButton>
          )}
        </Table.Cell>
        <Table.Cell py={1} fontFamily="mono" fontSize="xs" color="fg.muted">
          {subtask.id}
          {fromCache && (
            <Badge ml={1} size="xs" colorPalette="teal" variant="subtle">
              cached
            </Badge>
          )}
        </Table.Cell>
        <Table.Cell py={1} fontSize="xs" fontFamily="mono">
          {subtask.adapterLock.instanceRef} ({subtask.adapterLock.pluginRef})
        </Table.Cell>
        <Table.Cell py={1}>
          <StatusBadge status={subtask.status} />
        </Table.Cell>
        <Table.Cell py={1} fontSize="xs" color="fg.muted">
          {subtask.rowCount != null ? subtask.rowCount.toLocaleString() : "—"}
        </Table.Cell>
        <Table.Cell py={1} fontSize="xs" color="fg.muted">
          {formatBytes(subtask.diskBytes)}
        </Table.Cell>
        <Table.Cell py={1} fontSize="xs" color="fg.muted" whiteSpace="nowrap">
          {formatTimestamp(dataMinTime)} – {formatTimestamp(dataMaxTime)}
        </Table.Cell>
        <Table.Cell py={1} fontSize="xs" color="fg.muted">
          {subtask.chunks.length}
        </Table.Cell>
      </Table.Row>
      {expanded && hasChunks && (
        <Table.Row>
          <Table.Cell colSpan={8} py={1} bg="bg.subtle">
            <ChunkList chunks={subtask.chunks} />
          </Table.Cell>
        </Table.Row>
      )}
    </>
  );
}

export function SubtasksPanel({
  queryId,
  subtaskIds,
  staleTime = 30_000,
  refetchInterval,
  variant = "history",
}: {
  queryId: string;
  subtaskIds: string[];
  staleTime?: number;
  refetchInterval?: number;
  variant?: "history" | "status";
}) {
  const controller = useInitializedController();
  const { data, isLoading, error } = useQuery({
    queryKey: ["subtasksWithChunks", queryId],
    queryFn: () => controller.getSubtasksWithChunks(queryId, subtaskIds),
    staleTime,
    refetchInterval,
  });

  if (isLoading) {
    return (
      <Box py={2} px={4}>
        <Spinner size="sm" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box py={2} px={4}>
        <Text fontSize="xs" color="red.500">
          Failed to load subtasks
          {error instanceof Error ? `: ${error.message}` : ""}
        </Text>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box py={2} px={4}>
        <Text fontSize="xs" color="fg.muted">
          No subtask data
        </Text>
      </Box>
    );
  }

  const tableVariant = variant === "status" ? "outline" : "line";
  const containerProps =
    variant === "status"
      ? { px: 4, py: 2, bg: "bg.subtle" as const }
      : { borderLeft: "3px solid", borderColor: "border.emphasized", mb: 1 };

  const headerProps =
    variant === "status"
      ? { bg: "bg.subtle" as const }
      : {
          color: "fg.subtle" as const,
          fontSize: "2xs" as const,
          textTransform: "uppercase" as const,
          letterSpacing: "wide" as const,
        };

  return (
    <Box {...containerProps}>
      <Table.Root size="sm" variant={tableVariant}>
        <Table.Header>
          <Table.Row {...(variant === "status" ? { bg: "bg.subtle" } : {})}>
            <Table.ColumnHeader {...headerProps} w="6" />
            <Table.ColumnHeader {...headerProps}>Subtask ID</Table.ColumnHeader>
            <Table.ColumnHeader {...headerProps}>Adapter</Table.ColumnHeader>
            <Table.ColumnHeader {...headerProps}>Status</Table.ColumnHeader>
            <Table.ColumnHeader {...headerProps}>Rows</Table.ColumnHeader>
            <Table.ColumnHeader {...headerProps}>Disk</Table.ColumnHeader>
            <Table.ColumnHeader {...headerProps}>Time range</Table.ColumnHeader>
            <Table.ColumnHeader {...headerProps}>Chunks</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(data as SubtaskWithChunks[]).map((subtask) => (
            <SubtaskRow key={subtask.id} subtask={subtask} />
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

export function CollapsibleSearchTerm({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!value.trim()) {
    return (
      <Text
        fontSize="xs"
        color="fg.subtle"
        fontStyle="italic"
        fontFamily="mono"
      >
        &lt;empty&gt;
      </Text>
    );
  }

  const isLong =
    value.length > SEARCH_TERM_COLLAPSE_THRESHOLD || value.includes("\n");

  const highlightData = useMemo<HighlightData[]>(() => {
    try {
      return allData(value).highlight as HighlightData[];
    } catch {
      return [];
    }
  }, [value]);

  const displayValue =
    isLong && !expanded
      ? value.slice(0, SEARCH_TERM_COLLAPSE_THRESHOLD).trimEnd() + " …"
      : value;

  const displayHighlight = isLong && !expanded ? [] : highlightData;

  return (
    <Box>
      <TextHighlighter value={displayValue} highlightData={displayHighlight} />
      {isLong && (
        <Button
          size="2xs"
          variant="ghost"
          colorPalette="gray"
          mt="1px"
          px={1}
          height="auto"
          minH={0}
          fontSize="2xs"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "show less" : "show more"}
        </Button>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// HistoryCard — shared between Query History and Engine Status pages
// ---------------------------------------------------------------------------

export type HistoryEntry = {
  id: string;
  searchTerm: string;
  searchProfile: string;
  status: string;
  rowCount: number | null;
  createdAt: number;
  completedAt: number | null;
  diskBytes: number | null;
  subtaskIds: string[];
  fromTime: number | null;
  toTime: number | null;
  /** Rows currently held in the in-process memory cache; undefined for history entries. */
  memoryRows?: number;
  /** Estimated byte size of the in-process memory cache; undefined for history entries. */
  memoryBytes?: number;
};

export function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function durationSec(
  createdAt: number,
  completedAt: number | null,
): string | null {
  if (completedAt == null) return null;
  const secs = ((completedAt - createdAt) / 1000).toFixed(1);
  return `${secs}s`;
}

export function durationColorPalette(
  createdAt: number,
  completedAt: number,
): string {
  const ms = completedAt - createdAt;
  if (ms < 1_000) return "green";
  if (ms < 5_000) return "blue";
  if (ms < 15_000) return "yellow";
  if (ms < 60_000) return "orange";
  return "red";
}

export function HistoryCard({
  entry,
  onRunAgain,
  onDelete,
  isMounted = false,
  isLive = false,
}: {
  entry: HistoryEntry;
  onRunAgain?: (
    searchTerm: string,
    searchProfile: string,
    fromTime: number | null,
    toTime: number | null,
  ) => void;
  onDelete?: (id: string) => void;
  isMounted?: boolean;
  isLive?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSubtasks = entry.subtaskIds.length > 0;
  const duration = durationSec(entry.createdAt, entry.completedAt);

  return (
    <Box
      border="1px solid"
      borderColor="border"
      borderRadius="lg"
      overflow="hidden"
      bg="bg"
      _hover={{ borderColor: "border.emphasized" }}
      transition="border-color 0.15s"
    >
      {/* Header */}
      <Stack
        direction="row"
        align="center"
        px={3}
        py={2}
        gap={2}
        bg="bg.subtle"
        borderBottom="1px solid"
        borderColor="border"
        flexWrap="wrap"
      >
        <Stack
          direction="row"
          align="center"
          gap={2}
          flex={1}
          flexWrap="wrap"
          minW={0}
        >
          <StatusBadge status={entry.status} />
          {isLive && (
            <Badge size="xs" colorPalette="green" variant="subtle">
              live
            </Badge>
          )}
          {isMounted && (
            <Badge size="xs" colorPalette="purple" variant="subtle">
              open
            </Badge>
          )}
          <Text fontSize="xs" fontWeight="medium" color="fg">
            {entry.searchProfile}
          </Text>
          <MetaDot />
          <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
            {relativeTime(entry.createdAt)}
          </Text>
          {duration && entry.completedAt != null && (
            <>
              <MetaDot />
              <Badge
                size="xs"
                variant="subtle"
                colorPalette={durationColorPalette(
                  entry.createdAt,
                  entry.completedAt,
                )}
              >
                {duration}
              </Badge>
            </>
          )}
          <Text fontSize="2xs" color="fg.subtle" fontFamily="mono">
            {entry.id}
          </Text>
        </Stack>
        {(onRunAgain || onDelete) && (
          <Stack direction="row" gap={1} flexShrink={0}>
            {onRunAgain && (
              <Tooltip content="Run again">
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Run again"
                  onClick={() =>
                    onRunAgain(
                      entry.searchTerm,
                      entry.searchProfile,
                      entry.fromTime,
                      entry.toTime,
                    )
                  }
                >
                  <LuPlay />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip
                content={
                  isMounted
                    ? "Cannot delete: query is open in a tab"
                    : "Delete entry"
                }
              >
                <IconButton
                  size="xs"
                  variant="ghost"
                  colorPalette="red"
                  aria-label="Delete entry"
                  disabled={isMounted}
                  onClick={() => !isMounted && onDelete(entry.id)}
                >
                  <LuTrash2 />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </Stack>

      {/* Query */}
      <Box px={3} py={2}>
        <QueryBlock>
          <CollapsibleSearchTerm value={entry.searchTerm} />
        </QueryBlock>
      </Box>

      {/* Footer */}
      <Stack
        direction="row"
        align="center"
        px={3}
        py={1.5}
        gap={2}
        borderTop="1px solid"
        borderColor="border"
        bg="bg.subtle"
      >
        <Text fontSize="xs" color="fg.muted">
          {entry.rowCount != null ? entry.rowCount.toLocaleString() : "—"} rows
        </Text>
        <MetaDot />
        <Text fontSize="xs" color="fg.muted">
          {formatBytes(entry.diskBytes)}
        </Text>
        {entry.memoryRows != null && entry.memoryRows > 0 && (
          <>
            <MetaDot />
            <Badge
              size="xs"
              colorPalette="teal"
              variant="subtle"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <LuMemoryStick size={9} />
              {entry.memoryRows.toLocaleString()} rows in memory
              {entry.memoryBytes != null && entry.memoryBytes > 0 && (
                <Text as="span" opacity={0.75}>
                  ({formatBytes(entry.memoryBytes)})
                </Text>
              )}
            </Badge>
          </>
        )}
        {hasSubtasks && (
          <>
            <MetaDot />
            <Button
              size="2xs"
              variant="ghost"
              colorPalette="gray"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <LuChevronDown /> : <LuChevronRight />}
              {entry.subtaskIds.length} subtask
              {entry.subtaskIds.length !== 1 ? "s" : ""}
            </Button>
          </>
        )}
      </Stack>

      {/* Subtasks */}
      {expanded && hasSubtasks && (
        <Box borderTop="1px solid" borderColor="border">
          <SubtasksPanel queryId={entry.id} subtaskIds={entry.subtaskIds} />
        </Box>
      )}
    </Box>
  );
}
