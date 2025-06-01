import { css } from "@emotion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainContent from "~core/MainContent";

import "./index.css";
// import { electronBridge } from "~electron_bridge";
import "./websocket_bridge";
import { WEBSOCKET_BRIDGE } from "./websocket_bridge";

// const startTime = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <MainContent controller={WEBSOCKET_BRIDGE}
          initialQuery="developer | table _time, name, age"
        />
    </div>
  </StrictMode>
);
