import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const Header: React.FC = () => (
    <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
                Hacker News Reader
            </Typography>
        </Toolbar>
    </AppBar>
);

export default Header;
