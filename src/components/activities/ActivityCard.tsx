"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Heart, MapPin, Flame, Star } from "lucide-react";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import type { Activity } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  soirees: "Soirées", concerts: "Concerts", expositions: "Expositions",
  restaurants: "Restaurants", bars: "Bars", sport: "Sport", culture: "Culture",
  famille: "Famille", etudiants: "Étudiants", networking: "Networking", loisirs: "Loisirs",
};

const CATEGORY_COLORS: Record<string, string> = {
  soirees:     "from-purple-500 to-pink-500",
  concerts:    "from-rose-500 to-red-500",
  expositions: "from-amber-400 to-orange-500",
  restaurants: "from-orange-400 to-red-500",
  bars:        "from-yellow-400 to-amber-500",
  sport:       "from-emerald-400 to-teal-500",
  culture:     "from-blue-500 to-indigo-500",
  famille:     "from-cyan-400 to-blue-500",
  etudiants:   "from-violet-500 to-purple-500",
  networking:  "from-sky-400 to-blue-500",
  loisirs:     "from-teal-400 to-green-500",
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
  const isHot = activity.current_participants > 0 && spotsLeft !== null && spotsLeft < 5 && !isFull;
  const gradient = CATEGORY_COLORS[activity.category] ?? "from-gray-400 to-gray-600";

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavPulse(true);
    setTimeout(() => setFavPulse(false), 400);
    onFavoriteToggle?.();
  };

  return (
    <Link
      href={`/${locale}/activities/${activity.id}`}
      className="group block bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-shadow duration-300"
    >
      {/* Image — 16:9 */}
      {!compact && (
        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          {hasPhoto && photoUrl ? (
            <Image
              src={photoUrl}
              alt={activity.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient}`}>
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-white/25" />
              </div>
            </div>
          )}

          {/* Category + hot badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide">
              {CATEGORY_LABELS[activity.category] || activity.category}
            </span>
            {isHot && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500 text-white text-[11px] font-semibold">
                <Flame className="w-2.5 h-2.5" /> Chaud
              </span>
            )}
            {isFull && (
              <span className="px-2 py-1 rounded-full bg-red-500 text-white text-[11px] font-semibold">
                Complet
              </span>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold">
              {formatPrice(activity.price, "Gratuit")}
            </span>
          </div>

          {/* Favorite */}
          {onFavoriteToggle && (
            <button
              onClick={handleFav}
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  isFavorite ? "fill-red-400 text-red-400" : "text-white"
                } ${favPulse ? "scale-125" : "scale-100"}`}
              />
            </button>
          )}
        </div>
      )}

      {/* Text content */}
      <div className={compact ? "p-3" : "px-3 pt-3 pb-3.5"}>
        {compact && (
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 block">
            {CATEGORY_LABELS[activity.category] || activity.category}
          </span>
        )}

        <h3 className="font-semibold text-[14px] text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1.5">
          {activity.title}
        </h3>

        <p className="text-[12px] text-gray-400 dark:text-gray-500 line-clamp-1">
          {formatDate(activity.date, "fr")}
          {activity.time ? ` · ${formatTime(activity.time)}` : ""}
          {" · "}
          {activity.address.split(",")[0]}
        </p>

        {(activity.avg_rating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {activity.avg_rating?.toFixed(1)}
              {(activity.review_count ?? 0) > 0 && (
                <span className="text-gray-400"> ({activity.review_count})</span>
              )}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
