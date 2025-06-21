import { Box, Heading, Stack } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  return (
    <Box
      p={2}
      css={css`
        display: flex;
        flex-direction: column;
        flex: 1;
      `}
    >
      <Heading>Settings</Heading>
      <Stack direction="row" gap={2} mb={4}>
        <Link to="/settings/general">
          {({ isActive }) => (
            <SettingsTab label={"General"} isActive={isActive} />
          )}
        </Link>
        <Link to="/settings/initialized-datasets">
          {({ isActive }) => (
            <SettingsTab label={"Initialized Datasets"} isActive={isActive} />
          )}
        </Link>
      </Stack>
      <Box overflow="auto" flex={1} display="flex" flexDirection="column">
        <Outlet />
      </Box>
      {/* <GeneralSettingsSection />
      <InitializedDatasetsSection /> */}
    </Box>
  );
}

const SettingsTab: React.FC<{
  isActive: boolean;
  label: string;
}> = ({ isActive, label }) => {
  return (
    <Box
      css={css`
        display: flex;
        flex-direction: column;
        flex: 1;
        ${isActive ? "border-bottom: 2px solid #3182ce;" : ""}
      `}
    >
      <Heading
        size="sm"
        css={css`
          padding: 8px;
          cursor: pointer;
        `}
      >
        {label}
      </Heading>
      {/* Add your settings tab content here */}
    </Box>
  );
};
