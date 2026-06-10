"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const PULL_THRESHOLD = 80;
const INDICATOR_SIZE = 40;

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export function usePullToRefresh({ onRefresh, scrollContainerRef }: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = scrollContainerRef.current;
    if (!el || el.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
    pullingRef.current = true;
  }, [scrollContainerRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pullingRef.current || refreshing) return;
    const el = scrollContainerRef.current;
    if (!el || el.scrollTop > 0) {
      pullingRef.current = false;
      setPullDistance(0);
      return;
    }
    const delta = Math.max(0, e.touches[0].clientY - startYRef.current);
    // Elastic resistance: diminishing returns after threshold
    const resistance = delta < PULL_THRESHOLD ? delta : PULL_THRESHOLD + (delta - PULL_THRESHOLD) * 0.25;
    setPullDistance(Math.min(resistance, PULL_THRESHOLD + 20));
    if (delta > 10) e.preventDefault();
  }, [refreshing, scrollContainerRef]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(INDICATOR_SIZE);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, refreshing, onRefresh]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [scrollContainerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, refreshing, isPulling: pullDistance > 0 };
}
