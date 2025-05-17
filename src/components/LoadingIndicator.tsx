import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const LoadingIndicator: React.FC = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
    </Box>
);