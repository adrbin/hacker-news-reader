import { createContext } from 'react';
import type { HNPost, HNComment } from '../services/hnApi';

export interface PostsContextType {
    posts: HNPost[];
    comments: Record<string, HNComment[]>;
    setPosts: (posts: HNPost[]) => void;
    setComments: (comments: Record<string, HNComment[]>) => void;
    shouldPreserveState: boolean;
    setShouldPreserveState: (value: boolean) => void;
    fetchPosts: (query: string, timeRange: string, page: number, reset?: boolean) => Promise<{ hasMore: boolean } | undefined>;
    isLoading: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    timeRange: string;
    setTimeRange: (range: string) => void;
}

export const PostsContext = createContext<PostsContextType | null>(null);