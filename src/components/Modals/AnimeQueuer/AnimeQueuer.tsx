import { useState } from "react";
import { useQuery } from "react-query";
import { Modal } from "#/portals/Modals/Modal";

import neptune from "#/util/api/neptune";
import { Typography } from "#/components/Typography/Typography";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { WarningIcon } from "#/components/Icons/Icons";

import { Episode } from "./Episode"; 
import styles from "./AnimeQueuer.module.scss";
import Button from "#/components/Button/Button";

type AnimeQueuerProps = {
    id: string;
    onClose: () => void;
}

export function AnimeQueuer({ id, onClose }: AnimeQueuerProps) {
    const { data: info, isLoading } = useQuery(["info", id], () => {
        return neptune.info({ id, provider: "animepahe", resource: "anilist" })
            .then((r) => {
                if (r?.isOk()) return r.value;
            });
    }, { staleTime: Infinity });

    const [ nsfwFlagAcknowledged, setNsfwFlagAcknowledged ] = useState(false);

    return (<>
        <Modal onClose={onClose}>
            <div
                className={styles.anime_queuer}
                style={{ 
                    "--accent-color": (!isLoading && info?.meta.color) || "var(--accent-primary)",
                } as React.CSSProperties}
            >{!isLoading
                ? <>
                    {(info?.meta.is_nsfw || info?.meta.genres.includes("Ecchi")) && !nsfwFlagAcknowledged &&
                        <div className={styles.nsfw_flag}>
                            <WarningIcon
                                width={50}
                                height={50}
                            />
                            <div className={styles.warning_info}>
                                <Typography variant="heading" size="lg" weight="bold">
                                    Sensitive Content
                                </Typography>
                                <Typography size="md" weight="medium">
                                    This anime may contain content or topics that are sensitive to some viewers. Please proceed with caution when queuing.
                                </Typography>
                            </div>
                            <div className={styles.buttons}>
                                <Button
                                    color="Neutral"
                                    display="Filled"
                                    onClick={onClose}
                                >
                                    Go Back
                                </Button>
                                <Button
                                    color="Danger"
                                    display="Filled"
                                    onClick={() => setNsfwFlagAcknowledged(true)}
                                >
                                    Proceed
                                </Button>
                            </div>
                        </div>
                    }

                    <div className={styles.cover}>
                        {info?.meta.background && <img src={info.meta.background} />}
                    </div>
                    <div className={styles.info}>
                        <img className={styles.poster} src={info?.meta.poster!} />
                        <div className={styles.details}>
                            <div className={styles.title}>{typeof info?.meta.title === "string"
                                ? <Typography variant="heading" size="lg" weight="bold">
                                    {info?.meta.title}
                                </Typography>
                                : <>
                                {/* <Typography variant="heading" size="lg" weight="bold">
                                    {info?.title.english}
                                </Typography>
                                <Typography variant="heading_italics" size="md" weight="bold">
                                    {info?.title.romaji} ({info?.title.native})
                                </Typography> */}
                                </>
                            }</div>
                            <div className={styles.description}>
                                {/* TODO: parse description (line breaks, itallics, bold, etc). */}
                                {info?.meta?.description}
                            </div>
                        </div>
                    </div>
                    <div className={styles.episodes}>
                        {info?.episodes!.map((episode) => (
                            <Episode
                                key={episode.id}
                                id={episode.id}
                                series={info.meta.title}
                                title={episode.title!}
                                poster={info?.meta.poster!}
                                number={episode.episode as number}
                                thumbnail={`http://localhost:8443/proxied/${episode.preview}`}
                            />
                        ))}
                    </div>
                </>
                : <>
                    {/* <div className={styles.cover} /> */}
                    <div className={styles.info}>
                        <div className={styles.poster}>
                            <Skeleton type="rect" animation="wave" width="100%" height="100%" />
                        </div>
                        <div className={styles.details}>
                            <div className={styles.title}>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="lg">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </div>
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="90px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="250px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="500px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="250px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="250px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                        </div>
                    </div>
                    <div className={styles.episodes}>
                        <Skeleton.ColumnGroup>
                            <Skeleton type="rect" animation="wave" width="100%" height="144px" />
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                        </Skeleton.ColumnGroup>
                        <Skeleton.ColumnGroup>
                            <Skeleton type="rect" animation="wave" width="100%" height="144px" />
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                        </Skeleton.ColumnGroup>
                        <Skeleton.ColumnGroup>
                            <Skeleton type="rect" animation="wave" width="100%" height="144px" />
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                        </Skeleton.ColumnGroup>
                        <Skeleton.ColumnGroup>
                            <Skeleton type="rect" animation="wave" width="100%" height="144px" />
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                        </Skeleton.ColumnGroup>
                        <Skeleton.ColumnGroup>
                            <Skeleton type="rect" animation="wave" width="100%" height="144px" />
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                        </Skeleton.ColumnGroup>
                        <Skeleton.ColumnGroup>
                            <Skeleton type="rect" animation="wave" width="100%" height="144px" />
                            <Skeleton.RowGroup>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography size="md">.</Typography>
                                </Skeleton>
                            </Skeleton.RowGroup>
                        </Skeleton.ColumnGroup>
                    </div>
                    </>
                }</div>
        </Modal>
    </>);
}