import { css } from "@emotion/react";
import logo from "src/icons/png/256x256.png";

export const TopBar = () => {
  return (
    <div
      css={css`
        height: 34px;
        flex-shrink: 0;
        background: linear-gradient(
          to bottom,
          var(--app-topbar-gradient-start, #13141f),
          var(--app-topbar-gradient-end, #0d0e14)
        );
        -webkit-app-region: drag;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <img
        src={logo}
        alt="Cruncher Logo"
        style={{ width: "20px", height: "20px", pointerEvents: "none", userSelect: "none" }}
      />
      <span
        css={css`
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--app-topbar-text, #4a5568);
          text-transform: uppercase;
          -webkit-app-region: drag;
          user-select: none;
          margin-left: 6px;
        `}
      >
        Cruncher
      </span>
    </div>
  );
};
