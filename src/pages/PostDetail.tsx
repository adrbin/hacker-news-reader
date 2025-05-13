import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import {
  Container,
  Typography,
  Box,
  Paper,
  Link,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
  Slide,
  IconButton,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { getPost } from '../services/hnApi';
import { CommentTree } from '../components/CommentTree';
import type { HNPost, HNComment } from '../services/hnApi';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePostsContext } from '../hooks/usePostsContext';

type SortOption = 'mostReplies' | 'oldest' | 'newest';

// Utility to count all descendants recursively
const countReplies = (comment: HNComment): number => {
  if (!comment.children || comment.children.length === 0) return 0;
  return comment.children.reduce((acc, child) => acc + 1 + countReplies(child), 0);
};

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [post, setPost] = useState<HNPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('mostReplies');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const {
    posts,
    comments,
    setShouldPreserveState
  } = usePostsContext();

  const currentPostIndex = useMemo(() =>
    posts.findIndex((p: HNPost) => p.objectID === id),
    [posts, id]
  );

  const hasNextPost = currentPostIndex < posts.length - 1;
  const hasPrevPost = currentPostIndex > 0;
  const currentComments = comments[id || ''] || [];

  const navigateToPost = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && hasNextPost) {
      const nextPost = posts[currentPostIndex + 1];
      setSlideDirection('left');
      navigate(`/post/${nextPost.objectID}`, {
        state: { post: nextPost }
      });
    } else if (direction === 'prev' && hasPrevPost) {
      const prevPost = posts[currentPostIndex - 1];
      setSlideDirection('right');
      navigate(`/post/${prevPost.objectID}`, {
        state: { post: prevPost }
      });
    }
  }, [hasNextPost, hasPrevPost, posts, currentPostIndex, navigate]);

  const handleNavigateHome = useCallback(() => {
    setShouldPreserveState(true);
    navigate('/');
  }, [navigate, setShouldPreserveState]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Check if we have data from navigation state
      const state = location.state as { post: HNPost } | null;
      if (state?.post) {
        setPost(state.post);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const postData = await getPost(id);
        setPost(postData);
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      setSlideDirection(null);
    };
  }, [id, location.state]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      // Only trigger if swipe started from the right edge
      if (e.initial[0] > window.innerWidth * 0.8) {
        if (e.event?.cancelable) e.event.preventDefault(); // Prevent horizontal scroll
        navigateToPost('next');
      }
    },
    onSwipedRight: (e) => {
      // Only trigger if swipe started from the left edge
      if (e.initial[0] < window.innerWidth * 0.2) {
        if (e.event?.cancelable) e.event.preventDefault(); // Prevent horizontal scroll
        navigateToPost('prev');
      }
    },
    trackMouse: true, // Enable mouse swiping on all devices
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false }, // Fix: allow preventDefault
  });

  const sortComments = (comments: HNComment[]): HNComment[] => {
    return [...comments].sort((a, b) => {
      if (sortBy === 'mostReplies') {
        // Sort by reply count descending
        const repliesA = countReplies(a);
        const repliesB = countReplies(b);
        if (repliesA !== repliesB) return repliesB - repliesA;
      }
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      // For oldest first, use ascending order
      // For newest first, use descending order
      const comparison = sortBy === 'oldest'
        ? dateA - dateB
        : dateB - dateA;
      if (comparison !== 0) return comparison;
      if (a.objectID && b.objectID) {
        return a.objectID.localeCompare(b.objectID);
      }
      return comparison;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5">Post not found</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        position: 'relative',
        overflowX: 'hidden', // Prevent horizontal scroll
        touchAction: 'pan-y', // Prevent horizontal pan
      }}
      {...swipeHandlers} // Always attach swipe handlers
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleNavigateHome}
        sx={{ mb: 2 }}
        size={isMobile ? "small" : "medium"}
      >
        Back to Home
      </Button>

      {!isMobile && (
        <>
          <IconButton
            onClick={() => navigateToPost('prev')}
            disabled={!hasPrevPost}
            sx={{
              position: 'fixed',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              zIndex: 1000,
              width: 48,
              height: 48,
              borderRadius: '0 24px 24px 0',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton
            onClick={() => navigateToPost('next')}
            disabled={!hasNextPost}
            sx={{
              position: 'fixed',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              zIndex: 1000,
              width: 48,
              height: 48,
              borderRadius: '24px 0 0 24px',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}

      <Slide direction={slideDirection || 'left'} in={true} mountOnEnter unmountOnExit>
        <Box key={`post-content-${post.objectID}`}>
          <Paper key={`post-paper-${post.objectID}`} sx={{ p: isMobile ? 2 : 3, mb: 4 }}>
            <Typography
              key={`post-title-${post.objectID}`}
              variant={isMobile ? "h5" : "h4"}
              gutterBottom
              sx={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                lineHeight: 1.3
              }}
            >
              {post.title}
            </Typography>

            <Box key={`post-meta-${post.objectID}`} sx={{
              display: 'flex',
              gap: 0.5,
              mb: 2,
              flexWrap: 'wrap',
              '& .MuiChip-root': {
                height: isMobile ? 24 : 32,
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }
            }}>
              <Chip
                label={`${post.points} points`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${post.num_comments} comments`}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                variant="outlined"
              />
            </Box>

            {post.url && (
              <Link
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'block',
                  mb: 2,
                  wordBreak: 'break-all',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                {post.url}
              </Link>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              Posted by {post.author}
            </Typography>
          </Paper>

          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: isMobile ? '100%' : 200 }} size={isMobile ? "small" : "medium"}>
              <InputLabel>Sort Comments</InputLabel>
              <Select
                value={sortBy}
                label="Sort Comments"
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <MenuItem value="mostReplies">Most Replies</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            {sortComments(currentComments).map((comment, index) => (
              <CommentTree
                key={`${post.objectID}-comment-${comment.objectID || index}`}
                comment={comment}
              />
            ))}
          </Box>
        </Box>
      </Slide>
    </Container>
  );
};