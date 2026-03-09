import { BrowserWindow } from "electron";

export const createAuthWindow = async (
  url: string,
  requestedCookies: string[],
  checkValidCookies: (cookies: Record<string, string>) => Promise<boolean>,
  scriptExtractors: { key: string; js: string; waitForResult?: boolean; runOnNavigation?: boolean }[] = [],
) => {
  const authWindow = new BrowserWindow({
    width: 400,
    height: 600,
    title: "Auth",
    show: false,
    webPreferences: {
      partition: "persist:auth-fetcher",
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await authWindow.loadURL(url);

  console.log("Auth Window created, waiting for login...");
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error("Login timeout, closing auth window...");
      authWindow.webContents.off("did-frame-navigate", eventHandler);
      reject(new Error("Login timeout"));
      authWindow.close();
    }, 120000);

    // Only one eventHandler should proceed to extract + validate.
    let settled = false;

    // Values captured from runOnNavigation extractor calls (keyed by extractor key).
    // These are merged into the values dict before result-extractor polling starts,
    // so the CSRF interceptor result seen during an earlier navigation is reused.
    const navCaptured: Record<string, string> = {};

    const navigationExtractors = scriptExtractors.filter((e) => e.runOnNavigation);

    // Run result extractors, starting from anything already in navCaptured.
    const runExtractors = async (values: Record<string, string>) => {
      for (const { key, js, waitForResult } of scriptExtractors) {
        if (waitForResult) {
          // Prefer a value already captured during a navigation run.
          let result = navCaptured[key] ?? "";
          if (!result) {
            const deadline = Date.now() + 10_000;
            while (!result && Date.now() < deadline) {
              try {
                const r = await authWindow.webContents.executeJavaScript(js);
                if (r) { result = String(r); break; }
              } catch {
                break; // window destroyed
              }
              await new Promise<void>((r) => setTimeout(r, 300));
            }
          }
          values[key] = result;
        } else {
          try {
            const r = await authWindow.webContents.executeJavaScript(js);
            if (r != null) values[key] = String(r);
          } catch (e) {
            console.warn(`Auth extractor "${key}" failed:`, e);
          }
        }
      }
    };

    const eventHandler = async () => {
      // 1. Run setup extractors on every navigation (idempotent interceptor install).
      //    Also capture any value already available (e.g., CSRF seen in an early call).
      for (const { key, js } of navigationExtractors) {
        try {
          const r = await authWindow.webContents.executeJavaScript(js);
          if (r && !navCaptured[key]) navCaptured[key] = String(r);
        } catch {
          // page may not be ready on very early navigations
        }
      }

      // 2. Read all session cookies.
      const session = authWindow.webContents.session;
      const cookies = await session.cookies.get({ url: url });
      const values = cookies.reduce(
        (acc, cookie) => { acc[cookie.name] = cookie.value; return acc; },
        {} as Record<string, string>,
      );

      // 3. Quick LOCAL check (no IPC round-trip): are the required session cookies
      //    present? If not, show the window so the user can log in.
      const hasCookies =
        requestedCookies.length === 0 ||
        requestedCookies.some((k) => !!values[k]);

      if (!hasCookies) {
        authWindow.show();
        return;
      }

      // 4. Session cookies look good — claim ownership.
      if (settled) return;
      settled = true;
      authWindow.webContents.off("did-frame-navigate", eventHandler);
      clearTimeout(timeout);

      // 5. Merge anything already captured during navigation events.
      Object.assign(values, navCaptured);

      // 6. Run result extractors BEFORE calling the server so the enriched dict
      //    (including the CSRF token) is what gets sent over IPC and ultimately
      //    returned from getCookies().
      await runExtractors(values);

      // 7. Validate with server — values now contains both cookies AND extractor results.
      const valid = await checkValidCookies(values);
      if (valid) {
        console.log("Login successful, capturing cookies...");
        if (!authWindow.isDestroyed()) authWindow.close();
        resolve();
      } else {
        // Validation failed after enrichment (shouldn't happen if hasCookies passed,
        // but handle gracefully by resetting and letting the user retry).
        console.warn("Auth: server rejected enriched cookies, showing window for retry.");
        settled = false;
        authWindow.webContents.on("did-frame-navigate", eventHandler);
        authWindow.show();
      }
    };

    authWindow.webContents.on("did-frame-navigate", eventHandler);
  });
};
