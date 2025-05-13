import Typography from "#/components/Typography/Typography";
import { ClosedCaptionIcon, MicrophoneIcon } from "#/components/Icons/Icons";

import styles from "./SearchResult.module.scss";

export type SearchResultProps = {
    title: string;
    image: string;
    type: string;
    nsfw?: boolean;
    episodes: {
        subbed?: number;
        dubbed?: number
    };
    // episodes: number;
};

export function SearchResult({ title, image, type, episodes, nsfw }: SearchResultProps) {
    return (<>
        <div className={styles.search_result}>
            <img className={styles.image} src={image} />
            <div className={styles.anime_info}>
                <Typography font="header" weight="bold" tag="h5">{title}</Typography>
                <div className={styles.tags}>
                    <div className={styles.tag}>
                        <Typography font="body" weight="normal" tag="h5">
                            {type}
                        </Typography>
                    </div>
                    {episodes.subbed && (
                        <div className={styles.tag}>
                            <ClosedCaptionIcon />
                            <Typography font="body" weight="normal" tag="h5">
                                {episodes.subbed}
                            </Typography>
                        </div>
                    )}
                    {episodes.dubbed && (
                        <div className={styles.tag}>
                            <MicrophoneIcon />
                            <Typography font="body" weight="normal" tag="h5">
                                {episodes.dubbed}
                            </Typography>
                        </div>
                    )}
                    {nsfw && (
                        <div className={`${styles.tag} ${styles.tag_nsfw}`}>
                            {/* <ExclamationIcon /> */}
                            <Typography font="body" weight="normal" tag="h5">
                                NSFW
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </>);
}