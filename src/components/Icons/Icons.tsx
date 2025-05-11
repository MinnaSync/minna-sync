import React, { memo } from "react";

import styles from "./Icons.module.scss";

interface IconProps {
    children: React.ReactNode;
}

type IconSizeProps =
    | { width: string | number; height: string | number; }
    | { width?: string | number; height?: string | number; }; 

const Icon = memo((props: IconProps & (IconSizeProps)) => {
    return <div className={styles.icon} style={{ display: 'flex', width: props.width, height: props.height }}> 
        {props.children}
    </div>
});

export const EnterIcon = memo((props: IconSizeProps) => (
    <Icon {...props}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M48.291 15.5359C51.6991 11.4116 57.7212 10.7205 61.9648 13.8797L62.3701 14.197L96.3699 42.291C101.21 46.2905 101.21 53.7091 96.3699 57.7086L62.3701 85.8025L61.9648 86.1209C57.7211 89.2799 51.699 88.588 48.291 84.4636C44.7734 80.2063 45.3728 73.9034 49.6299 70.3855L62.1982 59.9998H10C4.47715 59.9998 0 55.5226 0 49.9998C0.000163383 44.4771 4.47725 39.9998 10 39.9998H62.1982L49.6299 29.615L49.2422 29.2771C45.3395 25.7051 44.883 19.6604 48.291 15.5359Z" fill="currentColor"/>
        </svg>
    </Icon>
));

export const LeaveIcon = memo((props: IconSizeProps) => (
    <Icon {...props}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51.7091 84.4642C48.301 88.5885 42.2789 89.2797 38.0352 86.1205L37.63 85.8031L3.63023 57.7092C-1.21007 53.7097 -1.21007 46.2911 3.63023 42.2915L37.63 14.1976L38.0352 13.8793C42.279 10.7202 48.3011 11.4121 51.7091 15.5365C55.2267 19.7938 54.6273 26.0967 50.3702 29.6146L37.8018 40.0004H90.0001C95.5229 40.0004 100 44.4775 100 50.0004C99.9999 55.5231 95.5228 60.0004 90.0001 60.0004H37.8018L50.3702 70.3851L50.7579 70.723C54.6606 74.295 55.1171 80.3397 51.7091 84.4642Z" fill="currentColor"/>
        </svg>
    </Icon>
));