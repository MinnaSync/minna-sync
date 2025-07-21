import Button from "#/components/Button/Button";
import { DeleteIcon } from "#/components/Icons/Icons";
import { Typography } from "#/components/Typography/Typography";
import styles from "./QueueItem.module.scss";

type QueueItemProps = {
    poster?: string;

    title: string;
    series: string;

    onRemove: () => void;
};

export function QueueItem({ poster, title, series, onRemove }: QueueItemProps) {
    return (<>
        <div className={styles.queue_item}>
            <img className={styles.poster} src={poster} />
            <div className={styles.details}>
                <Typography variant="heading" size="md" weight="bold">
                    {title}
                </Typography>
                <Typography variant="heading" size="sm" weight="medium">
                    {series}
                </Typography>
            </div>

            <Button
                color="Danger"
                display="Ghost"
                type="submit"
                icon={{
                    position: 'left',
                    element: <DeleteIcon
                        width="24px"
                        height="24px"
                    />
                }}
                onClick={onRemove}
            ></Button>
        </div>
    </>);
}