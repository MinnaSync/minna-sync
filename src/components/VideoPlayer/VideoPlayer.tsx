import { useRef, useState, useCallback, useEffect } from 'react';
import { MediaPlayer, MediaPlayerInstance, MediaProvider, MediaProviderInstance, useStore } from '@vidstack/react';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import styles from "./VideoPlayer.module.scss";
import { PlayPauseButton, VolumeButton, ToggleFullscreenButton } from './ControlButton';

type VideoPlayerProps = {
    src: string;
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

export function VideoPlayer({ src }: VideoPlayerProps) {
    const playerRef = useRef<MediaPlayerInstance | null>(null);
    useStore(MediaPlayerInstance, playerRef);

    const providerRef = useRef<MediaProviderInstance | null>(null);
    useStore(MediaProviderInstance, providerRef);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const seekingContainerRef = useRef<HTMLDivElement | null>(null);
    // const seekingTooltipRef = useRef<HTMLDivElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<HTMLDivElement | null>(null);

    const [ isPaused, setIsPaused ] = useState(true);
    const [ isEnded, setIsEnded ] = useState(false);
    const [ isSeeking, setIsSeeking ] = useState(false);
    const [ playerHovered, setPlayerHovered ] = useState(false);
    const [ volume, setVolume ] = useState(25);
    // const [ isMuted, setMuted ] = useState(false);
    
    const handlePausePlay = useCallback(async () => {
        if (!playerRef.current || !playerRef.current.state.canPlay) return;
        playerRef.current.paused
            ? await playerRef.current.play()
            : playerRef.current.pause();
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (!progressBarRef.current || !playerRef.current || !timerRef.current) return;

        progressBarRef.current.style.width = `${playerRef.current.currentTime / playerRef.current.duration * 100}%`;
        timerRef.current.textContent = `${formatTime(playerRef.current.currentTime)} / ${formatTime(playerRef.current.duration)}`;
    }, []);

    const handleProgressUpdate = useCallback((e: MouseEvent | TouchEvent) => {
        if (!progressRef.current || !playerRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();

        let clickX: number;
        if (e instanceof MouseEvent) {
            clickX = e.clientX - rect.left;
        }
        else {
            clickX = e.touches[0].clientX - rect.left;
        }

        const percentage = (clickX / rect.width) * 100;
        playerRef.current.currentTime = playerRef.current.duration * percentage / 100;
        handleTimeUpdate();
    }, []);

    const handleVolumeSet = useCallback((value: number) => {
        if (!playerRef.current) return;

        if (playerRef.current.muted) {
            playerRef.current.muted = false;
        }

        setVolume(Math.max(0, Math.min(100, value)));
        const volume = Math.min(1, Math.max(0, value / 100));
        playerRef.current.volume = volume;
    }, []);

    const handleVolumeAdjust = useCallback((amount: number) => {
        if (!playerRef.current) return;
        handleVolumeSet((playerRef.current.volume + amount) * 100);
    }, []);

    useEffect(() => {
        let seeking = false;
        let seekingPaused = false;
        let keybindDebounce = false;
        let playerFocused = false;
        let hideControlsTimeout: number | null = null;

        const controller = new AbortController();
        const signal = controller.signal;

        const provider = providerRef.current;
        const player = playerRef.current;
        const progress = progressRef.current;
        const wrapper = wrapperRef.current;

        const handleStartSeeking = () => {
            if (!player) return;

            seeking = true;
            seekingPaused = !player.paused;
            
            setIsSeeking(seeking);

            player?.pause();
        }

        const handleSeeking = (e: MouseEvent | TouchEvent) => {
            if (!player || !seeking) return;
            handleProgressUpdate(e);
        };

        const handleStopSeeking = async () => {
            if (!player || !seeking) return;

            if (seekingPaused) {
                await player.play();
            }

            seeking = false;
            seekingPaused = false;

            setIsSeeking(seeking);
        };

        const handleSeekTime = (time: number) => {
            if (!player) return;

            player.currentTime += time;
            handleTimeUpdate();
        };

        const handleControlsShow = () => {
            if (hideControlsTimeout) {
                clearTimeout(hideControlsTimeout);
            }

            if (!playerHovered) {
                setPlayerHovered(true);
            }

            // @ts-ignore
            // Bun uses the web standard, "number".
            hideControlsTimeout = setTimeout(() => {
                setPlayerHovered(false);
            }, 2_500);
        };

        provider?.addEventListener("click", handlePausePlay, { signal });

        // Keeps track of pausing/playing state for the icon.
        player?.addEventListener("playing", () => setIsPaused(false), { signal });
        player?.addEventListener("pause", () => setIsPaused(true), { signal });

        // Handles hovering on the player.
        wrapper?.addEventListener("mouseenter", handleControlsShow, { signal });
        wrapper?.addEventListener("mousemove", handleControlsShow, { signal });
        wrapper?.addEventListener("touchstart", handleControlsShow, { signal });

        // Sets the state of the player.
        player?.addEventListener("loadeddata", () => player.volume = volume / 100, { once: true, signal });
        progress?.addEventListener("click", handleProgressUpdate, { signal });
        player?.addEventListener("playing", () => setIsPaused(false), { signal });
        player?.addEventListener("pause", () => setIsPaused(true), { signal });
        player?.addEventListener("waiting", () => setIsEnded(false), { signal });
        player?.addEventListener("ended", () => setIsEnded(true), { signal });
        player?.addEventListener("seeked", () => {
            if (player.currentTime < player.duration) {
                setIsEnded(false);
            }
        }, { signal });

        // Progress has to have the mousedown event to trigger seeking.
        progress?.addEventListener("mousedown", handleStartSeeking, { signal });
        document.addEventListener("mousemove", handleSeeking, { signal });
        document.addEventListener("mouseup", handleStopSeeking, { signal });
        document.addEventListener("mouseleave", handleStopSeeking, { signal });
        progress?.addEventListener("touchstart", handleStartSeeking, { signal });
        document.addEventListener("touchmove", handleSeeking, { signal });
        document.addEventListener("touchend", handleStopSeeking, { signal });

        // If the video is focused, enabled keybind events for the player.
        wrapper?.addEventListener("mouseenter", () => playerFocused = true, { signal });
        wrapper?.addEventListener("mouseleave", () => playerFocused = false, { signal });
        document.addEventListener("keydown", (e) => {
            if (keybindDebounce || !playerFocused) return;
            handleControlsShow();

            switch (e.code) {
                case "Space": 
                    e.preventDefault();
                    handlePausePlay();
                    break;
                case "KeyM":
                    // handleMuteVolume();
                    break;
                case "ArrowUp":
                    handleVolumeAdjust(0.1);
                    break;
                case "ArrowDown":
                    handleVolumeAdjust(-0.1);
                    break;
                case "ArrowRight":
                    if (e.shiftKey) {
                        handleSeekTime(30);
                    }
                    else if (e.ctrlKey) {
                        handleSeekTime(1);
                    }
                    else {
                        handleSeekTime(10);
                    }

                    break;
                case "ArrowLeft":
                    if (e.shiftKey) {
                        handleSeekTime(-30);
                    }
                    else if (e.ctrlKey) {
                        handleSeekTime(-1);
                    }
                    else {
                        handleSeekTime(-5);
                    }

                    break;
                default:
                    break;
            }

            keybindDebounce = true;
            setTimeout(() => keybindDebounce = false, 100);
        }, { signal });

        return () => controller.abort();
    }, []);

    return (<>
        <div ref={wrapperRef} className={`${styles.video_player}${playerHovered ? ` ${styles.focused}` : ""}`}>
            <MediaPlayer
                ref={playerRef} className={styles.player} src={src}
                onTimeUpdate={handleTimeUpdate}
                onVolumeChange={(e) => handleVolumeSet(e.volume * 100)}
            >
                <div className={styles.controls}>
                    <div ref={progressRef} className={`${styles.progress}${isSeeking ? ` ${styles.seeking}` : ""}`}>
                        <div ref={seekingContainerRef} className={styles.timer_seeking}>
                            {/* <div
                                ref={seekingTooltipRef}
                                className={styles.timer_tooltip}
                            >00:00</div> */}
                        </div>
                        <div
                            ref={progressBarRef}
                            className={styles.progress_bar}
                        />
                    </div>
                    <div className={styles.buttons}>
                        <div className={styles.control_group}>
                            <PlayPauseButton
                                paused={isPaused}
                                ended={isEnded}
                                handlePausePlay={handlePausePlay}
                            />
                            <VolumeButton
                                volume={Math.round(volume)}
                                muted={false}
                                handleMuteVolume={() => {}}
                                handleVolumeChange={handleVolumeSet}
                            />
                            <div
                                ref={timerRef}
                                className={styles.timer}
                            >00:00 / 00:00</div>
                        </div>
                        <div className={styles.control_group}>
                            <ToggleFullscreenButton
                                wrapper={wrapperRef.current!}
                            />
                        </div>
                    </div>
                </div>
                <MediaProvider ref={providerRef} />
            </MediaPlayer>
        </div>
    </>)
}