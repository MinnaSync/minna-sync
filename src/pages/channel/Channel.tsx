import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router";

import { MediaUpdateEvent, RoomDataEvent, TimeUpdateEvent } from "#/util/ws/types";

import { Header } from "#/components/Header/Header";
import { ChatContent } from "#/components/Chat/ChatContent";
import { VideoPlayer } from "#/components/VideoPlayer/VideoPlayer";
import { SearchInput } from "#/components/Input//Search/SearchInput";

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

    const suppressStatusUpdates = useRef(false);
    const suppressTimeout = useRef<number | null>(null);

    const handleTempSuppress = useCallback(() => {
        suppressStatusUpdates.current = true;

        if (suppressTimeout.current) {
            clearTimeout(suppressTimeout.current);
        }

        // @ts-ignore
        suppressTimeout.current = setTimeout(() => {
            suppressStatusUpdates.current = false;
            suppressTimeout.current = null;
        }, 250);
    }, []);

    const handlePausePlay = useCallback((paused: boolean) => {
        if (suppressStatusUpdates.current) return;
        websocket.emit("player_state", { paused });
    }, []);

    const handleTimeUpdate = useCallback((time: number) => {
        if (suppressStatusUpdates.current) return;

        websocket.emit("player_state", { current_time: time });
    }, []);

    useEffect(() => {
        websocket.on("connected", () => {
            websocket.emit("join_room", channelId);
        });

        websocket.on("room_data", ({ now_playing }: RoomDataEvent) => {
            if (!now_playing || !playerRef.current) return;

            handleTempSuppress();

            setSrc(`http://localhost:8443/m3u8/${now_playing.url}`);
            setTime(now_playing.current_time);
            setPaused(now_playing.paused);
            setSeries(now_playing.series);
            setTitle(now_playing.title);
        });

        websocket.on("media_changed", ({ url, series, title }: MediaUpdateEvent) => {
            handleTempSuppress();

            setSrc(`http://localhost:8443/m3u8/${url}`);
            setTime(0);
            setPaused(false);
            setSeries(series);
            setTitle(title);
        });

        websocket.on("state_updated", ({ current_time, paused, user_updated }: TimeUpdateEvent) => {
            if (!playerRef.current) return;

            /**
             * Only suppress the state if the user is the one that updated it.
             */
            if (user_updated) {
                handleTempSuppress();
            }

            const playerTime = playerRef.current.currentTime;
            if (Math.abs(playerTime - current_time) > 1) {
                playerRef.current.currentTime = current_time;
            };

            if (playerRef.current.paused !== paused) {
                paused ? playerRef.current.pause() : playerRef.current.play();
            }
        });

        return () => {
            websocket.off("connected");
            websocket.off("room_data");
            websocket.off("media_changed");
            websocket.off("state_updated");
        }
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