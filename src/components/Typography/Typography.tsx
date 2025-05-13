import { createElement, memo } from 'react';
import styles from './Typography.module.scss';

type TypographyProps = {
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    font?: 'header' | 'body';
    weight?: 'bolder' | 'bold' | 'medium' | 'normal' | 'lighter';
    children: React.ReactNode;
};

export const Typography = memo(({ tag = 'p', font = 'body', weight = 'normal', children }: TypographyProps) => {
    return createElement(
        tag,
        { className: `${styles.typography} ${styles[font]} ${styles[weight]}` },
        children
    );
})