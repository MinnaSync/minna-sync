import { useState } from "react";
import styles from "./JoinChannel.module.scss";

import { Modal } from "#/portals/Modals/Modal";

import Button from "#/components/Button/Button";
import { FormFieldType, FormProvider } from "#/components/FormProvider/FormProvider";
import { Typography } from "#/components/Typography/Typography";

type JoinChannelProps = {
    channelId: string;
    onSubmit: (data: Record<string, string>) => void;
};

export function JoinChannel({ channelId, onSubmit }: JoinChannelProps) {
    const [ isSubmitting, setSubmitting ] = useState(false);

    const handleForm = (data: Record<string, string>) => {
        setSubmitting(true);
        onSubmit(data);
    }

    return (<>
        <Modal onClose={() => {}}>
            <div className={styles.heading}>
                <Typography variant="heading" size="lg" weight="extrabold">
                    Joining #{channelId}
                </Typography>
            </div>
            <div className={styles.body}>
                <FormProvider
                    id="join_channel"
                    fields={{
                        guestUsername: {
                            type: FormFieldType.ShortText,
                            label: "Username",
                            minLength: 3,
                            maxLength: 16,
                            required: true,
                        },
                    }}

                    onSubmitFail={() => {
                        setSubmitting(false);
                    }}

                    onSubmit={handleForm}
                />
            </div>
            <div className={styles.footer}>
                <Button
                    disabled={isSubmitting}
                    color="Primary"
                    display="Filled"
                    type="submit"
                    form="join_channel"
                >
                    Join Channel
                </Button>
            </div>
        </Modal>
    </>);
}