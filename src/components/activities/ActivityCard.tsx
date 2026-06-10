"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Heart, MapPin, Users, Calendar, Star, Flame } from "lucide-react";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import type { Activity } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  soirees: "Soirées", concerts: "Concerts", expositions: "Expositions",
  restaurants: "Restaurants", bars: "Bars", sport: "Sport", culture: "Culture",
  famille: "Famille", etudiants: "Étudiants", networking: "Networking", loisirs: "Loisirs",
};

const CATEGORY_COLORS: Record<string, string> = {
  soirees: "from-purple-600 to-pink-600",
  concerts: "from-rose-500 to-red-600",
  expositions: "from-amber-500 to-orange-500",
  restaurants: "from-orange-500 to-red-500",
  bars: "from-yellow-500 to-amber-600",
  sport: "from-emerald-500 to-teal-600",
  culture: "from-blue-500 to-indigo-600",
  famille: "from-cyan-500 to-blue-500",
  etudiants: "from-violet-500 to-purple-600",
  networking: "from-sky-500 to-blue-600",
  loisirs: "from-teal-500 to-green-500",
};

const CATEGORY_BG: Record<string, string> = {
  soirees: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  concerts: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  expositions: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  restaurants: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  bars: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  sport: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  culture: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  famille: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  etudiants: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  networking: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  loisirs: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

interface ActivityCardProps {
  activity: Activity;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  compact?: boolean;
}

export default function ActivityCard({ activity, isFavorite, onFavoriteToggle, compact }: ActivityCardProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [imgError, setImgError] = useState(false);
  const [favPulse, setFavPulse] = useState(false);

  const photoUrl = activity.photos?.[0]?.url;
  const hasPhoto = !compact && !!photoUrl && !imgError;
  const spotsLeft = activity.max_participants !== null
    ? activity.max_participants - activity.current_participants
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isPopular = activity.current_participants > 0 && spotsLeft !== null && spotsLeft < 5 && !isFull;
  const gradientClass = CATEGORY_COLORS[activity.category] ?? "from-brand-navy to-brand-navy-light";
  const categoryBg = CATEGORY_BG[activity.category] ?? "bg-gray-100 text-gray-700";

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavPulse(true);
    setTimeout(() => setFavPulse(false), 400);
    onFavoriteToggle?.();
  };

  return (
    <div className="group bg-white dark:bg-gray-800/80 rounded-2xl shadow-card border border-gray-100/80 dark:border-gray-700/60 overflow-hidden card-hover">
      {!compact && (
        <div className="relative h-40 overflow-hidden">
          {hasPhoto && photoUrl ? (
            <>
              <Image
                src={photoUrl}
                alt={activity.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <div className={`h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <MapPin className="w-10 h-10 text-white/30" />
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 shadow-sm">
              {CATEGORY_LABELS[activity.category] || activity.category}
            </span>
            <div className="flex items-center gap-1">
              {isPopular && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm text-white shadow-sm">
                  <Flame className="w-3 h-3" />
                  Chaud
                </span>
              )}
              {isFull && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-white shadow-sm">
                  Complet
                </span>
              )}
            </div>
          </div>
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-900/80 text-brand-navy dark:text-brand-gold backdrop-blur-sm shadow-sm">
              {formatPrice(activity.price, "Gratuit")}
            </span>
          </div>
          {onFavoriteToggle && (
            <button
              onClick={handleFavToggle}
              className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 transition-transform"
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  isFavorite ? "fill-brand-red text-brand-red" : "text-gray-400 dark:text-gray-500"
                } ${favPulse ? "scale-125" : "scale-100"}`}
              />
            </button>
          )}
        </div>
      )}

      <div className="p-4">
        {compact && (
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryBg}`}>
              {CATEGORY_LABELS[activity.category] || activity.category}
            </span>
            {activity.avg_rating && activity.avg_rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {activity.avg_rating.toFixed(1)}
              </div>
            )}
          </div>
        )}

        <Link href={`/${locale}/activities/${activity.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-2.5 hover:text-brand-navy dark:hover:text-brand-gold transition-colors line-clamp-2 text-sm">
            {activity.title}
          </h3>
        </Link>

        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-brand-navy/50 dark:text-brand-gold/50" />
            <span>{formatDate(activity.date, "fr")} · {formatTime(activity.time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-navy/50 dark:text-brand-gold/50" />
            <span className="truncate">{activity.address}</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 shrink-0 text-brand-navy/50 dark:text-brand-gold/50" />
              <span>
                {isFull ? (
                  <span className="text-brand-red font-medium">Complet</span>
                ) : spotsLeft !== null ? (
                  <span className={isPopular ? "text-orange-600 dark:text-orange-400 font-medium" : ""}>
                    {spotsLeft} place{spotsLeft !== 1 ? "s" : ""} restante{spotsLeft !== 1 ? "s" : ""}
                  </span>
                ) : activity.current_participants > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {activity.current_participants} participant{activity.current_participants !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Soyez le premier !</span>
                )}
              </span>
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-gray-50 dark:border-gray-700/50">
            {activity.avg_rating && activity.avg_rating > 0 ? (
              <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {activity.avg_rating.toFixed(1)}
                {activity.review_count && activity.review_count > 0 && (
                  <span className="text-gray-400 dark:text-gray-500">({activity.review_count})</span>
                )}
              </div>
            ) : (
              <span />
            )}
            <Link
              href={`/${locale}/activities/${activity.id}`}
              className="text-xs font-semibold text-brand-navy dark:text-brand-gold hover:underline"
            >
              Voir →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
