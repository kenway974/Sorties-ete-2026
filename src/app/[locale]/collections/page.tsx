import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookMarked, Plus, Lock, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explorez les listes d'activités partagées par la communauté MoodMap ou créez la vôtre.",
  alternates: { canonical: "/fr/collections" },
  openGraph: {
    title: "Collections · MoodMap",
    description: "Explorez les listes d'activités partagées par la communauté MoodMap.",
    type: "website",
  },
};

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: publicCollections } = await supabase
    .from("collections")
    .select("*, user:profiles(username), collection_items(count)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: myCollections } = user ? await supabase
    .from("collections")
    .select("*, collection_items(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) : { data: null };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Collections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Listes d&apos;activites partagees par la communaute</p>
        </div>
        {user && (
          <Link
            href={`/${locale}/collections/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-dark hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle liste
          </Link>
        )}
      </div>

      {myCollections && myCollections.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Mes listes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCollections.map((c) => (
              <CollectionCard key={c.id} collection={c} locale={locale} mine />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Listes publiques</h2>
        {!publicCollections?.length ? (
          <div className="text-center py-16 text-gray-400">
            <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune collection publique pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicCollections.map((c) => (
              <CollectionCard key={c.id} collection={c} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface CollectionRow {
  id: string;
  title: string;
  description?: string | null;
  is_public: boolean;
  collection_items?: { count: number }[];
  user?: { username: string } | null;
}

function CollectionCard({ collection, locale, mine }: { collection: CollectionRow; locale: string; mine?: boolean }) {
  const count = collection.collection_items?.[0]?.count ?? 0;
  return (
    <Link
      href={`/${locale}/collections/${collection.id}`}
      className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-navy/10 dark:bg-brand-navy/30 flex items-center justify-center shrink-0">
          <BookMarked className="w-5 h-5 text-brand-navy dark:text-brand-gold" />
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          {collection.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {collection.is_public ? "Publique" : "Privee"}
        </span>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors mb-1">
        {collection.title}
      </h3>
      {collection.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{collection.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{count} activite{count !== 1 ? "s" : ""}</span>
        {!mine && collection.user?.username && <span>par {collection.user.username}</span>}
      </div>
    </Link>
  );
}