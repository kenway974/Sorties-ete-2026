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
      {CATEGORIES.map(({ key, emoji, label }) => (
        <button
          key={key}
          onClick={() => onChange(key === "all" ? null : (key as ActivityCategory))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            (key === "all" && !selected) || key === selected
              ? "bg-brand-navy text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
          }`}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
