
import type React from "react";
import { DateRange } from "react-day-picker";
import {
    dateRangeAtom,
    isTimeNow
} from "./store/dateState";
  
  import { IconButton } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { useMemo } from "react";
import {
    DayButtonProps,
    DayPicker,
    DayProps,
    NavProps,
} from "react-day-picker";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
  
type InputTimeProps = {
  selectedRange: ReturnType<typeof dateRangeAtom.read> | undefined;
  onSelect: (range: DateRange | undefined) => void;
};

export function CalendarSelector({ selectedRange, onSelect }: InputTimeProps) {
  const dateRange = useMemo<DateRange | undefined>(() => {
    if (!selectedRange) {
      return undefined;
    }

    return {
      from: isTimeNow(selectedRange.from) ? new Date() : selectedRange.from,
      to: isTimeNow(selectedRange.to) ? new Date() : selectedRange.to,
    };
  }, [selectedRange]);

  return (
    <div>
      <DayPicker
        mode="range"
        numberOfMonths={1}
        components={{
          CaptionLabel: (props) => {
            return (
              <span
                style={{
                  fontSize: "1.2rem",
                }}
                {...props}
              />
            );
          },
          Nav: (props: NavProps) => {
            const { onPreviousClick, onNextClick } = props;
            return (
              <div
                css={css`
                  position: absolute;
                  right: 0;
                  top: 0.7rem;
                  display: flex;
                  gap: 4px;
                `}
              >
                <IconButton
                  size={"2xs"}
                  aria-label="Previous month"
                  variant={"surface"}
                  onClick={onPreviousClick}
                >
                  <LuArrowLeft />
                </IconButton>
                <IconButton
                  size={"2xs"}
                  variant={"surface"}
                  aria-label="Next month"
                  onClick={onNextClick}
                >
                  <LuArrowRight />
                </IconButton>
              </div>
            );
          },
          DayButton: (props: DayButtonProps) => {
            const { day, modifiers, style, className, ...rest } = props;

            let variant: React.ComponentProps<typeof IconButton>["variant"] =
              "ghost";
            if (modifiers.range_start || modifiers.range_end) {
              variant = "surface";
            }

            let todayStyle = {};
            if (modifiers.today) {
              todayStyle = {
                color: "red",
                fontWeight: "bold",
              };
            }
            return (
              // @ts-expect-error
              <IconButton
                style={{ ...todayStyle }}
                variant={variant}
                size="xs"
                {...rest}
              />
            );
          },
          Day: (props: DayProps) => {
            const { day, modifiers, style, className, ...rest } = props;

            let backgroundColor = "transparent";
            if (modifiers.range_middle) {
              backgroundColor = "rgba(255, 255, 255, 0.1)";
            }

            return (
              <td
                style={{
                  backgroundColor,
                }}
                {...rest}
              />
            );
          },
        }}
        selected={dateRange}
        onSelect={onSelect}
      />
    </div>
  );
}
