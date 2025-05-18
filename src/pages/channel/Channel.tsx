import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router";

import { MediaUpdateEvent, RoomDataEvent, TimeUpdateEvent } from "#/util/ws/types";

import { Header } from "#/components/Header/Header";
import { ChatContent } from "#/components/Chat/ChatContent";
import { VideoPlayer } from "#/components/VideoPlayer/VideoPlayer";
import { SearchInput } from "#/components/Input/SearchInput";

import { useWebsocket } from "#/providers/WebsocketProvider";

import styles from "./Channel.module.scss"
import { MediaPlayerInstance, useStore } from "@vidstack/react";

export function Channel() {
    const playerRef = useRef<MediaPlayerInstance | null>(null);
    useStore(MediaPlayerInstance, playerRef);

    const channelId = useParams().channelId;
    const websocket = useWebsocket();

    const [ src, setSrc ] = useState("");
    const [ time, setTime ] = useState(0);
    const [ paused, setPaused ] = useState(true);
    const [ series, setSeries ] = useState<null | string>(null);
    const [ title, setTitle ] = useState<null | string>(null);
    const suppressStatusUpdated = useRef(false);

    const handlePausePlay = useCallback((paused: boolean) => {
        if (suppressStatusUpdated.current) {
            suppressStatusUpdated.current = false;
            return;
        }

        websocket.emit("player_state", { paused });
    }, []);

    const handleTimeUpdate = useCallback((time: number) => {
        if (suppressStatusUpdated.current) {
            suppressStatusUpdated.current = false;
            return;
        }

        websocket.emit("player_state", { current_time: time });
    }, []);

    useEffect(() => {
        websocket.on("connected", () => {
            websocket.emit("join_room", channelId);
        });

        websocket.on("room_data", ({ now_playing }: RoomDataEvent) => {
            if (!now_playing || !playerRef.current) return;
            suppressStatusUpdated.current = true;

            setSrc(`http://localhost:8443/m3u8/${now_playing.url}`);
            setTime(now_playing.current_time);
            setPaused(now_playing.paused);
            setSeries(now_playing.series);
            setTitle(now_playing.title);

            console.log(now_playing);
        });

        websocket.on("media_changed", ({ url, series, title }: MediaUpdateEvent) => {
            suppressStatusUpdated.current = true;
            
            setSrc(`http://localhost:8443/m3u8/${url}`);
            setTime(0);
            setPaused(false);
            setSeries(series);
            setTitle(title);
        });

        websocket.on("state_updated", ({ current_time, paused }: TimeUpdateEvent) => {
            if (!playerRef.current) return;

            suppressStatusUpdated.current = true;

            const playerTime = playerRef.current.currentTime;
            if (Math.abs(playerTime - current_time) > 1) {
                playerRef.current.currentTime = current_time;
            };

            if (playerRef.current.paused !== paused) {
                playerRef.current.paused = paused;
            }
        });
    }, []);

    return (<>
        <div className={styles.container}>
            <Header>
                <SearchInput />
            </Header>
            <div className={styles.page_contents}>
                <VideoPlayer
                    ref={playerRef}
                    src={src}
                    time={time}
                    paused={paused}
                    nowPlaying={series && title &&
                        `${series} - ${title}`
                    }
                    onReady={() => {
                        const controller = new AbortController();
                        const signal = controller.signal;

                        const player = playerRef.current!;

                        player?.addEventListener("playing", () => handlePausePlay(false), { signal });
                        player?.addEventListener("pause", () => handlePausePlay(true), { signal });

                        player?.addEventListener("seeked", () => handleTimeUpdate(player.currentTime), { signal });

                        return () => controller.abort();
                    }}
                />
                <ChatContent />
            </div>
        </div>
    </>);
}