import { BaseStreamClient } from '~lib/baseStreamClient';
import { UnsubscribeFunction } from '~lib/network';


export class WebsocketStreamConnection extends BaseStreamClient {
    private ws!: WebSocket;
    constructor(private url: string) {
        super();
    }

    protected _sendMessage(buffer: Buffer<ArrayBufferLike>): Promise<void> {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(buffer);
            return Promise.resolve();
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
            return Promise.reject(new Error('WebSocket is not open'));
        }
    }
    initialize() {
        this.ws = new WebSocket(this.url);
        this.ws.binaryType = "arraybuffer";
        this.ws.addEventListener('open', () => {
            console.log('WebSocket connection established');
        });
        this.ws.addEventListener('close', () => {
            console.log('WebSocket connection closed');
        });


        this.ws.addEventListener('message', (event) => this.onMessage(event.data));
    }
    close(): void {
        super.close();
        this.ws.close();
    }

    onClose(callback: () => void): UnsubscribeFunction {
        this.ws.addEventListener('close', callback);
        return () => {
            this.ws.removeEventListener('close', callback);
        };
    }

    onReady(callback: () => void): UnsubscribeFunction {
        this.ws.addEventListener('open', callback);
        return () => {
            this.ws.removeEventListener('open', callback);
        };
    }
}
