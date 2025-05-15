import { useQuery } from "react-query";
import { Modal } from "#/portals/Modals/Modal";

import { Typography } from "#/components/_Typography/Typography";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { anilistMeta, zoroInfo } from "#/util/api/consumet";

import { Episode } from "./Episode";
import styles from "./AnimeQueuer.module.scss";

type AnimeQueuerProps = {
    id: string;
    onClose: () => void;
}

export function AnimeQueuer({ id, onClose }: AnimeQueuerProps) {
    const { data: info, isLoading } = useQuery(["info", id], () => {
        return zoroInfo({ id }).then(async (info) => {
            if (info.isErr() || !info.value.alID) return;

            const anilistInfo = await anilistMeta(info.value.alID, { provider: "zoro" });
            if (anilistInfo.isErr()) return;

            return anilistInfo.value;
        });
    }, { staleTime: Infinity });

    return (<>
        <Modal onClose={onClose}>
            <div
                className={styles.anime_queuer}
                style={{ 
                    "--accent-color": (!isLoading && info?.color) || "var(--accent-primary)",
                } as React.CSSProperties}
            >{!isLoading
                ? <>
                    <div className={styles.cover}>
                        {info?.cover && <img src={info.cover} />}
                    </div>
                    <div className={styles.info}>
                        <img className={styles.poster} src={info?.image} />
                        <div className={styles.details}>
                            <div className={styles.title}>{typeof info?.title === "string"
                                ? <Typography variant="heading" size="lg" weight="bold">
                                    {info.title}
                                </Typography>
                                : <>
                                <Typography variant="heading" size="lg" weight="bold">
                                    {info?.title.english}
                                </Typography>
                                <Typography variant="heading_italics" size="md" weight="bold">
                                    {info?.title.romaji} ({info?.title.native})
                                </Typography>
                                </>
                            }</div>
                            <div className={styles.description}>
                                {/* TODO: parse description (line breaks, itallics, bold, etc). */}
                                {info?.description}
                            </div>
                        </div>
                    </div>
                    <div className={styles.episodes}>
                        {info?.episodes!.map((episode) => (
                            <Episode
                                zoroId={episode.id}
                                title={episode.title}
                                number={episode.number as number}
                                thumbnail={episode.image}
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