import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { socket } from "#/util/socket";

const SocketContext = createContext<Socket>(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    return <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>;
}

export function useSocket() {
    return useContext(SocketContext);
}