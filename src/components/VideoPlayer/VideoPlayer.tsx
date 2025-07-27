import { useCallback, useEffect, useRef } from 'react';
import { Controls, isHLSProvider, MediaPlayer, MediaPlayerInstance, MediaProvider, MediaProviderAdapter, MediaProviderChangeEvent, MediaProviderInstance, TimeSlider, TimeSliderInstance, useMediaRemote, useStore } from '@vidstack/react';
import HLS from 'hls.js';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import styles from "./VideoPlayer.module.scss";
import { Typography } from '#/components/Typography/Typography';
import { ControlGroup, PlayPauseButton, SkipButton, ToggleFullscreenButton, VolumeControl } from './Controls';

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
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<HTMLDivElement>(null);

    const remote = useMediaRemote(ref.current)
    const providerRef = useRef<MediaProviderInstance>(null);
    const sliderRef = useRef<TimeSliderInstance>(null);
    const playerInstace = useStore(MediaPlayerInstance, ref);
    useStore(MediaProviderInstance, providerRef);

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

    const handlePausePlay = useCallback(() => {
        remote.togglePaused();
    }, []);

    useEffect(() => {
        remote.changeClipEnd(ref.current!.duration + 0.1);

        const player  = ref.current;
        player?.subscribe(({ currentTime, duration }) => {
            const typographyEl = timerRef.current?.firstElementChild as HTMLElement;
            if (!ref.current || !typographyEl) return;

            typographyEl.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        });

        const slider = sliderRef.current;
        slider?.subscribe(({ pointerRate }) => {
            const typographyEl = previewRef.current?.firstElementChild as HTMLElement;
            if (!ref.current || !typographyEl) return;

            typographyEl.innerText = `${formatTime(pointerRate * ref.current.duration)}`;
        });

        const center = centerRef.current;
        center?.addEventListener("click", handlePausePlay);

        return () => center?.removeEventListener("click", handlePausePlay);
    }, []);

    return (<>
        <div ref={wrapperRef} className={`${styles.video_player}`}>
            <MediaPlayer
                crossOrigin
                aspectRatio="16/9"
                preload="metadata"
                load="eager"
                streamType="on-demand"
                viewType="video"
                ref={ref}
                className={styles.player} src={src}
                hideControlsOnMouseLeave
                controlsDelay={5_000}
                onProviderChange={onProviderChange}
                onLoadedMetadata={() => {
                    if (time !== undefined)
                        remote.seek(time);

                    if (paused !== undefined) {
                        paused
                            ? remote.pause()
                            : remote.play();
                    }
                }}
                onCanPlay={onReady}
            >
                <MediaProvider ref={providerRef}>
                </MediaProvider>
                <Controls.Root className={styles.controls}>
                    <Controls.Group className={styles.header}>
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
                    </Controls.Group>

                    <Controls.Group ref={centerRef} className={styles.center}>
                    </Controls.Group>

                    <Controls.Group className={styles.media_controls}>
                        <TimeSlider.Root ref={sliderRef} className={styles.time_slider}>
                            <TimeSlider.Track className={styles.track} />
                            <TimeSlider.TrackFill className={styles.track_fill} />
                            <TimeSlider.Progress className={styles.progress} />
                            <TimeSlider.Thumb className={styles.thumb} />
                            
                            <TimeSlider.Preview ref={previewRef} className={styles.preview_timestamp}>
                                <Typography variant='heading' weight='medium' size='sm'>00:00</Typography>
                            </TimeSlider.Preview>
                        </TimeSlider.Root>

                        <div className={styles.buttons}>
                            <ControlGroup>
                                <PlayPauseButton
                                    paused={playerInstace.paused}
                                    ended={false}
                                    handlePausePlay={handlePausePlay}
                                />
                                {onSkip && <SkipButton
                                    handleClick={() => onSkip()}
                                />}
                                
                                {/* TODO: Implement vidstack native volume control. */}
                                <VolumeControl
                                    volume={playerInstace.volume * 100}
                                    muted={playerInstace.muted}
                                    onClick={() => {
                                        remote.toggleMuted();
                                    }}
                                    onVolumeChange={(v) => {
                                        v = Math.max(Math.min(v / 100, 100), 0);

                                        if (ref.current?.muted && v > 0) {
                                            remote.toggleMuted();
                                        };

                                        remote.changeVolume(v);
                                    }} 
                                />

                                <div ref={timerRef} className={styles.timer}>
                                    <Typography variant='heading' weight='medium' size='sm'>00:00 / 00:00</Typography>
                                </div>
                            </ControlGroup>
                            <ControlGroup>
                                <ToggleFullscreenButton
                                    wrapper={wrapperRef.current!}
                                />
                            </ControlGroup>
                        </div>
                    </Controls.Group>
                </Controls.Root>
            </MediaPlayer>
        </div>
    </>)
}