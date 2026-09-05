import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import ActivityDetailClient from "./ActivityDetailClient";
import type { Activity, ActivityRegistration } from "@/types";
import { curiosity as curiosityOf } from "@/lib/constants/curiosites";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const supabase = await createClient();
  const { data: activity } = await supabase
    .from("activities")
    .select("title, description, date, time, address, price, curiosity, photos:activity_photos(url)")
    .eq("id", id)
    .single();

  if (!activity) return { title: "Activité introuvable", robots: { index: false, follow: false } };

  const image = (activity.photos as { url: string }[] | null)?.[0]?.url;
  const cat = curiosityOf(activity.curiosity).label;
  const when = `${formatDate(activity.date, "fr")} à ${formatTime(activity.time)}`;
  const price = formatPrice(activity.price, "Gratuit");

  const description =
    activity.description?.slice(0, 200) ??
    `${cat} à Paris — ${when}, ${activity.address}. ${price}. À découvrir sur MoodMap.`;

  const canonical = `${getSiteUrl()}/${locale}/activities/${id}`;
  const siteUrl = getSiteUrl();
  const ogImageUrl = image
    ? image
    : `${siteUrl}/api/og?title=${encodeURIComponent(activity.title)}&curiosity=${activity.curiosity}&date=${activity.date}${activity.price != null ? `&price=${activity.price === 0 ? "Gratuit" : activity.price + "€"}` : ""}`;

  return {
    title: activity.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: activity.title,
      description,
      url: canonical,
      type: "article",
      siteName: "MoodMap",
      locale: "fr_FR",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: activity.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: activity.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createClient();

  const { data: activity } = await supabase
    .from("activities")
    .select(`
      *,
      creator:profiles!activities_creator_id_fkey(id, username, avatar_url),
      photos:activity_photos(id, url, uploaded_by),
      registrations:activity_registrations(id, user_id, user:profiles(id, username, avatar_url))
    `)
    .eq("id", id)
    .single();

  if (!activity) notFound();

  const participantList: ActivityRegistration[] =
    ((activity as Record<string, unknown>).registrations as ActivityRegistration[]) || [];

  const [{ data: reviews }, { data: similarData }] = await Promise.all([
    supabase
      .from("reviews")
      .select("*, user:profiles(id, username, avatar_url)")
      .eq("activity_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("*, photos:activity_photos(id, url)")
      .eq("curiosity", activity.curiosity)
      .eq("status", "approved")
      .neq("id", id)
      .gte("date", new Date().toISOString().slice(0, 10))
      .order("date", { ascending: true })
      .limit(6),
  ]);
  const similarActivities = (similarData || []) as Activity[];

  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  const isFavorite = user
    ? !!(await supabase.from("favorites").select("id").eq("user_id", user.id).eq("activity_id", id).single()).data
    : false;

  const isRegistered = user
    ? !!(await supabase.from("activity_registrations").select("id").eq("user_id", user.id).eq("activity_id", id).single()).data
    : false;

  const reviewList = reviews ?? [];
  const avgRating = reviewList.length
    ? reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length
    : 0;
  const image = activity.photos?.[0]?.url;
  const startDate = activity.time ? `${activity.date}T${activity.time}` : activity.date;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    description: activity.description ?? undefined,
    startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(image ? { image: [image] } : {}),
    location: {
      "@type": "Place",
      name: activity.address,
      address: { "@type": "PostalAddress", streetAddress: activity.address, addressLocality: "Paris", addressCountry: "FR" },
      ...(activity.lat && activity.lng
        ? { geo: { "@type": "GeoCoordinates", latitude: activity.lat, longitude: activity.lng } }
        : {}),
    },
    offers: {
      "@type": "Offer",
      price: activity.price ?? 0,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${getSiteUrl()}/${locale}/activities/${id}`,
    },
    ...(activity.creator?.username
      ? { organizer: { "@type": "Organization", name: activity.creator.username } }
      : {}),
    ...(avgRating > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: reviewList.length } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ActivityDetailClient
        activity={activity}
        reviews={reviewList}
        locale={locale}
        userId={user?.id || null}
        profile={profile}
        isFavorite={isFavorite}
        isRegistered={isRegistered}
        registeredUsers={participantList}
        similarActivities={similarActivities}
      />
    </>
  );
}