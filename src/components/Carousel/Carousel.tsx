import React, { useRef, useState } from "react";

import styles from "./Carousel.module.scss";

type Props = {
    children: React.ReactNode;
    /**
     * @default "horizontal"
     */
    direction?: "horizontal" | "vertical";
};

export function Carousel(props: Props) {
    const [ index, setIndex ] = useState(0);
    const totalItems = React.Children.count(props.children);

    const previousItem = () => setIndex((p) => p - 1 < 0 ? totalItems - 1 : p - 1);
    const nextItem = () => setIndex((p) => p + 1 > totalItems - 1 ? 0 : p + 1);

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY;
        if (delta > 0) {
            if (index === totalItems - 1) return;
            nextItem();
        } else if (delta < 0) {
            if (index === 0) return;
            previousItem();
        }
    };

    const swipeDistance = 100;
    const startSwipe = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        startSwipe.current = props.direction === "horizontal"
            ? e.touches[0].clientX
            : e.touches[0].clientY;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const end = props.direction === "horizontal"
            ? e.changedTouches[0].clientX
            : e.changedTouches[0].clientY;

        if (!end || !startSwipe.current) return;

        const distance = end - startSwipe.current;
        if (distance > swipeDistance) {
            if (index === 0) return;
            previousItem();
        } else if (distance < -swipeDistance) {
            if (index === totalItems - 1) return;
            nextItem();
        }
    };

    return (<>
        <div
            className={styles.carousel}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className={styles.items}>
                <ul
                    className={`${styles.list} ${props.direction === "horizontal"
                        ? styles.direction_horizontal
                        : styles.direction_vertical}`
                    }
                    style={props.direction === "horizontal"
                        ? { transform: `translateX(-${index * 100}%)` }
                        : { transform: `translateY(-${index * 100}%)` }
                    }
                >
                    {props.children}
                </ul>
            </div>
        </div>
    </>);
}

Carousel.Item = (props: Props) => {
    return (<>
        <li
            className={styles.item}>{props.children}
        </li>
    </>);
};

Carousel.Image = (props: { src: string }) => {
    return (<>
        <img
            className={styles.image_content}
            src={props.src}
        />
    </>);
}