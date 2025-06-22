import React, { useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery, Slide, Container, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePostsContext } from '../hooks/usePostsContext';
import type { SortOption } from '../utils/comments';
import type { HNPost, HNComment } from '../services/hnApi';
import { PostNavigationButtons } from '../components/PostNavigationButtons';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { NotFound } from '../components/NotFound';
import { PostContent } from '../components/PostContent';
import { usePostData } from '../hooks/usePostData';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const currentComments = comments[id || ''] as HNComment[] || [];

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

  // Use custom hook for post data
  const { post, loading } = usePostData(id, location.state);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      setSlideDirection(null);
    };
  }, [id]);

  // Use custom hook for swipe navigation
  const swipeHandlers = useSwipeNavigation({
    navigateToPost
  }) || {};

  // Overlay event handler to prevent Safari edge swipe navigation
  const preventSafariEdgeSwipe = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (loading) return <LoadingIndicator />;
  if (!post) return <NotFound />;

  return (
    <Container
      maxWidth="md"
      sx={{
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        position: 'relative',
        overflowX: 'hidden',
        touchAction: 'pan-y',
      }}
      {...swipeHandlers}
    >
      {/* Edge overlays for mobile Safari to block browser swipe navigation */}
      {isMobile && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '16px',
              height: '100vh',
              zIndex: 2000,
              touchAction: 'none',
              background: 'transparent',
            }}
            onTouchStart={preventSafariEdgeSwipe}
            onTouchMove={preventSafariEdgeSwipe}
            onTouchEnd={preventSafariEdgeSwipe}
          />
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '16px',
              height: '100vh',
              zIndex: 2000,
              touchAction: 'none',
              background: 'transparent',
            }}
            onTouchStart={preventSafariEdgeSwipe}
            onTouchMove={preventSafariEdgeSwipe}
            onTouchEnd={preventSafariEdgeSwipe}
          />
        </>
      )}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleNavigateHome}
        sx={{ mb: 2 }}
        size={isMobile ? "small" : "medium"}
      >
        Back to Home
      </Button>
      {!isMobile && (
        <PostNavigationButtons
          hasPrevPost={hasPrevPost}
          hasNextPost={hasNextPost}
          onPrev={() => navigateToPost('prev')}
          onNext={() => navigateToPost('next')}
        />
      )}
      <Slide direction={slideDirection || 'left'} in={true} mountOnEnter unmountOnExit>
        <div>
          <PostContent
            post={post}
            isMobile={isMobile}
            sortBy={sortBy}
            setSortBy={setSortBy}
            currentComments={currentComments}
          />
        </div>
      </Slide>
    </Container>
  );
};