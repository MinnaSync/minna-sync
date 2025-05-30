import { memo } from "react";
import styles from "./Input.module.scss";

type InputProps = {
    ref: React.Ref<HTMLInputElement>;
    name?: string;
    className?: string;
    placeholder?: string;
}

export const Input = memo(({ ref, name, placeholder, className }: InputProps) => {
    return (<>
        <div className={`${styles.input_container}${className ? ` ${className}` : ''}`}>
            <input ref={ref} name={name} type="text" placeholder={placeholder} />
        </div>
    </>);
})