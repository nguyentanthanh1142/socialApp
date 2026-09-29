import { useEffect, useRef } from "react";

export default function useInfiniteScroll({
  hasNextPage,
  isFetching,
  fetchNextPage,
  threshold = 1.0,
}) {
  const observerRef = useRef(null);
  const lastElementRef = useRef(null);

  useEffect(() => {
    if (isFetching) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold }
    );

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetching, fetchNextPage, threshold]);

  return { lastElementRef };
}