import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import React, { useCallback, useEffect } from "react";
import type { AppRouter } from "src/processes/server/plugins_engine/router_messages";
import { debounceInitialize } from "@cruncher/utils";
import { ApiController } from "./ApiController";
import { appStore } from "./store/appStore";

export const ApplicationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const initialize = useCallback(
    debounceInitialize(async () => {
      for (let i = 0; i < 3; i++) {
        try {
          console.log("Initializing stream server connection...");
          const port = await window.electronAPI.getPort();

          let isTerminating = false;

          const currentWs = createWSClient({
            url: `ws://localhost:${port}`,
            onClose(evt) {
              console.warn("WebSocket connection closed:", evt);
              currentWs?.close();
              if (!isTerminating) {
                console.log("Reinitializing stream server connection...");
                initialize(); // Attempt to reinitialize the connection
              }
            },
          });

          currentWs.connection?.ws.addEventListener("error", (event) => {
            console.error("WebSocket error:", event);
          });

          const trpc = createTRPCClient<AppRouter>({
            links: [
              wsLink({
                client: currentWs,
              }),
            ],
          });

          const controller = new ApiController(trpc);
          await appStore.getState().initialize(controller);
          return {
            cleanup: () => {
              console.log("Cleaning up WebSocket connection...");
              isTerminating = true;
              currentWs.close();
            },
          }; // Exit the loop if successful
        } catch (error) {
          console.error(
            "Failed to initialize stream server connection:",
            error,
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      throw new Error(
        "Failed to initialize stream server connection after 3 attempts",
      );
    }, 200), // Debounce to avoid multiple rapid calls
    [],
  );

  useEffect(() => {
    const initializeResult = initialize();

    return () => {
      console.log("Cleaning up ApplicationProvider...");
      initializeResult.then((result) => result.cleanup());
    };
  }, []);

  return children;
};
