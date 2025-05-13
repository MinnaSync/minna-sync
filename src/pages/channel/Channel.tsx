import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import styles from "./Channel.module.scss"
import { Header } from "#/components/Header/Header";
import { websocket } from "#/util/ws/connection";
import { ChatContent } from "#/components/Chat/ChatContent";
import { VideoPlayer } from "#/components/VIdeoPlayer/VideoPlayer";
import { SearchInput } from "#/components/Input/SearchInput";

export function Channel() {
    const channelId = useParams().channelId;
    const websocketRef = useRef(websocket);

    useEffect(() => {
        const socket = websocketRef.current;
        
        socket.on("connected", () => {
            socket.emit("join_room", channelId);
        });
    }, []);

    return (<>
        <div className={styles.container}>
            <Header>
                <SearchInput />
            </Header>
            <div className={styles.page_contents}>
                <VideoPlayer
                    src={""}
                />
                <ChatContent
                    websocket={websocketRef}
                />
            </div>
        </div>
    </>);
}