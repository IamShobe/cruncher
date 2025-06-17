import { MessagePortMain } from "electron";
import { isIpcMessage } from "./ipc";

/**
 * Helper to request the server process for a value and wait for a response.
 * @param serverProcess The child process to communicate with
 * @param request The request object to send
 * @param responseType The expected response type string
 */
export function requestFromServer<T>(
  port: MessagePortMain | null,
  request: object,
  responseType: string,
): Promise<T> {
  if (!port) {
    return Promise.reject(new Error("Server port is not initialized"));
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      port.off("message", handler);
      reject(
        new Error(
          `Request timed out after 30 seconds for response type: ${responseType}`,
        ),
      );
    }, 30000); // 30 seconds timeout

    const handler = (payload: Electron.MessageEvent) => {
      const msg = payload.data;
      if (isIpcMessage(msg) && msg.type === responseType) {
        port.off("message", handler);
        clearTimeout(timeout);
        resolve(msg as T);
      }
    };

    port.on("message", handler);
    port.postMessage(request);
  });
}
