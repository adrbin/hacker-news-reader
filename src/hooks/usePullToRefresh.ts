import { useCallback, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  isLoading: boolean;
  threshold?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  isLoading,
  threshold = 70,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh]);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (!enabled || isLoading || isRefreshing) {
        setPullDistance(0);
        return;
      }
      if (window.scrollY !== 0 || eventData.dir !== 'Down') {
        setPullDistance(0);
        return;
      }
      setPullDistance(Math.max(0, eventData.deltaY));
    },
    onSwipedDown: (eventData) => {
      if (!enabled) return;
      if (window.scrollY !== 0) return;
      if (eventData.deltaY < threshold) return;
      if (isLoading || isRefreshing) return;
      void triggerRefresh();
    },
    onSwiped: () => {
      if (!isRefreshing) {
        setPullDistance(0);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
    touchEventOptions: { passive: true },
  });

  return {
    handlers,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(1, pullDistance / threshold),
  };
}
