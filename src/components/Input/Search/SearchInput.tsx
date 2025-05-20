import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "react-query";

import { CloseIcon, SearchIcon } from "#/components/Icons/Icons";

import { Input } from "../Input";
import styles from "./SearchInput.module.scss";
import { SearchResult, SearchResultProps } from "./SearchResult";
import neptune from "#/util/api/neptune";
import { Typography } from "#/components/Typography/Typography";

export function SearchInput() {
    const inputRef = useRef<HTMLInputElement>(null);

    const [ results, setResults ] = useState<Omit<SearchResultProps, "displayPage" | "handleOpen" | "handleClose">[]>([]);
    const [ searchHasValue, setSearchHasValue ] = useState(false);
    const [ searchValue, setSearchValue ] = useState("");
    const [ isFocused, setIsFocused ] = useState(false);

    const [ provider, _ ] = useState<"animepahe">("animepahe");
    const [ resource, __ ] = useState<"anilist">("anilist");

    const [ openInfoId, setOpenInfoId ] = useState<string | null>(null); 

    const { data: search } = useQuery(["search", searchValue], () => {
        return neptune.search(searchValue, { provider: provider });
    }, { enabled: searchValue.length >= 3, staleTime: Infinity });

    const handleSearch = useCallback(async () => {
        if (inputRef.current?.value === undefined) return;
        
        const query = inputRef.current.value;
        if (query.length < 3) {
            if (results.length !== 0) {
                setResults([]);
            }

            return;
        };

        setSearchValue(query);
    }, []);

    const handleClear = useCallback(() => {
        if (!inputRef.current) return;

        inputRef.current.value = "";
        setResults([]);
        setSearchHasValue(false);
        setSearchValue("");
    }, [results]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const input = inputRef.current;
        
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

        input?.addEventListener('focus', () => {
            setIsFocused(true);
        }, { signal });

        input?.addEventListener('blur', () => {
            setIsFocused(false);
        }, { signal });
    }, []);

    useEffect(() => {
        if (!search || search.isErr()) return;

        // Sorts the results by type.
        // Most people are going to be wanting to watch TV first.
        const sortedResults: Omit<SearchResultProps, "displayPage" | "handleOpen" | "handleClose">[] = [];
        for (const type of ["TV", "OVA", "ONA", "Movie", "Special"]) {
            const results = search.value.results.filter((r) => r.type === type);
            if (results.length === 0) continue;

            sortedResults.push(...
                results.map(({ id, title, poster, type}) => ({
                    id, provider, resource,
                    title: title,
                    image: `http://localhost:8443/proxied/${poster}`,
                    type: type,
                }))
            );
        }

        setResults(sortedResults);
    }, [search]);

    return (<>
        <div className={styles.search_container}>
            <div className={styles.search_input_container}>
                <div className={styles.search_input}>
                    <SearchIcon />
                    <Input
                        ref={inputRef}
                        placeholder="Search Anime"
                    />
                    {searchHasValue && (
                        <div className={styles.clear_search} onClick={handleClear}>
                            <CloseIcon width={10} height={10} />
                        </div>
                    )}
                </div>
                <div className={styles.search_provider}>
                    <Typography variant='heading' size="xs" weight="medium">
                        {provider}
                    </Typography>
                </div>
            </div>
            <div className={`${styles.search_content}${results.length > 0 ? ` ${styles.has_content}` : ''}${isFocused ? ` ${styles.focused}` : ''}`}>
                {results
                    .map((result) => (
                        <SearchResult
                            key={result.title}
                            {...result}
                            displayPage={openInfoId === result.id}
                            handleClose={() => {
                                setOpenInfoId(null)
                            }}
                            handleOpen={() => {
                                setOpenInfoId(result.id)
                            }}
                        />
                    ))
                }
            </div>
        </div>
    </>)
}