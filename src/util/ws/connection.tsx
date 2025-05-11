import { type MessageEvent } from "./types";
import { tryCatch } from "#/util/util";

type EmitOptions = {
    /**
     * Queue any events that are emitted while the socket is disconnected.
     * @default false
     */
    queue?: boolean;
}

let ws: WebSocket;
const handlers = new Map<string, (data: any) => void>();
const queue: MessageEvent[] = [];

function connect() {
    ws = new WebSocket(import.meta.env.VITE_WSS_URL);

    const controller = new AbortController();
    const signal = controller.signal;

    ws.addEventListener("open", () => {
        console.log("Connected to websocket");

        emit("connection", null, { queue: false });

        for (const { event, data } of queue) {
            ws.send(JSON.stringify({ event, data }));
        }
    }, { signal });

    ws.addEventListener("message", ({ data }) => {
        console.log("Received message from websocket", data);

        const { result, error } = tryCatch(() => JSON.parse(data) as MessageEvent);

        if (error) {
            console.error(error);
            return;
        }

        const callback = handlers.get(result.event);
        if (!callback) {
            console.error(`No handler for event: ${result!.event}`);
            return;
        }

        callback(result!.data);
    }, { signal });

    ws.addEventListener("close", () => {
        emit("disconnected", null, { queue: false });

        controller.abort();
        connect();
    }, { signal });

    ws.addEventListener("error", () => {
        ws.close();
    }, { signal });

    return ws;
}
connect();

function on(event: string, callback: (data: any) => void, opts?: { signal?: AbortSignal }) {
    handlers.set(event, callback);

    if (opts?.signal) {
        opts.signal.addEventListener("abort", () => off(event), { once: true });
    }
}

function once(event: string, callback: (data: any) => void) {
    on(event, (data: any) => {
        off(event);
        callback(data);
    });
}

function off(event: string) {
    handlers.delete(event);
}

function emit(event: string, data: any, options?: EmitOptions) {
    if (ws.readyState !== ws.OPEN) {
        if (!options?.queue) return;
        queue.push({ event, data });

        return;
    }

    ws.send(JSON.stringify({ event, data }));
}

export const websocket = {
    on, once, off, emit
};