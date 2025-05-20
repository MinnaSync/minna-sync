import { useEffect } from "react";
import { useQuery } from "react-query";

import { MediaUpdateEvent } from "#/util/ws/types";
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

    queueRef: React.RefObject<Set<string>>;
    onQueue: (info: MediaUpdateEvent) => void;
};

export function Episode({ id, series, title, poster, number, thumbnail, queueRef, onQueue }: EpisodeProps) {
    const { data: episodeInfo, refetch } = useQuery({
        enabled: !!queueRef.current.has(id),
        queryKey: ["episodeInfo", id],
        queryFn: async () => await neptune.animepaheStream(id),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        if (!episodeInfo?.isOk()) return;

        const info = episodeInfo.value;

        onQueue({
            id: id,
            title: title,
            series: series,
            url: info.jpn.find((r) => r.resolution === "1080")?.link!,
            poster_image_url: poster,
        });
    }, [episodeInfo]);

    return (<>
        <div className={styles.episode} onClick={() => refetch()}>
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