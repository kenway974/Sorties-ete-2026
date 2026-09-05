import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  MapPin, ArrowRight, Shuffle, Eye, Compass, ChevronRight, Sparkles,
} from "lucide-react";
import ActivityCard from "@/components/activities/ActivityCard";
import ActivityRow from "@/components/home/ActivityRow";
import DiscoverButton from "@/components/home/DiscoverButton";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import GlobalStoriesBar from "@/components/stories/GlobalStoriesBar";
import { CURIOSITES } from "@/lib/constants/curiosites";
import { RARITY_BANDS, RARITY_FLOOR } from "@/lib/constants/rarity";
import { futureOrClause, parisNow } from "@/lib/utils/parisTime";

const SELECT = "*, photos:activity_photos(id, url)";

const DEMARCHE = [
  {
    icon: Shuffle,
    titre: "On montre",
    texte:
      "Pas de formulaire, pas de questionnaire. On ne peut pas chercher ce dont on ignore l'existence — alors la Roulette montre, une sortie à la fois.",
  },
  {
    icon: Eye,
    titre: "On filtre à l'entrée",
    texte:
      "Chaque sortie reçoit un indice d'insolite de 1 à 10. Sous 5, elle n'entre pas au catalogue. Le tri se fait avant toi, pas après.",
  },
  {
    icon: Compass,
    titre: "Tu montes le curseur",
    texte:
      "Le seul réglage est le cadran d'insolite. On le monte comme on monte le son, jusqu'à ce que ça devienne déraisonnable.",
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const supabase = await createClient();

  const { date: parisDate, time: parisTime } = parisNow();

  const [raresRes, tonightRes, lastMinuteRes, trendingRes, countRes, { data: { user } }] =
    await Promise.all([
      // Les plus rares du moment : la vitrine du produit.
      supabase
        .from("activities")
        .select(SELECT)
        .eq("status", "approved")
        .or(futureOrClause())
        .gte("rarity", RARITY_FLOOR)
        .order("rarity", { ascending: false, nullsFirst: false })
        .order("date", { ascending: true })
        .limit(4),

      supabase
        .from("activities")
        .select(SELECT)
        .eq("status", "approved")
        .eq("date", parisDate)
        .gte("time", parisTime)
        .gte("rarity", RARITY_FLOOR)
        .order("rarity", { ascending: false, nullsFirst: false })
        .limit(8),

      supabase
        .from("activities")
        .select(SELECT)
        .eq("status", "approved")
        .or(futureOrClause())
        .gte("rarity", RARITY_FLOOR)
        // eslint-disable-next-line react-hooks/purity -- composant serveur, une valeur par requête
        .gte("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(8),

      supabase
        .from("activities")
        .select(SELECT)
        .eq("status", "approved")
        .or(futureOrClause())
        .gte("rarity", RARITY_FLOOR)
        .gt("current_participants", 0)
        .order("current_participants", { ascending: false })
        .limit(8),

      supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .or(futureOrClause())
        .gte("rarity", RARITY_FLOOR),

      supabase.auth.getUser(),
    ]);

  const rares = raresRes.data || [];
  const tonight = tonightRes.data || [];
  const lastMinute = lastMinuteRes.data || [];
  const trending = trendingRes.data || [];
  const total = countRes.count ?? 0;

  // « Pour toi » : d'après les curiosités choisies à l'inscription.
  let pourToi: typeof rares = [];
  if (user) {
    const { data: profil } = await supabase
      .from("profiles").select("preferences").eq("id", user.id).single();
    if (profil?.preferences?.length) {
      const { data } = await supabase
        .from("activities")
        .select(SELECT)
        .eq("status", "approved")
        .in("curiosity", profil.preferences)
        .or(futureOrClause())
        .gte("rarity", RARITY_FLOOR)
        .order("rarity", { ascending: false, nullsFirst: false })
        .limit(8);
      pourToi = data || [];
    }
  }

  return (
    <div className="bg-parchment dark:bg-ink-deep">
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-ink-deep overflow-hidden grain">
        {/* Halos : les six teintes en fond, très diffusées. */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="halo w-[620px] h-[620px] -top-56 -left-40 bg-bizarre animate-float-slow" />
          <div className="halo w-[520px] h-[520px] top-10 -right-32 bg-scene animate-float-slower" />
          <div className="halo w-[420px] h-[420px] -bottom-40 left-1/3 bg-secret" />
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-gold/25 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" />
            {total > 0 ? `${total} sorties qui ne ressemblent à rien` : "Paris, hors des sentiers battus"}
          </div>

          <h1
            className="text-5xl md:text-7xl text-parchment mb-6 leading-[1.05] animate-fade-in-up text-balance"
            style={{ animationDelay: "0.05s" }}
          >
            Paris a des endroits<br />
            <span className="text-gilded">dont personne ne parle</span>
          </h1>

          <p
            className="text-parchment/55 text-lg sm:text-xl mb-9 max-w-lg mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Pas un agenda de plus. Un cabinet de curiosités : uniquement ce qui
            sort de l&apos;ordinaire, noté et trié avant d&apos;arriver jusqu&apos;à toi.
          </p>

          <div
            className="flex flex-col items-center sm:flex-row sm:justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href={`${base}/roulette`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gold text-ink font-bold px-9 py-4 rounded-2xl hover:bg-gold-light hover:scale-105 active:scale-95 transition-all text-base shadow-glow-gold"
            >
              <Shuffle className="w-5 h-5" />
              Fais tourner la Roulette
            </Link>
            <Link
              href={`${base}/activities`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-parchment/20 text-parchment/80 hover:bg-parchment/5 hover:border-parchment/40 transition-all"
            >
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>

      <GlobalStoriesBar userId={user?.id ?? null} />

      {/* ══ LES CURIOSITÉS ════════════════════════════════════════════════ */}
      <section className="bg-parchment dark:bg-ink py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-3">
            <h2 className="text-3xl sm:text-4xl text-ink dark:text-parchment mb-3">
              Six façons d&apos;être mémorable
            </h2>
            <p className="text-ink/50 dark:text-parchment/45 max-w-lg mx-auto leading-relaxed">
              On ne classe pas par genre — on peut s&apos;ennuyer à un concert et
              ne jamais oublier un atelier de reliure. On classe par ce qu&apos;il
              en reste le lendemain.
            </p>
          </div>

          <div className="filet max-w-xs mx-auto my-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURIOSITES.map(({ key, emoji, label, tagline, desc, gradient }, i) => (
              <Link
                key={key}
                href={`${base}/activities?curiosite=${key}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="group relative overflow-hidden rounded-3xl p-6 min-h-[190px] flex flex-col justify-between animate-reveal shadow-card hover:shadow-vitrine hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                <div className="absolute inset-0 bg-grain opacity-[0.16] mix-blend-overlay pointer-events-none" />

                <div className="relative">
                  <span className="text-3xl block mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 origin-left">
                    {emoji}
                  </span>
                  <h3 className="text-xl text-white leading-tight mb-1">{label}</h3>
                  <p className="text-white/75 text-sm leading-snug">{tagline}</p>
                </div>

                <p className="relative text-white/55 text-xs leading-snug mt-4 pt-3 border-t border-white/20">
                  {desc}
                </p>

                <ArrowRight
                  className="absolute top-6 right-6 w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LES PLUS RARES ════════════════════════════════════════════════ */}
      <section className="bg-parchment-dim dark:bg-ink-deep py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl text-ink dark:text-parchment">
                Les plus rares du moment
              </h2>
              <p className="text-ink/45 dark:text-parchment/40 text-sm mt-1.5">
                Ce que presque personne à Paris ne sait qu&apos;il peut faire
              </p>
            </div>
            <Link
              href={`${base}/activities?sort=rarity`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-gold hover:gap-2.5 transition-all shrink-0"
            >
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {rares.length === 0 ? (
            <div className="text-center py-16 bg-parchment dark:bg-ink rounded-3xl">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="font-medium text-ink/70 dark:text-parchment/70">
                Le cabinet est encore vide.
              </p>
              <p className="text-sm text-ink/40 dark:text-parchment/40 mt-1">
                Les imports repassent au crible, ça se remplit tout seul.
              </p>
              <Link
                href={`${base}/propose`}
                className="mt-4 inline-block text-gold font-semibold hover:underline text-sm"
              >
                Tu connais un endroit ? Propose-le →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {rares.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ LE CADRAN ═════════════════════════════════════════════════════ */}
      <section className="relative bg-ink dark:bg-ink py-16 sm:py-20 overflow-hidden grain">
        <div className="halo w-[500px] h-[500px] -top-40 right-0 bg-metier" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl text-parchment mb-3">
            Jusqu&apos;où tu veux aller&nbsp;?
          </h2>
          <p className="text-parchment/45 mb-10 max-w-md mx-auto leading-relaxed">
            Une seule question, posée à chaque sortie : combien de Parisiens
            savent que ça existe&nbsp;?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {RARITY_BANDS.map(({ min, max, label, desc, hex }) => (
              <Link
                key={label}
                href={`${base}/activities?insolite=${min}`}
                style={{ borderColor: `${hex}55` }}
                className="group rounded-2xl border bg-ink-soft/60 p-4 text-left hover:bg-ink-soft transition-all hover:-translate-y-1"
              >
                <span
                  className="text-xs font-black tabular-nums block mb-1.5"
                  style={{ color: hex }}
                >
                  {min}–{max}
                </span>
                <span className="text-parchment font-semibold text-sm block leading-tight mb-1">
                  {label}
                </span>
                <span className="text-parchment/40 text-xs leading-snug block">{desc}</span>
              </Link>
            ))}
          </div>

          <p className="text-parchment/30 text-xs mt-6">
            En dessous de {RARITY_FLOOR}, ça n&apos;entre pas au catalogue.
          </p>
        </div>
      </section>

      {/* ══ LES RANGÉES ═══════════════════════════════════════════════════ */}
      {tonight.length > 0 && (
        <div className="bg-parchment dark:bg-ink-deep">
          <ActivityRow
            title="Ce soir, si tu bouges maintenant"
            emoji="🌙"
            activities={tonight}
            viewAllHref={`/activities?date=today`}
            locale={locale}
          />
        </div>
      )}

      {pourToi.length > 0 && (
        <div className="bg-parchment-dim dark:bg-ink">
          <ActivityRow
            title="Dans tes curiosités"
            emoji="🎯"
            activities={pourToi}
            viewAllHref={`/activities`}
            locale={locale}
          />
        </div>
      )}

      {trending.length > 0 && (
        <div className="bg-parchment dark:bg-ink-deep">
          <ActivityRow
            title="Ceux qui se remplissent"
            emoji="🔥"
            activities={trending}
            viewAllHref={`/activities?sort=popularity`}
            locale={locale}
          />
        </div>
      )}

      {lastMinute.length > 0 && (
        <div className="bg-parchment-dim dark:bg-ink">
          <ActivityRow
            title="Entrés cette semaine"
            emoji="⚡"
            activities={lastMinute}
            viewAllHref={`/activities`}
            locale={locale}
          />
        </div>
      )}

      <RecentlyViewed />

      {/* ══ LA DÉMARCHE ═══════════════════════════════════════════════════ */}
      <section className="bg-parchment dark:bg-ink-deep py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl text-center text-ink dark:text-parchment mb-12">
            Comment on s&apos;y prend
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DEMARCHE.map(({ icon: Icon, titre, texte }, i) => (
              <div key={titre} className="text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gold/12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-lg text-ink dark:text-parchment mb-2">
                  <span className="text-gold/50 tabular-nums mr-1.5">0{i + 1}</span>
                  {titre}
                </h3>
                <p className="text-ink/55 dark:text-parchment/45 text-sm leading-relaxed">
                  {texte}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <DiscoverButton />
          </div>
        </div>
      </section>

      {/* ══ PROPOSER ══════════════════════════════════════════════════════ */}
      <section className="relative bg-ink-deep py-16 sm:py-20 overflow-hidden grain">
        <div className="halo w-[500px] h-[500px] -bottom-40 left-1/2 -translate-x-1/2 bg-gold" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl text-parchment mb-3">
            Tu connais un endroit&nbsp;?
          </h2>
          <p className="text-parchment/50 mb-8 leading-relaxed">
            Les meilleures adresses ne sont dans aucun agenda — elles se
            transmettent. Propose la tienne, elle passera par le même crible que
            les autres.
          </p>
          <Link
            href={`${base}/propose`}
            className="inline-flex items-center gap-2 bg-parchment text-ink font-bold px-8 py-4 rounded-2xl hover:bg-white hover:scale-105 active:scale-95 transition-all"
          >
            Proposer une sortie <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
