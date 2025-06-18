import { memo, useRef, useEffect } from "react";
import { ChannelMessage } from "#/util/ws/types";

import styles from './Chat.module.scss'
import { MessagesArea } from "./MessagesArea";
import { BottomArea } from "./BottomArea";

type ChatProps = {
    messages: Array<ChannelMessage>;
};

export const Chat = memo(({ messages }: ChatProps) => {
    const chatRef = useRef<HTMLDivElement>(null);
    const resizeBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const resizeBar = resizeBarRef.current;
        const chat = chatRef.current;
        if (!resizeBar || !chat) return;

        let resizing = false;
        resizeBar?.addEventListener("mousedown", () => {
            resizing = true;
        }, { signal });
        document.addEventListener("mousemove", (e) => {
            if (!resizing) return;

            const minWidth = 350;
            const maxWidth = 450;
            const width = chat.getBoundingClientRect().right - e.clientX;

            chat.style.width = `${Math.min(Math.max(width, minWidth), maxWidth)}px`;
        }, { signal });
        document.addEventListener("mouseup", () => {
            resizing = false
        }, { signal });

        return () => controller.abort();
    }, []);

    return (<>
        <div ref={chatRef} className={styles.chat}>
            <div
                ref={resizeBarRef}
                className={styles.resize_bar}
                onMouseDown={(e) => e.preventDefault()}
            ></div>
            <MessagesArea
                messages={messages}
            />
            <BottomArea/>
        </div>
    </>);
});