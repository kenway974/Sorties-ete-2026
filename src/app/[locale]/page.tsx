import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  MapPin, Calendar, ArrowRight, Zap, Users, Star,
  Search, Heart, Sparkles, ChevronRight,
} from "lucide-react";
import ActivityCard from "@/components/activities/ActivityCard";
import QuickFilters from "@/components/home/QuickFilters";
import DiscoverButton from "@/components/home/DiscoverButton";
import RecentlyViewed from "@/components/home/RecentlyViewed";

const CATEGORIES = [
  { key: "soirees",    emoji: "🎉", label: "Soirées" },
  { key: "concerts",  emoji: "🎵", label: "Concerts" },
  { key: "expositions", emoji: "🎨", label: "Expositions" },
  { key: "restaurants", emoji: "🍽️", label: "Restaurants" },
  { key: "bars",      emoji: "🍻", label: "Bars" },
  { key: "sport",     emoji: "⚽", label: "Sport" },
  { key: "culture",   emoji: "🏛️", label: "Culture" },
  { key: "famille",   emoji: "👨‍👩‍👧", label: "Famille" },
  { key: "etudiants", emoji: "🎓", label: "Étudiants" },
  { key: "networking", emoji: "🤝", label: "Networking" },
  { key: "loisirs",   emoji: "🎮", label: "Loisirs" },
];

const HOW_IT_WORKS = [
  {
    icon: Search,
    step: "01",
    title: "Cherche",
    desc: "Explore par quartier, catégorie ou date. Filtre selon ton budget et tes envies du moment.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Localise",
    desc: "Visualise les activités sur la carte interactive. Toujours un spot sympa à portée de métro.",
  },
  {
    icon: Heart,
    step: "03",
    title: "Profite",
    desc: "Sauvegarde tes coups de cœur, inscris-toi et rejoins la communauté parisienne.",
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("activities")
    .select("*, photos:activity_photos(id, url)")
    .eq("status", "approved")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .limit(4);

  const activities = featured || [];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative bg-brand-navy overflow-hidden min-h-[88vh] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-16 w-[360px] h-[360px] bg-brand-red/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full" />
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-brand-gold/30">
            <Zap className="w-3.5 h-3.5" />
            400+ activités à Paris cet été
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Finis les soirs<br />
            <span className="text-brand-gold">à rien faire</span>
          </h1>

          <p className="text-white/60 text-xl mb-4 max-w-xl mx-auto leading-relaxed">
            Concerts, expos, soirées, sports, culture —<br className="hidden sm:block" />
            tout ce qui se passe à Paris, au bon moment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-white/40 text-sm">
            {["Gratuit", "Sans inscription", "Mis à jour chaque jour"].map((t, i) => (
              <span key={t} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-brand-gold/50" />{t}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href={`${base}/activities`}
              className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-bold px-9 py-4 rounded-2xl hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all text-base shadow-xl shadow-brand-gold/20"
            >
              Explorer les activités
              <ArrowRight className="w-5 h-5" />
            </Link>
            <DiscoverButton />
          </div>

          {/* Quick temporal filters */}
          <QuickFilters />
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-white/5" />
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-brand-navy border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-3 divide-x divide-white/10 text-center">
          {[
            { icon: Calendar, value: "400+", label: "activités" },
            { icon: MapPin,   value: "20",   label: "arrondissements" },
            { icon: Users,    value: "100%", label: "gratuit" },
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
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              En 30 secondes, trouve ton prochain plan parisien.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-navy/5 group-hover:bg-brand-navy/10 transition-colors flex items-center justify-center">
                    <Icon className="w-7 h-7 text-brand-navy" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-navy text-xs font-black w-6 h-6 rounded-full flex items-center justify-center leading-none">
                    {step.slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href={`${base}/activities`}
              className="inline-flex items-center gap-2 text-brand-navy font-semibold hover:gap-3 transition-all text-sm"
            >
              Voir toutes les activités <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-brand-cream py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Par envie du moment</h2>
            <p className="text-gray-500 text-sm">Clique sur une catégorie pour filtrer les activités</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-3">
            {CATEGORIES.map(({ key, emoji, label }) => (
              <Link
                key={key}
                href={`${base}/activities?category=${key}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white bg-white hover:border-brand-navy hover:shadow-md transition-all group"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-brand-navy transition-colors text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ACTIVITIES ── */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">À venir à Paris</h2>
              <p className="text-gray-400 text-sm mt-1">Les prochains événements approuvés par la communauté</p>
            </div>
            <Link
              href={`${base}/activities`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:underline shrink-0"
            >
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16 bg-brand-cream rounded-3xl text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Aucun événement à venir pour le moment.</p>
              <Link href={`${base}/propose`} className="mt-3 inline-block text-brand-navy font-semibold hover:underline text-sm">
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
            <Link
              href={`${base}/activities`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:underline"
            >
              Voir toutes les activités <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── RECENTLY VIEWED ── */}
      <RecentlyViewed />

      {/* ── CTA ORGANISER ── */}
      <section className="bg-brand-navy py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-gold/15 rounded-2xl mb-5">
            <Star className="w-7 h-7 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Vous organisez un événement à Paris ?
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
            Proposez votre activité et touchez une communauté passionnée par la vie parisienne.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`${base}/propose`}
              className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-bold px-9 py-4 rounded-2xl hover:bg-yellow-300 transition-colors shadow-lg shadow-brand-gold/20"
            >
              Proposer un événement
              <ArrowRight className="w-4 h-4" />
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
