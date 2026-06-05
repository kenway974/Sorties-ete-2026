"use client";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { ActivityFilters } from "@/types";

interface FilterPanelProps {
  filters: ActivityFilters;
  onChange: (f: ActivityFilters) => void;
}

const DATE_LABELS: Record<string, string> = {
  today: "Aujourd'hui",
  tomorrow: "Demain",
  this_week: "Cette semaine",
  this_weekend: "Ce week-end",
  this_month: "Ce mois",
};

const SORT_LABELS: Record<string, string> = {
  date: "Date",
  distance: "Distance",
  popularity: "Popularité",
  rating: "Note",
  price: "Prix",
};

const DATE_OPTIONS = ["today", "tomorrow", "this_week", "this_weekend", "this_month"] as const;
const SORT_OPTIONS = ["date", "distance", "popularity", "rating", "price"] as const;

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [filters.dateFilter, filters.priceFilter, filters.sortBy && filters.sortBy !== "date" ? filters.sortBy : null].filter(Boolean).length;
  const hasFilters = activeCount > 0;

  const reset = () => onChange({ ...filters, dateFilter: null, priceFilter: null, sortBy: "date" });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
          hasFilters
            ? "bg-brand-navy text-white border-brand-navy"
            : "bg-white border-gray-200 text-gray-600 hover:border-brand-navy"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {hasFilters && (
          <span className="bg-white/20 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filtres</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <div className="flex flex-wrap gap-2">
                  {DATE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => onChange({ ...filters, dateFilter: filters.dateFilter === opt ? null : opt })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filters.dateFilter === opt
                          ? "bg-brand-navy text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {DATE_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Prix</label>
                <div className="flex gap-2">
                  {(["free", "paid"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => onChange({ ...filters, priceFilter: filters.priceFilter === opt ? null : opt })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filters.priceFilter === opt
                          ? "bg-brand-navy text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {opt === "free" ? "Gratuit" : "Payant"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Trier par</label>
                <select
                  value={filters.sortBy || "date"}
                  onChange={(e) => onChange({ ...filters, sortBy: e.target.value as ActivityFilters["sortBy"] })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{SORT_LABELS[opt]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={reset} className="flex-1">Réinitialiser</Button>
              <Button size="sm" onClick={() => setOpen(false)} className="flex-1">Appliquer</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
