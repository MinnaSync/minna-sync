import { type MessageEvent } from "./types";
import { tryCatch } from "#/util/util";

type EmitOptions = {
    /**
     * Queue any events that are emitted while the socket is disconnected.
     * @default false
     */
    queue?: boolean;
}

export class Websocket {
    private url: string;
    private ws: WebSocket | undefined;

    public connected: boolean;
    public reconnecting: boolean;

    public handlers: Map<string, (data: any) => void>;
    public queue: MessageEvent[];

    private readonly controller: AbortController;
    private readonly signal: AbortSignal;

    constructor(url: string) {
        this.url = url;
        this.connected = false;
        this.reconnecting = false;
        this.handlers = new Map();
        this.queue = [];

        this.controller = new AbortController();
        this.signal = this.controller.signal;
    }

    public connect() {
        if (this.connected || this.ws?.readyState === WebSocket.OPEN) {
            return this;
        }

        this.ws = new WebSocket(this.url);

        this.ws.addEventListener("open", () => {
            this.reconnecting = false;
            this.connected = true;

            this.emit("connection", null, { queue: false });

            for (const { event, data } of this.queue) {
                this.ws?.send(JSON.stringify({ event, data }));
            }
        }, { signal: this.signal });

        this.ws.addEventListener("message", ({ data }) => {
            console.log("Received message from websocket", data);

            const { result, error } = tryCatch(() => JSON.parse(data) as MessageEvent);

            if (error) {
                console.error(error);
                return;
            }

            const callback = this.handlers.get(result.event);
            if (!callback) {
                console.error(`No handler for event: ${result!.event}`);
                return;
            }

            callback(result!.data);
        }, { signal: this.signal });

        this.ws.addEventListener("close", () => {
            this.connected = false;
            this.reconnect();
        }, { signal: this.signal });

        this.ws.addEventListener("error", () => {
            this.connected = false;
        }, { signal: this.signal });

        this.signal.addEventListener("abort", () => {
            this.disconnect();;
        }, { once: true });

        return this;
    }

    public reconnect(attempt: number = 0) {
        const maxAttempts = 5;
        if (attempt >= maxAttempts || this.connected || this.reconnecting) return;

        attempt++;
        this.connected = false;
        this.reconnecting = true;

        setTimeout(() => {
            this.connect();
        }, 1_000 * attempt);
    }

    public disconnect() {
        this.ws?.close();

        this.connected = false;
        this.reconnecting = false;
    }

    public on(event: string, callback: (data: any) => void) {
        this.handlers.set(event, callback);
    }

    public once(event: string, callback: (data: any) => void) {
        this.on(event, (data: any) => {
            this.off(event);
            callback(data);
        });
    }

    public off(event: string) {
        this.handlers.delete(event);
    }

    public emit(event: string, data: any, options?: EmitOptions) {
        if (this.ws?.readyState !== this.ws?.OPEN) {
            if (!options?.queue) return;
            this.queue.push({ event, data });

            return;
        }

        this.ws?.send(JSON.stringify({ event, data }));
    }
}