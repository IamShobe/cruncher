import { Badge } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type TimerProps = {
  startTime: Date | undefined;
  endTime: Date | undefined;
  isLoading: boolean;
};

const CustomBadge = styled(Badge)`
  font-family: monospace;
  justify-content: center;
`;

const TimerHolder = styled.div`
  display: flex;
  position: absolute;
  right: 0.4rem;
  top: 0.4rem;
`;

const formatElapsedTime = (elapsedMilliseconds: number) => {
  if (elapsedMilliseconds < 1000) {
    // if less than 1 second - show milliseconds
    return `${elapsedMilliseconds}ms`;
  }

  if (elapsedMilliseconds < 10000) {
    // if less than 10 seconds - show not rounded
    return `${(elapsedMilliseconds / 1000).toFixed(2)}s`;
  }

  if (elapsedMilliseconds < 60000) {
    // if less than 1 minute - show seconds
    return `${Math.round(elapsedMilliseconds / 1000)}s`;
  }

  return `${Math.floor(elapsedMilliseconds / 60000)}m ${Math.floor((elapsedMilliseconds % 60000) / 1000)}s`;
};

const formatRange = (start: Date, end: Date) => {
  const elapsedMilliseconds = Math.abs(end.getTime() - start.getTime());
  return formatElapsedTime(elapsedMilliseconds);
};

export const Timer = ({ startTime, endTime, isLoading }: TimerProps) => {
  // if loading render elapsed time from startTime
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setElapsedTime(0);
  }, [startTime]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 10);
      }, 10);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <TimerHolder>
        <CustomBadge>{formatElapsedTime(elapsedTime)}</CustomBadge>
      </TimerHolder>
    );
  }

  if (endTime === undefined || startTime === undefined) {
    return <TimerHolder></TimerHolder>;
  }

  return (
    <TimerHolder>
      <CustomBadge>{formatRange(startTime, endTime)}</CustomBadge>
    </TimerHolder>
  );
};
