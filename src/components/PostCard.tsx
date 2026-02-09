import React from 'react';
import { Card, CardContent, Typography, Box, Divider, Skeleton, useTheme, useMediaQuery } from '@mui/material';
import type { HNPost } from '../services/hnApi';
import { useNavigate } from 'react-router-dom';
import { SafeHtml } from './SafeHtml';
import { usePostsContext } from '../hooks/usePostsContext';
import { PostMeta } from './PostMeta';
import { PostHeader } from './PostHeader';
import { countReplies } from '../utils/comments';

interface PostCardProps {
  post: HNPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { comments, setShouldPreserveState } = usePostsContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = () => {
    sessionStorage.setItem('hnScrollY', String(window.scrollY)); // Save scroll position before navigating
    setShouldPreserveState(true);
    navigate(`/post/${post.objectID}`, {
      state: { post }
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const commentsForPost = comments[post.objectID];
  const isCommentsLoading = commentsForPost === undefined;
  const topComment = commentsForPost?.length > 0
    ? [...commentsForPost].sort((a, b) => countReplies(b) - countReplies(a))[0]
    : null;

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
        },
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <PostHeader post={post} />
        <PostMeta post={post} />
        {isCommentsLoading && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Skeleton variant="text" height={20} width="40%" />
              <Skeleton variant="text" height={18} width="90%" />
              <Skeleton variant="text" height={18} width="85%" />
            </Box>
          </>
        )}
        {topComment && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                Top comment by {topComment.author}:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  lineHeight: 1.4
                }}
              >
                <SafeHtml html={truncateText(topComment.text, 300)} />
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
