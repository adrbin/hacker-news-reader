import React from 'react';
import {
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

const timeRanges = [
    { value: 'frontpage', label: 'Front Page' },
    { value: 'day', label: 'Past 24 Hours' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'year', label: 'Past Year' },
    { value: 'all', label: 'All Time' },
];

export interface SearchAndFilterBarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    timeRange: string;
    setTimeRange: (t: string) => void;
    isMobile: boolean;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
    searchQuery,
    setSearchQuery,
    timeRange,
    setTimeRange,
    isMobile
}) => (
    <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mb: 4 }}>
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
);
