import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-use";
import z from "zod";
import { notifyError } from "~core/notifyError";
import { StreamConnection, SubscribeOptions } from "~lib/network";
import { createSignal } from "~lib/utils";
import { WebsocketStreamConnection } from "~lib/websocket/client";
import { ControllerProviderContext } from "./search";
import { StreamQueryProviderBuilder } from "./StreamQueryProviderBuilder";


export const ApplicationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const readySignal = useRef(createSignal());
  const getPort = useAsync(async () => {
    return await window.electronAPI.getPort();
  }, []);

  const [streamConnection, setStreamConnection] = useState<StreamConnection>();
  const [queryProviderBuilder, setQueryProviderBuilder] =
    useState<StreamQueryProviderBuilder>();

  useEffect(() => {
    if (getPort.loading || !getPort.value) {
      return;
    }

    const server = new WebsocketStreamConnection(
      `ws://localhost:${getPort.value}`
    );
    server.initialize();

    const builder = new StreamQueryProviderBuilder(server);
    setStreamConnection(server);
    setQueryProviderBuilder(builder);

    return () => {
      server.close(); // Clean up the WebSocket connection when the component unmounts
    };
  }, [getPort]);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!streamConnection || !queryProviderBuilder) {
      return;
    }

    const streamServer = streamConnection;
    const cancelReady = streamServer.onReady(async () => {
      try {
        console.log("Stream server connection established");
        await queryProviderBuilder.initialize();

        if (Object.values(queryProviderBuilder.initializedControllers).length === 0) {
          console.warn(
            "No plugins initialized, initializing default plugin..."
          );
          notifyError(
            "No plugins initialized",
            new Error(
              "No plugins initialized, please add ~/.config/cruncher/cruncher.config.yaml file"
            )
          );
          return;
        }
      } finally {
        console.log("Stream server is ready, signaling...");
        readySignal.current.signal();
        setIsInitialized(true);
      }
    });

    const cancelOnClose = streamServer.onClose(() => {
      console.warn("Stream server connection closed. Reconnecting...");
      readySignal.current.reset();
      // TODO: cancel all subscriptions and reset state
      //   unsub(); // Unsubscribe from the previous subscription
      //   setup(); // Reinitialize the WebSocket connection
      setIsInitialized(false);
    });

    return () => {
      cancelReady();
      cancelOnClose();
    };
  }, [streamConnection, queryProviderBuilder]);

  const subscribeToMessages = <T extends z.ZodTypeAny>(
    schema: T,
    options: SubscribeOptions<T>
  ) => {
    if (!streamConnection) {
      throw new Error("WebSocket connection is not ready");
    }

    const ws = streamConnection;
    const unsub = ws.subscribe(schema, options);

    return () => {
      unsub(); // Unsubscribe from the WebSocket messages
    };
  };

  if (!isInitialized) {
    return <div>Loading WebSocket connection...</div>;
  }

  return (
    <ControllerProviderContext.Provider
      value={{
        builder: queryProviderBuilder,
        subscribeToMessages: subscribeToMessages,
      }}
    >
      {children}
    </ControllerProviderContext.Provider>
  );
};
