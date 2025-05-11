export function tryCatch<T>(fn: () => T) {
    try {
        const result = fn();

        return { result, error: null }
    } catch (e) {
        return { result: null, error: e as Error }
    }
}