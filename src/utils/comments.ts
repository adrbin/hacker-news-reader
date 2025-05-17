import type { HNComment } from "../services/hnApi";
export type SortOption = 'mostReplies' | 'oldest' | 'newest';

// Utility to count all descendants recursively
const countReplies = (comment: HNComment): number => {
    if (!comment.children || comment.children.length === 0) return 0;
    return comment.children.reduce((acc, child) => acc + 1 + countReplies(child), 0);
};

const sortComments = (comments: HNComment[], sortBy: SortOption): HNComment[] => {
    return [...comments].sort((a, b) => {
        if (sortBy === 'mostReplies') {
            // Sort by reply count descending
            const repliesA = countReplies(a);
            const repliesB = countReplies(b);
            if (repliesA !== repliesB) return repliesB - repliesA;
        }
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        // For oldest first, use ascending order
        // For newest first, use descending order
        const comparison = sortBy === 'oldest'
            ? dateA - dateB
            : dateB - dateA;
        if (comparison !== 0) return comparison;
        if (a.objectID && b.objectID) {
            return a.objectID.localeCompare(b.objectID);
        }
        return comparison;
    });
};

export { countReplies, sortComments };