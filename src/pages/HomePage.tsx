import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
import { searchPosts, getComments } from '../services/hnApi';
import type { HNPost, HNComment } from '../services/hnApi';

const timeRanges = [
  { value: 'day', label: 'Past 24 Hours' },
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'year', label: 'Past Year' },
];

interface LocationState {
  allPosts: HNPost[];
  allComments: Record<string, HNComment[]>;
  preserveState: boolean;
}

export const HomePage: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [posts, setPosts] = useState<HNPost[]>([]);
  const [comments, setComments] = useState<Record<string, HNComment[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('day');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Handle state from navigation
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.preserveState && state?.allPosts && state?.allComments) {
      setPosts(state.allPosts);
      setComments(state.allComments);
      setPage(Math.floor(state.allPosts.length / 20)); // Assuming 20 posts per page
      setHasMore(state.allPosts.length % 20 === 0); // If we have a full page, there might be more
    }
  }, [location.state]);

  const fetchComments = useCallback(async (postIds: string[]) => {
    const newComments: Record<string, HNComment[]> = {};
    await Promise.all(
      postIds.map(async (id) => {
        try {
          const postComments = await getComments(id);
          newComments[id] = postComments;
        } catch (error) {
          console.error(`Error fetching comments for post ${id}:`, error);
          newComments[id] = [];
        }
      })
    );
    setComments(prev => ({ ...prev, ...newComments }));
  }, []);

  const fetchPosts = useCallback(async (reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const response = await searchPosts(searchQuery, timeRange, currentPage);
      
      const newPosts = reset ? response.hits : [...posts, ...response.hits];
      setPosts(newPosts);
      setHasMore(currentPage < response.nbPages - 1);
      
      // Fetch comments for new posts
      const newPostIds = response.hits.map(post => post.objectID);
      await fetchComments(newPostIds);
      
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, timeRange, page, loading, posts, fetchComments]);

  // Initial data loading
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.preserveState && state?.allPosts && state?.allComments) {
      setPosts(state.allPosts);
      setComments(state.allComments);
      setPage(Math.floor(state.allPosts.length / 20));
      setHasMore(state.allPosts.length % 20 === 0);
    } else {
      setPage(0);
      fetchPosts(true);
    }
  }, [searchQuery, timeRange]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      if (hasMore && !loading) {
        fetchPosts();
      }
    }
  }, [hasMore, loading, fetchPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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

      {posts.map((post) => (
        <PostCard 
          key={post.objectID} 
          post={post} 
          comments={comments[post.objectID] || []}
          allPosts={posts}
          allComments={comments}
        />
      ))}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}; 