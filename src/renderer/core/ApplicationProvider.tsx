import React, { useEffect } from "react";
import { useAsync } from "react-use";
import { WebsocketStreamConnection } from "~lib/websocket/client";
import { appStore } from "./store/appStore";
import { ApiController } from "./ApiController";

export const ApplicationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const getPort = useAsync(async () => {
    return await window.electronAPI.getPort();
  }, []);

  useEffect(() => {
    if (getPort.loading || !getPort.value) {
      return;
    }

    const server = new WebsocketStreamConnection(
      `ws://localhost:${getPort.value}`
    );
    server.initialize();
    const cancelReady = server.onReady(async () => {
      console.log("Stream server connection established");
      const controller = new ApiController(server);
      await appStore.getState().initialize(controller);
    });

    const cancelOnClose = server.onClose(() => {
      console.warn("Stream server connection closed. Reconnecting...");
      // TODO: cancel all subscriptions and reset state
      //   unsub(); // Unsubscribe from the previous subscription
      //   setup(); // Reinitialize the WebSocket connection
    });

    return () => {
      cancelReady();
      cancelOnClose();
      server.close(); // Clean up the WebSocket connection when the component unmounts
    };
  }, [getPort]);

  return children;
};
