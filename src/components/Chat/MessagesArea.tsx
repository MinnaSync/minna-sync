import { Fragment, memo, useRef, useEffect } from "react";
import { UserMessage, Notification } from "./ChannelMessage";

import styles from './MessagesArea.module.scss'
import { ChannelMessage, MessageType } from "#/util/ws/types";
import { DeleteIcon, PlayIcon, QueueIcon, UserJoinIcon, UserLeaveIcon } from "../Icons/Icons";

type MessageAreaProps = {
    messages: Array<ChannelMessage>;
}

export const MessagesArea = memo(({ messages }: MessageAreaProps) => {
    const areaRef = useRef<HTMLOListElement>(null);

    useEffect(() => {
        const el = areaRef.current;
        if (!el) return;

        const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (isAtBottom) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    return (<>
        <ol ref={areaRef} className={styles.chat_messages}>
            {messages.map((m, i) =>
                <Fragment key={i}>
                    {m.type === MessageType.Notification &&
                        <Notification
                            header="SYSTEM"
                            accent="Primary"
                        >{m.content}</Notification>
                    }
                    {m.type === MessageType.UserJoin &&
                        <Notification
                            icon={<UserJoinIcon />}
                            header="USER JOINED"
                            accent="Green"
                            sfx="/sfx/notification.mp3"
                        >{m.content}</Notification>
                    }
                    {m.type === MessageType.UserLeave &&
                        <Notification
                            icon={<UserLeaveIcon />}
                            header="USER LEFT"
                            accent="Red"
                        >{m.content}</Notification>
                    }
                    {m.type === MessageType.UserMessage &&
                        <UserMessage
                            username={m.username}
                            timestamp={m.utc_epoch}
                            children={m.content}
                        />
                    }
                    {m.type === MessageType.MediaChanged &&
                        <Notification
                            icon={<PlayIcon />}
                            header="NOW PLAYING"
                            accent="Primary"
                        >{m.content}</Notification>
                    }
                    {m.type === MessageType.MediaRemoved &&
                        <Notification
                            icon={<DeleteIcon />}
                            header="REMOVED FROM QUEUE"
                            accent="Primary"
                        >{m.content}</Notification>
                    }
                    {m.type === MessageType.MediaQueued &&
                        <Notification
                            icon={<QueueIcon />}
                            header="ADDED TO QUEUE"
                            accent="Primary"
                        >{m.content}</Notification>
                    }
                </Fragment>
            )}
        </ol>
    </>);
});