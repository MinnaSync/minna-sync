import { useCallback, useEffect, useState} from "react";
import { useQuery } from "react-query";

import { useWebsocket } from "#/providers/WebsocketProvider";
import { Typography } from "#/components/Typography/Typography";
import styles from "./Episode.module.scss";
import neptune from "#/util/api/neptune";

type EpisodeProps = {
    id: string;
    series: string;
    title: string;
    poster: string;
    number: number;
    thumbnail: string;
};

export function Episode({ id, series, title, poster, number, thumbnail }: EpisodeProps) {
    const websocket = useWebsocket();

    const [ fetched, setFetched ] = useState(false);
    const [ queued, setQueued ] = useState(false);

    const { data: episodeInfo, refetch } = useQuery(["episodeInfo", id], () => {
        return neptune.animepaheStream(id);
    }, {
        enabled: false,
        staleTime: Infinity,
    });

    const handleClick = useCallback(() => {
        if (fetched) return;
        refetch();

        setFetched(true);
    }, []);

    useEffect(() => {
        if (!fetched || !episodeInfo?.isOk()) return;
        if (queued) return;

        const info = episodeInfo.value;

        websocket.emit("queue_media", {
            title: title,
            series: series,
            url: info.jpn.find((r) => r.resolution === "1080")?.link,
            poster_image_url: poster,
        });

        setQueued(true);
    }, [fetched, queued]);

    return (<>
        <div className={styles.episode} onClick={handleClick}>
            <div className={styles.thumbnail}>
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
}