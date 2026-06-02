import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ActivityDetailClient from "./ActivityDetailClient";

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

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:profiles(id, username, avatar_url)")
    .eq("activity_id", id)
    .order("created_at", { ascending: false });

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

  return (
    <ActivityDetailClient
      activity={activity}
      reviews={reviews || []}
      locale={locale}
      userId={user?.id || null}
      profile={profile}
      isFavorite={isFavorite}
      isRegistered={isRegistered}
    />
  );
}
