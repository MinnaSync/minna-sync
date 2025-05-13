import { memo } from "react";
import styles from "./Input.module.scss";

type InputProps = {
    ref: React.Ref<HTMLInputElement>;
    children?: React.ReactNode;
    className?: string;
    placeholder?: string;
}

export const Input = memo(({ ref, children, placeholder, className }: InputProps) => {
    return (<>
        <div className={`${styles.input_container} ${className}`}>
            {children}
            <input ref={ref} type="text" placeholder={placeholder} />
        </div>
    </>);
})