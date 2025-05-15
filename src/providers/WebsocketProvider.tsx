import { createContext, useContext, useRef } from "react";
import { Websocket } from "#/util/ws/connection";

export const WebsocketContext = createContext<Websocket | null>(null); 

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
    const wsRef = useRef<Websocket | null>(null);

    if (!wsRef.current) {
        wsRef.current = new Websocket(import.meta.env.VITE_WSS_URL);
        wsRef.current.connect();
    }

    return (
        <WebsocketContext.Provider value={wsRef.current}>
            {children}
        </WebsocketContext.Provider>
    );
}

export function useWebsocket() {
    const context = useContext(WebsocketContext);

    if (!context) {
        throw new Error("useWebsocket must be used within a WebsocketProvider");
    }

    return context;
}