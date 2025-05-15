import { useEffect, useState, useRef, memo, Fragment } from "react";
import { useParams } from "react-router";

import { useWebsocket } from "#/providers/WebsocketProvider";
import { UserJoinEvent, UserLeftEvent, type UserMessageEvent } from "#/util/ws/types";

import styles from "./ChatContent.module.scss";
import { ChatMessage } from "./ChatMessage";
import { ChatNotification } from "./ChatNotification";
import { Typography } from "#/components/Typography/Typography";
import { EnterIcon, LeaveIcon } from "#/components/Icons/Icons";
import { MessageInput } from "../Input/MessageInput";

export const ChatContent = memo(() => {
    const channelId = useParams().channelId;
    const websocket = useWebsocket();
    
    const chatContentRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLOListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const resizeBarRef = useRef<HTMLDivElement>(null);

    const [ messages, setMessages ] = useState<(
        { type: 'message', username: string, message: string } |
        { type: 'notification', icon: React.ReactNode, accent: 'primary' | 'green' | 'red' | 'orange'; message: string }
    )[]>([]);

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
            chatContent.style.width = `${Math.min(Math.max(width, 400), 750)}px`;
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

        websocket.on("user_joined", (data: UserJoinEvent) => {
            setMessages((p) => [...p, {
                type: 'notification',
                icon: <EnterIcon />,
                accent: 'green',
                message: `${data.username} has joined the channel.`,
            }]);
        });

        websocket.on("user_left", (data: UserLeftEvent) => {
            setMessages((p) => [...p, {
                type: 'notification',
                icon: <LeaveIcon />,
                accent: 'red',
                message: `${data.username} has left the channel.`,
            }]);
        });

        websocket.on("receive_message", ({ username, message }: UserMessageEvent) => {
            setMessages((p) => [...p, {
                type: 'message',
                username: username,
                message: message
            }]);
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
                {messages.map((m, i) =>
                    <Fragment key={i}>
                        {m.type === 'message' && <ChatMessage
                            username={m.username}
                            children={m.message}
                        />}
                        {m.type === 'notification' && <ChatNotification
                            icon={m.icon}
                            accent={m.accent}
                            children={<>
                                <Typography tag="span">{m.message}</Typography>
                            </>}
                        />}
                    </Fragment>
                )}
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