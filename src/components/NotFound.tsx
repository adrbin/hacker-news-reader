import React from 'react';
import { Container, Typography } from '@mui/material';

export const NotFound: React.FC = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5">Post not found</Typography>
    </Container>
);