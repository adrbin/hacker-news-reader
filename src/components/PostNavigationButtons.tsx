import React from 'react';
import { IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface PostNavigationButtonsProps {
    hasPrevPost: boolean;
    hasNextPost: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export const PostNavigationButtons: React.FC<PostNavigationButtonsProps> = ({ hasPrevPost, hasNextPost, onPrev, onNext }) => (
    <>
        <IconButton
            onClick={onPrev}
            disabled={!hasPrevPost}
            sx={{
                position: 'fixed',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-disabled': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                zIndex: 1000,
                width: 48,
                height: 48,
                borderRadius: '0 24px 24px 0',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            }}
        >
            <ArrowBackIosNewIcon />
        </IconButton>
        <IconButton
            onClick={onNext}
            disabled={!hasNextPost}
            sx={{
                position: 'fixed',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-disabled': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                zIndex: 1000,
                width: 48,
                height: 48,
                borderRadius: '24px 0 0 24px',
                boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            }}
        >
            <ArrowForwardIosIcon />
        </IconButton>
    </>
);
