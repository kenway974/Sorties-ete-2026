import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ActivityCard from "@/components/activities/ActivityCard";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { futureOrClause } from "@/lib/utils/parisTime";
import type { Activity } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Activités Gratuites à Paris — Sorties Gratuites | MoodMap";
  const description =
    "Découvrez les meilleures activités gratuites à Paris : concerts gratuits, expos gratuites, événements gratuits ce week-end. Sortez sans dépenser un euro.";
  const canonical = `${getSiteUrl()}/${locale}/activites-gratuites-paris`;
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

export default async function ActivitesGratuitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("activities")
    .select(
      `*, creator:profiles!activities_creator_id_fkey(id, username, avatar_url), photos:activity_photos(id, url)`
    )
    .eq("status", "approved")
    .or(futureOrClause())
    .or("price.eq.0,price.is.null")
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(36);

  const items = (activities ?? []) as Activity[];
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Activités gratuites à Paris",
    description: "Les meilleures activités et sorties gratuites à Paris",
    url: `${siteUrl}/${locale}/activites-gratuites-paris`,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/${locale}/activities/${a.id}`,
      name: a.title,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div className="bg-brand-navy text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-brand-gold text-white text-xs font-bold uppercase tracking-wide">
              Gratuit
            </span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Activités gratuites à Paris
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Concerts, expos, ateliers, balades guidées... Sortez à Paris sans dépenser un euro.
            Toutes les activités gratuites du moment sélectionnées pour vous.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">Aucune activité gratuite à venir</p>
            <p className="text-sm mb-6">Revenez bientôt, de nouvelles activités sont ajoutées chaque jour.</p>
            <Link href={`/${locale}/activities`} className="inline-block px-5 py-2 bg-brand-navy text-white rounded-full text-sm font-medium hover:bg-brand-navy/90 transition-colors">
              Voir toutes les activités
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {items.length} activité{items.length > 1 ? "s" : ""} gratuite{items.length > 1 ? "s" : ""} à venir
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </>
        )}

        {/* SEO content */}
        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Paris gratuit : comment trouver des sorties sans se ruiner ?
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-4">
            <p>
              Paris est l&apos;une des villes les plus chères d&apos;Europe, mais elle est aussi l&apos;une de celles qui offrent le plus d&apos;activités gratuites. Des musées nationaux aux concerts en plein air, en passant par les expositions en galeries et les balades thématiques, il est tout à fait possible de profiter pleinement de la capitale sans débourser un centime.
            </p>
            <p>
              Les musées nationaux français, comme le Louvre, le musée d&apos;Orsay ou le Centre Pompidou, sont gratuits le premier dimanche de chaque mois. Tout au long de l&apos;année, des événements culturels comme la Fête de la Musique en juin, la Nuit Blanche en octobre ou les Journées du Patrimoine en septembre proposent une programmation entièrement gratuite dans des lieux habituellement payants ou inaccessibles.
            </p>
            <p>
              Les parcs et jardins parisiens — Tuileries, Luxembourg, Buttes-Chaumont, Bois de Vincennes — organisent régulièrement des concerts, ateliers et animations gratuits, particulièrement pendant les mois d&apos;été. Le long des canaux et des quais de Seine, les guinguettes, concerts improvisés et projections cinématographiques se multiplient dès les premières chaleurs.
            </p>
            <p>
              MoodMap recense en temps réel toutes les activités gratuites proposées par des organisateurs locaux : ateliers créatifs, sorties sportives, événements communautaires, visites guidées participatives. Notre sélection est mise à jour quotidiennement pour que vous ne manquiez jamais une occasion de sortir sans vous ruiner à Paris.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/activities`} className="px-4 py-2 rounded-full text-sm font-medium bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors">
              Toutes les activités
            </Link>
            <Link href={`/${locale}/quartiers`} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Par quartier →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
