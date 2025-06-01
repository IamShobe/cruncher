import { BrowserWindow } from 'electron';


export const createAuthWindow = async (url: string) => {
    const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
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
            console.log('Grafana Session Cookie:', grafanaSessionCookie);
            console.log('Grafana Expiry Cookie:', grafanaExpiryCookie);
            // parse time from grafana_expiry cookie
            if (grafanaExpiryCookie) {
                const expiryTime = new Date(parseInt(grafanaExpiryCookie.value) * 1000); // Convert seconds to milliseconds
                console.log('Grafana Expiry Time:', expiryTime);
                if (expiryTime > new Date() && grafanaSessionCookie) {
                    console.log('Grafana session is valid, expiry time is in the future.');

                    console.log('Login successful, capturing cookies...');
                    authWindow.webContents.off('did-frame-navigate', eventHandler); // Remove the event listener
                    clearTimeout(timeout); // Clear the timeout since we have a valid session
                    resolve({
                        sessionCookie: grafanaSessionCookie.value,
                        expiryTime: expiryTime,
                    });
                    authWindow.close();
                }
            }
        }


        // OPTIONAL: Detect login completion by checking URL change
        authWindow.webContents.on('did-frame-navigate', eventHandler);
    });
}
