import { useRef, useEffect } from 'react';
import { debounce } from '@mui/material/utils';

/**
 * useDebouncedFetch
 *
 * Provides a debounced version of a fetch function. Calls the fetch function after a delay when dependencies change.
 *
 * @param fetchFn The fetch function to call (should be stable, e.g., from useCallback)
 * @param deps Dependency array to trigger the debounced fetch
 * @param delay Debounce delay in ms (default: 300)
 */
export function useDebouncedFetch(fetchFn: () => void, deps: ReadonlyArray<unknown>, delay = 300) {
    const debouncedFetchRef = useRef<ReturnType<typeof debounce> | null>(null);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => {
            fetchFn();
        }, delay);
        return () => {
            debouncedFetchRef.current?.clear();
        };
    }, [fetchFn, delay]);

    useEffect(() => {
        debouncedFetchRef.current?.();
    }, deps);
}
