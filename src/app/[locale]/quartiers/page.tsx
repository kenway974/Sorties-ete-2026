import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getSiteUrl } from "@/lib/utils/siteUrl";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Quartiers de Paris — Activités & Sorties | ParisSorties";
  const description =
    "Explorez les meilleurs quartiers de Paris et découvrez les concerts, soirées, expos et activités près de chez vous. Le Marais, Montmartre, Bastille et bien plus.";
  const canonical = `${getSiteUrl()}/${locale}/quartiers`;
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

export default async function QuartiersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-brand-navy text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-3">Quartiers de Paris</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Découvrez les activités, sorties et événements par quartier. Choisissez votre coin de Paris
            et trouvez ce qu&apos;il s&apos;y passe.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUARTIERS.map((quartier) => (
            <Link
              key={quartier.slug}
              href={`/${locale}/quartiers/${quartier.slug}`}
              className="group block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md hover:border-brand-navy/30 dark:hover:border-brand-gold/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors">
                  {quartier.name}
                </h2>
                <MapPin className="w-5 h-5 text-brand-navy dark:text-brand-gold shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {quartier.desc}
              </p>
              <span className="inline-block mt-4 text-xs font-semibold text-brand-navy dark:text-brand-gold group-hover:underline">
                Voir les activités →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
