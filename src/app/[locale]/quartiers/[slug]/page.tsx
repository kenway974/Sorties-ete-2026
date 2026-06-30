import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ActivityCard from "@/components/activities/ActivityCard";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { futureOrClause } from "@/lib/utils/parisTime";
import { QUARTIERS, type QuartierSlug } from "@/lib/data/quartiers";
import type { Activity } from "@/types";

export function generateStaticParams() {
  return QUARTIERS.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const quartier = QUARTIERS.find((q) => q.slug === slug);
  if (!quartier) return { title: "Quartier introuvable", robots: { index: false, follow: false } };

  const title = `Activités ${quartier.name} Paris — Sorties & Événements | MoodMap`;
  const description = `${quartier.desc} Concerts, soirées, expos et sorties à ${quartier.name} — toutes les activités à Paris sur MoodMap.`;
  const canonical = `${getSiteUrl()}/${locale}/quartiers/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "MoodMap",
      locale: "fr_FR",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const BBOX = 0.015;

export default async function QuartierPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const quartier = QUARTIERS.find((q) => q.slug === (slug as QuartierSlug));
  if (!quartier) notFound();

  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("activities")
    .select(
      `*,
       creator:profiles!activities_creator_id_fkey(id, username, avatar_url),
       photos:activity_photos(id, url)`
    )
    .eq("status", "approved")
    .or(futureOrClause())
    .gte("lat", quartier.lat - BBOX)
    .lte("lat", quartier.lat + BBOX)
    .gte("lng", quartier.lng - BBOX)
    .lte("lng", quartier.lng + BBOX)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(24);

  const items = (activities ?? []) as Activity[];
  const mapsUrl = `https://www.google.com/maps/search/activités+paris/@${quartier.lat},${quartier.lng},15z`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-brand-navy text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href={`/${locale}/quartiers`} className="hover:text-white transition-colors">
              Quartiers
            </Link>
            <span>/</span>
            <span className="text-white">{quartier.name}</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Sorties &amp; activités — {quartier.name}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">{quartier.desc}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-brand-gold hover:underline text-sm font-medium"
          >
            <MapPin className="w-4 h-4" />
            Voir {quartier.name} sur la carte
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">Aucune activité à venir</p>
            <p className="text-sm">
              Pas encore d&apos;activités prévues dans ce quartier. Revenez bientôt !
            </p>
            <Link
              href={`/${locale}/activities`}
              className="inline-block mt-6 px-5 py-2 bg-brand-navy text-white rounded-full text-sm font-medium hover:bg-brand-navy/90 transition-colors"
            >
              Voir toutes les activités
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {items.length} activité{items.length > 1 ? "s" : ""} à venir dans ce quartier
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </>
        )}

        {/* SEO description */}
        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {quartier.name} : que faire et que voir ?
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-4 max-w-3xl">
            {quartier.longDesc.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/activities`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors"
            >
              Toutes les activités à Paris
            </Link>
            <Link
              href={`/${locale}/quartiers`}
              className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              ← Tous les quartiers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
