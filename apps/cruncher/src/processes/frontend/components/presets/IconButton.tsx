import {
  IconButtonProps as OIconButtonProps,
  IconButton as OIconButton,
} from "@chakra-ui/react";
import { Tooltip, TooltipProps } from "./Tooltip";

export type IconButtonProps = OIconButtonProps & {
  tooltip?: TooltipProps["text"];
  tooltipPosition?: TooltipProps["position"];
  tooltipShortcut?: TooltipProps["shortcut"];
};

export const MiniIconButton: React.FC<IconButtonProps> = ({
  tooltip,
  tooltipPosition,
  tooltipShortcut,
  ...props
}) => {
  // @ts-expect-error -- Chakra UI v3 css prop (SystemStyleObject) conflicts with @emotion/react JSX extension (Interpolation<Theme>)
  const button = <OIconButton size="2xs" variant="surface" {...props} />;
  return (
    <Tooltip
      text={tooltip}
      position={tooltipPosition ?? "bottom"}
      shortcut={tooltipShortcut}
      aria-label={props["aria-label"] || tooltip}
    >
      {button}
    </Tooltip>
  );
};
