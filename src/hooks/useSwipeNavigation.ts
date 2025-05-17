import { useSwipeable } from 'react-swipeable';

export function useSwipeNavigation({
    navigateToPost
}: { navigateToPost: (dir: 'next' | 'prev') => void }) {
    return useSwipeable({
        onSwipedLeft: (e) => {
            if (e.initial[0] > window.innerWidth * 0.8) {
                if (e.event?.cancelable) e.event.preventDefault();
                navigateToPost('next');
            }
        },
        onSwipedRight: (e) => {
            if (e.initial[0] < window.innerWidth * 0.2) {
                if (e.event?.cancelable) e.event.preventDefault();
                navigateToPost('prev');
            }
        },
        trackMouse: true,
        preventScrollOnSwipe: true,
        touchEventOptions: { passive: false },
    });
}