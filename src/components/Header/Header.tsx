import styles from "./Header.module.scss";

export function Header({ children }: { children?: React.ReactNode }) {
    return (
        <div className={styles.header}>
            {children}
        </div>
    );
}