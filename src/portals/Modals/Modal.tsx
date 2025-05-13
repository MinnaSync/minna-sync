import { createPortal } from "react-dom";

import styles from "./Modal.module.scss";

type ModalProps = {
    children: React.ReactNode;
}

export function Modal({ children }: ModalProps) {
    return (
        createPortal(
            <div className={styles.background}>
                <dialog className={styles.modal}>
                    {children}
                </dialog>
            </div>,
            document.getElementById("modal")!
        )
    );
}