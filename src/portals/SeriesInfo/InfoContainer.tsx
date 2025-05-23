import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useInfiniteQuery } from "react-query";
import parse from 'html-react-parser';
import { AnimeInfo } from "@minnasync/api-types";

import styles from "./InfoContainer.module.scss";
import { Typography } from "#/components/Typography/Typography";

import { MediaUpdateEvent } from "#/util/ws/types";
import neptune from "#/util/api/neptune";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { CloseIcon, UpArrowIcon, WarningIcon } from "#/components/Icons/Icons";
import Button from "#/components/Button/Button";
import { Episode } from "./Episode";

type InfoContainerProps = {
    id: string;
    provider: "animepahe";
    resource: "anilist";

    queueRef: React.RefObject<Set<string>>;
    onQueue: (info: MediaUpdateEvent) => void;

    onClose: () => void;
};

function isSensitive(info: AnimeInfo['meta']) {
    if (info.is_nsfw) return true;

    const sensitiveGenres = [
        "Ecchi"
    ];

    return sensitiveGenres.some((genre) => info.genres.includes(genre));
}

export function InfoContainer({ id, provider, resource, queueRef, onQueue, onClose }: InfoContainerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const detailsRef = useRef<HTMLDivElement | null>(null);

    const [ nsfwFlagAcknowledged, setNsfwFlagAcknowledged ] = useState(false);
    const [ displayBackToTop, setDisplayBackToTop ] = useState(false);

    const {
        data: info,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["info", id],
        queryFn: async ({ pageParam = 1 }) => await neptune.info({ id, provider, resource, page: pageParam.toString() }).then((r) =>
            r.isOk() ? r.value : undefined
        ),
        getNextPageParam(lastPage, pages) {
            if (!lastPage || !lastPage.details.hasNextPage) return;
            return pages.length + 1;
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const threshold = container.scrollHeight - container.scrollTop - container.clientHeight < 250;
        if (threshold && hasNextPage && !isFetchingNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, isLoading, fetchNextPage]);

    const handleBackToTop = useCallback(() => {
        if (!detailsRef.current) return;
        containerRef.current?.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, []);

    useEffect(() => {
        let debounceTimer: number | null = null;

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
        containerRef.current?.addEventListener("scroll", () => {
            if (containerRef.current!.scrollTop > (detailsRef.current!.offsetHeight - 250)) {
                setDisplayBackToTop(true);
            } else {
                setDisplayBackToTop(false);
            }

            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            // @ts-ignore
            debounceTimer = setTimeout(handleScroll, 500); // Reset the debounce timer
        }, { signal });

        return () => {
            controller.abort();

            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, []);

    return createPortal(
        <>
            <div
                ref={containerRef}
                className={styles.container}
                style={{ 
                    "--accent-color": (!isLoading && info?.pages[0]?.meta.color) || "var(--accent-primary)",
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

                {displayBackToTop &&
                    <div className={styles.back_to_top} onClick={handleBackToTop}>
                        <UpArrowIcon />
                    </div>
                }
            {!isLoading
                ? <>
                    {isSensitive(info?.pages[0]?.meta!) && !nsfwFlagAcknowledged &&
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
                    <div ref={detailsRef} className={styles.details}>
                        <img
                            className={styles.poster}
                            src={info?.pages[0]?.meta.poster!}
                        />
                        <div className={styles.series_details}>
                            <div className={styles.tags}>
                                <div className={styles.tag}>
                                    <Typography variant="heading" size="md" weight="medium">
                                        {info?.pages[0]?.meta.type}
                                    </Typography>
                                </div>
                                <div className={styles.tag}>
                                    <Typography variant="heading" size="md" weight="medium">
                                        {info?.pages[0]?.meta.year}
                                    </Typography>
                                </div>
                            </div>
                            <div className={styles.title}>
                                <Typography variant="heading" size="xxl" weight="extrabold">
                                    {info?.pages[0]?.meta.title.english}
                                </Typography>
                                <div className={styles.sub_title}>
                                    <Typography variant="heading" size="md" weight="bold">
                                        {`${info?.pages[0]?.meta.title.romaji} (${info?.pages[0]?.meta.title.native})`}
                                    </Typography>
                                </div>
                            </div>
                            <div className={styles.description}>
                                <Typography variant="body" size="md" weight="normal">
                                    {info?.pages[0]?.meta.description && parse(info?.pages[0]?.meta.description)}
                                </Typography>
                            </div>
                            <div className={styles.tag_group}>
                                <Typography variant="heading" size="sm" weight="bold">
                                    Genres
                                </Typography>
                                <div className={styles.tags}>
                                    {info?.pages[0]?.meta.genres.map((genre) =>
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
                                    {info?.pages[0]?.meta.studios.map((s) =>
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
                            {info?.pages[0]?.meta.trailer && info.pages[0].meta.trailer.platform === "youtube" && <div className={styles.trailer}>
                                <iframe
                                    loading="lazy"
                                    allow="autoplay; encrypted-media"
                                    src={`https://www.youtube.com/embed/${info?.pages[0]?.meta.trailer?.id}?autoplay=1&loop=1&playlist=${info?.pages[0]?.meta.trailer?.id}&mute=1&cc_load_policy=0&iv_load_policy=0&controls=0&modestbranding`}>
                                </iframe> 
                            </div>}
                            <img className={styles.cover} src={info?.pages[0]?.meta.background!} />
                        </div>
                    </div>
                    <div className={styles.episodes_content}>
                        <div className={styles.episodes}>
                            <Typography variant="heading" size="lg" weight="bold">
                                Episodes
                            </Typography>
                            <div className={styles.episodes_list}>
                                {info?.pages.map((p) =>
                                    p?.details.episodes.map((episode) => (
                                        <Episode
                                            key={episode.id}
                                            id={episode.id}
                                            series={(
                                                info?.pages[0]?.meta.title.english ||
                                                info?.pages[0]?.meta.title.romaji ||
                                                info?.pages[0]?.meta.title.native ||
                                                'Unknown'
                                            )}
                                            title={episode.title!}
                                            poster={info?.pages[0]?.meta.poster!}
                                            number={episode.episode as number}
                                            thumbnail={`${import.meta.env.VITE_PROXY_URL}/url/${episode.preview}`}
                                            queueRef={queueRef}
                                            onQueue={onQueue}
                                        />
                                    ))
                                )}
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