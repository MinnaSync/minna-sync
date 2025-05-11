import { useAppState } from "../../context/AppStateContext";

import styles from "./Sidebar.module.scss";

export function Sidebar() {
    const appState = useAppState();

    return (
        <div
            className={
                `${styles.sidebar}${appState.sidebar.compact ? ` ${styles.compact}` : ""}${!appState.sidebar.open ? ` ${styles.closed}` : ""}`
            }
        >
            <button onClick={() => appState.sidebar.setOpen(!appState.sidebar.open)}>
                Close
            </button>
        </div>
    );
}