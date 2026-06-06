"use client";
import { useState, useCallback, useEffect } from "react";
import type { Activity } from "@/types";

const KEY = "ps_itinerary";

export interface ItineraryItem {
  id: string;
  title: string;
  date: string;
  time: string;
  address: string;
  price: number | null;
  category: string;
}

export function useItinerary() {
  const [items, setItems] = useState<ItineraryItem[]>([]);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  const save = (next: ItineraryItem[]) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const add = useCallback((activity: Pick<Activity, "id" | "title" | "date" | "time" | "address" | "price" | "category">) => {
    const item: ItineraryItem = {
      id: activity.id, title: activity.title, date: activity.date,
      time: activity.time, address: activity.address, price: activity.price,
      category: activity.category,
    };
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      const next = [...prev, item].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => save([]), []);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  return { items, add, remove, clear, has };
}
