"use client";
import { useState, useEffect } from "react";

const KEY = "ps_search_history";
const MAX = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const add = (term: string) => {
    if (!term.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== term);
      const next = [term, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clear = () => {
    try { localStorage.removeItem(KEY); } catch {}
    setHistory([]);
  };

  return { history, add, clear };
}
