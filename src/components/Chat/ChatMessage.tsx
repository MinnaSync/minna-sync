import { memo } from "react";
import { Typography } from "#/components/Typography/Typography";
import styles from "./ChatMessage.module.scss";

export const ChatMessage = memo(({ username, children }: { username: string, children: string }) => {
    return (<>
        <li className={styles.chat_message}>
            <Typography tag="span" weight="bold">{username}:</Typography>
            {" "}
            <Typography tag="span">{children}</Typography>
        </li>
    </>);
})