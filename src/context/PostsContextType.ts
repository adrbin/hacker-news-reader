import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { HNPost, HNComment } from '../services/hnApi';

export interface FetchPostsResult {
    posts: HNPost[];
    hasMore: boolean;
}

export interface PostsContextType {
    posts: HNPost[];
    comments: Record<string, HNComment[]>;
    setPosts: Dispatch<SetStateAction<HNPost[]>>;
    setComments: Dispatch<SetStateAction<Record<string, HNComment[]>>>;
    shouldPreserveState: boolean;
    setShouldPreserveState: (value: boolean) => void;
    fetchPosts: (query: string, timeRange: string, page: number, reset?: boolean) => Promise<FetchPostsResult>;
    ensureComments: (postId: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    timeRange: string;
    setTimeRange: (range: string) => void;
}

export const PostsContext = createContext<PostsContextType | null>(null);
