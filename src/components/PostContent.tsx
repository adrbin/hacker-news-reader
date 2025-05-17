import React from 'react';
import { Box, Paper } from '@mui/material';
import { PostHeader } from './PostHeader';
import { PostMeta } from './PostMeta';
import { CommentSortSelect } from './CommentSortSelect';
import { CommentTree } from './CommentTree';
import { sortComments } from '../utils/comments';
import type { HNPost, HNComment } from '../services/hnApi';
import type { SortOption } from '../utils/comments';

interface PostContentProps {
    post: HNPost;
    isMobile: boolean;
    sortBy: SortOption;
    setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
    currentComments: HNComment[];
}

export const PostContent: React.FC<PostContentProps> = ({ post, isMobile, sortBy, setSortBy, currentComments }) => (
    <Box key={`post-content-${post.objectID}`}>
        <Paper key={`post-paper-${post.objectID}`} sx={{ p: isMobile ? 2 : 3, mb: 4 }}>
            <PostHeader post={post} />
            <PostMeta post={post} />
        </Paper>
        <Box sx={{ mb: 3 }}>
            <CommentSortSelect sortBy={sortBy} setSortBy={setSortBy} isMobile={isMobile} />
        </Box>
        <Box>
            {sortComments(currentComments, sortBy).map((comment, index) => (
                <CommentTree
                    key={`${post.objectID}-comment-${comment.objectID || index}`}
                    comment={comment}
                />
            ))}
        </Box>
    </Box>
);