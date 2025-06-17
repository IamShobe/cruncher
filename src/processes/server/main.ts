import { ResponseHandler } from '~lib/networkTypes';
import { createSignal } from '~lib/utils';
import { getServer, setupEngine } from '~lib/websocket/server';
import { getRoutes, newUrlNavigationMessage } from './plugins_engine/router';
import log from 'electron-log/main';
import { Engine } from './engineV2/engine';
import * as grafana from '../../adapters/grafana_browser';
import * as local from '../../adapters/mocked_data';
import * as docker from '../../adapters/docker';
import { IPCMessage } from './types';
import { ExternalAuthProvider } from '~lib/adapters';
import { DefaultExternalAuthProvider, ElectronExternalAuthProvider } from './externalAuthProvider';

process.title = "cruncher-server";

log.initialize();
Object.assign(console, log.functions);

let messageSender: ResponseHandler | undefined = undefined;

let serverContainer: Awaited<ReturnType<typeof getServer>> | undefined = undefined;
const messageSenderReady = createSignal();

const initializeServer = async (authProvider: ExternalAuthProvider) => {
    console.log("Initializing server...");
    // get free port
    serverContainer = await getServer();
    console.log(`Server is running on port ${serverContainer.port}`);
    // messageSender = getWebsocketMessageSender(serverContainer);
    messageSender = serverContainer;
    messageSenderReady.signal();

    const engineV2 = new Engine(messageSender, authProvider);
    // TODO: dynamically load supported plugins
    engineV2.registerPlugin(grafana.adapter);
    engineV2.registerPlugin(local.adapter);
    engineV2.registerPlugin(docker.adapter);

    const routes = await getRoutes(engineV2);
    await setupEngine(serverContainer, routes);

    return {
        serverContainer,
        port: serverContainer.port,
        messageSender,
        messageSenderReady
    };
};

const sendUrlNavigationMessage = (url: string) => {
    if (!messageSender) {
        console.warn("Message sender is not initialized yet, cannot handle open-url event");
        return;
    }

    messageSender.sendMessage(newUrlNavigationMessage(url));
};


console.log("Server process started, waiting for IPC messages...");
// If this file is run directly, start the server and listen for IPC messages
if (require.main === module) {
    (async () => {
        if (process.parentPort === undefined) {
            await initializeServer(new DefaultExternalAuthProvider());
        } else {
            process.parentPort?.on('message', async (e) => {
                const [port] = e.ports
                const serverData = await initializeServer(new ElectronExternalAuthProvider(port));

                port.on('message', (e) => {
                    const msg = e.data as IPCMessage;
                    if (!msg || typeof msg !== 'object' || !('type' in msg)) return;
                    if (msg.type === 'authResult') { // safety check for authResult - don't handle it here!
                        return;
                    }

                    const handlers = {
                        getPort: () => {
                            port.postMessage({ type: 'port', port: serverData.port });
                        },
                        navigateUrl: (msg: IPCMessage) => {
                            if (typeof msg.url === 'string') sendUrlNavigationMessage(msg.url);
                        },
                    } as const;

                    if (!(msg.type in handlers)) {
                        return;
                    }

                    console.log(`Received IPC message: ${msg.type}`, msg);
                    const handler = handlers[msg.type as keyof typeof handlers];
                    handler(msg);
                })
                port.start()
                port.postMessage({ type: 'ready', port: serverData.port });
            })
        }

    })();
}

// listen to signal to exit gracefully
process.on('SIGINT', () => {
    console.log("Received SIGINT, shutting down server...");
    serverContainer?.server.close((err) => {
        if (err) {
            console.error("Error shutting down server:", err);
        } else {
            console.log("Server shut down successfully.");
        }
    });

    process.exit(0);
})
