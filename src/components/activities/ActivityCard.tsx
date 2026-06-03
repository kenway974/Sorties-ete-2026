"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Users, Calendar, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import type { Activity } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  soirees: "Soirées", concerts: "Concerts", expositions: "Expositions",
  restaurants: "Restaurants", bars: "Bars", sport: "Sport", culture: "Culture",
  famille: "Famille", etudiants: "Étudiants", networking: "Networking", loisirs: "Loisirs",
};

interface ActivityCardProps {
  activity: Activity;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  compact?: boolean;
}

export default function ActivityCard({ activity, isFavorite, onFavoriteToggle, compact }: ActivityCardProps) {
  const spotsLeft = activity.max_participants !== null
    ? activity.max_participants - activity.current_participants
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {!compact && activity.photos && activity.photos.length > 0 && (
        <div className="h-40 bg-gradient-to-br from-brand-navy to-brand-navy-light relative">
          <Image
            src={activity.photos[0].url}
            alt={activity.title}
            fill
            className="object-cover"
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
        <div className="flex items-center justify-between mb-2">
          <Badge variant="navy" className="text-xs">
            {CATEGORY_LABELS[activity.category] || activity.category}
          </Badge>
          {activity.avg_rating && activity.avg_rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-brand-gold font-medium">
              <Star className="w-4 h-4 fill-brand-gold" />
              <span>{activity.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <Link href={`/fr/activities/${activity.id}`}>
          <h3 className="font-semibold text-gray-900 leading-snug mb-2 hover:text-brand-navy transition-colors line-clamp-2">
            {activity.title}
          </h3>
        </Link>

        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(activity.date, "fr")} {formatTime(activity.time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{activity.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isFull ? (
                <span className="text-brand-red font-medium">Complet</span>
              ) : spotsLeft !== null ? (
                `${spotsLeft} place(s) restante(s)`
              ) : (
                "Places illimitées"
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="font-semibold text-brand-navy">
            {formatPrice(activity.price, "Gratuit")}
          </span>
          <div className="flex items-center gap-2">
            {onFavoriteToggle && (
              <button
                onClick={(e) => { e.preventDefault(); onFavoriteToggle(); }}
                className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite ? "fill-brand-red text-brand-red" : "text-gray-400"
                  }`}
                />
              </button>
            )}
            <Link
              href={`/fr/activities/${activity.id}`}
              className="text-xs font-medium text-brand-navy hover:underline"
            >
              Voir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
