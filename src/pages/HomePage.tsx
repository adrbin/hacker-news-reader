import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Alert,
  Collapse,
  Card,
  CardContent,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PostCard } from '../components/PostCard';
import { usePostsContext } from '../hooks/usePostsContext';
import { SearchAndFilterBar } from '../components/SearchAndFilterBar';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useRestoreScroll } from '../hooks/useRestoreScroll';
import { getUniquePosts } from '../utils/getUniquePosts';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

export const HomePage: React.FC = () => {
  const {
    posts,
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
  const shouldSkipInitialFetchRef = useRef(shouldPreserveState && posts.length > 0);
  const loadSequenceRef = useRef(0);
  const [page, setPage] = useState(() => shouldPreserveState ? Math.ceil(posts.length / 20) : 0);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const loadFirstPage = useCallback(async () => {
    const loadSequence = loadSequenceRef.current + 1;
    loadSequenceRef.current = loadSequence;
    setPage(0);
    setHasMore(true);
    const result = await fetchPosts(debouncedSearchQuery, timeRange, 0, true);
    if (loadSequence !== loadSequenceRef.current) {
      return;
    }
    setHasMore(result.hasMore);
    setPage(1);
  }, [debouncedSearchQuery, fetchPosts, timeRange]);

  const performFetch = useCallback(async (reset: boolean = false) => {
    if (reset) {
      await loadFirstPage();
      return;
    }
    if (isLoading || !hasMore) {
      return;
    }

    const currentPage = page;
    const loadSequence = loadSequenceRef.current;
    const result = await fetchPosts(debouncedSearchQuery, timeRange, currentPage, false);
    if (loadSequence !== loadSequenceRef.current) {
      return;
    }
    setHasMore(result.hasMore);
    setPage(currentPage + 1);
  }, [debouncedSearchQuery, fetchPosts, hasMore, isLoading, loadFirstPage, page, timeRange]);

  useEffect(() => {
    if (shouldSkipInitialFetchRef.current) {
      shouldSkipInitialFetchRef.current = false;
      return;
    }

    void loadFirstPage();
  }, [loadFirstPage]);

  // Infinite scroll
  useInfiniteScroll({ hasMore, isLoading, performFetch });

  // Scroll restoration
  useRestoreScroll(posts, shouldPreserveState, setShouldPreserveState);

  const {
    handlers: pullToRefreshHandlers,
    isRefreshing: isPullRefreshing,
    pullDistance,
    pullProgress,
  } = usePullToRefresh({
    onRefresh: async () => {
      await performFetch(true);
    },
    isLoading,
  });

  // Filter out duplicate posts by objectID
  const uniquePosts = React.useMemo(() => getUniquePosts(posts), [posts]);

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 2 }} {...pullToRefreshHandlers}>
      <Box
        sx={{
          height: isPullRefreshing || pullDistance > 0 ? 40 : 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'height 120ms ease',
          overflow: 'hidden',
        }}
      >
        <CircularProgress
          size={24}
          variant={isPullRefreshing ? 'indeterminate' : 'determinate'}
          value={pullProgress * 100}
        />
      </Box>
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
        <Box>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`skeleton-${index}`} sx={{ mb: 2 }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Skeleton variant="text" height={32} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={20} width="40%" />
                <Skeleton variant="rectangular" height={64} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}
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
