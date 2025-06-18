import { useRef, useState } from "react";
import { Input } from "#/components/Input/Input";
import { Typography } from "#/components/Typography/Typography";
import { Modal } from "#/portals/Modals/Modal";

import styles from "./JoinChannel.module.scss";
import Button from "#/components/Button/Button";

type JoinRoomProps = {
    channelId: string;
    onSubmit: (data: { username: string; }) => void;
    onClose: () => void;
};

export function JoinChannel({ channelId, onSubmit, onClose }: JoinRoomProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    
    const [ usernameError, setUsernameError ] = useState<string | null>(null);

    return (<>
        <Modal onClose={onClose}>
            <form onSubmit={(e) => {
                /**
                 * At the moment, this is just all code to get it working.
                 * In the future, better form validation will be implemented.
                 */

                e.preventDefault();
                setIsSubmitting(true);

                if (!inputRef.current) {
                    setIsSubmitting(false);
                    setUsernameError("Error: Input ref is not found?");
                    return;
                };

                if (!inputRef.current.value || inputRef.current.value.length === 0) {
                    setIsSubmitting(false);
                    setUsernameError("This field is required.");
                    return;
                }

                if (inputRef.current.value.length < 3) {
                    setIsSubmitting(false);
                    setUsernameError("Username must be at least 3 characters.");
                    return;
                }

                onSubmit({
                    username: inputRef.current.value!
                });
            }} className={styles.form}>
                <div className={styles.heading}>
                    <Typography variant="heading" size="lg" weight="extrabold">
                        Joining #{channelId}
                    </Typography>
                </div>
                <div className={styles.body}>
                    <div className={styles.username_input}>
                        <div className={styles.input_heading}>
                            <Typography variant="body" size="sm" weight="semi_bold">
                                Join as User
                            </Typography>
                            <span className={styles.required}>*</span>
                        </div>
                        <Input ref={inputRef} name="guest_username" placeholder="Username" className={styles.input} />
                        {usernameError && <Typography variant="body" size="xs" weight="semi_bold">
                            {usernameError}
                        </Typography>}
                    </div>
                </div>
                <div className={styles.footer}>
                    <Button
                        disabled={isSubmitting}
                        color="Primary"
                        display="Filled"
                        type="submit"
                    >
                        Join Channel
                    </Button>
                </div>
            </form>
        </Modal>
    </>);
}