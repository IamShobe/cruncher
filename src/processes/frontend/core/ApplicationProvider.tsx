import React, { useCallback, useEffect } from "react";
import { WebsocketStreamConnection } from "~lib/websocket/client";
import { ApiController } from "./ApiController";
import { appStore } from "./store/appStore";
import { debounceInitialize } from "~lib/utils";

let server: WebsocketStreamConnection | null = null;
let cancelReady: () => void;
let cancelOnClose: () => void;

export const ApplicationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const initialize = useCallback(
    debounceInitialize(async () => {
      for (let i = 0; i < 3; i++) {
        try {
          console.log("Initializing stream server connection...");
          const port = await window.electronAPI.getPort();
          const currentServer = new WebsocketStreamConnection(
            `ws://localhost:${port}`
          );
          server = currentServer;
          currentServer.initialize();
          cancelReady = currentServer.onReady(async () => {
            console.log("Stream server connection established");
            const controller = new ApiController(currentServer);
            await appStore.getState().initialize(controller);
          });

          cancelOnClose = currentServer.onClose(() => {
            console.warn("Stream server connection closed. Reconnecting...");
            cancelReady?.();
            cancelOnClose?.();
            server = null; // Reset the server reference
            initialize(); // Reinitialize the connection
            // TODO: cancel all subscriptions and reset state
            //   unsub(); // Unsubscribe from the previous subscription
            //   setup(); // Reinitialize the WebSocket connection
          });

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
      cancelReady?.();
      cancelOnClose?.();
      server?.close(); // Clean up the WebSocket connection when the component unmounts
    };
  }, []);

  return children;
};
