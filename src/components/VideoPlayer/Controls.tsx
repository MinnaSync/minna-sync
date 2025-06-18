import { useCallback, memo, useRef, useEffect } from "react";

import { PlayIcon, PauseIcon, ReplayIcon, FullscreenIcon, VolumeMuteIcon, VolumeMinIcon, VolumeMaxIcon } from "#/components/Icons/Icons";
import styles from "./Controls.module.scss";

type BaseControlButtonProps = {
    ref?: React.Ref<HTMLButtonElement>;
    children?: React.ReactNode;
    onClick?: () => void;
}

const ControlButton = memo(({ ref, children, onClick }: BaseControlButtonProps) => {
    return (<>
        <button ref={ref} className={styles.control_button} onClick={onClick}>
            {children}
        </button>
    </>);
});

export function ControlGroup({ children }: { children: React.ReactNode }) {
    return (<>
        <div className={styles.control_group}>
            {children}
        </div>
    </>);
}

export const PlayPauseButton = memo(({ paused, ended, handlePausePlay }: {
    paused: boolean;
    ended: boolean;
    handlePausePlay: () => void;
}) => {
    const iconStyle = { width: "20px", height: "20px" };
    return (<>
        <ControlButton onClick={handlePausePlay}>
            {!ended && paused && <PlayIcon {...iconStyle} />}
            {!ended && !paused && <PauseIcon {...iconStyle} />}
            {ended && <ReplayIcon {...iconStyle} />}
        </ControlButton>
    </>);
});

export const ToggleFullscreenButton = memo(({ wrapper }: {
    wrapper: HTMLDivElement;
}) => {
    const handleClick = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            wrapper.requestFullscreen();
        }
    }, [wrapper]);

    return (<>
        <ControlButton onClick={handleClick}>
            <FullscreenIcon width={"20px"} height={"20px"} />
        </ControlButton>
    </>);
});

export const VolumeControl = memo(({ volume, muted, onClick, onVolumeChange }: {
    volume: number;
    muted: boolean;
    onClick: () => void;
    onVolumeChange: (volume: number) => void;
}) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const volumeWrapperRef = useRef<HTMLDivElement | null>(null);
    const volumeSliderRef = useRef<HTMLDivElement | null>(null);

    const isMuted = muted || volume <= 0;
    volume = isMuted ? 0 : volume;

    const handleVolumeChange = useCallback((e: MouseEvent | TouchEvent) => {
        if (!volumeWrapperRef.current) return;
        const rect = volumeWrapperRef.current.getBoundingClientRect();
        
        let clickX: number;
        if (e instanceof MouseEvent) {
            clickX = e.clientX - rect.left;
        }
        else {
            clickX = e.touches[0].clientX - rect.left;
        }

        const percentage = Math.min((clickX / rect.width) * 100, 100);
        onVolumeChange(percentage);
    }, []);

    useEffect(() => {
        if (!buttonRef.current) return;

        let adjustingVolume = false;

        const controller = new AbortController();
        const signal = controller.signal;

        const volumeWrapper = volumeWrapperRef.current;
        
        volumeWrapper?.addEventListener("click", handleVolumeChange, { signal });
        volumeWrapper?.addEventListener("mousedown", () => adjustingVolume = true, { signal });
        document.addEventListener("mousemove", (e) => {
            console.log(adjustingVolume);
            if (!adjustingVolume) return;
            handleVolumeChange(e);
        }, { signal });
        document?.addEventListener("mouseup", () => adjustingVolume = false, { signal });
        document?.addEventListener("mouseleave", () => adjustingVolume = false, { signal });
    }, []);

    return (<>
        <ControlButton ref={buttonRef} onClick={onClick} >
            {isMuted && <VolumeMuteIcon  width={"20px"} height={"20px"} />}
            {!isMuted && volume < 50 && <VolumeMinIcon width={"20px"} height={"20px"} />}
            {!isMuted && volume >= 50 && <VolumeMaxIcon width={"20px"} height={"20px"} />}
        </ControlButton>
        <div ref={volumeWrapperRef} className={styles.volume}>
            <div
                ref={volumeSliderRef}
                className={styles.slider}
                style={{ width: `${volume}%` }}
            ></div>
        </div>
    </>);
});