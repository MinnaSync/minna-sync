import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import styles from "./Channel.module.scss"
import { Header } from "#/components/Header/Header";
import { websocket } from "#/util/ws/connection";
import { ChatContent } from "#/components/Chat/ChatContent";
import { VideoPlayer } from "#/components/VideoPlayer/VideoPlayer";

export function Channel() {
    const channelId = useParams().channelId;
    const websocketRef = useRef(websocket);

    useEffect(() => {
        const socket = websocketRef.current;
        
        socket.once("connected", () => {
            socket.emit("join_room", channelId);
        });

        return () => socket.emit("leave_room", channelId);
    }, []);

    return (<>
        <div className={styles.container}>
            <Header />
            <div className={styles.page_contents}>
                <VideoPlayer
                    src="/videos/test.mp4"
                />
                <ChatContent
                    websocket={websocketRef}
                />
            </div>
        </div>
    </>);
}