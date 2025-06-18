import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import React, { useCallback, useEffect } from "react";
import type { AppRouter } from "src/processes/server/plugins_engine/router_messages";
import { debounceInitialize } from "~lib/utils";
import { ApiController } from "./ApiController";
import { appStore } from "./store/appStore";

let wsClient: ReturnType<typeof createWSClient> | null = null;

export const ApplicationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const initialize = useCallback(
    debounceInitialize(async () => {
      for (let i = 0; i < 3; i++) {
        try {
          console.log("Initializing stream server connection...");
          const port = await window.electronAPI.getPort();

          wsClient = createWSClient({
            url: `ws://localhost:${port}`,
            onError(evt) {
              console.error("WebSocket error:", evt);
              wsClient?.close();
              wsClient = null;
              initialize(); // Attempt to reinitialize the connection
            },
            onClose(evt) {
              console.warn("WebSocket connection closed:", evt);
              wsClient?.close();
              wsClient = null;
              initialize(); // Attempt to reinitialize the connection
            },
          });

          wsClient.connection?.ws.addEventListener("error", (event) => {
            console.error("WebSocket error:", event);
          });

          const trpc = createTRPCClient<AppRouter>({
            links: [
              wsLink({
                client: wsClient,
              }),
            ],
          });

          const controller = new ApiController(trpc);
          await appStore.getState().initialize(controller);
          return; // Exit the loop if successful
        } catch (error) {
          console.error(
            "Failed to initialize stream server connection:",
            error
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }, 200), // Debounce to avoid multiple rapid calls
    []
  );

  useEffect(() => {
    initialize();

    return () => {
      console.log("Cleaning up ApplicationProvider...");
      if (wsClient) {
        wsClient.close();
        wsClient = null;
      }
    };
  }, []);

  return children;
};
