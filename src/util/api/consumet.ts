import { errAsync, okAsync } from "neverthrow";

const BASE_URL = 'http://127.0.0.1:3000/';

async function request<T>(
    method: string,
    path: string,
    query: Record<string, any> = {},
) {
    const url = new URL(path, BASE_URL);

    for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
    }

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        }
    });
    
    if (!res.ok) {
        return errAsync({
            status: res.status,
            message: res.statusText,
        });
    }

    return okAsync(await res.json() as T);
}

export function zoroSearch(searchQuery: string, query?: { path?: string; }) {
    return request<{
        totalPages: number;
        currentPage: number;
        hasNextPage: boolean;
        results: Array<{
            id: string;
            title: string;
            image: string;
            releaseDate: string | null;
            subOrDub: "sub" | "dub";
        }>;
    }>('GET', `/anime/zoro/${searchQuery}`, query);
}

export function zoroInfo(query: { id: string; }) {
    return request<{
        id: string;
        title: string;
        url: string;
        image: string;
        releaseDate: string;
        description: string;
        genres: string[];
        subOrDub: string;
        type: string;
        status: string;
        otherName: string;
        totalEpisodes: number;
        episodes: {
            id: string;
            number: number;
            url: string;
        }[]; 
    }>('GET', `/anime/zoro/info`, query);
}

export function zoroEpisode(episodeId: string, query?: { server?: "vidcloud" | "streamsb" | "vidstreaming" | "streamtape" | "vidcloud" }) {
    return request<{
        headers: {
            Referrer: string;
            watchsb: string | null;
            "User-Agent": string | null;
        };
        sources: Array<{
            url: string;
            quality: string;
            isM3U8: boolean;
        }>;
    }>('GET', `/anime/zoro/watch/${episodeId}`, query);
}