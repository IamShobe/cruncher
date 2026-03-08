import { Box, Field, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useContext } from "react";
import { ThemeContext } from "~components/ui/provider";
import { THEMES, type ThemeId } from "~components/ui/themes";
import { useGeneralSettings } from "~core/store/appStore";

export const Route = createFileRoute("/settings/general")({
  component: GeneralSettings,
});

function GeneralSettings() {
  const generalSettings = useGeneralSettings();
  const { themeId, setThemeId } = useContext(ThemeContext);

  return (
    <Stack maxW={600} gap={6}>
      <Box>
        <Heading size="md" mb={3}>
          Theme
        </Heading>
        <Stack direction="row" gap={3} flexWrap="wrap">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const t = THEMES[id];
            const isSelected = themeId === id;
            return (
              <Box
                key={id}
                onClick={() => setThemeId(id)}
                cursor="pointer"
                borderRadius="lg"
                overflow="hidden"
                borderWidth="2px"
                borderColor={isSelected ? "accent" : "border"}
                style={{
                  outline: isSelected ? `2px solid ${t.accent}` : "none",
                }}
                _hover={{ borderColor: "accent" }}
                transition="border-color 0.15s"
                w="120px"
              >
                <Box
                  style={{ background: t.bg }}
                  h="64px"
                  p={2}
                  display="flex"
                  flexDirection="column"
                  gap="4px"
                >
                  <Box
                    style={{ background: t.bgSubtle }}
                    h="8px"
                    borderRadius="sm"
                  />
                  <Box
                    style={{ background: t.accent }}
                    h="8px"
                    borderRadius="sm"
                    w="60%"
                  />
                  <Box
                    style={{ background: t.bgMuted }}
                    h="8px"
                    borderRadius="sm"
                    w="80%"
                  />
                </Box>
                <Box
                  style={{ background: t.bgPanel }}
                  px={2}
                  py={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text
                    fontSize="xs"
                    style={{ color: t.fg }}
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {t.label}
                  </Text>
                  {isSelected && (
                    <Text fontSize="xs" style={{ color: t.accent }}>
                      ✓
                    </Text>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

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
