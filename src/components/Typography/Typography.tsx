import { createElement, memo } from 'react';
import styles from './Typography.module.scss';

type TypographyProps = {
    className?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    variant?: 'branding' | 'display' | 'heading' | 'body' | 'heading_italics';
    weight?: 'normal' | 'medium' | 'semi_bold' | 'bold' | 'extrabold';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    children: React.ReactNode;
};

export const Typography = memo(({ className, tag = 'p', variant = 'body', weight = 'normal', size = 'md', children }: TypographyProps) => {
    return createElement(
        tag,
        { className: `${className ? `${className} ` : ''}${styles[variant]} ${styles[weight]} ${styles[size]}` },
        children
    );
})