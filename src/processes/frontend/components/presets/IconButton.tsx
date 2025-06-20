import {
  IconButtonProps as OIconButtonProps,
  IconButton as OIconButton,
} from "@chakra-ui/react";
import { Tooltip, TooltipProps } from "./Tooltip";

export type IconButtonProps = OIconButtonProps &
  import("react").RefAttributes<HTMLButtonElement> & {
    tooltip?: TooltipProps["text"];
    tooltipPosition?: TooltipProps["position"];
    tooltipShortcut?: TooltipProps["shortcut"];
  };

export const MiniIconButton: React.FC<IconButtonProps> = (props) => {
  return (
    <Tooltip
      text={props.tooltip}
      position={props.tooltipPosition ?? "bottom"}
      shortcut={props.tooltipShortcut}
      aria-label={props["aria-label"] || props.tooltip}
    >
      <OIconButton size="2xs" variant="surface" {...props} />
    </Tooltip>
  );
};
