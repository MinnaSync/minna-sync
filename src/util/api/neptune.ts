import type { AnimeSearch, AnimeInfo, AnimeStreams } from "@minnasync/api-types";
import { errAsync, okAsync } from "neverthrow";

const BASE_URL = import.meta.env.VITE_NEPTUNE_URL;

async function request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    headers: Record<string, string>,
    query: Record<string, string>,
) {
    const reqUrl = new URL(endpoint, BASE_URL);

    for (const [key, value] of Object.entries(query)) {
        reqUrl.searchParams.set(key, value);
    }

    const req = await fetch(reqUrl, { method, headers });

    if (req.status !== 200) {
        return errAsync(new Error('Failed to request.'));
    }

    const json: T = await req.json();
    return okAsync(json);
}

async function search(searchQuery: string, query: { provider: "animepahe" }) {
    return await request<AnimeSearch>(
        'GET', `/anime/search/${searchQuery}`, {}, query
    );
}

async function info(query: { id: string, provider: "animepahe", resource: "anilist", page?: string }) {
    return await request<AnimeInfo>(
        'GET', `/anime/info`, {}, query
    );
}

async function animepaheStream(id: string) {
    return await request<AnimeStreams>(
        'GET', `/anime/streams/animepahe/${id}`, {}, {}
    );
}

export default {
    search,
    info,
    animepaheStream
}