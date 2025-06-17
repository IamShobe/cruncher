import { ExternalAuthProvider } from "~lib/adapters";
import { IPCMessage } from "./types";

export class ElectronExternalAuthProvider implements ExternalAuthProvider {
  constructor(private port: Electron.ParentPort) {}
  getCookies(
    requestedUrl: string,
    cookies: string[],
    validate: (cookies: Record<string, string>) => Promise<boolean>
  ): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      const jobId = crypto.randomUUID();

      // eslint-disable-next-line
      let timeout: NodeJS.Timeout;

      const handleResponse = async (event: Electron.MessageEvent) => {
        const msg = event.data as IPCMessage;
        if (!msg || typeof msg !== "object" || !("type" in msg)) return;
        if (msg.type === "authResult") {
          const jobId = msg.jobId as string;
          const cookies = msg.cookies as Record<string, string>;
          try {
            const result = await validate(cookies);
            this.port.postMessage({
              type: "authResult",
              jobId: jobId,
              status: result,
            });
            if (result) {
              this.port.off("message", handleResponse);
              clearTimeout(timeout);
              resolve(cookies);
            }
          } catch (error) {
            clearTimeout(timeout);
            reject(
              new Error(
                "Validation failed: " +
                  (error instanceof Error ? error.message : "Unknown error")
              )
            );
            this.port.off("message", handleResponse);
            return;
          }
        }
      };

      timeout = setTimeout(() => {
        this.port.off("message", handleResponse);
        reject(new Error("Authentication request timed out"));
      }, 125000); // 2 minutes timeout

      this.port.on("message", handleResponse);

      this.port.postMessage({
        type: "getAuth",
        authUrl: requestedUrl,
        jobId: jobId,
        cookies,
      });
    });
  }
}

export class DefaultExternalAuthProvider implements ExternalAuthProvider {
  getCookies(): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      reject(
        new Error(
          "External authentication provider is not implemented in this environment."
        )
      );
    });
  }
}
