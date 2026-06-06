"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Moon, Sun, Calendar, Zap } from "lucide-react";

const FILTERS = [
  { label: "Ce soir", value: "today", icon: Moon, desc: "Activités ce soir" },
  { label: "Ce week-end", value: "this_weekend", icon: Sun, desc: "Sam & Dim" },
  { label: "Cette semaine", value: "this_week", icon: Calendar, desc: "7 prochains jours" },
  { label: "Ce mois", value: "this_month", icon: Zap, desc: "30 prochains jours" },
];

export default function QuickFilters() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {FILTERS.map(({ label, value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => router.push(`/${locale}/activities?date=${value}`)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm"
        >
          <Icon className="w-3.5 h-3.5 text-brand-gold" />
          {label}
        </button>
      ))}
    </div>
  );
}
