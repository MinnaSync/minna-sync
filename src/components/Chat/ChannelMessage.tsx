import { JSX, memo, useRef, useEffect } from "react";

import styles from "./ChannelMessage.module.scss";
import { Typography } from "../Typography/Typography";

type NotificationProps = {
    accent: "Primary" | "Green" | "Red" | "Orange";
    header: string;
    icon?: JSX.Element;
    sfx?: string;
    children: string;
};

export const Notification = memo(({ accent, header, icon, sfx, children }: NotificationProps) => {
    const color = styles[`color${accent}`];

    const audioRef = useRef<HTMLAudioElement>(new Audio(sfx));

    /**
     * A notification that will play when the user is not tabbed in.
     * Useful for when the user is in another tab and someone joins the channel.
     */
    useEffect(() => {
        if (!sfx || document.visibilityState !== "hidden") return;

        const audio = audioRef.current;
        audio.volume = 0.05;
        audio.play();
    }, [sfx]);

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