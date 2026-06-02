"use client";
import { useTranslations } from "next-intl";
import type { ActivityCategory } from "@/types";

const CATEGORIES: { key: ActivityCategory | "all"; emoji: string }[] = [
  { key: "all", emoji: "🌆" },
  { key: "soirees", emoji: "🎉" },
  { key: "concerts", emoji: "🎵" },
  { key: "expositions", emoji: "🎨" },
  { key: "restaurants", emoji: "🍽️" },
  { key: "bars", emoji: "🍻" },
  { key: "sport", emoji: "⚽" },
  { key: "culture", emoji: "🏛️" },
  { key: "famille", emoji: "👨‍👩‍👧" },
  { key: "etudiants", emoji: "🎓" },
  { key: "networking", emoji: "🤝" },
  { key: "loisirs", emoji: "🎮" },
];

interface CategoryFilterProps {
  selected: ActivityCategory | null;
  onChange: (cat: ActivityCategory | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const t = useTranslations("categories");

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map(({ key, emoji }) => (
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
          <span>{t(key)}</span>
        </button>
      ))}
    </div>
  );
}
