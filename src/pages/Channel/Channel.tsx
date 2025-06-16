import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router";

import { TimeUpdateEvent } from "#/util/ws/types";

import { Header } from "#/components/Header/Header";
import { ChatContent } from "#/components/Chat/ChatContent";
import { VideoPlayer } from "#/components/VideoPlayer/VideoPlayer";
import { SearchInput } from "#/components/Input//Search/SearchInput";

import { useWebsocket } from "#/providers/WebsocketProvider";

import styles from "./Channel.module.scss"
import { MediaPlayerInstance, useStore } from "@vidstack/react";
import { InfoContainer } from "#/portals/SeriesInfo/InfoContainer";
import { JoinChannel } from "#/components/Modals/JoinChannel/JoinChannel";

export function Channel() {
    const playerRef = useRef<MediaPlayerInstance | null>(null);
    useStore(MediaPlayerInstance, playerRef);

    const queuedRef = useRef(new Set<string>());

    const channelId = useParams().channelId!;
    const websocket = useWebsocket();

    const [ provider, _ ] = useState<"animepahe">("animepahe");

    const [ displayJoinRoomModal, setDisplayJoinRoomModal ] = useState(false);
    const [ connected, setConnected ] = useState(false);
    const [ guestUser, setGuestUser ] = useState<null | string>(null);

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
        }, 1_000);
    }, []);

    const handlePausePlay = useCallback((paused: boolean) => {
        if (suppressStatusUpdates.current) return;
        
        /**
         * Ignores pause events for when the video is near the end.
         * 
         * This prevents the player from telling the server that the video is paused,
         * causing it to not queue the next ideo.
         */
        if (Math.abs(playerRef.current!.currentTime - playerRef.current!.duration) < 0.1) return;

        websocket.emit("player_state", { paused });
    }, []);

    const handleTimeUpdate = useCallback((time: number) => {
        if (suppressStatusUpdates.current) return;

        websocket.emit("player_state", { current_time: time });
    }, []);

    const [ openedPage, setOpenedPage ] = useState<string | null>(null);

    useEffect(() => {
        if (!connected || !guestUser) return;

        websocket.emit("join_channel", {
            channel_id: channelId,
            guest_username: guestUser,
        });
    }, [connected, guestUser]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const handleTimeUpdate = ({ current_time, paused }: TimeUpdateEvent) => {
            if (!playerRef.current) return;

            const playerTime = playerRef.current.currentTime;
            if (Math.abs(playerTime - current_time) > 1) {
                playerRef.current.currentTime = current_time;
            };

            if (playerRef.current.paused !== paused) {
                paused ? playerRef.current.pause() : playerRef.current.play();
            }
        }

        websocket.on("connected", () => {
            setConnected(true);
            setDisplayJoinRoomModal(true);
        }, { signal });

        websocket.on("room_data", ({ now_playing, queue }) => {
            if (!now_playing || !playerRef.current) return;

            handleTempSuppress();

            setSrc(`${import.meta.env.VITE_PROXY_URL}/m3u8/${now_playing.url}`);
            setTime(now_playing.current_time);
            setPaused(now_playing.paused);
            setSeries(now_playing.series || "Unknown Series");
            setTitle(now_playing.title || "No title");

            for (const media of queue) {
                queuedRef.current.add(media.id);
            }
        }, { signal });

        websocket.on("media_changed", ({ url, series, title }) => {
            handleTempSuppress();

            setSrc(`${import.meta.env.VITE_PROXY_URL}/m3u8/${url}`);
            setTime(0);
            setPaused(false);
            setSeries(series  || "Unknown Series");
            setTitle(title || "No title");
        }, { signal });

        websocket.on("queue_updated", ({ id }) => {
            queuedRef.current.add(id);
        }, { signal });

        websocket.on("state_sync", (e) => {
            handleTimeUpdate(e);
        }, { signal });

        websocket.on("state_updated", (e) => {
            handleTimeUpdate(e);
        }, { signal });

        return () => controller.abort();
    }, []);

    return (<>
        {displayJoinRoomModal && <JoinChannel
            channelId={channelId}
            onSubmit={({ username }) => {
                setGuestUser(username);
                setDisplayJoinRoomModal(false);
            }}
            onClose={() => {
                
            }}
        ></JoinChannel>}
        <div className={styles.container}>
            <Header>
                <SearchInput
                    provider={provider}
                    onClickResult={(id) => setOpenedPage(id)}
                />
            </Header>
            <div id="search_info"></div>
            <div className={styles.page_contents}>
                {openedPage && <InfoContainer
                    id={openedPage!}
                    provider={provider}
                    queueRef={queuedRef}
                    onQueue={(info) => {
                        if (queuedRef.current.has(info.id)) return;

                        websocket.emit("queue_media", info);
                        queuedRef.current.add(info.id);
                    }}
                    onClose={() => setOpenedPage(null)}
                />}
                <VideoPlayer
                    ref={playerRef}
                    src={src}
                    time={time}
                    paused={paused}
                    nowPlaying={series && title &&
                        `${series} - ${title}`
                    }
                    onReady={() => {
                        /**
                         * Prevent from emitting a state_updated event until seeking is done.
                         */
                        let seekDebounce: number | null = null;

                        const controller = new AbortController();
                        const signal = controller.signal;

                        const player = playerRef.current!;

                        player?.addEventListener("playing", () => handlePausePlay(false), { signal });
                        player?.addEventListener("pause", () => handlePausePlay(true), { signal });

                        player?.addEventListener("seeked", () => {
                            if (seekDebounce) {
                                clearTimeout(seekDebounce);
                            }

                            // @ts-ignore
                            seekDebounce = setTimeout(() => {
                                handleTimeUpdate(player.currentTime);
                                seekDebounce = null;
                            }, 500);
                        }, { signal });

                        return () => controller.abort();
                    }}
                />
                <ChatContent />
            </div>
        </div>
    </>);
}