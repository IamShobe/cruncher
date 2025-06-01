import { css } from "@emotion/react";

type ShortcutProps = {
    keys: string[];
}

export const Shortcut = ({ keys }: ShortcutProps) => {
    return (
        <span css={css`
            font-size: 0.8rem;
            color: #666;
        `}>
            {keys.join("")}
        </span>
    );
}