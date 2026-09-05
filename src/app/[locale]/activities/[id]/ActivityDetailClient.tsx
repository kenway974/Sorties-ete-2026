"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { MapPin, Calendar, Clock, Users, ExternalLink, Heart, ArrowLeft, Star, Share2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import AddToCollectionButton from "@/components/activities/AddToCollectionButton";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import GoingButton from "@/components/activities/GoingButton";
import { useItinerary } from "@/lib/hooks/useItinerary";
import { Route } from "lucide-react";
import ActivityCard from "@/components/activities/ActivityCard";
import ActivityStories from "@/components/activities/ActivityStories";
import Markdown from "@/components/ui/Markdown";
import type { Activity, Review, Profile, ActivityRegistration } from "@/types";
import { curiosity as curiosityOf } from "@/lib/constants/curiosites";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });


interface Props {
  activity: Activity;
  reviews: Review[];
  locale: string;
  userId: string | null;
  profile: Profile | null;
  isFavorite: boolean;
  isRegistered: boolean;
  registeredUsers: ActivityRegistration[];
  similarActivities: Activity[];
}

export default function ActivityDetailClient({ activity, reviews, userId, isFavorite: initFav, isRegistered: initReg, registeredUsers, similarActivities }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const { add: addRecentlyViewed } = useRecentlyViewed();
  const { add: addToItinerary, has: inItinerary, remove: removeFromItinerary } = useItinerary();
  const [isFavorite, setIsFavorite] = useState(initFav);

  useEffect(() => {
    addRecentlyViewed({
      id: activity.id,
      title: activity.title,
      curiosity: activity.curiosity,
      date: activity.date,
      address: activity.address,
      price: activity.price,
      photoUrl: activity.photos?.[0]?.url,
    });
  }, [activity, addRecentlyViewed]);
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
      <Link href={`/${locale}/activities`} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-navy dark:hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {activity.photos && activity.photos.length > 0 && !imgError ? (
            <div className="rounded-2xl overflow-hidden h-64 bg-gradient-to-br from-brand-navy to-brand-navy-light relative">
              <Image src={activity.photos[0].url} alt={activity.title} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" onError={() => setImgError(true)} />
            </div>
          ) : (
            <div className="rounded-2xl h-48 bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center">
              <MapPin className="w-16 h-16 text-white/20" />
            </div>
          )}

          <ActivityStories activityId={activity.id} userId={userId} />

          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="navy" className="mb-2">{curiosityOf(activity.curiosity).emoji} {curiosityOf(activity.curiosity).label}</Badge>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activity.title}</h1>
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
              <AddToCollectionButton activityId={activity.id} userId={userId} locale={locale} />
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

          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            {(["info", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-brand-navy text-brand-navy dark:border-white dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab === "info" ? "Informations" : `Avis (${localReviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === "info" && (
            <div className="space-y-4">
              <Markdown>{activity.description || ""}</Markdown>
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-300">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="h-48 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <MapView activities={[activity]} />
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              {userId && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
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
                <div key={review.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-navy dark:text-blue-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200">{formatDate(activity.date, "fr")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-navy dark:text-blue-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200">{formatTime(activity.time)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand-navy dark:text-blue-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200">{activity.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-navy dark:text-blue-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200">
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
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xl font-bold text-brand-navy dark:text-white">
                {formatPrice(activity.price, "Gratuit")}
              </span>
            </div>
          </div>

          {registeredUsers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Qui y va ?</h3>
              <div className="flex items-center">
                {registeredUsers.slice(0, 6).map((reg, i) => (
                  <div
                    key={reg.id}
                    className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-gray-800 overflow-hidden shrink-0"
                    style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: 6 - i }}
                    title={reg.user?.username || "Participant"}
                  >
                    {reg.user?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={reg.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (reg.user?.username?.[0] || "?").toUpperCase()
                    )}
                  </div>
                ))}
                {registeredUsers.length > 6 && (
                  <div
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-gray-800 shrink-0"
                    style={{ marginLeft: "-8px" }}
                  >
                    +{registeredUsers.length - 6}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {registeredUsers.length} personne{registeredUsers.length !== 1 ? "s" : ""} inscrite{registeredUsers.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {activity.external_url && (
            <a
              href={activity.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-brand-navy text-brand-navy font-medium hover:bg-brand-navy hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-brand-navy transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Réserver / Plus d&apos;infos
            </a>
          )}

          <GoingButton activityId={activity.id} userId={userId} className="w-full justify-center" />

          <button
            onClick={() => inItinerary(activity.id) ? removeFromItinerary(activity.id) : addToItinerary(activity)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              inItinerary(activity.id)
                ? "bg-brand-navy/5 border-brand-navy text-brand-navy dark:bg-brand-navy/20 dark:text-white"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-navy hover:text-brand-navy"
            }`}
          >
            <Route className="w-4 h-4" />
            {inItinerary(activity.id) ? "Dans mon itinéraire ✓" : "Ajouter à l'itinéraire"}
          </button>

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
            <Link href={`/${locale}/auth/login`}>
              <Button className="w-full" size="lg">S&apos;inscrire</Button>
            </Link>
          )}

          {activity.creator && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Organisé par</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.creator.username}</p>
            </div>
          )}
        </div>
      </div>

      {similarActivities.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Vous aimerez aussi</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {similarActivities.map((a) => (
              <div key={a.id} className="min-w-[240px] max-w-[240px] snap-start">
                <ActivityCard activity={a} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
