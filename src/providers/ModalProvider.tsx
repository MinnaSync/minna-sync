import { createContext, useContext, useState } from "react";

export enum ModalType {
    JoinChannel,
    ManageQueue
}

export const ModalContext = createContext<{
    modal: ModalType | null;
    setModal: (modal: ModalType | null) => void;
} | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [ modal, setModal ] = useState<ModalType | null>(null);

    return (
        <ModalContext.Provider value={{ modal, setModal }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }

    return context;
}