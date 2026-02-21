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
  const topTolerance = 2;

  const getScrollTop = () => {
    const docScrollTop = document.documentElement?.scrollTop ?? 0;
    const bodyScrollTop = document.body?.scrollTop ?? 0;
    return Math.max(window.scrollY, docScrollTop, bodyScrollTop);
  };

  const isAtTop = () => getScrollTop() <= topTolerance;

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
      if (!isAtTop() || eventData.dir !== 'Down') {
        setPullDistance(0);
        return;
      }
      setPullDistance(Math.max(0, eventData.deltaY));
    },
    onSwipedDown: (eventData) => {
      if (!enabled) return;
      if (!isAtTop()) return;
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
