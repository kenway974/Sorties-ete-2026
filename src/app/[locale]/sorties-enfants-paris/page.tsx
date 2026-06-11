import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
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
  const title = "Sorties Enfants Paris — Activités Famille | ParisSorties";
  const description =
    "Les meilleures sorties enfants à Paris : ateliers créatifs, spectacles jeunesse, visites de musées, parcs d'attractions. Idées d'activités en famille à Paris ce week-end.";
  const canonical = `${getSiteUrl()}/${locale}/sorties-enfants-paris`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "ParisSorties",
      locale: "fr_FR",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SortiesEnfantsPage({
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
    .eq("category", "famille")
    .or(futureOrClause())
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(36);

  const items = (activities ?? []) as Activity[];
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sorties enfants à Paris",
    description: "Les meilleures activités et sorties en famille à Paris",
    url: `${siteUrl}/${locale}/sorties-enfants-paris`,
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
            <span className="px-3 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold uppercase tracking-wide">
              Famille
            </span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Sorties enfants à Paris
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Ateliers créatifs, spectacles jeunesse, visites de musées, activités sportives...
            Toutes les idées de sorties en famille à Paris, pour petits et grands.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">Aucune activité famille à venir</p>
            <p className="text-sm mb-6">Revenez bientôt, de nouvelles activités sont ajoutées chaque jour.</p>
            <Link href={`/${locale}/activities`} className="inline-block px-5 py-2 bg-brand-navy text-white rounded-full text-sm font-medium hover:bg-brand-navy/90 transition-colors">
              Toutes les activités
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {items.length} activité{items.length > 1 ? "s" : ""} famille à venir
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
            Paris en famille : toutes les idées de sorties pour vos enfants
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-4">
            <p>
              Paris regorge d&apos;activités et de sorties pensées spécialement pour les enfants et les familles. Contrairement aux idées reçues, la capitale française est une ville extrêmement accueillante pour les plus jeunes, avec une offre culturelle, éducative et ludique sans égale en Europe. Des musées interactifs aux ateliers créatifs, en passant par les parcs animaliers et les spectacles de magie, il y en a pour tous les goûts et tous les âges.
            </p>
            <p>
              Les musées parisiens ont fait de gros efforts pour accueillir les familles avec des programmes adaptés : ateliers du mercredi et du week-end au Louvre, visites contées au musée d&apos;Orsay, expériences immersives à la Cité des Sciences et de l&apos;Industrie à La Villette ou encore animations au Muséum National d&apos;Histoire Naturelle. Le Palais de la Découverte, avec ses expériences scientifiques spectaculaires, fascine les enfants de 6 à 12 ans.
            </p>
            <p>
              Les parcs parisiens se prêtent merveilleusement aux sorties en famille : le Bois de Boulogne avec le Jardin d&apos;Acclimatation, le Bois de Vincennes avec son zoo renommé, ou encore les nombreux jardins à jeux dispersés dans toute la ville. En été, les guinguettes et piscines municipales complètent cette offre. Le Parc Astérix et Disneyland Paris, accessibles en moins d&apos;une heure depuis le centre de Paris, restent les destinations fétiches des familles pour les grandes occasions.
            </p>
            <p>
              ParisSorties référence toutes les activités famille organisées par des associations, des artistes et des structures jeunesse de la région parisienne. Ateliers cuisine pour enfants, cours de cirque, spectacles de marionnettes, chasses au trésor urbaines — découvrez chaque semaine de nouvelles idées de sorties originales pour passer un moment inoubliable en famille à Paris.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/activities`} className="px-4 py-2 rounded-full text-sm font-medium bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors">
              Toutes les activités
            </Link>
            <Link href={`/${locale}/activites-gratuites-paris`} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Activités gratuites →
            </Link>
            <Link href={`/${locale}/quartiers/latin`} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Quartier Latin →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
