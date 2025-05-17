import { useRef, useLayoutEffect } from 'react';
import type { HNPost } from '../services/hnApi';

export function useRestoreScroll(posts: HNPost[], shouldPreserveState: boolean, setShouldPreserveState: (v: boolean) => void) {
    const didRestoreScroll = useRef(false);
    useLayoutEffect(() => {
        if (posts.length > 0 && shouldPreserveState && !didRestoreScroll.current) {
            const savedScroll = sessionStorage.getItem('hnScrollY');
            if (savedScroll) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        window.scrollTo(0, parseInt(savedScroll, 10));
                        setShouldPreserveState(false);
                    });
                });
            } else {
                setShouldPreserveState(false);
            }
            didRestoreScroll.current = true;
        }
    }, [posts, shouldPreserveState, setShouldPreserveState]);
}
