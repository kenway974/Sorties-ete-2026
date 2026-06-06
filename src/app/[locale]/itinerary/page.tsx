"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Calendar, Clock, Trash2, Share2, Check, Route, Plus } from "lucide-react";
import { useItinerary } from "@/lib/hooks/useItinerary";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";

const CATEGORY_COLORS: Record<string, string> = {
  soirees: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  concerts: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  expositions: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  restaurants: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  bars: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  sport: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  culture: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  famille: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  etudiants: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  networking: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  loisirs: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

export default function ItineraryPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const { items, remove, clear } = useItinerary();
  const [copied, setCopied] = useState(false);

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.date] = acc[item.date] || []).push(item);
    return acc;
  }, {});

  const share = async () => {
    const text = items.map((i) => `- ${i.title} — ${formatDate(i.date, "fr")} a ${formatTime(i.time)}`).join("\n");
    if (navigator.share) {
      await navigator.share({ title: "Mon itineraire Paris", text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalBudget = items.reduce((s, i) => s + (i.price ?? 0), 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Route className="w-5 h-5 text-brand-navy dark:text-brand-gold" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mon itineraire</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {items.length} activite{items.length !== 1 ? "s" : ""} planifiee{items.length !== 1 ? "s" : ""}
            {totalBudget > 0 && ` - Budget estime : ${totalBudget.toFixed(2).replace(".", ",")} euros`}
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={share}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-brand-navy hover:text-brand-navy transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              Partager
            </button>
            <button
              onClick={clear}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-brand-red hover:text-brand-red transition-colors"
              title="Vider l'itineraire"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Route className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2 dark:text-gray-300">Ton itineraire est vide</p>
          <p className="text-sm mb-6">Ajoute des activites depuis leur page de detail.</p>
          <Link
            href={`/${locale}/activities`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-navy text-white font-semibold hover:bg-brand-navy-dark hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Explorer les activites
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, dayItems]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-brand-navy text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100">{formatDate(date, "fr")}</h2>
              </div>
              <div className="space-y-3 ml-4 pl-6 border-l-2 border-gray-100 dark:border-gray-800">
                {dayItems.map((item) => (
                  <div key={item.id} className="relative bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 shadow-card">
                    <div className="absolute -left-[1.9rem] top-4 w-3 h-3 rounded-full border-2 border-brand-navy dark:border-brand-gold bg-white dark:bg-gray-900" />
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-brand-navy dark:text-brand-gold">
                            {formatPrice(item.price, "Gratuit")}
                          </span>
                        </div>
                        <Link href={`/${locale}/activities/${item.id}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-navy dark:hover:text-brand-gold transition-colors text-sm">
                          {item.title}
                        </Link>
                        <div className="mt-1.5 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{formatTime(item.time)}</div>
                          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /><span className="truncate">{item.address}</span></div>
                        </div>
                      </div>
                      <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}