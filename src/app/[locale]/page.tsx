import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  MapPin, Calendar, ArrowRight, Zap, Users, Star,
  Search, Heart, Sparkles, ChevronRight,
} from "lucide-react";
import ActivityCard from "@/components/activities/ActivityCard";
import ActivityRow from "@/components/home/ActivityRow";
import QuickFilters from "@/components/home/QuickFilters";
import DiscoverButton from "@/components/home/DiscoverButton";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import { futureOrClause, parisNow } from "@/lib/utils/parisTime";

const CATEGORIES = [
  { key: "soirees",    emoji: "🎉", label: "Soirées",    color: "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300" },
  { key: "concerts",  emoji: "🎵", label: "Concerts",   color: "hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300" },
  { key: "expositions", emoji: "🎨", label: "Expos",    color: "hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300" },
  { key: "restaurants", emoji: "🍽️", label: "Restos",  color: "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300" },
  { key: "bars",      emoji: "🍻", label: "Bars",       color: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-300" },
  { key: "sport",     emoji: "⚽", label: "Sport",      color: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300" },
  { key: "culture",   emoji: "🏛️", label: "Culture",   color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300" },
  { key: "famille",   emoji: "👨‍👩‍👧", label: "Famille", color: "hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-300" },
  { key: "etudiants", emoji: "🎓", label: "Étudiants",  color: "hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300" },
  { key: "networking", emoji: "🤝", label: "Network",   color: "hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300" },
  { key: "loisirs",   emoji: "🎮", label: "Loisirs",    color: "hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300" },
];

const HOW_IT_WORKS = [
  { icon: Search, step: "01", title: "Cherche", desc: "Explore par quartier, catégorie ou date. Filtre selon ton budget et tes envies du moment." },
  { icon: MapPin, step: "02", title: "Localise", desc: "Visualise les activités sur la carte interactive. Toujours un spot sympa à portée de métro." },
  { icon: Heart, step: "03", title: "Profite", desc: "Sauvegarde tes coups de cœur, inscris-toi et rejoins la communauté parisienne." },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const supabase = await createClient();

  const { date: parisDate, time: parisTime } = parisNow();

  const [featuredRes, tonightRes, lastMinuteRes, trendingRes, { data: { user } }] = await Promise.all([
    supabase
      .from("activities")
      .select("*, photos:activity_photos(id, url)")
      .eq("status", "approved")
      .or(futureOrClause())
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(4),

    // Ce soir : aujourd'hui, encore à venir
    supabase
      .from("activities")
      .select("*, photos:activity_photos(id, url)")
      .eq("status", "approved")
      .eq("date", parisDate)
      .gte("time", parisTime)
      .order("time", { ascending: true })
      .limit(8),

    // Dernière minute : créées ou mises à jour dans les 48h
    supabase
      .from("activities")
      .select("*, photos:activity_photos(id, url)")
      .eq("status", "approved")
      .or(futureOrClause())
      .gte("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(8),

    // Tendances : plus d'inscrits cette semaine
    supabase
      .from("activities")
      .select("*, photos:activity_photos(id, url)")
      .eq("status", "approved")
      .or(futureOrClause())
      .gt("current_participants", 0)
      .order("current_participants", { ascending: false })
      .limit(8),

    supabase.auth.getUser(),
  ]);

  const activities = featuredRes.data || [];
  const tonight = tonightRes.data || [];
  const lastMinute = lastMinuteRes.data || [];
  const trending = trendingRes.data || [];

  // Personalized "Pour vous" section
  let personalizedActivities: typeof activities = [];
  if (user) {
    const { data: userProfile } = await supabase.from("profiles").select("preferences").eq("id", user.id).single();
    if (userProfile?.preferences && userProfile.preferences.length > 0) {
      const { data: persoData } = await supabase
        .from("activities")
        .select("*, photos:activity_photos(id, url)")
        .eq("status", "approved")
        .in("category", userProfile.preferences)
        .or(futureOrClause())
        .order("date", { ascending: true })
        .limit(8);
      personalizedActivities = persoData || [];
    }
  }

  return (
    <div className="dark:bg-[#0d111a]">
      {/* ── HERO ── */}
      <section className="relative bg-brand-navy overflow-hidden min-h-[88vh] flex items-center">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-brand-gold/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-16 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-brand-gold/5 rounded-full blur-2xl" />
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-brand-gold/30 animate-fade-in-up">
            <Zap className="w-3.5 h-3.5" />
            400+ activités à Paris cet été
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            Finis les soirs<br />
            <span className="text-brand-gold">à rien faire</span>
          </h1>

          <p className="text-white/60 text-xl mb-4 max-w-xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Concerts, expos, soirées, sports, culture —<br className="hidden sm:block" />
            tout ce qui se passe à Paris, au bon moment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-white/40 text-sm animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {["Gratuit", "Sans inscription", "Mis à jour chaque jour"].map((t, i) => (
              <span key={t} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-brand-gold/50" />{t}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href={`${base}/activities`}
              className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-bold px-9 py-4 rounded-2xl hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all text-base shadow-xl shadow-brand-gold/20"
            >
              Explorer les activités
              <ArrowRight className="w-5 h-5" />
            </Link>
            <DiscoverButton />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <QuickFilters />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-brand-navy" />
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-brand-navy-dark dark:bg-[#0a0e16] border-b border-white/8">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-3 divide-x divide-white/8 text-center">
          {[
            { icon: Calendar, value: "400+", label: "activités" },
            { icon: MapPin, value: "20", label: "arrondissements" },
            { icon: Users, value: "100%", label: "gratuit" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center gap-1.5 text-white">
                <Icon className="w-4 h-4 text-brand-gold" />
                <span className="text-xl font-extrabold">{value}</span>
              </div>
              <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white dark:bg-gray-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">En 30 secondes, trouve ton prochain plan parisien.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-navy/6 dark:bg-brand-navy/20 group-hover:bg-brand-navy/10 dark:group-hover:bg-brand-navy/30 transition-colors flex items-center justify-center">
                    <Icon className="w-7 h-7 text-brand-navy dark:text-brand-gold" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-navy text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                    {step.slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={`${base}/activities`} className="inline-flex items-center gap-2 text-brand-navy dark:text-brand-gold font-semibold hover:gap-3 transition-all text-sm">
              Voir toutes les activités <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-brand-cream dark:bg-[#0d111a] py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Par envie du moment</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Clique sur une catégorie pour filtrer</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-3">
            {CATEGORIES.map(({ key, emoji, label, color }) => (
              <Link
                key={key}
                href={`${base}/activities?category=${key}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border border-white dark:border-gray-700 bg-white dark:bg-gray-800/60 transition-all group hover:scale-105 hover:shadow-md ${color}`}
              >
                <span className="text-2xl group-hover:animate-bounce-gentle">{emoji}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ACTIVITIES ── */}
      <section className="bg-white dark:bg-gray-900/30 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">À venir à Paris</h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Les prochains événements approuvés par la communauté</p>
            </div>
            <Link href={`${base}/activities`} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-navy dark:text-brand-gold hover:underline shrink-0">
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16 bg-brand-cream dark:bg-gray-800/40 rounded-3xl text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium dark:text-gray-300">Aucun événement à venir pour le moment.</p>
              <Link href={`${base}/propose`} className="mt-3 inline-block text-brand-navy dark:text-brand-gold font-semibold hover:underline text-sm">
                Soyez le premier à en proposer un →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href={`${base}/activities`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy dark:text-brand-gold hover:underline">
              Voir toutes les activités <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CE SOIR ── */}
      {tonight.length > 0 && (
        <div className="bg-brand-cream dark:bg-[#0d111a]">
          <ActivityRow
            title="Ce soir à Paris"
            emoji="🌙"
            activities={tonight}
            viewAllHref={`/activities?date=today`}
            locale={locale}
          />
        </div>
      )}

      {/* ── POUR VOUS ── */}
      {personalizedActivities.length > 0 && (
        <div className="bg-white dark:bg-gray-900/30">
          <ActivityRow
            title="Pour vous"
            emoji="🎯"
            activities={personalizedActivities}
            viewAllHref={`/activities`}
            locale={locale}
          />
        </div>
      )}

      {/* ── TENDANCES ── */}
      {trending.length > 0 && (
        <div className="bg-white dark:bg-gray-900/30">
          <ActivityRow
            title="Tendances cette semaine"
            emoji="🔥"
            activities={trending}
            viewAllHref={`/activities?sort=popularity`}
            locale={locale}
          />
        </div>
      )}

      {/* ── DERNIÈRE MINUTE ── */}
      {lastMinute.length > 0 && (
        <div className="bg-brand-cream dark:bg-[#0d111a]">
          <ActivityRow
            title="Ajoutés récemment"
            emoji="⚡"
            activities={lastMinute}
            viewAllHref={`/activities`}
            locale={locale}
          />
        </div>
      )}

      {/* ── RECENTLY VIEWED ── */}
      <RecentlyViewed />

      {/* ── CTA ORGANISER ── */}
      <section className="bg-brand-navy dark:bg-[#0a0e16] py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-gold/8 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-gold/15 rounded-2xl mb-5 border border-brand-gold/20">
            <Star className="w-7 h-7 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Vous organisez un événement à Paris ?</h2>
          <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
            Proposez votre activité et touchez une communauté passionnée par la vie parisienne.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`${base}/propose`}
              className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-bold px-9 py-4 rounded-2xl hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-gold/20"
            >
              Proposer un événement <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`${base}/activities`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-medium px-9 py-4 rounded-2xl hover:bg-white/20 transition-colors border border-white/20"
            >
              Explorer d&apos;abord
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}