import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { HNPost, HNComment } from '../services/hnApi';
import { PostsContext } from './PostsContextType';
import { searchPosts, getComments } from '../services/hnApi';

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<HNPost[]>([]);
    const [comments, setComments] = useState<Record<string, HNComment[]>>({});
    const [shouldPreserveState, setShouldPreserveState] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [timeRange, setTimeRange] = useState('frontpage');
    const latestPostRequestRef = useRef(0);
    const commentsRef = useRef(comments);
    const pendingCommentsRef = useRef(new Set<string>());

    useEffect(() => {
        commentsRef.current = comments;
    }, [comments]);

    const ensureComments = useCallback(async (postId: string) => {
        if (!postId || postId in commentsRef.current || pendingCommentsRef.current.has(postId)) {
            return;
        }

        pendingCommentsRef.current.add(postId);
        try {
            const postComments = await getComments(postId);
            setComments(prev => postId in prev ? prev : { ...prev, [postId]: postComments });
        } catch (error) {
            console.error(`Error fetching comments for post ${postId}:`, error);
            setComments(prev => postId in prev ? prev : { ...prev, [postId]: [] });
        } finally {
            pendingCommentsRef.current.delete(postId);
        }
    }, []);

    const fetchPosts = useCallback(async (query: string, timeRange: string, page: number, reset: boolean = false) => {
        const requestId = reset ? latestPostRequestRef.current + 1 : latestPostRequestRef.current;
        if (reset) {
            latestPostRequestRef.current = requestId;
            setPosts([]);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await searchPosts(query, timeRange, page);

            if (requestId === latestPostRequestRef.current) {
                setPosts(prev => reset ? response.hits : [...prev, ...response.hits]);
                response.hits.forEach(post => {
                    void ensureComments(post.objectID);
                });
            }

            return { posts: response.hits, hasMore: page < response.nbPages - 1 };
        } catch (error) {
            console.error('Error fetching posts:', error);
            if (requestId === latestPostRequestRef.current) {
                setError('Failed to load posts. Please try again.');
            }
            return { posts: [], hasMore: false };
        } finally {
            if (requestId === latestPostRequestRef.current) {
                setIsLoading(false);
            }
        }
    }, [ensureComments]);

    return (
        <PostsContext.Provider
            value={{
                posts,
                setPosts,
                comments,
                setComments,
                shouldPreserveState,
                setShouldPreserveState,
                fetchPosts,
                ensureComments,
                isLoading,
                error,
                searchQuery,
                setSearchQuery,
                timeRange,
                setTimeRange
            }}
        >
            {children}
        </PostsContext.Provider>
    );
};
