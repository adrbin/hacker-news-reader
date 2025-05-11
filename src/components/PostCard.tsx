import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, useTheme, useMediaQuery } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import type { HNPost, HNComment } from '../services/hnApi';
import { useNavigate } from 'react-router-dom';
import { SafeHtml } from './SafeHtml';

interface PostCardProps {
  post: HNPost;
  comments: HNComment[];
  allPosts: HNPost[];
  allComments: Record<string, HNComment[]>;
}

export const PostCard: React.FC<PostCardProps> = ({ post, comments, allPosts, allComments }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = () => {
    navigate(`/post/${post.objectID}`, {
      state: { 
        post, 
        comments,
        allPosts,
        allComments,
        preserveState: true
      }
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const topComment = comments.length > 0
    ? [...comments].sort((a, b) => b.points - a.points)[0]
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
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          component="div" 
          gutterBottom
          sx={{ 
            fontSize: isMobile ? '1.1rem' : '1.25rem',
            lineHeight: 1.3
          }}
        >
          {post.title}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          mb: 1, 
          flexWrap: 'wrap',
          '& .MuiChip-root': {
            height: isMobile ? 24 : 32,
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }
        }}>
          <Chip 
            size="small" 
            label={`${post.points} points`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            size="small" 
            label={`${post.num_comments} comments`} 
            color="secondary" 
            variant="outlined"
          />
          <Chip 
            size="small" 
            label={formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} 
            variant="outlined"
          />
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom
          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
        >
          by {post.author}
        </Typography>
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