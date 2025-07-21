import { Modal } from "#/portals/Modals/Modal";
import { QueueItem } from "./QueueItem";

import styles from "./ManageQueue.module.scss";

import { QueuedMedia } from "#/util/ws/types";
import { Fragment } from "react/jsx-runtime";
import { Typography } from "#/components/Typography/Typography";
import Button from "#/components/Button/Button";
import { useWebsocket } from "#/providers/WebsocketProvider";

type ManageQueue = {
    queue: Array<QueuedMedia>;

    onClose: () => void;
};

export function ManageQueue({ queue, onClose }: ManageQueue) {
    const websocket = useWebsocket();

    const handleRemove = (id: string) => {
        websocket.emit("queue_remove", { id });
    }

    return (<>
        <Modal onClose={onClose}>
            <div className={styles.heading}>
                <Typography variant="heading" size="lg" weight="extrabold">
                    Manage Queue
                </Typography>
            </div>
            <div className={styles.body}>
                {queue.map((i) =>
                    <Fragment key={i.id}>
                        <QueueItem
                            poster={i.poster_image_url!}
                            title={i.title!}
                            series={i.series!}
                            episode={i.episode}

                            onRemove={() => handleRemove(i.id)}
                        />
                    </Fragment>)
                }

                {queue.length <= 0 &&
                    <Typography variant="heading" size="sm" weight="medium">
                        Nothing currently queued.
                    </Typography>
                }
            </div>
            <div className={styles.footer}>
                <Button
                    color="Neutral"
                    display="Filled"
                    type="submit"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>
        </Modal>
    </>);
}