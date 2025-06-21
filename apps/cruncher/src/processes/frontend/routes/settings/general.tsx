import { Field, Heading, Input, Stack } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useGeneralSettings } from "~core/store/appStore";
export const Route = createFileRoute("/settings/general")({
  component: GeneralSettings,
});

function GeneralSettings() {
  const generalSettings = useGeneralSettings();
  return (
    <Stack maxW={500}>
      <Heading size="md">General Settings</Heading>
      <Stack direction="row" gap={4}>
        <Field.Root disabled={true}>
          <Field.Label>
            Config File Path
            <Field.RequiredIndicator />
          </Field.Label>
          <Input value={generalSettings.configFilePath} />
          <Field.HelperText />
          <Field.ErrorText />
        </Field.Root>
      </Stack>
    </Stack>
  );
}
