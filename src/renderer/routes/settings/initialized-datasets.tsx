import { Button, Card, DataList, Heading, Stack } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from "react";
import { PluginInstance } from "src/engineV2/types";
import { ProgressBar, ProgressRoot } from "~components/ui/progress";
import { useInitializedInstances } from "~core/search";
import { useApplicationStore } from "~core/store/appStore";

export const Route = createFileRoute('/settings/initialized-datasets')({
  component: InitializedDatasetsSection,
})

function InitializedDatasetsSection() {
  const initializedPlugins = useInitializedInstances();
  const reload = useApplicationStore((state) => state.reload);
  return (
    <Stack>
      <Stack direction="row">
        <Heading size="md">Initialized Datasets</Heading>
        <Button variant="surface" size="2xs" onClick={reload}>
          Reload
        </Button>
      </Stack>
      <div
        css={css`
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 16px;
        `}
      >
        {initializedPlugins.map((instance) => (
          <InitializedDataset key={instance.name} instance={instance} />
        ))}
      </div>
    </Stack>
  );
};

const InitializedDataset: React.FC<{
  instance: PluginInstance;
}> = ({ instance }) => {
  const datasetMetadata = useApplicationStore(
    (state) => state.datasets[instance.name]
  );
  const loadedCount = Object.keys(
    datasetMetadata?.controllerParams || {}
  ).length;

  const colorPalette = useMemo(() => {
    switch (datasetMetadata?.status) {
      case "loading":
        return "white";
      case "loaded":
        return "green";
      case "error":
        return "red";
    }
  }, [datasetMetadata?.status]);

  const progressValue = datasetMetadata?.status === "loading" ? null : 100;

  return (
    <Card.Root>
      <Card.Body p={4}>
        <Stack>
          <ProgressRoot
            value={progressValue}
            variant="subtle"
            size="xs"
            colorPalette={colorPalette}
          >
            <ProgressBar />
          </ProgressRoot>
          <DataList.Root orientation="horizontal" gap={1}>
            <ItemProp label={"Name"} value={instance.name} />
            <ItemProp
              label={"Status"}
              value={datasetMetadata.status}
              color={colorPalette}
            />
            <ItemProp label={"Loaded Params"} value={loadedCount} />
            <ItemProp label={"Plugin Type"} value={instance.pluginRef} />
            <ItemProp label={"Description"} value={instance.description} />
          </DataList.Root>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

const ItemProp: React.FC<{
  label: string;
  value: string | number | boolean;
  color?: string;
}> = ({ label, value, color }) => {
  return (
    <DataList.Item alignItems="start">
      <DataList.ItemLabel>{label}</DataList.ItemLabel>
      <DataList.ItemValue color={color}>{value.toString()}</DataList.ItemValue>
    </DataList.Item>
  );
};