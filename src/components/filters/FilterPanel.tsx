"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { CURIOSITES } from "@/lib/constants/curiosites";
import { RARITY_FLOOR, rarityBand } from "@/lib/constants/rarity";
import type { ActivityFilters, CuriosityKey } from "@/types";

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

// Contexte, pas genre : ces étiquettes viennent de l'inférence des imports et
// répondent à « dans quelles conditions », pas à « quel type de sortie ».
const CONTEXTE_TAGS = [
  { key: "plein-air", emoji: "🌿", label: "En plein air" },
  { key: "famille", emoji: "👨‍👩‍👧", label: "Avec des enfants" },
  { key: "gastronomie", emoji: "🍽️", label: "Ça se mange" },
  { key: "live-music", emoji: "🎵", label: "Musique live" },
  { key: "art", emoji: "🎨", label: "Arts visuels" },
  { key: "sport", emoji: "💪", label: "Physique" },
];

const SORT_OPTIONS = [
  { key: "rarity", emoji: "🔮", label: "Insolite" },
  { key: "date", emoji: "📅", label: "Date" },
  { key: "popularity", emoji: "🔥", label: "Fréquentation" },
  { key: "price", emoji: "💰", label: "Prix" },
  { key: "distance", emoji: "📍", label: "Distance" },
] as const;

const EMPTY: Partial<ActivityFilters> = {
  dateFilter: null,
  priceFilter: null,
  sortBy: "rarity",
  dateFrom: null,
  dateTo: null,
  timeFrom: null,
  timeTo: null,
  tags: null,
  curiosity: null,
  minRarity: RARITY_FLOOR,
};

interface FilterPanelProps {
  filters: ActivityFilters;
  onChange: (f: ActivityFilters) => void;
}

function Section({
  emoji, title, count, defaultOpen = false, children,
}: {
  emoji: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink/8 dark:border-parchment/10 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3 font-medium text-ink dark:text-parchment">
          <span className="text-lg">{emoji}</span>
          <span>{title}</span>
          {count != null && count > 0 && (
            <span className="bg-gold text-ink text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-ink/40 dark:text-parchment/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function Chip({
  active, onClick, children, hex,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hex?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={
        active && hex
          ? { backgroundColor: hex, borderColor: hex, color: "#fff" }
          : hex
            ? { borderColor: `${hex}55`, color: hex }
            : undefined
      }
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all active:scale-95 ${
        hex
          ? ""
          : active
            ? "bg-ink text-parchment border-ink dark:bg-parchment dark:text-ink dark:border-parchment shadow-sm"
            : "bg-transparent border-ink/15 dark:border-parchment/20 text-ink/60 dark:text-parchment/60 hover:border-ink/40 dark:hover:border-parchment/40"
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

  // Le seuil par défaut n'est pas un filtre « posé » par l'utilisateur : il ne
  // compte que s'il a été remonté au-dessus du plancher du catalogue.
  const countActive = (f: ActivityFilters) =>
    [
      f.dateFilter,
      f.priceFilter,
      f.curiosity,
      f.sortBy && f.sortBy !== "rarity" ? f.sortBy : null,
      f.dateFrom || f.dateTo ? "range" : null,
      f.timeFrom || f.timeTo ? "time" : null,
      (f.minRarity ?? RARITY_FLOOR) > RARITY_FLOOR ? "rarity" : null,
      ...((f.tags ?? []) as string[]),
    ].filter(Boolean).length;

  const appliedCount = countActive(filters);
  const localCount = countActive(local);

  const seuil = local.minRarity ?? RARITY_FLOOR;
  const band = rarityBand(seuil);

  const dateCount = [local.dateFilter, local.dateFrom || local.dateTo ? "range" : null].filter(Boolean).length;
  const timeCount = local.timeFrom || local.timeTo ? 1 : 0;
  const priceCount = local.priceFilter ? 1 : 0;
  const tagsCount = (local.tags ?? []).length;
  const sortCount = local.sortBy && local.sortBy !== "rarity" ? 1 : 0;

  const openSheet = () => { setLocal(filters); setOpen(true); };
  const apply = () => { onChange(local); setOpen(false); };
  const clear = () => {
    const cleared = { ...filters, ...EMPTY };
    setLocal(cleared);
    onChange(cleared);
    setOpen(false);
  };

  const setTimeSlot = (key: string | null) => {
    if (!key) { setLocal((l) => ({ ...l, timeFrom: null, timeTo: null })); return; }
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
    "flex-1 px-3 py-2 rounded-xl border border-ink/12 dark:border-parchment/15 bg-parchment-dim dark:bg-ink-soft text-sm text-ink dark:text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <>
      <button
        onClick={openSheet}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
          appliedCount > 0
            ? "bg-gold text-ink border-gold shadow-md shadow-gold/20"
            : "bg-parchment dark:bg-ink-soft text-ink/70 dark:text-parchment/70 border-ink/12 dark:border-parchment/15 hover:border-gold"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {appliedCount > 0 && (
          <span className="bg-ink/20 text-current text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
            {appliedCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end md:justify-center md:items-center">
          <div
            className="absolute inset-0 bg-ink-deep/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full md:w-[500px] bg-parchment dark:bg-ink rounded-t-3xl md:rounded-3xl shadow-vitrine flex flex-col max-h-[92dvh] md:max-h-[88dvh] animate-slide-up md:animate-scale-in">
            <div className="md:hidden pt-3 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-ink/15 dark:bg-parchment/20 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-ink/8 dark:border-parchment/10 shrink-0">
              <h2 className="font-display text-xl text-ink dark:text-parchment">
                Affiner
                {localCount > 0 && (
                  <span className="ml-2 text-sm font-sans font-normal text-ink/40 dark:text-parchment/40">
                    · {localCount} actif{localCount > 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-ink/40 dark:text-parchment/40 hover:bg-ink/5 dark:hover:bg-parchment/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Le réglage principal, en tête et ouvert par défaut. */}
              <Section
                emoji="🔮"
                title="Indice d'insolite"
                count={seuil > RARITY_FLOOR ? 1 : 0}
                defaultOpen
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-ink/50 dark:text-parchment/50">
                    À partir de
                  </span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: band?.hex }}>
                    {seuil}/10 · {band?.label}
                  </span>
                </div>
                <input
                  type="range"
                  min={RARITY_FLOOR}
                  max={10}
                  step={1}
                  value={seuil}
                  onChange={(e) => setLocal((l) => ({ ...l, minRarity: Number(e.target.value) }))}
                  aria-label="Indice d'insolite minimum"
                  className="w-full accent-gold"
                  style={{ accentColor: band?.hex }}
                />
                <p className="text-xs text-ink/40 dark:text-parchment/40 mt-2 leading-snug">
                  {band?.desc}. Rien en dessous de {RARITY_FLOOR} n&apos;entre au catalogue.
                </p>
              </Section>

              <Section emoji="🎭" title="Curiosité" count={local.curiosity ? 1 : 0}>
                <div className="flex flex-wrap gap-2">
                  {CURIOSITES.map(({ key, emoji, label, hex }) => (
                    <Chip
                      key={key}
                      hex={hex}
                      active={local.curiosity === key}
                      onClick={() =>
                        setLocal((l) => ({
                          ...l,
                          curiosity: l.curiosity === key ? null : (key as CuriosityKey),
                        }))
                      }
                    >
                      {emoji} {label}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section emoji="📅" title="Quand" count={dateCount}>
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
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={local.dateFrom || ""}
                    onChange={(e) =>
                      setLocal((l) => ({ ...l, dateFrom: e.target.value || null, dateFilter: null }))
                    }
                    className={inputCls}
                    aria-label="Date de début"
                  />
                  <span className="text-ink/25 dark:text-parchment/25 shrink-0">→</span>
                  <input
                    type="date"
                    value={local.dateTo || ""}
                    onChange={(e) =>
                      setLocal((l) => ({ ...l, dateTo: e.target.value || null, dateFilter: null }))
                    }
                    className={inputCls}
                    aria-label="Date de fin"
                  />
                </div>
              </Section>

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
              </Section>

              <Section emoji="💰" title="Prix" count={priceCount}>
                <div className="flex gap-2">
                  <Chip
                    active={local.priceFilter === "free"}
                    onClick={() =>
                      setLocal((l) => ({ ...l, priceFilter: l.priceFilter === "free" ? null : "free" }))
                    }
                  >
                    🎟️ Gratuit
                  </Chip>
                  <Chip
                    active={local.priceFilter === "paid"}
                    onClick={() =>
                      setLocal((l) => ({ ...l, priceFilter: l.priceFilter === "paid" ? null : "paid" }))
                    }
                  >
                    💳 Payant
                  </Chip>
                </div>
              </Section>

              <Section emoji="🧭" title="Contexte" count={tagsCount}>
                <div className="flex flex-wrap gap-2">
                  {CONTEXTE_TAGS.map(({ key, emoji, label }) => (
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

              <Section emoji="↕️" title="Trier par" count={sortCount}>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(({ key, emoji, label }) => (
                    <Chip
                      key={key}
                      active={(local.sortBy ?? "rarity") === key}
                      onClick={() =>
                        setLocal((l) => ({ ...l, sortBy: key as ActivityFilters["sortBy"] }))
                      }
                    >
                      {emoji} {label}
                    </Chip>
                  ))}
                </div>
              </Section>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-ink/8 dark:border-parchment/10 flex gap-3 bg-parchment dark:bg-ink rounded-b-3xl">
              <button
                onClick={clear}
                className="px-5 py-3 rounded-2xl border border-ink/12 dark:border-parchment/15 text-sm font-medium text-ink/60 dark:text-parchment/60 hover:bg-ink/5 dark:hover:bg-parchment/10 transition-colors"
              >
                Effacer
              </button>
              <button
                onClick={apply}
                className="flex-1 py-3 rounded-2xl bg-gold text-ink text-sm font-bold hover:bg-gold-light transition-colors shadow-glow-gold active:scale-[0.98]"
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
