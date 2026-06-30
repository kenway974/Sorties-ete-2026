import type { Metadata } from "next";
import Link from "next/link";
import { Music } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ActivityCard from "@/components/activities/ActivityCard";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { parisNow } from "@/lib/utils/parisTime";
import type { Activity } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Concerts à Paris ce Week-end — Programme & Billets | MoodMap";
  const description =
    "Tous les concerts à Paris ce week-end : rock, jazz, électro, classique, rap. Trouvez les meilleurs concerts parisiens du moment et réservez votre place.";
  const canonical = `${getSiteUrl()}/${locale}/concerts-paris-weekend`;
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

function getWeekendRange(): { from: string; to: string } {
  const { date } = parisNow();
  const now = new Date(date);
  const day = now.getDay(); // 0=Sun,1=Mon,...,6=Sat
  // Days until next Saturday
  const daysToSat = day === 0 ? 6 : 7 - day;
  const sat = new Date(now);
  sat.setDate(now.getDate() + (day === 6 ? 0 : daysToSat));
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  const fmt = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  return { from: fmt(sat), to: fmt(sun) };
}

export default async function ConcertsParisWeekendPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { from, to } = getWeekendRange();

  const { data: weekendActivities } = await supabase
    .from("activities")
    .select(
      `*, creator:profiles!activities_creator_id_fkey(id, username, avatar_url), photos:activity_photos(id, url)`
    )
    .eq("status", "approved")
    .eq("category", "concerts")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(36);

  // If no weekend concerts, show upcoming concerts instead
  const weekendItems = (weekendActivities ?? []) as Activity[];
  let items = weekendItems;

  if (items.length < 6) {
    const { data: upcoming } = await supabase
      .from("activities")
      .select(
        `*, creator:profiles!activities_creator_id_fkey(id, username, avatar_url), photos:activity_photos(id, url)`
      )
      .eq("status", "approved")
      .eq("category", "concerts")
      .gte("date", from)
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(36);
    items = (upcoming ?? []) as Activity[];
  }

  const isWeekendOnly = weekendItems.length >= 6;
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Concerts à Paris ce week-end",
    description: "Le programme complet des concerts parisiens du week-end",
    url: `${siteUrl}/${locale}/concerts-paris-weekend`,
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
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold uppercase tracking-wide">
              Concerts
            </span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Concerts à Paris ce week-end
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Rock, jazz, électro, classique, rap... Le programme complet des concerts parisiens
            {isWeekendOnly ? " ce week-end" : " à venir"}. Ne ratez plus aucun concert à Paris.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">Aucun concert à venir</p>
            <p className="text-sm mb-6">Revenez bientôt, de nouveaux concerts sont ajoutés chaque jour.</p>
            <Link href={`/${locale}/activities`} className="inline-block px-5 py-2 bg-brand-navy text-white rounded-full text-sm font-medium hover:bg-brand-navy/90 transition-colors">
              Toutes les activités
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {items.length} concert{items.length > 1 ? "s" : ""} {isWeekendOnly ? "ce week-end" : "à venir"}
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
            Paris, capitale mondiale de la musique live
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-4">
            <p>
              Paris est l&apos;une des villes du monde où l&apos;offre de concerts est la plus dense et la plus diversifiée. Chaque week-end, des centaines de concerts de tous genres se déroulent simultanément dans la capitale : des salles mythiques comme l&apos;Olympia, la Salle Pleyel ou le Bataclan aux clubs underground de Pigalle et d&apos;Oberkampf, en passant par les jardins et parcs qui accueillent des festivals en plein air lors des mois estivaux.
            </p>
            <p>
              La scène jazz parisienne est particulièrement réputée : des clubs historiques comme le New Morning, le Duc des Lombards ou le Sunset/Sunside proposent des programmations d&apos;exception qui attirent les plus grands noms du jazz international. Pour les amateurs de musique classique, la Philharmonie de Paris, l&apos;Opéra Bastille et l&apos;Opéra Garnier offrent une programmation de niveau mondial toute l&apos;année.
            </p>
            <p>
              La scène rock et indie parisienne est également très vivace, avec des salles comme le Zénith, Bercy Arena ou les Trois Baudets qui accueillent des artistes français et internationaux. La musique électronique a ses temples au Trabendo, au Rex Club et lors des festivals comme Techno Parade ou We Love Green. Le rap et les musiques urbaines trouvent quant à eux leurs scènes à l&apos;Accor Arena et dans de nombreux clubs du 18e et du 19e arrondissement.
            </p>
            <p>
              MoodMap recense en temps réel tous les concerts organisés par des passionnés de musique à Paris, des petits concerts de salle aux événements plus confidentiels. Découvrez de nouveaux artistes, soutenez la scène locale et ne manquez plus un seul concert à Paris ce week-end grâce à notre sélection mise à jour quotidiennement.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/activities`} className="px-4 py-2 rounded-full text-sm font-medium bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors">
              Toutes les activités
            </Link>
            <Link href={`/${locale}/activites-gratuites-paris`} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Activités gratuites →
            </Link>
            <Link href={`/${locale}/quartiers/pigalle`} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Concerts à Pigalle →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
