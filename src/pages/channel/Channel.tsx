import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { MediaUpdateEvent } from "#/util/ws/types";

import { Header } from "#/components/Header/Header";
import { ChatContent } from "#/components/Chat/ChatContent";
import { VideoPlayer } from "#/components/VIdeoPlayer/VideoPlayer";
import { SearchInput } from "#/components/Input/SearchInput";

import styles from "./Channel.module.scss"
import { useWebsocket } from "#/providers/WebsocketProvider";

export function Channel() {
    const channelId = useParams().channelId;
    const websocket = useWebsocket();

    const [ src, setSrc ] = useState("");

    useEffect(() => {
        websocket.on("connected", () => {
            websocket.emit("join_room", channelId);
        });

        websocket.on("media_update", ({ url }: MediaUpdateEvent) => {
            setSrc(`http://localhost:8443/proxied/${url}`);
        })
    }, []);

    return (<>
        <div className={styles.container}>
            <Header>
                <SearchInput />
            </Header>
            <div className={styles.page_contents}>
                <VideoPlayer
                    src={src}
                />
                <ChatContent />
            </div>
        </div>
    </>);
}