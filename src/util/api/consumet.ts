import { errAsync, okAsync } from "neverthrow";
import { IAnimeInfo, ISource, MediaFormat } from "@consumet/extensions";

const BASE_URL = import.meta.env.VITE_CONSUMET_URL;

async function request<T>(
    method: string,
    path: string,
    query: Record<string, any> = {},
    signal?: AbortSignal,
) {
    const url = new URL(path, BASE_URL);

    for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
    }

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        signal,
    });
    
    if (!res.ok) {
        return errAsync({
            status: res.status,
            message: res.statusText,
        });
    }

    return okAsync(await res.json() as T);
}

export async function zoroSearch(searchQuery: string, query?: { path?: string; }) {
    return await request<{
        currentPage: number;
        hasNextPage: boolean;
        totalPages: number;
        results: Array<{
            id: string;
            title: string;
            url: string;
            image: string;
            duration: string;
            watchList: string;
            japaneseTitle: string;
            type: MediaFormat;
            nsfw: boolean;
            sub: number;
            dub: number;
            episodes: number;
        }>;
    }>('GET', `/anime/zoro/${searchQuery}`, query);
}

export async function zoroInfo(query: { id: string; }, signal?: AbortSignal) { 
    return await request<{
        id: string;
        title: string;
        malID: number;
        alID: number;
        episodes: {
            id: string;
            number: number;
            url: string;
        }[]; 
        genres: string[];
        url: string;
        image: string;
        releaseDate: string;
        description: string;
        subOrDub: string;
        type: string;
        status: string;
        otherName: string;
        totalEpisodes: number;
    }>('GET', `/anime/zoro/info`, query, signal);
}

export async function zoroEpisode(episodeId: string, query?: { server?: "vidcloud" | "streamsb" | "vidstreaming" | "streamtape" | "vidcloud" }, signal?: AbortSignal) {
    return await request<ISource>('GET', `/anime/zoro/watch/${episodeId}`, query, signal);
}

export async function anilistMeta(anilistId: number, query: { provider: string }, signal?: AbortSignal) {
    return await request<IAnimeInfo>('GET', `/meta/anilist/info/${anilistId}`, query, signal);
}
