import { BrowserWindow } from "electron";

export const createAuthWindow = async (
  url: string,
  requestedCookies: string[],
  checkValidCookies: (cookies: Record<string, string>) => Promise<boolean>
) => {
  const authWindow = new BrowserWindow({
    width: 400,
    height: 600,
    title: "Auth",
    show: false, // Start hidden
    webPreferences: {
      partition: "persist:auth-fetcher", // Persist cookies
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await authWindow.loadURL(url);

  console.log("Auth Window created, waiting for login...");
  return new Promise<void>((resolve, reject) => {
    // add timeout to reject if login takes too long
    const timeout = setTimeout(() => {
      console.error("Login timeout, closing auth window...");
      authWindow.webContents.off("did-frame-navigate", eventHandler); // Remove the event listener
      reject(new Error("Login timeout"));
      authWindow.close();
    }, 120000); // 120 seconds timeout

    const eventHandler = async () => {
      const session = authWindow.webContents.session;
      const cookies = await session.cookies.get({ url: url });
      const values = requestedCookies.reduce(
        (acc, cookieName) => {
          const cookie = cookies.find((c) => c.name === cookieName);
          if (cookie) {
            acc[cookieName] = cookie.value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      const validatedCookies = await checkValidCookies(values);
      if (validatedCookies) {
        console.log("Login successful, capturing cookies...");
        authWindow.webContents.off("did-frame-navigate", eventHandler); // Remove the event listener
        clearTimeout(timeout); // Clear the timeout since we have a valid session
        authWindow.close();
        resolve();
      } else {
        console.info("Cookies not found - prompting user to login again.");
        authWindow.show(); // Show the window to prompt user to login again
      }
    };

    // OPTIONAL: Detect login completion by checking URL change
    authWindow.webContents.on("did-frame-navigate", eventHandler);
  });
};
