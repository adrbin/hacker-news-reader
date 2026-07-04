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

type RawHNPost = Partial<HNPost> & {
  id?: string | number;
  story_title?: string;
  story_url?: string;
  children?: RawHNComment[];
};

type RawHNComment = Partial<HNComment> & {
  id?: string | number;
  children?: RawHNComment[];
};

const fallbackDate = new Date(0).toISOString();

const toNumber = (value: unknown): number => (
  typeof value === 'number' && Number.isFinite(value) ? value : 0
);

const normalizeId = (value: unknown): string => (
  value === undefined || value === null ? '' : String(value)
);

const normalizePost = (post: RawHNPost): HNPost => ({
  objectID: normalizeId(post.objectID ?? post.id),
  title: post.title || post.story_title || 'Untitled',
  url: post.url || post.story_url || '',
  points: toNumber(post.points),
  author: post.author || 'unknown',
  created_at: post.created_at || fallbackDate,
  num_comments: toNumber(post.num_comments ?? post.children?.length),
  text: post.text,
  _highlightResult: post._highlightResult,
});

const normalizeComment = (comment: RawHNComment): HNComment => ({
  objectID: normalizeId(comment.objectID ?? comment.id),
  author: comment.author || 'unknown',
  text: comment.text || '',
  created_at: comment.created_at || fallbackDate,
  points: toNumber(comment.points),
  children: (comment.children || []).map(normalizeComment),
});

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
    return {
      hits: (response.data.hits || []).map(normalizePost),
      nbPages: toNumber(response.data.nbPages),
    };
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
  return {
    hits: (response.data.hits || []).map(normalizePost),
    nbPages: toNumber(response.data.nbPages),
  };
};

export const getPost = async (id: string): Promise<HNPost> => {
  const response = await axios.get(`${ALGOLIA_API}/items/${id}`);
  return normalizePost(response.data);
};

export const getComments = async (id: string): Promise<HNComment[]> => {
  const response = await axios.get(`${ALGOLIA_API}/items/${id}`);
  return (response.data.children || []).map(normalizeComment);
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
