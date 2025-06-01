import { subDays, subHours, subMinutes } from "date-fns";
import { atom, useAtom } from "jotai";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { useOutsideDetector } from "~components/ui/useOutsideDetector";
import {
  compareFullDates,
  dateRangeAtom,
  DateType,
  endFullDateAtom,
  renderedEndDateAtom,
  renderedStartDateAtom,
  startFullDateAtom,
  tryToUpdateDate as tryToUpdateDateFromText,
} from "./store/dateState";

import { IconButton, Input, SimpleGrid, Stack } from "@chakra-ui/react";
import { LuClock2 } from "react-icons/lu";
import { Button } from "~components/ui/button";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "~components/ui/popover";
import { CalendarSelector } from "./CalendarSelector";
import { Tooltip } from "~components/ui/tooltip";
import { Shortcut } from "~components/ui/shortcut";
import { globalShortcuts } from "./keymaps";
import { store } from "./store/store";

export const setRangeByMinutes = (minutes: number) => {
  const now = new Date();
  store.set(startFullDateAtom, subMinutes(now, minutes));
  store.set(endFullDateAtom, new Date());
};

export const setRangeByHours = (hours: number) => {
  const now = new Date();
  store.set(startFullDateAtom, subHours(now, hours));
  store.set(endFullDateAtom, new Date());
};

export const setRangeByDays = (days: number) => {
  const now = new Date();
  store.set(startFullDateAtom, subDays(now, days));
  store.set(endFullDateAtom, new Date());
};

export function alignToNow(): void {
  const fullStartDate = store.get(startFullDateAtom);
  if (!fullStartDate || fullStartDate > new Date()) {
    store.set(startFullDateAtom, new Date());
  }
  store.set(endFullDateAtom, DateType.Now);
}

export const isDateSelectorOpen = atom(false);

export const DateSelector = () => {
  const [selectedRenderedStartDate] = useAtom(renderedStartDateAtom);
  const [selectedRenderedEndDate] = useAtom(renderedEndDateAtom);
  const [isOpen, setIsOpen] = useAtom(isDateSelectorOpen);

  const wrapperRef = useOutsideDetector(
    useCallback(() => setIsOpen(false), [])
  );

  return (
    <PopoverRoot
      open={isOpen}
      positioning={{ placement: "left-end" }}
      lazyMount
      unmountOnExit
    >
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          style={{
            display: "flex",
            width: `41ch`,
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Tooltip
            content={
              <span>
                Change time range
                <Shortcut keys={globalShortcuts.getAlias("select-time")} />
              </span>
            }
            showArrow
            positioning={{
              placement: "bottom",
            }}
          >
            <Stack direction="row">
              <LuClock2 />
              <span style={{ flex: 1 }}>{selectedRenderedStartDate}</span>
              <span> - </span>
              <span style={{ flex: 1 }}>{selectedRenderedEndDate}</span>
            </Stack>
          </Tooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent width={400} ref={wrapperRef}>
        <PopoverArrow />
        <PopoverBody
          display={"flex"}
          justifyContent="center"
          alignItems="center"
        >
          <CalendarPopUp setIsOpen={setIsOpen} />
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

type CalendarPopUpProps = {
  setIsOpen: (value: boolean) => void;
};

const CalendarPopUp = ({ setIsOpen }: CalendarPopUpProps) => {
  const [selectedRange, setSelectedRange] = useAtom(dateRangeAtom);

  const [startFullDate] = useAtom(startFullDateAtom);
  const [endFullDate] = useAtom(endFullDateAtom);

  const endInputBoxRef = useRef<HTMLInputElement>(null);

  const [selectedRenderedStartDate] = useAtom(renderedStartDateAtom);
  const [selectedRenderedEndDate] = useAtom(renderedEndDateAtom);

  const [inputRenderedStartDate, setInputRenderedStartDate] = useState(
    selectedRenderedStartDate
  );
  const [inputRenderedEndDate, setInputRenderedEndDate] = useState(
    selectedRenderedEndDate
  );

  const onInputStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    tryToUpdateDateFromText(startFullDateAtom, e.target.value);
    setInputRenderedStartDate(e.target.value);
  };

  const onInputEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    tryToUpdateDateFromText(endFullDateAtom, e.target.value);
    setInputRenderedEndDate(e.target.value);
  };

  const updateRenderedText = () => {
    const startValue = store.get(renderedStartDateAtom);
    setInputRenderedStartDate(startValue);

    const endValue = store.get(renderedEndDateAtom);
    setInputRenderedEndDate(endValue);
  };

  const onDatePickerChange = (range: DateRange | undefined) => {
    setSelectedRange(range);
    updateRenderedText();
  };

  const datePresetSelector = (callback: () => void) => () => {
    callback();
    updateRenderedText();
  };

  const closeOnEscape = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const onStartInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      endInputBoxRef.current?.focus();
      return;
    }

    closeOnEscape(e);
  };

  const onEndInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsOpen(false);
    }

    closeOnEscape(e);
  };
  return (
    <Stack>
      <Stack direction="row" flex={1}>
        <Input
          name="start"
          value={inputRenderedStartDate}
          onBlur={() => {
            // if end date is empty of lower than start date align it to start date
            if (
              startFullDate &&
              (!endFullDate || compareFullDates(endFullDate, startFullDate) < 0)
            ) {
              store.set(endFullDateAtom, startFullDate);
              updateRenderedText();
            }
          }}
          onKeyDown={onStartInputKeyDown}
          onChange={onInputStartDateChange}
        />
        <Input
          name="end"
          ref={endInputBoxRef}
          onKeyDown={onEndInputKeyDown}
          value={inputRenderedEndDate}
          onChange={onInputEndDateChange}
        />
      </Stack>
      <Stack direction="row" flex={1}>
        <CalendarSelector
          selectedRange={selectedRange}
          onSelect={onDatePickerChange}
        />
        <Stack justifyContent="center">
          <SimpleGrid columns={4} gap={2}>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByMinutes(5))}
            >
              5m
            </IconButton>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByMinutes(10))}
            >
              10m
            </IconButton>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByMinutes(15))}
            >
              15m
            </IconButton>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByMinutes(30))}
            >
              30m
            </IconButton>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByHours(1))}
            >
              1h
            </IconButton>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByHours(4))}
            >
              4h
            </IconButton>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByHours(12))}
            >
              12h
            </IconButton>
            <IconButton
              variant="surface"
              size="2xs"
              onClick={datePresetSelector(() => setRangeByHours(24))}
            >
              24h
            </IconButton>
          </SimpleGrid>
          <Button
            variant="surface"
            onClick={datePresetSelector(() => setRangeByDays(3))}
          >
            Last 3 days
          </Button>
          <Button
            variant="surface"
            onClick={datePresetSelector(() => setRangeByDays(7))}
          >
            Last 7 days
          </Button>
          <Button
            variant="surface"
            onClick={datePresetSelector(() => setRangeByDays(30))}
          >
            Last 30 days
          </Button>
          <Button
            variant="surface"
            onClick={datePresetSelector(() => alignToNow())}
          >
            Until Now
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
