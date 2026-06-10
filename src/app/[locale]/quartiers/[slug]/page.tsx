import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ActivityCard from "@/components/activities/ActivityCard";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { futureOrClause } from "@/lib/utils/parisTime";
import type { Activity } from "@/types";

const QUARTIERS = [
  { slug: "marais",        name: "Le Marais",             lat: 48.8566, lng: 2.3522, desc: "Galeries d'art, bars branchés et histoire au cœur de Paris." },
  { slug: "montmartre",    name: "Montmartre",             lat: 48.8867, lng: 2.3431, desc: "Le village dans la ville, entre artistes et vue panoramique." },
  { slug: "bastille",      name: "Bastille",               lat: 48.8533, lng: 2.3692, desc: "La vie nocturne la plus animée de Paris." },
  { slug: "saint-germain", name: "Saint-Germain-des-Prés", lat: 48.8539, lng: 2.3334, desc: "Cafés littéraires, librairies et culture rive gauche." },
  { slug: "oberkampf",     name: "Oberkampf",              lat: 48.8648, lng: 2.3747, desc: "Bars, concerts et street art dans le 11e arrondissement." },
  { slug: "pigalle",       name: "Pigalle",                lat: 48.8826, lng: 2.3327, desc: "Cabarets légendaires et nouvelle scène musicale." },
  { slug: "republique",    name: "République",             lat: 48.8674, lng: 2.3634, desc: "Place emblématique, expositions et vie culturelle." },
  { slug: "latin",         name: "Quartier Latin",         lat: 48.8501, lng: 2.3475, desc: "Étudiants, musées et terrasses au bord de la Seine." },
  { slug: "belleville",    name: "Belleville",             lat: 48.8725, lng: 2.3791, desc: "Art urbain, scène alternative et diversité culinaire." },
  { slug: "champs-elysees",name: "Champs-Élysées",        lat: 48.8698, lng: 2.3078, desc: "La plus belle avenue du monde et ses événements." },
] as const;

type QuartierSlug = (typeof QUARTIERS)[number]["slug"];

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

  const title = `Activités ${quartier.name} Paris | ParisSorties`;
  const description = `${quartier.desc} Concerts, soirées, expos et sorties à ${quartier.name} — toutes les activités à Paris sur ParisSorties.`;
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
      siteName: "ParisSorties",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const BBOX = 0.015; // ±0.015° lat/lng bounding box

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
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">Aucune activité à venir</p>
            <p className="text-sm">
              Pas encore d'activités prévues dans ce quartier. Revenez bientôt !
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

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href={`/${locale}/quartiers`}
            className="text-brand-navy dark:text-brand-gold font-medium hover:underline text-sm"
          >
            ← Tous les quartiers de Paris
          </Link>
        </div>
      </div>
    </div>
  );
}
