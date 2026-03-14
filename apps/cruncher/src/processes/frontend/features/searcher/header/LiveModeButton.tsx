import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";
import { token } from "~components/ui/system";
import { Button } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect } from "react";
import { useTimeoutFn } from "react-use";
import { isLiveModeAtom } from "~core/store/queryState";
import { useApplicationStore } from "~core/store/appStore";
import { isLoadingAtom, lastRanJobAtom } from "~core/search";
import { Tooltip } from "~components/ui/tooltip";
import { Shortcut } from "~components/ui/shortcut";
import { searcherShortcuts, useResolvedShortcuts } from "~core/keymaps";

const pulseAnimation = keyframes`
  0%   { opacity: 1; transform: scale(1); }
  50%  { opacity: 0.4; transform: scale(1.5); }
  100% { opacity: 1; transform: scale(1); }
`;

const Dot = styled.span<{ $isLive: boolean }>`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ $isLive }) =>
    $isLive ? token("colors.teal.400") : token("colors.fg.subtle")};
  transition: background-color 0.2s ease;
  ${({ $isLive }) =>
    $isLive &&
    css`
      animation: ${pulseAnimation} 1.2s ease-in-out infinite;
    `}
`;

const LiveButton = styled(Button)<{ $isLive: boolean }>`
  min-width: 3.5rem;
  border: 1.5px solid
    ${({ $isLive }) => ($isLive ? token("colors.teal.500") : "transparent")};
  color: ${({ $isLive }) =>
    $isLive ? token("colors.teal.300") : token("colors.fg.muted")};
  transition: border-color 0.2s ease, color 0.2s ease;
`;

const LiveModeButton: React.FC = () => {
  const resolvedSearcherShortcuts = useResolvedShortcuts(searcherShortcuts);
  const [isLiveMode, setIsLiveMode] = useAtom(isLiveModeAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const job = useAtomValue(lastRanJobAtom);
  const liveAutoStopMinutes = useApplicationStore(
    (s) => s.generalSettings?.liveAutoStopMinutes ?? 30,
  );
  const delay =
    isLiveMode && liveAutoStopMinutes && liveAutoStopMinutes > 0
      ? liveAutoStopMinutes * 60 * 1000
      : undefined;

  const [, cancelAutoStop, resetAutoStop] = useTimeoutFn(
    () => setIsLiveMode(false),
    delay ?? 0,
  );

  useEffect(() => {
    if (delay) {
      resetAutoStop();
    } else {
      cancelAutoStop();
    }
  }, [delay, resetAutoStop, cancelAutoStop]);

  const disabled = isLoading || !job;

  return (
    <Tooltip
      content={
        <span>
          {isLiveMode ? "Live — click to disable" : "Enable live mode"}{" "}
          <Shortcut
            keys={resolvedSearcherShortcuts.getAlias("toggle-live-mode")}
          />
        </span>
      }
      showArrow
      positioning={{ placement: "bottom" }}
    >
      <LiveButton
        $isLive={isLiveMode}
        aria-label={isLiveMode ? "Disable live mode" : "Enable live mode"}
        size="2xs"
        variant="ghost"
        disabled={disabled}
        onClick={() => setIsLiveMode((prev) => !prev)}
        gap="1.5"
        px="2"
      >
        <Dot $isLive={isLiveMode} />
        LIVE
      </LiveButton>
    </Tooltip>
  );
};

export default LiveModeButton;
