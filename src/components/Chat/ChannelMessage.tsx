import { JSX, memo } from "react";

import styles from "./ChannelMessage.module.scss";
import { Typography } from "../Typography/Typography";

type NotificationProps = {
    accent: "Primary" | "Green" | "Red" | "Orange";
    header: string;
    icon?: JSX.Element;
    children: string;
};

export const Notification = memo(({ accent, header, icon, children }: NotificationProps) => {
    const color = styles[`color${accent}`];

    return (<>
        <li className={styles.channel_message}>
            <div className={`${styles.notification} ${color}`}>
                <div className={styles.header}>
                    {icon}
                    <Typography
                        tag="h4"
                        variant="heading"
                        weight="bold"
                        size="sm"
                    >{header}</Typography>
                </div>
                <Typography
                    tag="span"
                    variant="body"
                    weight="normal"
                    size="md"
                >{children}</Typography>
            </div>
        </li>
    </>);
});

type UserMessageProps = {
    username: string;
    timestamp: number
    children: string;
};

export const UserMessage = memo(({ username, timestamp, children }: UserMessageProps) => {
    const { locale, timeZone } = Intl.DateTimeFormat().resolvedOptions();
    const time = Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
    }).format(new Date(timestamp * 1000));

    return (<>
        <li className={styles.channel_message}>
            <div className={styles.user_message}>
                <div className={styles.header}>
                    <Typography
                        tag="h4"
                        variant="heading"
                        weight="bold"
                        size="md"
                    >{username}</Typography>
                    <Typography
                        tag="h4"
                        variant="heading"
                        weight="normal"
                        size="sm"
                    >{time}</Typography>
                </div>
                <Typography
                    tag="span"
                    variant="body"
                    weight="normal"
                    size="md"
                >{children}</Typography>
            </div>
        </li>
    </>);
});