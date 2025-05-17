import { useEffect, useState } from 'react';
import { getPost } from '../services/hnApi';
import type { HNPost } from '../services/hnApi';

export function usePostData(id: string | undefined, locationState: { post?: HNPost } | null) {
    const [post, setPost] = useState<HNPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            if (locationState?.post) {
                setPost(locationState.post);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const postData = await getPost(id);
                setPost(postData);
            } catch {
                // error is intentionally ignored
                setPost(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, locationState]);

    return { post, loading };
}