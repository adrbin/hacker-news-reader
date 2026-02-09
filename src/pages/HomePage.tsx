import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Alert,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PostCard } from '../components/PostCard';
import { usePostsContext } from '../hooks/usePostsContext';
import { SearchAndFilterBar } from '../components/SearchAndFilterBar';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useRestoreScroll } from '../hooks/useRestoreScroll';
import { getUniquePosts } from '../utils/getUniquePosts';
import { useDebouncedFetch } from '../hooks/useDebouncedFetch';

export const HomePage: React.FC = () => {
  const {
    posts,
    setPosts,
    shouldPreserveState,
    fetchPosts,
    isLoading,
    error,
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
  const pendingResetRef = useRef(false);

  // Keep search params in refs to avoid dependency issues
  const searchParamsRef = useRef({ query: searchQuery, timeRange, page });

  const performFetch = useCallback(async (reset: boolean = false) => {
    if (isLoading) return;
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
  }, [fetchPosts, isLoading]);

  // Use the new debounced fetch hook
  useDebouncedFetch(
    () => {
      setPosts([]);
      setPage(0);
      searchParamsRef.current.page = 0;
      if (isLoading) {
        pendingResetRef.current = true;
        return;
      }
      performFetch(true);
    },
    [searchQuery, timeRange]
  );

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
    // debouncedFetchRef removed, handled by useDebouncedFetch
  }, [searchQuery, timeRange]);

  // If a filter/search change happens mid-request, retry once loading finishes.
  useEffect(() => {
    if (!isLoading && pendingResetRef.current) {
      pendingResetRef.current = false;
      performFetch(true);
    }
  }, [isLoading, performFetch]);

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
      <Collapse in={Boolean(error)}>
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Collapse>
      {isLoading && uniquePosts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {uniquePosts.map((post) => (
            <PostCard key={post.objectID} post={post} />
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
