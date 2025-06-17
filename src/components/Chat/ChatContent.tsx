import { useEffect, useRef, memo, Fragment } from "react";
import { useParams } from "react-router";

import { useWebsocket } from "#/providers/WebsocketProvider";

import styles from "./ChatContent.module.scss";
import { ChatMessage } from "./ChatMessage";
import { ChatNotification } from "./ChatNotification";
import { Typography } from "#/components/Typography/Typography";
import { EnterIcon, LeaveIcon, PlayIcon, QueueIcon } from "#/components/Icons/Icons";
import { MessageInput } from "../Input/MessageInput";
import { ChannelMessage, MessageType } from "#/util/ws/types";

type ChatContentProps = {
    messages: Array<ChannelMessage>;
    onMessage: (m: ChannelMessage) => void;
};

export const ChatContent = memo(({ messages, onMessage }: ChatContentProps) => {
    const channelId = useParams().channelId;
    const websocket = useWebsocket();
    
    const chatContentRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLOListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const resizeBarRef = useRef<HTMLDivElement>(null);

    const sendMessage = (message: string) => {
        websocket.emit("send_message", {
            message: message
        });
    }

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const resizeBar = resizeBarRef.current;
        const chatContent = chatContentRef.current;
        if (!resizeBar || !chatContent) return;

        let resizing = false;
        resizeBar?.addEventListener("mousedown", () => {
            resizing = true;
        }, { signal });
        document.addEventListener("mousemove", (e) => {
            if (!resizing) return;

            const width = chatContent.getBoundingClientRect().right - e.clientX;
            chatContent.style.width = `${Math.min(Math.max(width, 300), 750)}px`;
        }, { signal });
        document.addEventListener("mouseup", () => {
            resizing = false
        }, { signal });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;

        const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (isAtBottom) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        websocket.on("channel_message", (m) => {
            onMessage(m);
        }, { signal });

        return () => controller.abort();
    }, []);
    
    return (<>
        <div
            ref={chatContentRef}
            className={styles.chat_content}
        >
            <div
                ref={resizeBarRef}
                className={styles.resize_bar}
                onMouseDown={(e) => e.preventDefault()}
            ></div>
            <ol ref={messagesRef} className={styles.messages}>
                {websocket.connected
                    ? messages.map((m, i) =>
                        <Fragment key={i}>
                            {m.type === MessageType.UserMessage &&
                                <ChatMessage username={m.username}>
                                    {m.content}
                                </ChatMessage>
                            }
                            {m.type === MessageType.UserJoin &&
                                <ChatNotification
                                    icon={<EnterIcon />}
                                    accent="green"
                                >
                                    <Typography tag="span">{m.content}</Typography>
                                </ChatNotification>
                            }
                            {m.type === MessageType.UserLeave &&
                                <ChatNotification
                                    icon={<LeaveIcon />}
                                    accent="red"
                                >
                                    <Typography tag="span">{m.content}</Typography>
                                </ChatNotification>
                            }
                            {m.type === MessageType.MediaChanged &&
                                <ChatNotification
                                    icon={<PlayIcon />}
                                    accent="primary"
                                >
                                    <Typography tag="span">{m.content}</Typography>
                                </ChatNotification>
                            }
                            {m.type === MessageType.MediaQueued &&
                                <ChatNotification
                                    icon={<QueueIcon />}
                                    accent="primary"
                                >
                                    <Typography tag="span">{m.content}</Typography>
                                </ChatNotification>
                            }
                        </Fragment>
                    )
                    : <></>
                }
            </ol>
            <div className={styles.chat_input}>
                <form onSubmit={(e) => {
                    if (!inputRef.current) return;

                    e.preventDefault();
                    const message = inputRef.current.value;

                    if (message) {
                        sendMessage(message);
                        inputRef.current.value = "";
                    }
                }}>
                    <MessageInput
                        ref={inputRef}
                        channel={channelId}
                    />
                </form>
            </div>
        </div>
    </>);
});