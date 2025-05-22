import { useCallback, memo } from "react";

import { PlayIcon, PauseIcon, ReplayIcon, FullscreenIcon } from "#/components/Icons/Icons";
import styles from "./Controls.module.scss";

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

export function ControlGroup({ children }: { children: React.ReactNode }) {
    return (<>
        <div className={styles.control_group}>
            {children}
        </div>
    </>);
}

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