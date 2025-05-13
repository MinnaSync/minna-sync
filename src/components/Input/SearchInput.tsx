import { useState, useEffect, useRef, useCallback } from "react";

import { zoroSearch } from "#/util/api/consumet";
import { CloseIcon, SearchIcon } from "#/components/Icons/Icons";

import { Input } from "./Input";
import styles from "./SearchInput.module.scss";
import { SearchResult, SearchResultProps } from "./SearchResult";

export function SearchInput() {
    const ref = useRef<HTMLInputElement>(null);

    const [ results, setResults ] = useState<SearchResultProps[]>([]);
    const [ searchHasValue, setSearchHasValue ] = useState(false);

    const handleSearch = useCallback(async () => {
        if (ref.current?.value === undefined) return;
        
        const query = ref.current.value;
        if (query.length < 3) {
            setResults([]);
            return;
        };

        const info = await zoroSearch(ref.current.value);
        if (info.isErr()) return;

        // Sorts the results by type.
        // Most people are going to be wanting to watch TV first.
        const sortedResults: SearchResultProps[] = [];
        for (const type of ["TV", "OVA", "ONA", "Movie", "Special"]) {
            const results = info.value.results.filter((r) => r.type === type);
            if (results.length === 0) continue;

            sortedResults.push(...results.map((r) => ({
                title: r.title,
                image: r.image,
                type: r.type,
                nsfw: r.nsfw,
                episodes: {
                    subbed: r.sub,
                    dubbed: r.dub
                }
            })));
        }

        setResults(sortedResults);
    }, []);

    const handleClear = useCallback(() => {
        if (!ref.current) return;

        ref.current.value = "";
        setResults([]);
        setSearchHasValue(false);
    }, [results]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const input = ref.current;
        
        let timeout: number | null = null;

        input?.addEventListener('keyup', () => {
            if (timeout) {
                clearTimeout(timeout);
            }

            setSearchHasValue(input.value.length > 0);

            // @ts-ignore
            // Bun implements the standard, "number".
            timeout = setTimeout(handleSearch, 1_000);
        }, { signal });

        input?.addEventListener('keydown', () => {
            if (timeout) {
                clearTimeout(timeout);
            }

            setSearchHasValue(input.value.length > 0);
        }, { signal });
    }, []);

    return (<>
        <div className={styles.search_container}>
            <div className={styles.search_input}>
                <SearchIcon />
                <Input
                    ref={ref}
                    placeholder="Search Anime"
                />
                {searchHasValue && (
                    <div className={styles.clear_search} onClick={handleClear}>
                        <CloseIcon width={10} height={10} />
                    </div>
                )}
            </div>
            <div className={`${styles.search_content}${results.length > 0 ? ` ${styles.has_content}` : ''}`}>
                {results
                    .map((result) => (
                        <SearchResult
                            key={result.title}
                            {...result}
                        />
                    ))
                }
            </div>
        </div>
    </>)
}