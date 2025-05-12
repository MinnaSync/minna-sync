import { useCallback, memo, useEffect, useRef, useState } from "react";

import styles from "./ControlButton.module.scss";
import { PlayIcon, PauseIcon, ReplayIcon, FullscreenIcon, VolumeMuteIcon, VolumeMaxIcon, VolumeMinIcon } from "#/components/Icons/Icons";

type BaseControlButtonProps = {
    ref?: React.Ref<HTMLButtonElement>;
    children?: React.ReactNode;
    onClick?: () => void;
}

const ControlButton = memo((props: BaseControlButtonProps) => {
    return (<>
        <button ref={props.ref} className={styles.control_button} onClick={props.onClick}>
            {props.children}
        </button>
    </>);
});

/**
 * @todo figure out how to memoize this.
 */
export const PlayPauseButton = memo((props: {
    paused: boolean;
    ended: boolean;
    handlePausePlay: () => void;
}) => {
    const iconStyle = { width: "20px", height: "20px" };
    return (<>
        <ControlButton onClick={props.handlePausePlay}>
            {!props.ended && props.paused && <PlayIcon {...iconStyle} />}
            {!props.ended && !props.paused && <PauseIcon {...iconStyle} />}
            {props.ended && <ReplayIcon {...iconStyle} />}
        </ControlButton>
    </>);
});

export const ToggleFullscreenButton = memo((props: {
    wrapper: HTMLDivElement;
}) => {
    const handleClick = useCallback(() => {
        const wrapper = props.wrapper;
        if (!wrapper) return;
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            wrapper.requestFullscreen();
        }
    }, [props.wrapper]);

    return (<>
        <ControlButton onClick={handleClick}>
            <FullscreenIcon width={"20px"} height={"20px"} />
        </ControlButton>
    </>);
});

export const VolumeButton = memo((props: {
    volume: number;
    muted: boolean;
    handleMuteVolume: () => void;
    handleVolumeChange: (value: number) => void;
}) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const volumeBarRef = useRef<HTMLDivElement | null>(null);

    const [ focused, setFocused ] = useState(false);

    const handleVolumeChange = useCallback((e: MouseEvent | TouchEvent) => {
        if (!volumeBarRef.current) return;
        const rect = volumeBarRef.current.getBoundingClientRect();

        let clickY: number;
        if (e instanceof MouseEvent) {
            clickY = e.clientY - rect.top;
        }
        else {
            clickY = e.touches[0].clientY - rect.top;
        }

        const percentage = 100 - (clickY / rect.height) * 100;

        props.handleVolumeChange(percentage);
    }, []);

    const isVolumeMuted = props.muted || props.volume <= 0;
    const isVolumePastHalf = props.volume > 50;

    useEffect(() => {
        let adjustingVolume = false;
        let touchFocusTimeout: number | null = null;

        const controller = new AbortController();
        const signal = controller.signal;

        const volumeBar = volumeBarRef.current;
        const wrapper = wrapperRef.current;
        const button = buttonRef.current;

        const handleVolumeAdjust = (e: MouseEvent | TouchEvent) => {
            if (!adjustingVolume) return;

            if (touchFocusTimeout) {
                clearTimeout(touchFocusTimeout);
            }

            handleVolumeChange(e);
        };
        
        button?.addEventListener("mouseenter", () => setFocused(true), { signal });
        wrapper?.addEventListener("mouseleave", () => setFocused(false), { signal });
        button?.addEventListener("touchstart", () => setFocused(true), { signal });
        wrapper?.addEventListener("touchend", () => {
            if (touchFocusTimeout) {
                clearTimeout(touchFocusTimeout);
            }

            // @ts-ignore
            // Bun uses the web standard as "number".
            touchFocusTimeout = setTimeout(() => {
                setFocused(false);
            }, 1_000);
        }, { signal });

        volumeBar?.addEventListener("click", handleVolumeChange, { signal });

        volumeBar?.addEventListener("mousedown", () => adjustingVolume = true, { signal });
        wrapper?.addEventListener("mousemove", handleVolumeAdjust, { signal });
        wrapper?.addEventListener("mouseup", () => adjustingVolume = false, { signal });
        wrapper?.addEventListener("mouseleave", () => adjustingVolume = false, { signal });

        volumeBar?.addEventListener("touchstart", () => adjustingVolume = true, { signal });
        wrapper?.addEventListener("touchmove", handleVolumeAdjust, { signal });
        wrapper?.addEventListener("touchend", () => adjustingVolume = false, { signal });

        return () => controller.abort();
    }, []);

    return (<>
        <div ref={wrapperRef} className={`${styles.volume_slider_wrapper}${focused ? ` ${styles.focused}` : ""}`}>
            <div className={styles.volume_zone}>
                <div className={styles.volume_set}>
                    <div ref={volumeBarRef} className={styles.volume_slider}>
                        <div
                            className={styles.volume_slider_bar}
                            style={{ height: props.muted ? 0 : `${props.volume}%` }}
                        />
                    </div>
                    <div className={styles.volume_percentage}>{props.muted
                        ? "0"
                        : `${props.volume}`
                    }</div>
                </div>
            </div>
            <ControlButton ref={buttonRef} onClick={props.handleMuteVolume}>
                {isVolumeMuted && <VolumeMuteIcon width={"20px"} height={"20px"} />}
                {!isVolumeMuted && !isVolumePastHalf && <VolumeMinIcon width={"20px"} height={"20px"} />}
                {!isVolumeMuted && isVolumePastHalf && <VolumeMaxIcon width={"20px"} height={"20px"} />}
            </ControlButton>
        </div>
    </>);
});