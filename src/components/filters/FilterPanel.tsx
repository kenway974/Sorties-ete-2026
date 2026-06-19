"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { ActivityFilters } from "@/types";

const DATE_CHIPS = [
  { key: "today", label: "Aujourd'hui" },
  { key: "tomorrow", label: "Demain" },
  { key: "this_week", label: "Cette semaine" },
  { key: "this_weekend", label: "Week-end" },
  { key: "this_month", label: "Ce mois" },
] as const;

const TIME_SLOTS = [
  { key: "morning", emoji: "🌅", label: "Matin", from: "06:00", to: "12:00" },
  { key: "afternoon", emoji: "☀️", label: "Après-midi", from: "12:00", to: "18:00" },
  { key: "evening", emoji: "🌆", label: "Soir", from: "18:00", to: "22:00" },
  { key: "night", emoji: "🌙", label: "Nuit", from: "22:00", to: "23:59" },
] as const;

const VIBE_TAGS = [
  { key: "festif", emoji: "🎉", label: "Festif" },
  { key: "live-music", emoji: "🎵", label: "Live Music" },
  { key: "art", emoji: "🎨", label: "Art & Créatif" },
  { key: "gastronomie", emoji: "🍽️", label: "Gastro" },
  { key: "sport", emoji: "💪", label: "Sportif" },
  { key: "plein-air", emoji: "🌿", label: "Plein air" },
  { key: "culture", emoji: "🏛️", label: "Culture" },
  { key: "famille", emoji: "👨‍👩‍👧", label: "Famille" },
];

const SORT_OPTIONS = [
  { key: "date", emoji: "📅", label: "Date" },
  { key: "popularity", emoji: "🔥", label: "Popularité" },
  { key: "rating", emoji: "⭐", label: "Note" },
  { key: "price", emoji: "💰", label: "Prix" },
  { key: "distance", emoji: "📍", label: "Distance" },
] as const;

const EMPTY: Partial<ActivityFilters> = {
  dateFilter: null,
  priceFilter: null,
  sortBy: "date",
  dateFrom: null,
  dateTo: null,
  timeFrom: null,
  timeTo: null,
  tags: null,
};

interface FilterPanelProps {
  filters: ActivityFilters;
  onChange: (f: ActivityFilters) => void;
}

function Section({
  emoji,
  title,
  count,
  defaultOpen = false,
  children,
}: {
  emoji: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3 font-medium text-gray-900 dark:text-white">
          <span className="text-lg">{emoji}</span>
          <span>{title}</span>
          {count != null && count > 0 && (
            <span className="bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
        active
          ? "bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy shadow-sm"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<ActivityFilters>(filters);

  const activeTimeSlot =
    TIME_SLOTS.find((s) => s.from === local.timeFrom && s.to === local.timeTo)?.key ?? null;

  const countActive = (f: ActivityFilters) =>
    [
      f.dateFilter,
      f.priceFilter,
      f.sortBy && f.sortBy !== "date" ? f.sortBy : null,
      f.dateFrom || f.dateTo ? "range" : null,
      f.timeFrom || f.timeTo ? "time" : null,
      ...((f.tags ?? []) as string[]),
    ].filter(Boolean).length;

  const appliedCount = countActive(filters);
  const localCount = countActive(local);

  const dateCount = [
    local.dateFilter,
    local.dateFrom || local.dateTo ? "range" : null,
  ].filter(Boolean).length;
  const timeCount = local.timeFrom || local.timeTo ? 1 : 0;
  const priceCount = local.priceFilter ? 1 : 0;
  const tagsCount = (local.tags ?? []).length;
  const sortCount = local.sortBy && local.sortBy !== "date" ? 1 : 0;

  const openSheet = () => {
    setLocal(filters);
    setOpen(true);
  };

  const apply = () => {
    onChange(local);
    setOpen(false);
  };

  const clear = () => {
    const cleared = { ...filters, ...EMPTY };
    setLocal(cleared);
    onChange(cleared);
    setOpen(false);
  };

  const setTimeSlot = (key: string | null) => {
    if (!key) {
      setLocal((l) => ({ ...l, timeFrom: null, timeTo: null }));
      return;
    }
    const slot = TIME_SLOTS.find((s) => s.key === key);
    if (slot) setLocal((l) => ({ ...l, timeFrom: slot.from, timeTo: slot.to }));
  };

  const toggleTag = (tag: string) => {
    setLocal((l) => {
      const cur = l.tags ?? [];
      const next = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
      return { ...l, tags: next.length > 0 ? next : null };
    });
  };

  const inputCls =
    "flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 dark:focus:ring-brand-gold/30";

  return (
    <>
      {/* Trigger */}
      <button
        onClick={openSheet}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
          appliedCount > 0
            ? "bg-brand-navy text-white border-brand-navy shadow-md shadow-brand-navy/20 dark:bg-brand-gold dark:text-brand-navy dark:border-brand-gold"
            : "bg-white dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 text-gray-600 hover:border-brand-navy dark:hover:border-brand-gold"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {appliedCount > 0 && (
          <span className="bg-white/30 text-current text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
            {appliedCount}
          </span>
        )}
      </button>

      {/* Bottom sheet modal — rendered via portal to escape backdrop-filter stacking context */}
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end md:justify-center md:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full md:w-[500px] bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88dvh] animate-slide-up md:animate-scale-in">
            {/* Drag handle (mobile only) */}
            <div className="md:hidden pt-3 pb-0 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                Filtres
                {localCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    · {localCount} actif{localCount > 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Quand */}
              <Section emoji="📅" title="Quand" count={dateCount} defaultOpen>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DATE_CHIPS.map(({ key, label }) => (
                    <Chip
                      key={key}
                      active={local.dateFilter === key}
                      onClick={() =>
                        setLocal((l) => ({
                          ...l,
                          dateFilter: l.dateFilter === key ? null : key,
                          dateFrom: null,
                          dateTo: null,
                        }))
                      }
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="date"
                    value={local.dateFrom || ""}
                    onChange={(e) =>
                      setLocal((l) => ({
                        ...l,
                        dateFrom: e.target.value || null,
                        dateFilter: null,
                      }))
                    }
                    className={inputCls}
                    aria-label="Date de début"
                  />
                  <span className="text-gray-300 dark:text-gray-600 shrink-0">→</span>
                  <input
                    type="date"
                    value={local.dateTo || ""}
                    onChange={(e) =>
                      setLocal((l) => ({
                        ...l,
                        dateTo: e.target.value || null,
                        dateFilter: null,
                      }))
                    }
                    className={inputCls}
                    aria-label="Date de fin"
                  />
                </div>
              </Section>

              {/* Horaire */}
              <Section emoji="🕐" title="Horaire" count={timeCount}>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(({ key, emoji, label }) => (
                    <Chip
                      key={key}
                      active={activeTimeSlot === key}
                      onClick={() => setTimeSlot(activeTimeSlot === key ? null : key)}
                    >
                      {emoji} {label}
                    </Chip>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Filtre sur l&apos;heure de début de l&apos;activité.
                </p>
              </Section>

              {/* Prix */}
              <Section emoji="💰" title="Prix" count={priceCount}>
                <div className="flex gap-2">
                  <Chip
                    active={local.priceFilter === "free"}
                    onClick={() =>
                      setLocal((l) => ({
                        ...l,
                        priceFilter: l.priceFilter === "free" ? null : "free",
                      }))
                    }
                  >
                    🎟️ Gratuit
                  </Chip>
                  <Chip
                    active={local.priceFilter === "paid"}
                    onClick={() =>
                      setLocal((l) => ({
                        ...l,
                        priceFilter: l.priceFilter === "paid" ? null : "paid",
                      }))
                    }
                  >
                    💳 Payant
                  </Chip>
                </div>
              </Section>

              {/* Ambiance */}
              <Section emoji="✨" title="Ambiance" count={tagsCount}>
                <div className="flex flex-wrap gap-2">
                  {VIBE_TAGS.map(({ key, emoji, label }) => (
                    <Chip
                      key={key}
                      active={(local.tags ?? []).includes(key)}
                      onClick={() => toggleTag(key)}
                    >
                      {emoji} {label}
                    </Chip>
                  ))}
                </div>
              </Section>

              {/* Trier par */}
              <Section emoji="↕️" title="Trier par" count={sortCount}>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(({ key, emoji, label }) => (
                    <Chip
                      key={key}
                      active={(local.sortBy ?? "date") === key}
                      onClick={() =>
                        setLocal((l) => ({
                          ...l,
                          sortBy: key as ActivityFilters["sortBy"],
                        }))
                      }
                    >
                      {emoji} {label}
                    </Chip>
                  ))}
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-white dark:bg-gray-900 rounded-b-3xl md:rounded-b-2xl">
              <button
                onClick={clear}
                className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Effacer
              </button>
              <button
                onClick={apply}
                className="flex-1 py-3 rounded-2xl bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-brand-navy/20 dark:shadow-brand-gold/20 active:scale-[0.98]"
              >
                Appliquer{localCount > 0 ? ` (${localCount})` : ""}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
