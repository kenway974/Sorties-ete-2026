import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Retrouvez toutes les activités et événements parisiens que vous avez sauvegardés.",
  robots: { index: false, follow: false },
};
import Link from "next/link";
import ActivityCard from "@/components/activities/ActivityCard";
import Button from "@/components/ui/Button";
import type { Activity } from "@/types";

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: favorites } = await supabase
    .from("favorites")
    .select("activity_id, activity:activities(*, photos:activity_photos(id, url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type FavoriteRow = { activity_id: string; activity: Activity | null };
  const activities = (favorites as FavoriteRow[] | null)
    ?.map((f) => f.activity)
    .filter((a): a is Activity => a !== null) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes favoris</h1>
      {activities.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">♥️</p>
          <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore de favoris.</p>
          <Link href={`/${locale}/activities`}>
            <Button>Découvrir des activités</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} isFavorite />
          ))}
        </div>
      )}
    </div>
  );
}
