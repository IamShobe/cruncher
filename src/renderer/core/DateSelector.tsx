import { subDays, subHours, subMinutes } from "date-fns";
import { atom, useAtom, useSetAtom } from "jotai";
import type React from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  dateRangeAtom,
  endFullDateAtom,
  renderedEndDateAtom,
  renderedStartDateAtom,
  startFullDateAtom,
  useTryToUpdateDate,
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
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { useOutsideDetector } from "~components/ui/useOutsideDetector";
import { CalendarSelector } from "./CalendarSelector";
import { searcherShortcuts } from "./keymaps";
import { useQueryActions } from "./search";
import { useQuerySpecificStoreInternal } from "./store/queryState";
import { compareFullDates } from "~lib/dateUtils";

const useDateOperations = () => {
  const setStartFullDate = useSetAtom(startFullDateAtom);
  const setEndFullDate = useSetAtom(endFullDateAtom);

  return {
    setRangeByMinutes: (minutes: number) => {
      const now = new Date();
      setStartFullDate(subMinutes(now, minutes));
      setEndFullDate(new Date());
    },
    setRangeByHours: (hours: number) => {
      const now = new Date();
      setStartFullDate(subHours(now, hours));
      setEndFullDate(new Date());
    },
    setRangeByDays: (days: number) => {
      const now = new Date();
      setStartFullDate(subDays(now, days));
      setEndFullDate(new Date());
    },
  };
};

export const isDateSelectorOpenAtom = atom(false);

export const DateSelector = () => {
  const [selectedRenderedStartDate] = useAtom(renderedStartDateAtom);
  const [selectedRenderedEndDate] = useAtom(renderedEndDateAtom);
  const [isOpen, setIsOpen] = useAtom(isDateSelectorOpenAtom);

  const firstFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the popover is opened, focus the first input
    if (isOpen) {
      setTimeout(() => {
        firstFocusRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const wrapperRef = useOutsideDetector(
    useCallback(() => setIsOpen(false), [])
  );

  return (
    <PopoverRoot
      open={isOpen}
      initialFocusEl={() => firstFocusRef.current}
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
                <Shortcut keys={searcherShortcuts.getAlias("select-time")} />
              </span>
            }
            showArrow
            positioning={{
              placement: "bottom",
            }}
          >
            <Stack direction="row" alignItems="center">
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
          <CalendarPopUp setIsOpen={setIsOpen} ref={firstFocusRef} />
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

type CalendarPopUpProps = {
  setIsOpen: (value: boolean) => void;
};

const CalendarPopUp = forwardRef(
  (
    { setIsOpen }: CalendarPopUpProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    const [selectedRange, setSelectedRange] = useAtom(dateRangeAtom);

    const { toggleUntilNow } = useQueryActions();

    const { setRangeByMinutes, setRangeByHours, setRangeByDays } =
      useDateOperations();

    const [startFullDate] = useAtom(startFullDateAtom);
    const [endFullDate, setEndFullDate] = useAtom(endFullDateAtom);

    const endInputBoxRef = useRef<HTMLInputElement>(null);

    const [selectedRenderedStartDate] = useAtom(renderedStartDateAtom);
    const [selectedRenderedEndDate] = useAtom(renderedEndDateAtom);

    const [inputRenderedStartDate, setInputRenderedStartDate] = useState(
      selectedRenderedStartDate
    );
    const [inputRenderedEndDate, setInputRenderedEndDate] = useState(
      selectedRenderedEndDate
    );

    const tryToUpdateStartDateFromText = useTryToUpdateDate(startFullDateAtom);
    const tryToUpdateEndDateFromText = useTryToUpdateDate(endFullDateAtom);

    const onInputStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      tryToUpdateStartDateFromText(e.target.value);
      setInputRenderedStartDate(e.target.value);
    };

    const store = useQuerySpecificStoreInternal();

    const onInputEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      tryToUpdateEndDateFromText(e.target.value);
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
            ref={ref}
            name="start"
            value={inputRenderedStartDate}
            onBlur={() => {
              // if end date is empty of lower than start date align it to start date
              if (
                startFullDate &&
                (!endFullDate ||
                  compareFullDates(endFullDate, startFullDate) < 0)
              ) {
                setEndFullDate(startFullDate);
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
            <Tooltip
              content={
                <span>
                  <Shortcut
                    keys={searcherShortcuts.getAlias("toggle-until-now")}
                  />
                </span>
              }
              showArrow
              positioning={{
                placement: "bottom",
              }}
            >
              <Button
                variant="surface"
                onClick={datePresetSelector(() => toggleUntilNow())}
              >
                Toggle Until Now
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    );
  }
);
