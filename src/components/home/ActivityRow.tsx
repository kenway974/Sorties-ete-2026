import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ActivityCard from "@/components/activities/ActivityCard";
import type { Activity } from "@/types";

interface ActivityRowProps {
  title: string;
  emoji: string;
  activities: Activity[];
  viewAllHref: string;
  locale: string;
}

export default function ActivityRow({ title, emoji, activities, viewAllHref, locale }: ActivityRowProps) {
  if (activities.length === 0) return null;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between px-4 mb-5 max-w-5xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{emoji}</span>
            {title}
          </h2>
        </div>
        <Link
          href={`/${locale}${viewAllHref}`}
          className="flex items-center gap-1 text-sm font-semibold text-brand-navy dark:text-brand-gold hover:gap-2 transition-all shrink-0"
        >
          Tout voir <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 pb-2 snap-x snap-mandatory">
        {activities.map((a) => (
          <div key={a.id} className="min-w-[260px] max-w-[260px] snap-start">
            <ActivityCard activity={a} />
          </div>
        ))}
        <Link
          href={`/${locale}${viewAllHref}`}
          className="min-w-[120px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-brand-navy dark:hover:border-brand-gold hover:text-brand-navy dark:hover:text-brand-gold transition-colors snap-start"
        >
          <ArrowRight className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Voir tout</span>
        </Link>
      </div>
    </section>
  );
}
