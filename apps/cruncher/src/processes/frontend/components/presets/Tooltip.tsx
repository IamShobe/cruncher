import { Shortcut } from "~components/ui/shortcut";
import {
  TooltipProps as OTooltipProps,
  Tooltip as OTooltip,
} from "~components/ui/tooltip";

export type TooltipProps = Omit<OTooltipProps, "content" | "positioning"> & {
  shortcut?: string[];
  text?: string;
  position?: "top" | "bottom" | "left" | "right";
};

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  shortcut,
  position,
  ...props
}) => {
  return (
    <OTooltip
      showArrow
      content={
        <span>
          {text} {shortcut && <Shortcut keys={shortcut} />}
        </span>
      }
      positioning={{ placement: position }}
      {...props}
    />
  );
};
