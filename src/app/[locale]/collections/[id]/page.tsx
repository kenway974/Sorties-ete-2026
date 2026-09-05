import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookMarked, ArrowLeft, Globe, Lock, Calendar } from "lucide-react";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { formatDate } from "@/lib/utils/formatters";
import CollectionContent from "@/components/collections/CollectionContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const supabase = await createClient();
  const { data: c } = await supabase
    .from("collections")
    .select("title, description, is_public, user:profiles(username)")
    .eq("id", id)
    .single();

  if (!c || !c.is_public) return { title: "Collection", robots: { index: false, follow: false } };

  const user = c.user as unknown as { username?: string } | null;
  const desc = c.description ||
    `Une sélection de sorties à Paris${user?.username ? ` par ${user.username}` : ""} sur Hors-Piste.`;
  const canonical = `${getSiteUrl()}/${locale}/collections/${id}`;

  return {
    title: c.title,
    description: desc,
    alternates: { canonical },
    openGraph: { title: c.title, description: desc, url: canonical, type: "article", siteName: "Hors-Piste", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title: c.title, description: desc },
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("*, user:profiles(username)")
    .eq("id", id)
    .single();

  if (!collection) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === collection.user_id;

  const { data: items } = await supabase
    .from("collection_items")
    .select("*, activity:activities(*, photos:activity_photos(id, url))")
    .eq("collection_id", id)
    .order("added_at", { ascending: true });

  const activities = (items ?? []).map((i) => i.activity).filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href={`/${locale}/collections`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-navy dark:hover:text-brand-gold mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Toutes les collections
      </Link>

      <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 mb-8 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-navy/10 dark:bg-brand-navy/30 flex items-center justify-center shrink-0">
            <BookMarked className="w-7 h-7 text-brand-navy dark:text-brand-gold" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{collection.title}</h1>
              <span className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5">
                {collection.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {collection.is_public ? "Publique" : "Privée"}
              </span>
            </div>
            {collection.description && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{collection.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {collection.user?.username && <span>par {collection.user.username}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(collection.created_at.split("T")[0], "fr")}
              </span>
              <span>{activities.length} activité{activities.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <CollectionContent
        collectionId={collection.id}
        title={collection.title}
        activities={activities}
        isOwner={isOwner}
        locale={locale}
      />
    </div>
  );
}