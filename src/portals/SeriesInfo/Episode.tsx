import { memo } from "react";
import { useQuery } from "react-query";

import styles from "./Episode.module.scss";

import { useWebsocket } from "#/providers/WebsocketProvider";
import { QueuedMedia } from "#/util/ws/types";
import { Typography } from "#/components/Typography/Typography";
import neptune from "#/util/api/neptune";
import LoadingSpinner from "#/components/Loading/LoadingSpinner";
import { SuccessIcon } from "#/components/Icons/Icons";

type EpisodeProps = {
    id: string;
    series: string;
    title: string;
    poster: string;
    number: number;
    thumbnail: string;

    queue: Array<QueuedMedia>;
};

export const Episode = memo(({ id, series, title, poster, number, thumbnail, queue }: EpisodeProps) => {
    const websocket = useWebsocket();
    const isQueued = queue.find((m) => m.id === id);
    
    const { refetch, isLoading } = useQuery({
        enabled: false,
        queryKey: ["episodeInfo", id],
        queryFn: async () => await neptune.animepaheStream(id),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return (<>
        <div className={`${styles.episode} ${isQueued ? styles.queued : ""}`} onClick={async () => {
            if (queue.find((m) => m.id === id)) return;

            const { data: episodeInfo } = await refetch();
            if (!episodeInfo || !episodeInfo.isOk()) return;

            const info = episodeInfo.value;
            const queueInfo = {
                id, title, series,
                /**
                 * TODO: Find the most relaible link (1080 -> 720 -> etc)
                 * The backend should be updated to provide a sort order to make this easier on the frontend.
                 */
                url: info.jpn.find((r) => r.resolution === "1080")!.link,
                poster_image_url: poster,
            }

            websocket.emit("queue_media", queueInfo);
        }}>
            <div className={styles.thumbnail}>
                {isLoading &&
                    <div className={styles.queue_state}>
                        <LoadingSpinner />
                    </div>
                }

                {isQueued &&
                    <div className={styles.queue_state}>
                        <SuccessIcon />
                    </div>
                }

                <img loading="lazy" src={thumbnail} />
                <div className={styles.episode_number}>
                    <Typography variant="heading" size="sm" weight="bold">
                        EP {number}
                    </Typography>
                </div>
            </div>
            <div className={styles.title}>
                <Typography variant="heading" size="md" weight="bold">
                    {title}
                </Typography>
            </div>
        </div>
    </>);
});