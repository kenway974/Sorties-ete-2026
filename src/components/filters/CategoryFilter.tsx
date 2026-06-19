"use client";
import type { ActivityCategory } from "@/types";

const CATEGORIES: { key: ActivityCategory | "all"; emoji: string; label: string }[] = [
  { key: "all", emoji: "🌆", label: "Tout" },
  { key: "soirees", emoji: "🎉", label: "Soirées" },
  { key: "concerts", emoji: "🎵", label: "Concerts" },
  { key: "expositions", emoji: "🎨", label: "Expositions" },
  { key: "restaurants", emoji: "🍽️", label: "Restaurants" },
  { key: "bars", emoji: "🍻", label: "Bars" },
  { key: "sport", emoji: "⚽", label: "Sport" },
  { key: "culture", emoji: "🏛️", label: "Culture" },
  { key: "famille", emoji: "👨‍👩‍👧", label: "Famille" },
  { key: "etudiants", emoji: "🎓", label: "Étudiants" },
  { key: "networking", emoji: "🤝", label: "Networking" },
  { key: "loisirs", emoji: "🎮", label: "Loisirs" },
  { key: "salons", emoji: "🎪", label: "Salons & Conventions" },
];

interface CategoryFilterProps {
  selected: ActivityCategory | null;
  onChange: (cat: ActivityCategory | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="relative">
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="group"
        aria-label="Filtrer par catégorie"
      >
        {CATEGORIES.map(({ key, emoji, label }) => {
          const active = (key === "all" && !selected) || key === selected;
          return (
            <button
              key={key}
              onClick={() => onChange(key === "all" ? null : (key as ActivityCategory))}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                active
                  ? "bg-brand-navy text-white shadow-md shadow-brand-navy/20 dark:bg-brand-gold dark:text-brand-navy dark:shadow-brand-gold/20"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-gold dark:hover:text-brand-gold"
              }`}
            >
              <span className={active ? "" : "opacity-90"}>{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      {/* Fade hint on the right edge (light + dark) */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
    </div>
  );
}
