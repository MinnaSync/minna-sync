import { type MessageEvent } from "./types";
import { tryCatch } from "#/util/util";

type EmitOptions = {
    /**
     * Queue any events that are emitted while the socket is disconnected.
     * @default false
     */
    queue?: boolean;
}

// import.meta.env.VITE_WSS_URL

export class Websocket {
    private readonly ws: WebSocket;

    public handlers: Map<string, (data: any) => void>;
    public queue: MessageEvent[];

    constructor(url: string) {
        this.ws = new WebSocket(url);
        this.handlers = new Map();
        this.queue = [];
    }

    public connect() {
        const controller = new AbortController();
        const signal = controller.signal;

        this.ws.addEventListener("open", () => {
            console.log("Connected to websocket");

            this.emit("connection", null, { queue: false });

            for (const { event, data } of this.queue) {
                this.ws.send(JSON.stringify({ event, data }));
            }
        }, { signal });

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
        }, { signal });

        this.ws.addEventListener("close", () => {
            controller.abort();
            
            this.connect();
        }, { signal });

        this.ws.addEventListener("error", () => {
            this.ws.close();
        }, { signal });

        return this;
    }

    public on(event: string, callback: (data: any) => void, opts?: { signal?: AbortSignal }) {
        this.handlers.set(event, callback);

        if (opts?.signal) {
            opts.signal.addEventListener("abort", () => this.off(event), { once: true });
        }
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
        if (this.ws.readyState !== this.ws.OPEN) {
            if (!options?.queue) return;
            this.queue.push({ event, data });

            return;
        }

        this.ws.send(JSON.stringify({ event, data }));
    }
}