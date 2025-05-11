import { useCallback, useEffect, useRef, useState } from "react";

import { PlayPauseButton, ToggleFullscreenButton, VolumeButton } from "./ControlButton";
import styles from "./VideoPlayer.module.scss";

type VideoPlayerProps = {
    src: string;
    accentColor?: string;
    forcedTime?: number;
}

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

export function VideoPlayer(props: VideoPlayerProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const bufferBarRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<HTMLDivElement | null>(null);
    const seekingContainerRef = useRef<HTMLDivElement | null>(null);
    const seekingTooltipRef = useRef<HTMLDivElement | null>(null);

    const [ isSeeking, setIsSeeking ] = useState(false);
    const [ isPaused, setIsPaused ] = useState(true);
    const [ isEnded, setIsEnded ] = useState(false);
    const [ volume, setVolume ] = useState(25);
    const [ isMuted, setMuted ] = useState(false);
    const [ playerHovered, setPlayerHovered ] = useState(false);

    const handlePlayPause = useCallback(() => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
            return;
        }

        videoRef.current.pause();
    }, []);

    const progressSeekingTooltip = useCallback(() => {
        if (!videoRef.current || !seekingTooltipRef.current || !seekingContainerRef.current) return;

        const seeking = videoRef.current.currentTime / videoRef.current.duration * 100;
        seekingContainerRef.current.style.width = `${seeking}%`;
        seekingTooltipRef.current.innerText = `${formatTime(videoRef.current.currentTime)}`;
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (!progressBarRef.current || !videoRef.current || !timerRef.current) return;

        progressBarRef.current.style.width = `${videoRef.current.currentTime / videoRef.current.duration * 100}%`;
        timerRef.current.textContent = `${formatTime(videoRef.current.currentTime)} / ${formatTime(videoRef.current.duration)}`;
        progressSeekingTooltip();
    }, []);

    const handleProgressUpdate = useCallback((e: MouseEvent | TouchEvent) => {
        if (!progressRef.current || !videoRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();

        let clickX: number;
        if (e instanceof MouseEvent) {
            clickX = e.clientX - rect.left;
        }
        else {
            clickX = e.touches[0].clientX - rect.left;
        }

        const percentage = (clickX / rect.width) * 100;
        videoRef.current.currentTime = videoRef.current.duration * percentage / 100;
        handleTimeUpdate();
    }, []);

    const handleVolumeSet = useCallback((value: number) => {
        if (!videoRef.current) return;

        if (videoRef.current.muted) {
            videoRef.current.muted = false;
        }

        videoRef.current.volume = Math.min(1, Math.max(0, value / 100));
    }, []);

    const handleVolumeAdjust = useCallback((amount: number) => {
        if (!videoRef.current) return;
        handleVolumeSet((videoRef.current.volume + amount) * 100);
    }, []);

    const handleMuteVolume = useCallback(() => {
        if (!videoRef.current) return;

        // If the volume is already muted, set it to 25.
        if (videoRef.current.volume === 0) {
            handleVolumeSet(25);
            return;
        }
        
        if (videoRef.current.muted) {
            videoRef.current.muted = false;
        } else {
            videoRef.current.muted = true;
        }
    }, []);

    const updateBufferBar = useCallback(() => {
        if (!videoRef.current || !bufferBarRef.current || !videoRef.current.buffered.length) return;

        const buffered = videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / videoRef.current.duration * 100;
        bufferBarRef.current.style.width = `${buffered}%`;
    }, []);

    const handlePausePlay = useCallback(async () => {
        if (!videoRef.current) return;
        videoRef.current.paused
            ? await videoRef.current.play()
            : videoRef.current.pause();
    }, []);

    useEffect(() => {
        let seeking = false;
        let seekingPaused = false;
        let keybindDebounce = false;
        let playerFocused = false;
        let hideControlsTimeout: number | null = null;

        const controller = new AbortController();
        const signal = controller.signal;

        const wrapper = wrapperRef.current;
        const video = videoRef.current;
        const progress = progressRef.current;

        const handleStartSeeking = () => {
            if (!video) return;

            seeking = true;
            seekingPaused = !video.paused;
            
            setIsSeeking(seeking);

            video?.pause();
        }

        const handleSeeking = (e: MouseEvent | TouchEvent) => {
            if (!video || !seeking) return;
            handleProgressUpdate(e);
        };

        const handleStopSeeking = async () => {
            if (!video || !seeking) return;

            if (seekingPaused) {
                await video.play();
            }

            seeking = false;
            seekingPaused = false;

            setIsSeeking(seeking);
        };

        const handleSeekTime = (time: number) => {
            if (!video) return;

            video.currentTime += time;
            handleTimeUpdate();
        };

        const handleControlsShow = () => {
            if (hideControlsTimeout) {
                clearTimeout(hideControlsTimeout);
            }

            if (!playerHovered) {
                setPlayerHovered(true);
            }

            hideControlsTimeout = setTimeout(() => {
                setPlayerHovered(false);
            }, 2_500);
        };
        
        video?.addEventListener("loadeddata", () => video.volume = volume / 100, { once: true, signal });

        // Handles hovering on the player.
        wrapper?.addEventListener("mouseenter", handleControlsShow, { signal });
        wrapper?.addEventListener("mousemove", handleControlsShow, { signal });
        wrapper?.addEventListener("touchstart", handleControlsShow, { signal });

        // Sets the state of the player.
        // This is used for control buttons so they can be properly memoized.
        video?.addEventListener("progress", updateBufferBar, { signal });
        video?.addEventListener("playing", () => setIsPaused(false), { signal });
        video?.addEventListener("pause", () => setIsPaused(true), { signal });
        video?.addEventListener("waiting", () => setIsEnded(false), { signal });
        video?.addEventListener("ended", () => setIsEnded(true), { signal });
        video?.addEventListener("seeked", () => {
            if (video.currentTime < video.duration) {
                setIsEnded(false);
            }
        }, { signal });

        video?.addEventListener("volumechange", () => {
            setVolume(Math.round(video.volume * 100));
            setMuted(video.muted);
        }, { signal });

        video?.addEventListener("timeupdate", handleTimeUpdate, { signal })

        video?.addEventListener("click", handlePlayPause, { signal });

        progress?.addEventListener("click", handleProgressUpdate, { signal });

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
                    handlePlayPause();
                    break;
                case "KeyM":
                    handleMuteVolume();
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
        <div
            ref={wrapperRef}
            className={`${styles.video_player_wrapper}${playerHovered ? ` ${styles.focused}` : ""}`}
            style={props.accentColor ? { 
                "--accent-color": props.accentColor
            } as React.CSSProperties : {}}
        >
            <video ref={videoRef} className={styles.video_player}>
                <source
                    src={`${props.src}#t=${props.forcedTime || 0}`}
                    type={`video/${props.src.split('.').pop()}`}
                />
            </video>
            <div className={styles.video_controls}>
                <div ref={progressRef} className={`${styles.progress}${isSeeking ? ` ${styles.seeking}` : ""}`}>
                    <div
                        ref={seekingContainerRef}
                        className={styles.timer_seeking}
                    >
                        <div
                            ref={seekingTooltipRef}
                            className={styles.timer_tooltip}
                        >00:00</div>
                    </div>
                    <div
                        ref={progressBarRef}
                        className={styles.progress_bar}
                    />
                    <div
                        ref={bufferBarRef}
                        className={styles.buffered_bar}
                        style={{ width: '0%', }}
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
                            muted={isMuted}
                            handleMuteVolume={handleMuteVolume}
                            handleVolumeChange={handleVolumeSet}
                        />
                        <div
                            ref={timerRef}
                            className={styles.timer}
                        >
                            00:00 / 00:00
                        </div>
                    </div>
                    <div className={styles.control_group}>
                        <ToggleFullscreenButton wrapper={wrapperRef.current!} />
                    </div>
                </div>
            </div>
        </div>
    </>);
}