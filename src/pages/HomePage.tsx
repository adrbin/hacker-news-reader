import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import {
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { PostCard } from '../components/PostCard';
import { usePostsContext } from '../hooks/usePostsContext';
import { debounce } from '@mui/material/utils';

const timeRanges = [
  { value: 'frontpage', label: 'Front Page' },
  { value: 'day', label: 'Past 24 Hours' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'year', label: 'Past Year' },
  { value: 'all', label: 'All Time' },
];

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
    if (!isLoading) { // Only block on isLoading
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
    // eslint-disable-next-line
  }, []);

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

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 100 // Use threshold for reliability
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

  // Ref to ensure scroll restoration only happens once
  const didRestoreScroll = useRef(false);

  useLayoutEffect(() => {
    if (posts.length > 0 && shouldPreserveState && !didRestoreScroll.current) {
      const savedScroll = sessionStorage.getItem('hnScrollY');
      if (savedScroll) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, parseInt(savedScroll, 10));
            // Only reset shouldPreserveState after scroll restoration
            setShouldPreserveState(false);
          });
        });
      } else {
        setShouldPreserveState(false);
      }
      didRestoreScroll.current = true;
    }
  }, [posts, shouldPreserveState, setShouldPreserveState]);

  // Filter out duplicate posts by objectID
  const uniquePosts = React.useMemo(() => {
    const seen = new Set();
    return posts.filter(post => {
      if (seen.has(post.objectID)) return false;
      seen.add(post.objectID);
      return true;
    });
  }, [posts]);

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 2 }}>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size={isMobile ? "small" : "medium"}
        />
        <FormControl sx={{ minWidth: isMobile ? '100%' : 200 }} size={isMobile ? "small" : "medium"}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRanges.map((range) => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {uniquePosts.map((post) => (
        <PostCard
          key={post.objectID}
          post={post}
        />
      ))}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};