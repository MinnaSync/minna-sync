import { memo, useCallback,  useState } from "react";

import { Typography } from "#/components/Typography/Typography";
import { ClosedCaptionIcon, MicrophoneIcon } from "#/components/Icons/Icons";

import styles from "./SearchResult.module.scss";
import { AnimeQueuer } from "../Modals/AnimeQueuer/AnimeQueuer";

export type SearchResultProps = {
    id: string;
    title: string;
    image: string;
    type: string;
    nsfw?: boolean;
    episodes?: {
        subbed?: number;
        dubbed?: number
    };
};

export const SearchResult = memo(({ id, title, image, type, episodes, nsfw }: SearchResultProps) => {
    const [ openModal, setOpenModal ] = useState(false);

    const handleClick = useCallback(() => {
        setOpenModal(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModal(false);
    }, []);
    
    return (<>
        <div className={styles.search_result} onClick={handleClick}>
            <img className={styles.image} src={image} />
            <div className={styles.anime_info}>
                <Typography tag="h5" variant="heading" weight="bold" size="sm">{title}</Typography>
                <div className={styles.tags}>
                    <div className={styles.tag}>
                        <Typography tag="h5" size="xs">
                            {type}
                        </Typography>
                    </div>
                    {episodes && episodes.subbed !== 0 && episodes.dubbed !== 0 && episodes.subbed == episodes.dubbed && (
                        <div className={styles.tag}>
                            <MicrophoneIcon />
                            <ClosedCaptionIcon />
                            <Typography tag="h5" size="xs">
                                {episodes.subbed}
                            </Typography>
                        </div>
                    )}
                    {episodes && episodes.dubbed !== 0 && episodes.subbed !== episodes.dubbed && (
                        <div className={styles.tag}>
                            <MicrophoneIcon />
                            <Typography tag="h5" size="xs">
                                {episodes.dubbed}
                            </Typography>
                        </div>
                    )}
                    {episodes && episodes.subbed !== 0 && episodes.subbed !== episodes.dubbed && (
                        <div className={styles.tag}>
                            <ClosedCaptionIcon />
                            <Typography tag="h5" size="xs">
                                {episodes.subbed}
                            </Typography>
                        </div>
                    )}
                    {nsfw && (
                        <div className={`${styles.tag} ${styles.tag_nsfw}`}>
                            <Typography tag="h5" size="xs">
                                NSFW
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
        {openModal && <AnimeQueuer id={id} onClose={handleClose} />}
    </>);
});