import { createPortal } from "react-dom";

import styles from "./Modal.module.scss";

type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
}

export function Modal({ children, onClose }: ModalProps) {
    return (
        createPortal(
            // <div className={styles.background} onClick={onClose}>
            //     <dialog className={styles.modal}>
            //         {children}
            //     </dialog>
            // </div>,
            <>
                <div className={styles.background} onClick={onClose}></div>
                <dialog className={styles.modal}>
                    {children}
                </dialog>
            </>,
            document.getElementById("modal")!
        )
    );
}