import { useCallback, useEffect, useRef, useState } from 'react';
import { isHLSProvider, MediaPlayer, MediaPlayerInstance, MediaProvider, MediaProviderAdapter, MediaProviderChangeEvent, MediaProviderInstance, useMediaRemote, useStore } from '@vidstack/react';
import HLS from 'hls.js';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import styles from "./VideoPlayer.module.scss";
import { ControlGroup, PlayPauseButton, SkipButton, ToggleFullscreenButton, VolumeControl } from './Controls';
import { Typography } from '../Typography/Typography';

type VideoPlayerProps = {
    ref: React.RefObject<MediaPlayerInstance | null>;
    src: string;
    time?: number;
    paused?: boolean;
    nowPlaying: string | null;
    onSkip?: () => void;
    onReady?: () => void;
};

const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";

    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor(time / 60 % 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0')

    if (hours === "00") {
        return `${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}:${seconds}`;
};

export function VideoPlayer({ src, ref, time, paused, nowPlaying, onSkip, onReady }: VideoPlayerProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const timeRef = useRef<HTMLDivElement | null>(null);

    const remote = useMediaRemote(ref.current)
    const providerRef = useRef<MediaProviderInstance | null>(null);
    useStore(MediaProviderInstance, providerRef);

    const [ playerFocused, setPlayerFocused ] = useState(false);
    const [ isPaused, setIsPaused ] = useState(false);
    const [ isMuted, setIsMuted ] = useState(ref.current?.muted || false);
    const [ volume, setVolume ] = useState(ref.current?.volume || 1);
    const [ currentTime, setCurrentTime ] = useState("00:00 / 00:00");

    const onProviderChange = useCallback((provider: MediaProviderAdapter | null, _: MediaProviderChangeEvent) => {
        if (!isHLSProvider(provider)) return;

        /**
         * Newer versions of hls.js are broken with providers like animepahe.
         * This is because, for example, animepahe uses .jpg instead of .ts for segments.
         * Why? I don't know, nor do I really care. Basically, dont upgrade hls.js for your own sanity.
         * 
         * For some reason, the older hls.js versions do work, so, whatever I guess!
         */
        provider.library = HLS;
    }, []);

    const handleTimestampUpdate = useCallback((time: number) => {
        const typographyEl = timeRef.current?.firstElementChild as HTMLElement;
        if (!ref.current || !timeRef.current || !typographyEl) return;

        timeRef.current.style.width = `${time / ref.current.duration * 100}%`;
        typographyEl.innerText = `${formatTime(time)}`;
    }, []);

    const handlePausePlay = useCallback(() => {
        remote.togglePaused();
    }, []);

    const handleTimerUpdate = useCallback(() => {
        if (!ref.current || !progressBarRef.current || !timerRef.current) return;

        progressBarRef.current.style.width = `${ref.current.currentTime / ref.current.duration * 100}%`;
        setCurrentTime(`${formatTime(ref.current.currentTime)} / ${formatTime(ref.current.duration)}`);
        handleTimestampUpdate(ref.current.currentTime);
    }, []);

    const handleSeekingUpdate = useCallback((e: MouseEvent | TouchEvent) => {
        if (!progressRef.current || !ref.current) return;

        const rect = progressRef.current.getBoundingClientRect();

        let clickX: number;
        if (e instanceof MouseEvent) {
            clickX = e.clientX - rect.left;
        }
        else {
            clickX = e.touches[0].clientX - rect.left;
        }

        const percentage = (clickX / rect.width) * 100;

        remote.seek(ref.current.duration * percentage / 100);
        handleTimerUpdate();
    }, []);

    useEffect(() => {
        remote.changeClipEnd(ref.current!.duration + 0.1);
    }, []);

    useEffect(() => {
        let seeking = false;
        let displayControlsTimeout: number | null = null;

        const controller = new AbortController();
        const signal = controller.signal;
        
        const player = ref.current;
        const provider = providerRef.current;
        const wrapper = wrapperRef.current;
        const progress = progressRef.current;

        const handleControlsDisplay = () => {
            if (displayControlsTimeout) {
                clearTimeout(displayControlsTimeout);
            }

            if (!playerFocused) {
                setPlayerFocused(true);
            }

            // @ts-ignore
            // Bun uses the web standard, "number".
            displayControlsTimeout = setTimeout(() => {
                setPlayerFocused(false);
            }, 2_500);
        };

        const handleSeeking = (e: MouseEvent | TouchEvent) => {
            if (!player || !seeking) return;
            handleSeekingUpdate(e);
        };

        const handleStartSeeking = () => {
            if (!player) return;
            seeking = true;
        }

        const handleStopSeeking = async () => {
            if (!player || !seeking) return;
            seeking = false;
        };

        provider?.addEventListener("click", handlePausePlay, { signal });

        wrapper?.addEventListener("mouseenter", handleControlsDisplay, { signal });
        wrapper?.addEventListener("mousemove", handleControlsDisplay, { signal });
        wrapper?.addEventListener("touchstart", handleControlsDisplay, { signal });

        progress?.addEventListener("click", (e) => handleSeekingUpdate(e), { signal });
        progress?.addEventListener("mousedown", handleStartSeeking, { signal });
        document.addEventListener("mousemove", handleSeeking, { signal });
        document.addEventListener("mouseup", handleStopSeeking, { signal });
        document.addEventListener("mouseleave", handleStopSeeking, { signal });
        progress?.addEventListener("touchstart", handleStartSeeking, { signal });
        document.addEventListener("touchmove", handleSeeking, { signal });
        document.addEventListener("touchend", handleStopSeeking, { signal });

        player?.addEventListener("ended", () => remote.pause(), { signal });

        player?.addEventListener("playing", () => setIsPaused(false), { signal });
        player?.addEventListener("pause", () => setIsPaused(true), { signal });

        return () => controller.abort();
    }, []);

    return (<>
        <div ref={wrapperRef} className={`${styles.video_player}${playerFocused ? ` ${styles.focused}` : ""}`}>
            <div className={styles.header}>
                {(nowPlaying && nowPlaying !== "")
                    ? <>
                        <Typography variant='heading' weight='medium' size='sm'>
                            {nowPlaying}
                        </Typography>
                    </>
                    : <>
                        <Typography variant='heading' weight='medium' size='sm'>
                            Nothing Playing
                        </Typography>
                    </>
                }
            </div>
            <MediaPlayer
                // controls
                crossOrigin
                aspectRatio="16/9"
                preload="metadata"
                load="eager"
                streamType="on-demand"
                viewType="video"
                ref={ref}
                className={styles.player} src={src}
                onTimeUpdate={handleTimerUpdate}
                onProviderChange={onProviderChange}
                onLoadedMetadata={() => {
                    if (time !== undefined)
                        remote.seek(time);

                    if (paused !== undefined) {
                        paused
                            ? remote.pause()
                            : remote.play();

                        setIsPaused(paused);
                    }
                }}
                onCanPlay={onReady}
            >
                <MediaProvider ref={providerRef}>
                </MediaProvider>
            </MediaPlayer>
            <div className={styles.controls}>
                <div className={styles.timestamp}>
                    <div ref={timeRef} className={styles.current_time}>
                        <Typography variant='heading' weight='medium' size='sm'>00:00</Typography>
                    </div>
                </div>
                <div ref={progressRef} className={styles.progress}>
                    <div ref={progressBarRef} className={styles.bar} />
                </div>
                <div className={styles.buttons}>
                    <ControlGroup>
                        <PlayPauseButton
                            paused={isPaused}
                            ended={false}
                            handlePausePlay={handlePausePlay}
                        />
                        {onSkip && <SkipButton
                            handleClick={() => onSkip()}
                        />}
                        <VolumeControl
                            volume={volume * 100}
                            muted={isMuted}
                            onClick={() => {
                                remote.toggleMuted();

                                /**
                                 * This seems backwards but it's how it works when toggleMuted() is called.
                                 */
                                if (ref.current?.muted) {
                                    setIsMuted(false);
                                }
                                else {
                                    setIsMuted(true);
                                }
                            }}
                            onVolumeChange={(v) => {
                                if (ref.current?.muted) {
                                    remote.toggleMuted();
                                    setIsMuted(false);
                                };

                                v = Math.min(v / 100, 100);

                                remote.changeVolume(v);
                                setVolume(v);
                            }} 
                        />
                        <div
                            ref={timerRef}
                            className={styles.timer}
                        >
                            <Typography variant='heading' weight='medium' size='sm'>
                                {currentTime}
                            </Typography>
                        </div>
                    </ControlGroup>
                    <ControlGroup>
                        <ToggleFullscreenButton
                            wrapper={wrapperRef.current!}
                        />
                    </ControlGroup>
                </div>
            </div>
        </div>
    </>)
}