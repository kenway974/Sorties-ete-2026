"use client";
import { CURIOSITES } from "@/lib/constants/curiosites";
import type { CuriosityKey } from "@/types";

interface CuriosityFilterProps {
  selected: CuriosityKey | null;
  onChange: (key: CuriosityKey | null) => void;
}

export default function CuriosityFilter({ selected, onChange }: CuriosityFilterProps) {
  return (
    <div className="relative">
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="group"
        aria-label="Filtrer par curiosité"
      >
        <button
          onClick={() => onChange(null)}
          aria-pressed={!selected}
          className={`px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
            !selected
              ? "bg-ink text-parchment dark:bg-parchment dark:text-ink shadow-md"
              : "border border-ink/15 dark:border-parchment/20 text-ink/60 dark:text-parchment/60 hover:border-ink/40 dark:hover:border-parchment/40"
          }`}
        >
          Tout
        </button>

        {CURIOSITES.map(({ key, emoji, label, hex }) => {
          const active = key === selected;
          return (
            <button
              key={key}
              onClick={() => onChange(active ? null : key)}
              aria-pressed={active}
              style={
                active
                  ? { backgroundColor: hex, borderColor: hex, boxShadow: `0 4px 18px ${hex}55` }
                  : { borderColor: `${hex}55`, color: hex }
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 active:scale-95 ${
                active ? "text-white" : "hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-parchment dark:from-ink to-transparent" />
    </div>
  );
}
