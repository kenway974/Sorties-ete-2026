"use client";
import { useCallback } from "react";

const KEY = "ps_recently_viewed";
const MAX = 10;

export interface RecentlyViewedItem {
  id: string;
  title: string;
  curiosity: string;
  date: string;
  address: string;
  price: number | null;
  photoUrl?: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const getAll = useCallback((): RecentlyViewedItem[] => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }, []);

  const add = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    try {
      const current = JSON.parse(localStorage.getItem(KEY) || "[]") as RecentlyViewedItem[];
      const filtered = current.filter((i) => i.id !== item.id);
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
  }, []);

  return { getAll, add, clear };
}
