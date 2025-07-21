import { JSX, ReactNode } from 'react';

import { Typography } from '#/components/Typography/Typography';
import styles from './Button.module.scss'

interface ButtonProps {
    type?: "submit" | "reset" | "button";
    disabled?: boolean;
    color: 'Primary' | 'White' | 'Danger' | 'Warning' | 'Positive' | 'Neutral';
    display: 'Filled' | 'Outlined' | 'Link' | 'Ghost';
    textInverted?: boolean;
    icon?: {
        position: 'left' | 'right';
        element: JSX.Element;
    };
    form?: string;
    children?: ReactNode;
    onClick?: () => void;
}

export default function Button(
    props: ButtonProps
) {
    const color = styles[`color${props.color}`];
    const type = styles[`display${props.display}`];

    return (
        <button
            disabled={props.disabled ? true : undefined}
            className={
                `${color} ${type}
                ${props.textInverted ? `${styles.textColorInverted}` : ''}
                ${props.icon && !props.children ? `${styles.iconOnly}` : ''}`
            }
            onClick={
                props.disabled ? undefined : props.onClick
            }
            type={props.type}
            form={props.form}
        >
            { props.icon && props.icon.position === 'left' && props.icon.element }
            { props.children &&
                <Typography variant="heading" weight="semi_bold" size="sm">
                    {props.children}
                </Typography>
            }
            { props.icon && props.icon.position === 'right' && props.icon.element }
        </button>
    )
}