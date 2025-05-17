import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PostCard } from '../components/PostCard';
import { usePostsContext } from '../hooks/usePostsContext';
import { debounce } from '@mui/material/utils';
import { SearchAndFilterBar } from '../components/SearchAndFilterBar';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useRestoreScroll } from '../hooks/useRestoreScroll';
import { getUniquePosts } from '../utils/getUniquePosts';


export const HomePage: React.FC = () => {
  const {
    posts,
    shouldPreserveState,
    fetchPosts,
    isLoading,
    searchQuery,
    setSearchQuery,
    timeRange,
    setTimeRange,
    setShouldPreserveState
  } = usePostsContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Keep search params in refs to avoid dependency issues
  const searchParamsRef = useRef({ query: searchQuery, timeRange, page });

  const performFetch = useCallback(async (reset: boolean = false) => {
    if (!isLoading) {
      const currentPage = reset ? 0 : searchParamsRef.current.page;
      const result = await fetchPosts(
        searchParamsRef.current.query,
        searchParamsRef.current.timeRange,
        currentPage,
        reset
      );
      if (result) {
        setHasMore(result.hasMore);
        if (!reset) {
          setPage(prev => prev + 1);
          searchParamsRef.current.page = currentPage + 1;
        }
      }
    }
  }, [fetchPosts, isLoading]);

  const debouncedFetchRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedFetchRef.current = debounce(() => {
      setPage(0);
      searchParamsRef.current.page = 0;
      performFetch(true);
    }, 300);
    return () => {
      debouncedFetchRef.current?.clear();
    };
  }, [performFetch]);

  // Initial load: only fetch if not preserving state and posts are empty
  useEffect(() => {
    if (!shouldPreserveState && posts.length === 0) {
      performFetch(true);
    }
  }, []); // eslint-disable-line

  // Handle search/sort changes (always allow user to trigger fetch)
  useEffect(() => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      query: searchQuery,
      timeRange,
      page: 0
    };
    setPage(0);
    searchParamsRef.current.page = 0;
    debouncedFetchRef.current?.();
  }, [searchQuery, timeRange]);

  // Infinite scroll
  useInfiniteScroll({ hasMore, isLoading, performFetch });

  // Scroll restoration
  useRestoreScroll(posts, shouldPreserveState, setShouldPreserveState);

  // Filter out duplicate posts by objectID
  const uniquePosts = React.useMemo(() => getUniquePosts(posts), [posts]);

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 2 }}>
      <SearchAndFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        isMobile={isMobile}
      />
      {uniquePosts.map((post) => (
        <PostCard key={post.objectID} post={post} />
      ))}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};