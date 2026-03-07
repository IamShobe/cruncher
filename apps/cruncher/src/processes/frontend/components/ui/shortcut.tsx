import { css } from "@emotion/react";
import { token } from "./system";

type ShortcutProps = {
  keys: string[];
};

export const Shortcut = ({ keys }: ShortcutProps) => {
  return (
    <span
      css={css`
        font-size: 0.8rem;
        color: ${token("colors.fg.subtle")};
      `}
    >
      {keys.join("")}
    </span>
  );
};
