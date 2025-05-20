import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import parse from 'html-react-parser';
import { AnimeInfo } from "api-types";

import styles from "./InfoContainer.module.scss";
import { Typography } from "#/components/Typography/Typography";

import neptune from "#/util/api/neptune";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { createPortal } from "react-dom";
import { CloseIcon, WarningIcon } from "#/components/Icons/Icons";
import Button from "#/components/Button/Button";
import { Episode } from "./Episode";

type InfoContainerProps = {
    id: string;
    provider: "animepahe";
    resource: "anilist";
    onClose: () => void;
};

function isSensitive(info: AnimeInfo['meta']) {
    if (info.is_nsfw) return true;

    const sensitiveGenres = [
        "Ecchi"
    ];

    return sensitiveGenres.some((genre) => info.genres.includes(genre));
}

export function InfoContainer({ id, provider, resource, onClose }: InfoContainerProps) {
    const { data: info, isLoading } = useQuery(["info", id], () => {
        return neptune.info({ id, provider, resource })
            .then((r) => {
                if (r?.isOk()) return r.value;
            });
    }, { staleTime: Infinity });

    const [ nsfwFlagAcknowledged, setNsfwFlagAcknowledged ] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
            }
        };

        document.addEventListener("keyup", handleKeyDown, { signal });

        return () => controller.abort();
    }, []);

    return createPortal(
        <>
            <div
                className={styles.container}
                style={{ 
                    "--accent-color": (!isLoading && info?.meta.color) || "var(--accent-primary)",
                } as React.CSSProperties}
            >
                <div className={styles.close_container}>
                    <div className={styles.close} onClick={onClose}>
                        <CloseIcon />
                    </div>
                    <Typography variant="heading" size="sm" weight="semi_bold">
                        Close (ESC)
                    </Typography>
                </div>
            {!isLoading
                ? <>
                    {isSensitive(info?.meta!) && !nsfwFlagAcknowledged &&
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
                                    This anime maybe contain content that is inappropriate for some viewers.
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
                    <div className={styles.details}>
                        <img
                            className={styles.poster}
                            src={info?.meta.poster!}
                        />
                        <div className={styles.series_details}>
                            <div className={styles.tags}>
                                <div className={styles.tag}>
                                    <Typography variant="heading" size="md" weight="medium">
                                        {info?.meta.type}
                                    </Typography>
                                </div>
                                <div className={styles.tag}>
                                    <Typography variant="heading" size="md" weight="medium">
                                        {info?.meta.year}
                                    </Typography>
                                </div>
                            </div>
                            <div className={styles.title}>
                                <Typography variant="heading" size="xxl" weight="extrabold">
                                    {info?.meta.title.english}
                                </Typography>
                                <div className={styles.sub_title}>
                                    <Typography variant="heading" size="md" weight="bold">
                                        {`${info?.meta.title.romaji} (${info?.meta.title.native})`}
                                    </Typography>
                                </div>
                            </div>
                            <div className={styles.description}>
                                <Typography variant="body" size="md" weight="normal">
                                    {info?.meta.description && parse(info?.meta.description)}
                                </Typography>
                            </div>
                            <div className={styles.tag_group}>
                                <Typography variant="heading" size="sm" weight="bold">
                                    Genres
                                </Typography>
                                <div className={styles.tags}>
                                    {info?.meta.genres.map((genre) =>
                                        <div key={genre} className={styles.tag}>
                                            <Typography variant="body" size="sm" weight="normal">
                                                {genre}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.tag_group}>
                                <Typography variant="heading" size="sm" weight="bold">
                                    Studios
                                </Typography>
                                <div className={styles.tags}>
                                    {info?.meta.studios.map((s) =>
                                        <div key={s} className={styles.tag}>
                                            <Typography variant="body" size="sm" weight="normal">
                                                {s}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.gradient}></div>
                        <div className={styles.cover}>
                            {info?.meta.trailer && info.meta.trailer.platform === "youtube" && <div className={styles.trailer}>
                                <iframe
                                    loading="lazy"
                                    allow="autoplay; encrypted-media"
                                    src={`https://www.youtube.com/embed/${info?.meta.trailer?.id}?autoplay=1&loop=1&playlist=${info?.meta.trailer?.id}&mute=1&cc_load_policy=0&iv_load_policy=0&controls=0&modestbranding`}>
                                </iframe> 
                            </div>}
                            <img className={styles.cover} src={info?.meta.background!} />
                        </div>
                    </div>
                    <div className={styles.episodes_content}>
                        <div className={styles.episodes}>
                            <Typography variant="heading" size="lg" weight="bold">
                                Episodes
                            </Typography>
                            <div className={styles.episodes_list}>
                                {info?.episodes!.map((episode) => (
                                    <Episode
                                        key={episode.id}
                                        id={episode.id}
                                        series={info.meta.title.english}
                                        title={episode.title!}
                                        poster={info?.meta.poster!}
                                        number={episode.episode as number}
                                        thumbnail={`http://localhost:8443/proxied/${episode.preview}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
                : <>
                    <div className={styles.details}>
                        <Skeleton className={styles.poster} type="rect" animation="wave"/>
                        <div className={styles.series_details}>
                            <div className={styles.tags}>
                                <Skeleton type="rect" animation="pulse" width="75px" height="30px">
                                    <Typography variant="heading" size="md" weight="medium">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="75px" height="30px">
                                    <Typography variant="heading" size="md" weight="medium">.</Typography>
                                </Skeleton>
                            </div>
                            <div className={styles.title}>
                                <Skeleton type="rect" animation="pulse" width="750px">
                                    <Typography variant="heading" size="xxl" weight="extrabold">.</Typography>
                                </Skeleton>
                                <div className={styles.sub_title}>
                                    <Skeleton type="rect" animation="pulse" width="calC(100% - 150px)">
                                        <Typography variant="heading" size="md" weight="bold">.</Typography>
                                    </Skeleton>
                                </div>
                            </div>
                            <div className={styles.description} style={{ padding: 0 }}>
                                <Skeleton type="rect" animation="pulse" width="100%">
                                    <Typography variant="body" size="md" weight="normal">.</Typography>
                                </Skeleton>
                                <Skeleton type="rect" animation="pulse" width="calc(100% - 250px)">
                                    <Typography variant="body" size="md" weight="normal">.</Typography>
                                </Skeleton>
                                <Skeleton.RowGroup>
                                    <Skeleton type="rect" animation="pulse" width="calc(100% - 500px)">
                                        <Typography variant="body" size="md" weight="normal">.</Typography>
                                    </Skeleton>
                                    <Skeleton type="rect" animation="pulse" width="100%">
                                        <Typography variant="body" size="md" weight="normal">.</Typography>
                                    </Skeleton>

                                </Skeleton.RowGroup>
                            </div>
                            <div className={styles.tag_group}>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography variant="heading" size="sm" weight="bold">.</Typography>
                                </Skeleton>
                                <div className={styles.tags}>
                                    <Skeleton type="rect" animation="pulse" width="75px" height="27px">
                                        <Typography variant="heading" size="md" weight="medium">.</Typography>
                                    </Skeleton>
                                    <Skeleton type="rect" animation="pulse" width="75px" height="27px">
                                        <Typography variant="heading" size="md" weight="medium">.</Typography>
                                    </Skeleton>
                                    <Skeleton type="rect" animation="pulse" width="75px" height="27px">
                                        <Typography variant="heading" size="md" weight="medium">.</Typography>
                                    </Skeleton>
                                    <Skeleton type="rect" animation="pulse" width="75px" height="27px">
                                        <Typography variant="heading" size="md" weight="medium">.</Typography>
                                    </Skeleton>
                                </div>
                            </div>
                            <div className={styles.tag_group}>
                                <Skeleton type="rect" animation="pulse" width="100px">
                                    <Typography variant="heading" size="sm" weight="bold">.</Typography>
                                </Skeleton>
                                <div className={styles.tags}>
                                    <Skeleton type="rect" animation="pulse" width="75px" height="27px">
                                        <Typography variant="heading" size="md" weight="medium">.</Typography>
                                    </Skeleton>
                                    <Skeleton type="rect" animation="pulse" width="75px" height="27px">
                                        <Typography variant="heading" size="md" weight="medium">.</Typography>
                                    </Skeleton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.gradient}></div>
                    <div className={styles.cover}>
                        <div style={{
                            width: "100%", height: "100%",
                        }}></div>
                    </div>
                </>
            }</div>
        </>,
        document.getElementById("search_info")!
    );
}