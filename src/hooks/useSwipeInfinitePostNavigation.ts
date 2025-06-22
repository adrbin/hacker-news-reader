import { useState, useCallback, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostsContext } from './usePostsContext';
import { useSwipeNavigation } from './useSwipeNavigation';
import type { HNPost } from '../services/hnApi';

export function useSwipeInfinitePostNavigation(currentPostId: string | undefined) {
  const navigate = useNavigate();
  const {
    posts,
    fetchPosts,
    searchQuery,
    timeRange,
  } = usePostsContext();

  const [page, setPage] = useState(Math.ceil(posts.length / 20) || 0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchLock = useRef(false);

  // Keep search params in ref for consistency
  const searchParamsRef = useRef({ query: searchQuery, timeRange, page });

  // Update local page if posts change (e.g., after fetch)
  useLayoutEffect(() => {
    setPage(Math.ceil(posts.length / 20) || 0);
  }, [posts.length]);

  // Update search params ref if searchQuery/timeRange changes
  useLayoutEffect(() => {
    searchParamsRef.current = { query: searchQuery, timeRange, page };
  }, [searchQuery, timeRange, page]);

  const currentPostIndex = posts.findIndex((p: HNPost) => p.objectID === currentPostId);
  const hasNextPost = currentPostIndex < posts.length - 1;
  const hasPrevPost = currentPostIndex > 0;

  const navigateToPost = useCallback(async (direction: 'next' | 'prev') => {
    if (direction === 'next' && hasNextPost) {
      const nextPost = posts[currentPostIndex + 1];
      navigate(`/post/${nextPost.objectID}`, {
        state: { post: nextPost }
      });
    } else if (direction === 'prev' && hasPrevPost) {
      const prevPost = posts[currentPostIndex - 1];
      navigate(`/post/${prevPost.objectID}`, {
        state: { post: prevPost }
      });
    } else if (direction === 'next' && !hasNextPost && hasMore && !loadingMore && !fetchLock.current) {
      setLoadingMore(true);
      fetchLock.current = true;
      const nextPage = page;
      const result = await fetchPosts(
        searchParamsRef.current.query,
        searchParamsRef.current.timeRange,
        nextPage,
        false
      );
      setLoadingMore(false);
      fetchLock.current = false;
      if (result) {
        setHasMore(result.hasMore);
        setPage(nextPage + 1);
        // If new posts loaded, try navigating again
        setTimeout(() => {
          const newIndex = posts.findIndex((p: HNPost) => p.objectID === currentPostId) + 1;
          if (posts[newIndex]) {
            navigate(`/post/${posts[newIndex].objectID}`, {
              state: { post: posts[newIndex] }
            });
          }
        }, 100);
      }
    }
  }, [hasNextPost, hasPrevPost, posts, currentPostIndex, navigate, hasMore, loadingMore, fetchPosts, page, currentPostId]);

  const swipeHandlers = useSwipeNavigation({ navigateToPost });

  return { swipeHandlers, loadingMore, navigateToPost };
} 