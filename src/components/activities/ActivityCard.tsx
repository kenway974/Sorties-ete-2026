"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Heart, MapPin, Users, Calendar, Star, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import type { Activity } from "@/types";

interface ActivityCardProps {
  activity: Activity;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  compact?: boolean;
}

export default function ActivityCard({ activity, isFavorite, onFavoriteToggle, compact }: ActivityCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const spotsLeft = activity.max_participants !== null
    ? activity.max_participants - activity.current_participants
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover image placeholder */}
      {!compact && activity.photos && activity.photos.length > 0 && (
        <div className="h-40 bg-gradient-to-br from-brand-navy to-brand-navy-light relative">
          <img
            src={activity.photos[0].url}
            alt={activity.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      {!compact && (!activity.photos || activity.photos.length === 0) && (
        <div
          className="h-32 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, #1B3A6B, #2A4F8A)` }}
        >
          <MapPin className="w-10 h-10 text-white/30" />
        </div>
      )}

      <div className="p-4">
        {/* Category + Rating */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="navy" className="text-xs">
            {t(`categories.${activity.category}`)}
          </Badge>
          {activity.avg_rating && activity.avg_rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-brand-gold font-medium">
              <Star className="w-4 h-4 fill-brand-gold" />
              <span>{activity.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/${locale}/activities/${activity.id}`}>
          <h3 className="font-semibold text-gray-900 leading-snug mb-2 hover:text-brand-navy transition-colors line-clamp-2">
            {activity.title}
          </h3>
        </Link>

        {/* Meta */}
        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(activity.date, locale)} {formatTime(activity.time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{activity.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isFull ? (
                <span className="text-brand-red font-medium">{t("activities.spots_full")}</span>
              ) : spotsLeft !== null ? (
                t("activities.spots_left", { count: spotsLeft })
              ) : (
                t("activities.unlimited")
              )}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="font-semibold text-brand-navy">
            {formatPrice(activity.price, t("activities.free"))}
          </span>
          <div className="flex items-center gap-2">
            {onFavoriteToggle && (
              <button
                onClick={(e) => { e.preventDefault(); onFavoriteToggle(); }}
                className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label={isFavorite ? t("activities.remove_favorite") : t("activities.add_favorite")}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite ? "fill-brand-red text-brand-red" : "text-gray-400"
                  }`}
                />
              </button>
            )}
            <Link
              href={`/${locale}/activities/${activity.id}`}
              className="text-xs font-medium text-brand-navy hover:underline"
            >
              {t("common.see_all")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
