import { useCallback, useEffect } from 'react';

interface UseInfiniteScrollProps {
    hasMore: boolean;
    isLoading: boolean;
    performFetch: () => void;
}

export function useInfiniteScroll({ hasMore, isLoading, performFetch }: UseInfiniteScrollProps) {
    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop
            >= document.documentElement.offsetHeight - 100
        ) {
            if (hasMore && !isLoading) {
                performFetch();
            }
        }
    }, [hasMore, isLoading, performFetch]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);
}
