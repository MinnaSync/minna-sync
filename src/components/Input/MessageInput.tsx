import { Input } from "./Input";

import styles from "./MessageInput.module.scss";

type MessageInputProps = {
    ref: React.RefObject<HTMLInputElement | null>;
    channel: string | undefined;
};

export function MessageInput({ ref, channel }: MessageInputProps) {
    return (<>
        <div className={styles.message_input}>
            <Input
                ref={ref}
                placeholder={`Message #${channel}`}
            />    
        </div>       
    </>);
}