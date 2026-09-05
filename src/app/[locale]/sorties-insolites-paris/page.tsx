import type { Metadata } from "next";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ActivityCard from "@/components/activities/ActivityCard";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { futureOrClause } from "@/lib/utils/parisTime";
import { CURIOSITES } from "@/lib/constants/curiosites";
import { RARITY_FLOOR } from "@/lib/constants/rarity";
import type { Activity } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Sorties Insolites à Paris — Lieux Secrets & Expériences Rares | Hors-Piste";
  const description =
    "Que faire d'insolite à Paris ? Lieux secrets, ateliers de savoir-faire rares, " +
    "expériences immersives, bizarreries assumées. Chaque sortie notée sur 10 : " +
    "on ne référence que ce qui sort vraiment de l'ordinaire.";
  const canonical = `${getSiteUrl()}/${locale}/sorties-insolites-paris`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical,
      type: "website", siteName: "Hors-Piste", locale: "fr_FR",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SortiesInsolitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const supabase = await createClient();

  const { data } = await supabase
    .from("activities")
    .select(`*, creator:profiles!activities_creator_id_fkey(id, username, avatar_url), photos:activity_photos(id, url)`)
    .eq("status", "approved")
    .or(futureOrClause())
    .gte("rarity", RARITY_FLOOR)
    .order("rarity", { ascending: false, nullsFirst: false })
    .order("date", { ascending: true })
    .limit(36);

  const items = (data ?? []) as Activity[];
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sorties insolites à Paris",
    description: "Les sorties les plus insolites de Paris, notées et triées.",
    url: `${siteUrl}/${locale}/sorties-insolites-paris`,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/${locale}/activities/${a.id}`,
      name: a.title,
    })),
  };

  return (
    <div className="bg-parchment dark:bg-ink-deep">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative bg-ink-deep overflow-hidden grain py-16 sm:py-20">
        <div className="halo w-[520px] h-[520px] -top-40 -left-32 bg-bizarre" />
        <div className="halo w-[420px] h-[420px] -bottom-32 -right-20 bg-secret" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl text-parchment mb-5 leading-tight text-balance">
            Sorties insolites à Paris
          </h1>
          <p className="text-parchment/55 text-lg leading-relaxed mb-8">
            Paris compte des milliers d&apos;événements par semaine. La quasi-totalité
            se ressemble. Cette page ne référence que le reste : les lieux qu&apos;on
            ne trouve pas sans y avoir été envoyé, les gestes qu&apos;on n&apos;apprend
            plus nulle part, et ce qui n&apos;a honnêtement aucun sens.
          </p>
          <Link
            href={`${base}/roulette`}
            className="inline-flex items-center gap-2.5 bg-gold text-ink font-bold px-8 py-4 rounded-2xl hover:bg-gold-light hover:scale-105 active:scale-95 transition-all shadow-glow-gold"
          >
            <Shuffle className="w-5 h-5" />
            Fais tourner la Roulette
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl sm:text-3xl text-ink dark:text-parchment mb-6">
          Par type de curiosité
        </h2>
        <div className="flex flex-wrap gap-2.5 mb-14">
          {CURIOSITES.map(({ key, emoji, label, hex }) => (
            <Link
              key={key}
              href={`${base}/activities?curiosite=${key}`}
              style={{ borderColor: `${hex}55`, color: hex }}
              className="px-4 py-2.5 rounded-full border font-medium text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.06] transition-colors"
            >
              {emoji} {label}
            </Link>
          ))}
        </div>

        <h2 className="text-2xl sm:text-3xl text-ink dark:text-parchment mb-2">
          Les plus insolites en ce moment
        </h2>
        <p className="text-ink/45 dark:text-parchment/45 text-sm mb-8">
          Classées par indice d&apos;insolite décroissant. Rien sous {RARITY_FLOOR}/10.
        </p>

        {items.length === 0 ? (
          <p className="text-center py-16 text-ink/40 dark:text-parchment/40">
            Le cabinet se remplit. Reviens d&apos;ici peu.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="filet mb-8" />
        <h2 className="text-2xl text-ink dark:text-parchment mb-4">
          Comment on décide que c&apos;est insolite
        </h2>
        <div className="space-y-4 text-ink/60 dark:text-parchment/50 leading-relaxed">
          <p>
            Chaque sortie reçoit une note de 1 à 10 sur une seule question :
            combien de Parisiens savent que ça existe ? Un concert en salle, une
            expo de musée national ou une brocante tournent autour de 2. Une
            visite de carrière souterraine, un atelier de reliure à l&apos;ancienne
            ou un musée d&apos;objets abandonnés montent au-delà de 7.
          </p>
          <p>
            La note ne mesure pas la qualité : elle mesure l&apos;écart à
            l&apos;ordinaire. Un événement peut être excellent et parfaitement
            banal — il n&apos;entrera pas ici. En dessous de {RARITY_FLOOR}/10, rien
            n&apos;entre au catalogue, et le vocabulaire promotionnel
            («&nbsp;expérience unique&nbsp;», «&nbsp;incontournable&nbsp;») ne
            compte pas comme preuve.
          </p>
          <p>
            Le catalogue reste donc petit, et c&apos;est voulu : mieux vaut six
            trouvailles que six cents lignes.
          </p>
        </div>
      </section>
    </div>
  );
}
