import type { HNPost } from '../services/hnApi';

export function getUniquePosts(posts: HNPost[]) {
    const seen = new Set();
    return posts.filter(post => {
        if (seen.has(post.objectID)) return false;
        seen.add(post.objectID);
        return true;
    });
}
