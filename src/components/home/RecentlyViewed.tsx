"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, X } from "lucide-react";
import { useRecentlyViewed, type RecentlyViewedItem } from "@/lib/hooks/useRecentlyViewed";
import { formatDate, formatPrice } from "@/lib/utils/formatters";

export default function RecentlyViewed() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const { getAll, clear } = useRecentlyViewed();
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getAll().slice(0, 6));
  }, [getAll]);

  if (items.length === 0) return null;

  return (
    <section className="bg-white dark:bg-gray-900/50 py-12 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vu récemment</h2>
          </div>
          <button
            onClick={() => { clear(); setItems([]); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Effacer
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/activities/${item.id}`}
              className="group flex flex-col gap-2 p-3 rounded-2xl bg-brand-cream dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
            >
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors leading-tight">
                {item.title}
              </div>
              <div className="text-xs text-gray-400 truncate">{formatDate(item.date, "fr")}</div>
              <div className="text-xs font-semibold text-brand-navy dark:text-brand-gold">
                {formatPrice(item.price, "Gratuit")}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
