import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { HNPost, HNComment } from '../services/hnApi';
import { PostsContext } from './PostsContextType';
import { searchPosts, getComments } from '../services/hnApi';

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<HNPost[]>([]);
    const [comments, setComments] = useState<Record<string, HNComment[]>>({});
    const [shouldPreserveState, setShouldPreserveState] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPosts = useCallback(async (query: string, timeRange: string, page: number, reset: boolean = false) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await searchPosts(query, timeRange, page);
            setPosts(prev => reset ? response.hits : [...prev, ...response.hits]);

            // Only fetch comments for posts that don't already have them
            const newComments: Record<string, HNComment[]> = {};
            const postsToFetch = response.hits.filter(post => !(post.objectID in comments));
            await Promise.all(
                postsToFetch.map(async (post) => {
                    try {
                        const postComments = await getComments(post.objectID);
                        newComments[post.objectID] = postComments;
                    } catch (error) {
                        console.error(`Error fetching comments for post ${post.objectID}:`, error);
                        newComments[post.objectID] = [];
                    }
                })
            );
            if (Object.keys(newComments).length > 0) {
                setComments(prev => ({ ...prev, ...newComments }));
            }

            return { hasMore: page < response.nbPages - 1 };
        } catch (error) {
            console.error('Error fetching posts:', error);
            return { hasMore: false };
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, comments]);

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
                isLoading
            }}
        >
            {children}
        </PostsContext.Provider>
    );
};