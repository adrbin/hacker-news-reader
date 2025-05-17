import { Typography, Link, useTheme, useMediaQuery } from '@mui/material';
import type { HNPost } from '../services/hnApi';

interface PostHeaderProps {
    post: HNPost;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <>
            <Typography
                variant={isMobile ? 'h5' : 'h4'}
                gutterBottom
                sx={{ fontSize: isMobile ? '1.5rem' : '2rem', lineHeight: 1.3 }}
            >
                {post.title}
            </Typography>
            {post.url && (
                <Link
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        display: 'block',
                        mb: 2,
                        wordBreak: 'break-all',
                        fontSize: isMobile ? '0.875rem' : '1rem'
                    }}
                >
                    {post.url}
                </Link>
            )}
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
                Posted by {post.author}
            </Typography>
        </>
    );
};
