import { memo } from "react";
import styles from "./Input.module.scss";

type InputProps = {
    ref: React.Ref<HTMLInputElement>;
    className?: string;
    placeholder?: string;
}

export const Input = memo(({ ref, placeholder, className }: InputProps) => {
    return (<>
        <div className={`${styles.input_container} ${className}`}>
            <input ref={ref} type="text" placeholder={placeholder} />
        </div>
    </>);
})