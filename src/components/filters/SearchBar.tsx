"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import { useSearchHistory } from "@/lib/hooks/useSearchHistory";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);
  const { history, add, clear } = useSearchHistory();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) {
        onChange(local);
        if (local.trim().length >= 2) add(local.trim());
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [local]);

  const showHistory = focused && local === "" && history.length > 0;

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Rechercher une activité, un lieu..."
        className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy shadow-sm"
      />
      {local && (
        <button
          onClick={() => { setLocal(""); onChange(""); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {showHistory && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50">
            <span className="text-xs text-gray-500 font-medium">Recherches récentes</span>
            <button onClick={clear} className="text-xs text-brand-navy hover:underline">Effacer</button>
          </div>
          {history.map((h) => (
            <button
              key={h}
              onClick={() => { setLocal(h); onChange(h); setFocused(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-700"
            >
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
