"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Calendar, Clock, Users, ExternalLink, Heart, ArrowLeft, Star, Share2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import type { Activity, Review, Profile } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

const CATEGORY_LABELS: Record<string, string> = {
  soirees: "Soirées", concerts: "Concerts", expositions: "Expositions",
  restaurants: "Restaurants", bars: "Bars", sport: "Sport", culture: "Culture",
  famille: "Famille", etudiants: "Étudiants", networking: "Networking", loisirs: "Loisirs",
};

interface Props {
  activity: Activity;
  reviews: Review[];
  locale: string;
  userId: string | null;
  profile: Profile | null;
  isFavorite: boolean;
  isRegistered: boolean;
}

export default function ActivityDetailClient({ activity, reviews, userId, isFavorite: initFav, isRegistered: initReg }: Props) {
  const [isFavorite, setIsFavorite] = useState(initFav);
  const [isRegistered, setIsRegistered] = useState(initReg);
  const [participants, setParticipants] = useState(activity.current_participants);
  const [loading, setLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: activity.title, text: activity.description || "", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const spotsLeft = activity.max_participants !== null ? activity.max_participants - participants : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const toggleFavorite = async () => {
    if (!userId) return;
    const supabase = createClient();
    if (isFavorite) {
      await supabase.from("favorites").delete().match({ user_id: userId, activity_id: activity.id });
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({ user_id: userId, activity_id: activity.id });
      setIsFavorite(true);
    }
  };

  const toggleRegistration = async () => {
    if (!userId || isFull) return;
    setLoading(true);
    const supabase = createClient();
    if (isRegistered) {
      await supabase.from("activity_registrations").delete().match({ user_id: userId, activity_id: activity.id });
      await supabase.from("activities").update({ current_participants: participants - 1 }).eq("id", activity.id);
      setIsRegistered(false);
      setParticipants((p) => p - 1);
    } else {
      await supabase.from("activity_registrations").insert({ user_id: userId, activity_id: activity.id });
      await supabase.from("activities").update({ current_participants: participants + 1 }).eq("id", activity.id);
      setIsRegistered(true);
      setParticipants((p) => p + 1);
    }
    setLoading(false);
  };

  const submitReview = async () => {
    if (!userId || reviewRating === 0) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .insert({ activity_id: activity.id, user_id: userId, rating: reviewRating, comment: reviewText || null })
      .select("*, user:profiles(id, username, avatar_url)")
      .single();
    if (data) {
      setLocalReviews((r) => [data as Review, ...r]);
      setReviewText("");
      setReviewRating(0);
    }
  };

  const avgRating = localReviews.length
    ? localReviews.reduce((s, r) => s + r.rating, 0) / localReviews.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/fr/activities" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-navy mb-4">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {activity.photos && activity.photos.length > 0 && !imgError ? (
            <div className="rounded-2xl overflow-hidden h-64 bg-gradient-to-br from-brand-navy to-brand-navy-light relative">
              <Image src={activity.photos[0].url} alt={activity.title} fill className="object-cover" onError={() => setImgError(true)} />
            </div>
          ) : (
            <div className="rounded-2xl h-48 bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center">
              <MapPin className="w-16 h-16 text-white/20" />
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="navy" className="mb-2">{CATEGORY_LABELS[activity.category] || activity.category}</Badge>
              <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-brand-navy transition-colors"
                title="Partager"
              >
                {copied
                  ? <Check className="w-5 h-5 text-green-500" />
                  : <Share2 className="w-5 h-5 text-gray-400" />}
              </button>
              {userId && (
                <button
                  onClick={toggleFavorite}
                  className="p-2.5 rounded-xl border border-gray-200 hover:border-brand-red transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-brand-red text-brand-red" : "text-gray-400"}`} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4 border-b border-gray-200">
            {(["info", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-brand-navy text-brand-navy"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "info" ? "Informations" : `Avis (${localReviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === "info" && (
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{activity.description}</p>
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="h-48 rounded-2xl overflow-hidden border border-gray-100">
                <MapView activities={[activity]} />
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              {userId && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                  <h3 className="font-medium mb-3">Écrire un avis</h3>
                  <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Votre avis..."
                    rows={3}
                    className="w-full mt-3 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
                  />
                  <Button size="sm" onClick={submitReview} disabled={reviewRating === 0} className="mt-2">
                    Publier
                  </Button>
                </div>
              )}
              {localReviews.length === 0 && (
                <p className="text-gray-400 text-center py-8">Aucun avis pour le moment.</p>
              )}
              {localReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-medium">
                      {review.user?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.user?.username}</p>
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-navy shrink-0" />
              <span className="text-sm">{formatDate(activity.date, "fr")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-navy shrink-0" />
              <span className="text-sm">{formatTime(activity.time)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand-navy shrink-0" />
              <span className="text-sm">{activity.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-navy shrink-0" />
              <span className="text-sm">
                {participants} participant(s)
                {spotsLeft !== null && (
                  <span className={`ml-1 ${isFull ? "text-brand-red" : "text-green-600"} font-medium`}>
                    ({isFull ? "Complet" : `${spotsLeft} place(s) restante(s)`})
                  </span>
                )}
              </span>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                <span className="text-sm font-medium">{avgRating.toFixed(1)}/5</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xl font-bold text-brand-navy">
                {formatPrice(activity.price, "Gratuit")}
              </span>
            </div>
          </div>

          {activity.external_url && (
            <a
              href={activity.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-brand-navy text-brand-navy font-medium hover:bg-brand-navy hover:text-white transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Réserver / Plus d&apos;infos
            </a>
          )}

          {userId ? (
            <Button
              onClick={toggleRegistration}
              loading={loading}
              disabled={isFull && !isRegistered}
              variant={isRegistered ? "outline" : "primary"}
              className="w-full"
              size="lg"
            >
              {isRegistered ? "Se désinscrire" : isFull ? "Complet" : "S'inscrire"}
            </Button>
          ) : (
            <Link href="/fr/auth/login">
              <Button className="w-full" size="lg">S&apos;inscrire</Button>
            </Link>
          )}

          {activity.creator && (
            <div className="bg-white rounded-2xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Organisé par</p>
              <p className="text-sm font-medium">{activity.creator.username}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
