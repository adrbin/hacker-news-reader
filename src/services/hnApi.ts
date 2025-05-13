import axios from 'axios';

const ALGOLIA_API = 'https://hn.algolia.com/api/v1';

export interface HNPost {
  objectID: string;
  title: string;
  url: string;
  points: number;
  author: string;
  created_at: string;
  num_comments: number;
  text?: string;
  _highlightResult?: {
    title: {
      value: string;
    };
  };
}

export interface HNComment {
  objectID: string;
  author: string;
  text: string;
  created_at: string;
  points: number;
  children: HNComment[];
}

export const searchPosts = async (
  query: string = '',
  timeRange: string = 'frontpage', // Set 'frontpage' as default
  page: number = 0
): Promise<{ hits: HNPost[]; nbPages: number }> => {
  if (timeRange === 'frontpage') {
    const response = await axios.get(`${ALGOLIA_API}/search`, {
      params: {
        query,
        tags: 'front_page',
        page,
        hitsPerPage: 20,
      },
    });
    return response.data;
  }
  const timeFilter = getTimeFilter(timeRange);
  const response = await axios.get(`${ALGOLIA_API}/search`, {
    params: {
      query,
      tags: 'story',
      numericFilters: timeFilter,
      page,
      hitsPerPage: 20,
    },
  });
  return response.data;
};

export const getPost = async (id: string): Promise<HNPost> => {
  const response = await axios.get(`${ALGOLIA_API}/items/${id}`);
  return response.data;
};

export const getComments = async (id: string): Promise<HNComment[]> => {
  const response = await axios.get(`${ALGOLIA_API}/items/${id}`);
  return response.data.children || [];
};

// Utility to count all descendants recursively
export const countReplies = (comment: HNComment): number => {
  if (!comment.children || comment.children.length === 0) return 0;
  return comment.children.reduce((acc, child) => acc + 1 + countReplies(child), 0);
};

const getTimeFilter = (timeRange: string): string => {
  // 'frontpage' handled in searchPosts, so skip here
  const now = Math.floor(Date.now() / 1000);
  const day = 24 * 60 * 60;

  switch (timeRange) {
    case 'day':
      return `created_at_i>${now - day}`;
    case 'week':
      return `created_at_i>${now - 7 * day}`;
    case 'month':
      return `created_at_i>${now - 30 * day}`;
    case 'year':
      return `created_at_i>${now - 365 * day}`;
    default:
      return '';
  }
};