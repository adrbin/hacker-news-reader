import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse,
  Paper,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import type { HNComment } from '../services/hnApi';
import { SafeHtml } from './SafeHtml';

interface CommentTreeProps {
  comment: HNComment;
  level?: number;
}

export const CommentTree: React.FC<CommentTreeProps> = ({ comment, level = 0 }) => {
  const [expanded, setExpanded] = useState(level === 0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 1, 
        ml: isMobile ? level : level * 2,
        p: isMobile ? 1 : 1.5,
        backgroundColor: level === 0 ? 'background.paper' : 'background.default'
      }}
    >
      <Box key={`comment-header-${comment.objectID}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
        {comment.children && comment.children.length > 0 && (
          <IconButton 
            key={`expand-button-${comment.objectID}`}
            size={isMobile ? "small" : "medium"} 
            onClick={toggleExpand}
            sx={{ p: isMobile ? 0.5 : 1 }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
        <Box key={`comment-content-${comment.objectID}`} sx={{ flex: 1 }}>
          <Box key={`comment-meta-${comment.objectID}`} sx={{ 
            display: 'flex', 
            gap: 0.5, 
            mb: 1, 
            flexWrap: 'wrap',
            '& .MuiChip-root': {
              height: isMobile ? 20 : 24,
              fontSize: isMobile ? '0.7rem' : '0.75rem'
            }
          }}>
            <Typography 
              key={`author-${comment.objectID}`}
              variant="subtitle2" 
              component="span"
              sx={{ 
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: 600
              }}
            >
              {comment.author}
            </Typography>
            <Chip 
              key={`time-${comment.objectID}`}
              size="small" 
              label={formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })} 
              variant="outlined"
            />
            {comment.points > 0 && (
              <Chip 
                key={`points-${comment.objectID}`}
                size="small" 
                label={`${comment.points} points`} 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
          <Typography 
            key={`comment-text-${comment.objectID}`}
            variant="body2" 
            component="div" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: isMobile ? '0.875rem' : '1rem',
              lineHeight: 1.4
            }}
          >
            <SafeHtml html={comment.text} />
          </Typography>
        </Box>
      </Box>
      <Collapse key={`collapse-${comment.objectID}`} in={expanded}>
        <Box key={`children-${comment.objectID}`} sx={{ mt: 1 }}>
          {comment.children?.map((child, index) => (
            <CommentTree 
              key={`${comment.objectID}-child-${child.objectID || index}`} 
              comment={child} 
              level={level + 1} 
            />
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}; 