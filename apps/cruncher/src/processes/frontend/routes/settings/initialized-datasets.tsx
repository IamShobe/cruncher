import {
  Box,
  Grid,
  IconButton,
  Stack,
  Table,
  Text,
  Badge,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { token } from "~components/ui/system";
import { createFileRoute } from "@tanstack/react-router";
import { LuPlay, LuRefreshCw } from "react-icons/lu";
import {
  PluginInstance,
  SearchProfile,
} from "src/processes/server/engineV2/types";
import {
  DatasetMetadata,
  DatasetStatus,
  useApplicationStore,
} from "~core/store/appStore";
import { useInitializedInstances } from "~core/search";
import { Tooltip } from "~components/ui/tooltip";

export const Route = createFileRoute("/settings/initialized-datasets")({
  component: ConnectorsPage,
});

const STATUS_COLOR: Record<DatasetStatus, string> = {
  loaded: "green",
  error: "red",
  loading: "yellow",
  uninitialized: "gray",
};

const labelText = css`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${token("colors.fg.muted")};
`;

const labelRow = css`
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid ${token("colors.border")};
`;

const connectorTable = css`
  th, td {
    padding: 2px 6px;
    font-size: 0.71rem;
    white-space: nowrap;
    vertical-align: middle;
  }
  td:last-child {
    white-space: normal;
    color: ${token("colors.fg.muted")};
    max-width: 240px;
  }
`;

const StatusDot: React.FC<{ status: DatasetStatus; label?: string }> = ({
  status,
  label: tip,
}) => {
  const dot = (
    <Box
      w="7px"
      h="7px"
      borderRadius="full"
      bg={`${STATUS_COLOR[status]}.500`}
      flexShrink={0}
      cursor={tip ? "default" : undefined}
    />
  );

  if (!tip) return dot;
  return (
    <Tooltip
      content={
        <span>
          {tip} — {status}
        </span>
      }
      showArrow
      positioning={{ placement: "top" }}
    >
      {dot}
    </Tooltip>
  );
};

function ConnectorsPage() {
  const initializedPlugins = useInitializedInstances();
  const searchProfiles = useApplicationStore((state) => state.searchProfiles);
  const reload = useApplicationStore((state) => state.reload);

  return (
    <Grid templateColumns="200px 1fr" gap={4} flex={1} overflow="hidden">
      {/* LEFT: Profiles */}
      <Stack gap={2} overflow="auto">
        <div css={labelRow}>
          <Text css={labelText}>Profiles</Text>
        </div>
        {searchProfiles.length === 0 ? (
          <Text fontSize="xs" color="fg.subtle">
            No profiles
          </Text>
        ) : (
          <Stack gap={1}>
            {searchProfiles.map((profile) => (
              <ProfileRow key={profile.name} profile={profile} />
            ))}
          </Stack>
        )}
      </Stack>

      {/* RIGHT: Connectors */}
      <Stack gap={2} overflow="hidden" minW={0}>
        <div css={labelRow}>
          <Text css={labelText}>Connectors</Text>
          <Tooltip
            content={<span>Reload all</span>}
            showArrow
            positioning={{ placement: "top" }}
          >
            <IconButton
              aria-label="Reload"
              size="2xs"
              variant="ghost"
              color="fg.muted"
              onClick={reload}
              h="14px"
              w="14px"
              minW="0"
              fontSize="10px"
            >
              <Box
                css={css`
                  svg {
                    width: 8px;
                    height: 8px;
                  }
                `}
              >
                <LuRefreshCw />
              </Box>
            </IconButton>
          </Tooltip>
        </div>
        {initializedPlugins.length === 0 ? (
          <Text fontSize="xs" color="fg.subtle">
            No connectors initialized
          </Text>
        ) : (
          <Box overflowX="auto" overflowY="auto" flex={1}>
            <Table.Root size="sm" variant="outline" css={connectorTable}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader w="1" />
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Plugin</Table.ColumnHeader>
                  <Table.ColumnHeader>Param Keys</Table.ColumnHeader>
                  <Table.ColumnHeader>Last Init</Table.ColumnHeader>
                  <Table.ColumnHeader>Description / Error</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {initializedPlugins.map((instance) => (
                  <ConnectorRow key={instance.name} instance={instance} />
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Stack>
    </Grid>
  );
}

const ProfileRow: React.FC<{ profile: SearchProfile }> = ({ profile }) => {
  const datasets = useApplicationStore((state) => state.datasets);
  const initializeProfileDatasets = useApplicationStore(
    (state) => state.initializeProfileDatasets,
  );

  return (
    <Stack
      gap={1}
      px={2}
      py={1}
      borderRadius="sm"
      border="1px solid"
      borderColor="border"
      css={css`
        font-size: 0.75rem;
      `}
    >
      <Stack direction="row" align="center" gap={1}>
        <Text
          flex={1}
          fontWeight="medium"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {profile.name}
        </Text>
        <Tooltip
          content={<span>Initialize</span>}
          showArrow
          positioning={{ placement: "top" }}
        >
          <IconButton
            aria-label="Initialize"
            size="2xs"
            variant="ghost"
            color="fg.muted"
            flexShrink={0}
            onClick={() => initializeProfileDatasets(profile.name)}
          >
            <LuPlay />
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack gap="2px">
        {profile.instances.map((instance) => {
          const status = datasets[instance]?.status ?? "uninitialized";
          return (
            <Stack key={instance} direction="row" align="center" gap={1}>
              <StatusDot status={status} />
              <Text
                fontSize="0.68rem"
                color="fg.muted"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {instance}
              </Text>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};

const ConnectorRow: React.FC<{ instance: PluginInstance }> = ({ instance }) => {
  const metadata: DatasetMetadata | undefined = useApplicationStore(
    (state) => state.datasets[instance.name],
  );
  const supportedPlugins = useApplicationStore(
    (state) => state.supportedPlugins,
  );

  const status = metadata?.status ?? "uninitialized";
  const paramKeys = Object.keys(metadata?.controllerParams ?? {});
  const pluginName =
    supportedPlugins.find((p) => p.ref === instance.pluginRef)?.name ??
    instance.pluginRef;
  const initializedAt = metadata?.initializedAt;
  const timeLabel = initializedAt
    ? initializedAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <Table.Row>
      <Table.Cell>
        <Tooltip
          content={<span>{status}</span>}
          showArrow
          positioning={{ placement: "top" }}
        >
          <Box display="flex" alignItems="center" justifyContent="center">
            <StatusDot status={status} />
          </Box>
        </Tooltip>
      </Table.Cell>
      <Table.Cell fontWeight="medium">{instance.name}</Table.Cell>
      <Table.Cell color="fg.muted">{pluginName}</Table.Cell>
      <Table.Cell>
        {paramKeys.length === 0 ? (
          <Text color="fg.subtle">—</Text>
        ) : (
          <Stack direction="row" gap="2px" wrap="wrap">
            {paramKeys.map((key) => (
              <Badge key={key} size="xs" variant="surface" colorPalette="gray">
                {key}
              </Badge>
            ))}
          </Stack>
        )}
      </Table.Cell>
      <Table.Cell color="fg.muted" whiteSpace="nowrap">
        {timeLabel}
      </Table.Cell>
      <Table.Cell>
        {status === "error" && metadata?.errorMessage ? (
          <Text color="red.500" fontSize="0.68rem">
            {metadata.errorMessage}
          </Text>
        ) : (
          <Text color="fg.muted">{instance.description}</Text>
        )}
      </Table.Cell>
    </Table.Row>
  );
};
