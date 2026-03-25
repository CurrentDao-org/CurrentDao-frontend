import { useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export function useInfiniteScroll({
  loading,
  hasNextPage,
  onLoadMore,
  threshold = 1,
  root = null,
  rootMargin = '200px',
}: UseInfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: Element | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            onLoadMore();
          }
        },
        { root, rootMargin, threshold }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasNextPage, onLoadMore, root, rootMargin, threshold]
  );

  return { lastElementRef };
}