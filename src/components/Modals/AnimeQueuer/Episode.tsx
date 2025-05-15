import { Typography } from "#/components/_Typography/Typography";
import styles from "./Episode.module.scss";

type EpisodeProps = {
    zoroId: string;
    title?: string;
    number?: number;
    thumbnail?: string;
};

export function Episode({ zoroId, title, number, thumbnail }: EpisodeProps) {
    return (<>
        <div className={styles.episode}>
            <div className={styles.thumbnail}>
                <img src={thumbnail} />
                <div className={styles.episode_number}>
                    <Typography variant="heading" size="md" weight="bold">
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