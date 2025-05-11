import { memo } from 'react';
import styles from './ChatNotification.module.scss';

type ChatNotificationProps = {
    icon: React.ReactNode;
    accent?: 'primary' | 'green' | 'red' | 'orange';
    children: React.ReactNode;
};

export const ChatNotification = memo(({ icon, children, accent = 'primary' }: ChatNotificationProps) => {
    return (<>
        <li
            className={styles.chat_notification}
            style={{ '--accent-color': `var(--accent-${accent})` } as React.CSSProperties}
        >
            {icon}
            {" "}
            <div className={styles.message}>{children}</div>
        </li>
    </>);
})