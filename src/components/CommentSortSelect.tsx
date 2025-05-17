import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React from 'react';
import type { SortOption } from '../utils/comments';

interface CommentSortSelectProps {
    sortBy: SortOption;
    setSortBy: (value: SortOption) => void;
    isMobile: boolean;
}

export const CommentSortSelect: React.FC<CommentSortSelectProps> = ({ sortBy, setSortBy, isMobile }) => (
    <FormControl sx={{ minWidth: isMobile ? '100%' : 200 }} size={isMobile ? 'small' : 'medium'}>
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
);
