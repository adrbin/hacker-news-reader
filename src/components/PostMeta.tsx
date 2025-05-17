import { Chip, Box, useMediaQuery, useTheme } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import type { HNPost } from '../services/hnApi';

interface PostMetaProps {
    post: HNPost;
}

export const PostMeta: React.FC<PostMetaProps> = ({ post }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Box sx={{
            display: 'flex',
            gap: 0.5,
            mb: 2,
            flexWrap: 'wrap',
            '& .MuiChip-root': {
                height: isMobile ? 24 : 32,
                fontSize: isMobile ? '0.75rem' : '0.875rem'
            }
        }}>
            <Chip label={`${post.points} points`} color="primary" variant="outlined" />
            <Chip label={`${post.num_comments} comments`} color="secondary" variant="outlined" />
            <Chip label={formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} variant="outlined" />
        </Box>
    );
};
