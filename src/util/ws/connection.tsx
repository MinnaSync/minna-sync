import type {
    ConnectionEvent,
    ConnectedEvent,
    JoinRoomEvent,
    PlayerStateEvent,
    MessageEvent,
    QueuedMedia,
    QueueMediaId,
    UserJoinEvent,
    UserLeftEvent,
    UserMessageEvent,
    GenericMessageEvent,
    RoomDataEvent,
    TimeUpdateEvent,
    ChannelMessage,
    ChannelCommand
} from "./types";
import { tryCatch } from "#/util/util";

type EmitOptions = {
    /**
     * Queue any events that are emitted while the socket is disconnected.
     * @default false
     */
    queue?: boolean;
};

type ListenerOptions = {
    /**
     * A custom abort signal to use to abort event listeners.
     * This will automatically call off() with the callback to remove the specific event.
     */
    signal?: AbortSignal;
};

type EmitPayloads = {
    connection: ConnectionEvent;
    join_channel: JoinRoomEvent;
    player_state: PlayerStateEvent;
    queue_media: QueuedMedia;
    queue_remove: QueueMediaId;
    send_message: GenericMessageEvent;
    run_command: ChannelCommand;
};

type ResponsePayloads = {
    connected: ConnectedEvent;
    room_data: RoomDataEvent;
    user_joined: UserJoinEvent;
    user_left: UserLeftEvent;
    receive_message: UserMessageEvent;
    queue_updated: QueuedMedia;
    media_changed: QueuedMedia;
    media_removed: QueueMediaId;
    state_sync: TimeUpdateEvent;
    state_updated: TimeUpdateEvent;
    channel_message: ChannelMessage;
    command: ChannelCommand;
};

export class Websocket {
    private url: string;
    private ws: WebSocket | undefined;

    public connected: boolean;
    public reconnecting: boolean;

    public handlers: Map<string, Set< (data: any) => void>>;
    public queue: MessageEvent[];

    private readonly controller: AbortController;
    private readonly signal: AbortSignal;

    /**
     * A custom websocket implementation that handles the server's responses.
     * Inspired off of socket.io's way of handling event.
     * @param url The ws/wss connection url.
     */
    constructor(url: string) {
        this.url = url;
        this.connected = false;
        this.reconnecting = false;
        this.handlers = new Map();
        this.queue = [];

        this.controller = new AbortController();
        this.signal = this.controller.signal;
    }

    /**
     * Create a connection to the websocket.
     */
    public connect() {
        if (this.connected || this.ws?.readyState === WebSocket.OPEN) {
            return this;
        }

        this.ws = new WebSocket(this.url);

        this.ws.addEventListener("open", () => {
            console.debug('[ws] connected');

            this.reconnecting = false;
            this.connected = true;

            this.emit("connection", {});

            for (const { event, data } of this.queue) {
                this.ws?.send(JSON.stringify({ event, data }));
            }
        }, { signal: this.signal });

        this.ws.addEventListener("message", ({ data }) => {
            console.debug('[ws] received message', data);

            const { result, error } = tryCatch(() => JSON.parse(data) as MessageEvent);

            if (error) {
                console.error(error);
                return;
            }

            for (const callback of this.handlers.get(result.event)!) {
                callback(result.data);
            }
        }, { signal: this.signal });

        this.ws.addEventListener("close", () => {
            console.debug('[ws] connection closed');

            this.connected = false;
            this.reconnect();
        }, { signal: this.signal });

        this.ws.addEventListener("error", (msg) => {
            console.debug('[ws] error', msg);

            this.connected = false;
        }, { signal: this.signal });

        this.signal.addEventListener("abort", () => {
            console.debug('[ws] connection aborted');

            this.disconnect();
        }, { once: true });

        return this;
    }

    /**
     * Attempt to reconnect to the websocket.
     * 
     * This method is only used by the class itself.
     * If an attempt at reconnection wants to be maade, use the connect() method.
     */
    private reconnect(attempt: number = 0) {
        const maxAttempts = 5;
        if (attempt >= maxAttempts || this.connected || this.reconnecting) return;

        attempt++;
        this.connected = false;
        this.reconnecting = true;

        setTimeout(() => {
            this.connect();
        }, 1_000 * attempt);
    }

    /**
     * Disconnect from the websocket.
     */
    public disconnect() {
        this.ws?.close();

        this.connected = false;
        this.reconnecting = false;
    }

    /**
     * Listen for an event from the server.
     * @param event The event to listen for.
     * @param callback The callback for when the event is emitted.
     * @param {ListenerOptions} opts Extra options.
     */
    public on<E extends keyof ResponsePayloads>(event: E, callback: (data: ResponsePayloads[E]) => void, opts?: ListenerOptions) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }

        this.handlers.get(event)?.add(callback);

        opts?.signal?.addEventListener("abort", () => {
            this.off(event, callback);
        }, { once: true });
    }

    /**
     * Listens for an event once
     * @param event The event to listen for.
     * @param callback The callback for when the event is emitted.
     * @param {ListenerOptions} opts Extra options.
     */
    public once<E extends keyof ResponsePayloads>(event: E, callback: (data: ResponsePayloads[E]) => void, opts?: ListenerOptions) {
        this.on(event, (data: any) => {
            this.off(event, callback);
            callback(data);
        });

        opts?.signal?.addEventListener("abort", () => {
            this.off(event, callback);
        }, { once: true });
    }

    /**
     * Stop listening to an event.
     * @param event The event to stop listening for.
     * @param callback The specific callback of the event.
     */
    public off(event: string, callback?: (data: any) => void) {
        if (callback) {
            this.handlers.get(event)?.delete(callback);

            if (this.handlers.get(event)?.size === 0) {
                this.handlers.delete(event);
            }

            return;
        }

        this.handlers.get(event)?.clear();
    }

    /**
     * Emit an event to the server.
     * @param event The event to emit.
     * @param data The data that needs to be sent.
     * @param {EmitOptions} options Extra options.
     */
    public emit<E extends keyof EmitPayloads>(event: E, data: EmitPayloads[E], options?: EmitOptions) {
        if (this.ws?.readyState !== this.ws?.OPEN) {
            if (!options?.queue) return;
            this.queue.push({ event, data });

            return;
        }

        const emitData = JSON.stringify({ event, data });

        console.debug('[ws] sending message', emitData);
        this.ws?.send(emitData);
    }
}