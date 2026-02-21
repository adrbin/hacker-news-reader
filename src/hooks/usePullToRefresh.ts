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

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handlers = useSwipeable({
    onSwipedDown: (eventData) => {
      if (!enabled) return;
      if (window.scrollY !== 0) return;
      if (eventData.deltaY < threshold) return;
      if (isLoading || isRefreshing) return;
      void triggerRefresh();
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
    touchEventOptions: { passive: true },
  });

  return {
    handlers,
    isRefreshing,
  };
}
