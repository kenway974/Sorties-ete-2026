import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { QUARTIERS } from "@/lib/data/quartiers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Quartiers de Paris — Activités & Sorties | Hors-Piste";
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
      siteName: "Hors-Piste",
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
      <div className="bg-brand-navy text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-3">Quartiers de Paris</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Découvrez les activités, sorties et événements par quartier. Choisissez votre coin de Paris
            et trouvez ce qu&apos;il s&apos;y passe.
          </p>
        </div>
      </div>

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
