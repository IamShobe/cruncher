import {
  CloseButton,
  Drawer,
  Field,
  IconButton,
  NumberInput,
  Portal,
  SegmentGroup,
  Stack,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { LuSettings } from "react-icons/lu";
import { Tooltip } from "~components/presets/Tooltip";
import { useInitializedController } from "~core/search";
import {
  liveAutoStopMinutesAtom,
  liveIntervalAtom,
  maxLogsAtom,
  timezoneAtom,
} from "~core/store/liveState";
import {
  LiveInterval,
  LIVE_INTERVAL_OPTIONS,
  TIMEZONE_OPTIONS,
  TimezoneOption,
} from "src/processes/server/config/schema";

const INTERVAL_OPTIONS = LIVE_INTERVAL_OPTIONS.map((v) => ({
  label: v,
  value: v,
}));
const TZ_OPTIONS = TIMEZONE_OPTIONS.map((v) => ({
  label: v.toUpperCase(),
  value: v,
}));

export const SettingsDrawer = () => {
  const [maxLogs, setMaxLogs] = useAtom(maxLogsAtom);
  const [liveInterval, setLiveInterval] = useAtom(liveIntervalAtom);
  const [liveAutoStopMinutes, setLiveAutoStopMinutes] = useAtom(
    liveAutoStopMinutesAtom,
  );
  const [timezone, setTimezone] = useAtom(timezoneAtom);
  const controller = useInitializedController();

  // Load persisted settings on mount
  useEffect(() => {
    controller.getGeneralSettings().then((settings) => {
      setLiveInterval(settings.liveInterval);
      setMaxLogs(settings.maxLogs);
      setLiveAutoStopMinutes(settings.liveAutoStopMinutes ?? 30);
      setTimezone(settings.timezone ?? "local");
    });
  }, [
    controller,
    setLiveInterval,
    setMaxLogs,
    setLiveAutoStopMinutes,
    setTimezone,
  ]);

  const saveSettings = (
    interval = liveInterval,
    logs = maxLogs,
    autoStop = liveAutoStopMinutes,
    tz = timezone,
  ) => controller.setLiveSettings(interval, logs, autoStop, tz);

  const handleIntervalChange = (value: LiveInterval) => {
    setLiveInterval(value);
    saveSettings(value);
  };

  const handleMaxLogsChange = (value: number) => {
    setMaxLogs(value);
    saveSettings(liveInterval, value);
  };

  const handleAutoStopChange = (value: number) => {
    const minutes = value <= 0 ? null : value;
    setLiveAutoStopMinutes(minutes);
    saveSettings(liveInterval, maxLogs, minutes);
  };

  const handleTimezoneChange = (value: TimezoneOption) => {
    setTimezone(value);
    saveSettings(liveInterval, maxLogs, liveAutoStopMinutes, value);
  };

  return (
    <Drawer.Root size="xs">
      <Tooltip text="Search Settings">
        <Drawer.Trigger asChild>
          <IconButton aria-label="Settings" size="2xs" variant="ghost">
            <LuSettings />
          </IconButton>
        </Drawer.Trigger>
      </Tooltip>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner padding="4">
          <Drawer.Content rounded="md">
            <Drawer.Header paddingY="2">
              <Drawer.Title fontSize="sm">Settings</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body paddingY="2">
              <Stack gap="3">
                <Field.Root orientation="horizontal" gap="2">
                  <Field.Label flex="1" fontSize="xs" whiteSpace="nowrap">
                    Timezone
                  </Field.Label>
                  <SegmentGroup.Root
                    size="xs"
                    value={timezone}
                    onValueChange={(e) =>
                      handleTimezoneChange(e.value as TimezoneOption)
                    }
                  >
                    <SegmentGroup.Indicator />
                    <SegmentGroup.Items items={TZ_OPTIONS} />
                  </SegmentGroup.Root>
                </Field.Root>
                <Field.Root orientation="horizontal" gap="2">
                  <Field.Label flex="1" fontSize="xs" whiteSpace="nowrap">
                    Live interval
                  </Field.Label>
                  <SegmentGroup.Root
                    size="xs"
                    value={liveInterval}
                    onValueChange={(e) =>
                      handleIntervalChange(e.value as LiveInterval)
                    }
                  >
                    <SegmentGroup.Indicator />
                    <SegmentGroup.Items items={INTERVAL_OPTIONS} />
                  </SegmentGroup.Root>
                </Field.Root>
                <Field.Root orientation="horizontal" gap="2">
                  <Field.Label flex="1" fontSize="xs" whiteSpace="nowrap">
                    Max logs in memory
                  </Field.Label>
                  <NumberInput.Root
                    value={String(maxLogs)}
                    min={1000}
                    max={1000000}
                    step={10000}
                    width="24"
                    size="xs"
                    onValueChange={(e) => handleMaxLogsChange(Number(e.value))}
                  >
                    <NumberInput.Input />
                    <NumberInput.Control>
                      <NumberInput.IncrementTrigger />
                      <NumberInput.DecrementTrigger />
                    </NumberInput.Control>
                  </NumberInput.Root>
                </Field.Root>
                <Field.Root orientation="horizontal" gap="2">
                  <Field.Label flex="1" fontSize="xs" whiteSpace="nowrap">
                    Auto-stop live (min, 0=off)
                  </Field.Label>
                  <NumberInput.Root
                    value={String(liveAutoStopMinutes ?? 0)}
                    min={0}
                    max={480}
                    step={5}
                    width="24"
                    size="xs"
                    onValueChange={(e) => handleAutoStopChange(Number(e.value))}
                  >
                    <NumberInput.Input />
                    <NumberInput.Control>
                      <NumberInput.IncrementTrigger />
                      <NumberInput.DecrementTrigger />
                    </NumberInput.Control>
                  </NumberInput.Root>
                </Field.Root>
              </Stack>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild top="2" right="2">
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
