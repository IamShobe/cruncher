import { BrowserWindow } from 'electron';


export const createAuthWindow = async (url: string) => {
    const authWindow = new BrowserWindow({
        width: 400,
        height: 600,
        title: 'Grafana Auth',
        show: false, // Start hidden
        webPreferences: {
            partition: 'persist:grafana-session', // Persist cookies
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    await authWindow.loadURL(url);

    console.log('Grafana Auth Window created, waiting for login...');
    return new Promise<{
        sessionCookie: string;
        expiryTime: Date;
    }>((resolve, reject) => {
        // add timeout to reject if login takes too long
        const timeout = setTimeout(() => {
            console.error('Login timeout, closing auth window...');
            authWindow.webContents.off('did-frame-navigate', eventHandler); // Remove the event listener
            reject(new Error('Login timeout'));
            authWindow.close();
        }, 120000); // 120 seconds timeout


        const eventHandler = async () => {
            const session = authWindow.webContents.session;
            const cookies = await session.cookies.get({ url: url });
            const grafanaSessionCookie = cookies.find(cookie => cookie.name === 'grafana_session');
            const grafanaExpiryCookie = cookies.find(cookie => cookie.name === 'grafana_session_expiry');
            console.log('Grafana Expiry Cookie:', grafanaExpiryCookie);
            // parse time from grafana_expiry cookie
            const validatedCookies = checkValidCookies(grafanaExpiryCookie, grafanaSessionCookie);
            if (validatedCookies) {
                console.log('Login successful, capturing cookies...');
                authWindow.webContents.off('did-frame-navigate', eventHandler); // Remove the event listener
                clearTimeout(timeout); // Clear the timeout since we have a valid session
                authWindow.close();
                resolve(validatedCookies);
            } else {
                console.info('Grafana expiry cookie not found - prompting user to login again.');
                authWindow.show(); // Show the window to prompt user to login again
            }
        }


        // OPTIONAL: Detect login completion by checking URL change
        authWindow.webContents.on('did-frame-navigate', eventHandler);
    });
}

const checkValidCookies = (grafanaExpiryCookie?: Electron.Cookie, grafanaSessionCookie?: Electron.Cookie) => {
    if (grafanaExpiryCookie) {
        const expiryTime = new Date(parseInt(grafanaExpiryCookie.value) * 1000); // Convert seconds to milliseconds
        console.log('Grafana Expiry Time:', expiryTime);
        if (expiryTime > new Date() && grafanaSessionCookie) {
            console.log('Grafana session is valid, expiry time is in the future.');
            return {
                sessionCookie: grafanaSessionCookie.value,
                expiryTime: expiryTime,
            };
        }
    }

    console.info('Grafana expiry cookie not found or expired - prompting user to login again.');
    return null;
}