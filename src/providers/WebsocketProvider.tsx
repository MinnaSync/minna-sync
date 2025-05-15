import { createContext, useContext } from "react";
import { Websocket } from "#/util/ws/connection";

export const WebsocketContext = createContext<Websocket | null>(null); 

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
    const ws = new Websocket(import.meta.env.VITE_WSS_URL);
    const connection = ws.connect();

    return (
        <WebsocketContext.Provider value={connection}>
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