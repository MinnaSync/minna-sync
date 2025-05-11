import { memo } from "react";
import styles from "./Input.module.scss";

type InputProps = {
    ref: React.Ref<HTMLInputElement>;
    placeholder?: string;
}

export const Input = memo(({ ref, placeholder }: InputProps) => {
    return (<>
        <div className={styles.input_container}>
            <input ref={ref} type="text" placeholder={placeholder} />
        </div>
    </>);
})