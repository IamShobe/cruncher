import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import type { FC, ReactNode } from "react";
import type { AppRouter } from "cruncher-server/router_messages";
import { debounceInitialize } from "@cruncher/utils";
import { useEffectOnce } from "react-use";
import { ApiController } from "./ApiController";
import { notifyError } from "./notifyError";
import { appStore } from "./store/appStore";

const initializeConnection = debounceInitialize(async () => {
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
            initializeConnection().catch((error) => {
              notifyError("Failed to re-establish server connection", error);
            });
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
      console.error("Failed to initialize stream server connection:", error);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error(
    "Failed to initialize stream server connection after 3 attempts",
  );
}, 200); // Debounce to avoid multiple rapid calls

export const ApplicationProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  useEffectOnce(() => {
    const initializeResult = initializeConnection();

    initializeResult.catch((error) => {
      notifyError(
        "Failed to establish server connection after 3 attempts",
        error,
      );
    });

    return () => {
      console.log("Cleaning up ApplicationProvider...");
      initializeResult.then((result) => result.cleanup()).catch(() => {});
    };
  });

  return children;
};
