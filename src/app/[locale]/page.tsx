import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Calendar, ArrowRight, Zap, Users, Star } from "lucide-react";
import ActivityCard from "@/components/activities/ActivityCard";

const CATEGORIES = [
  { key: "soirees", emoji: "🎉", label: "Soirées" },
  { key: "concerts", emoji: "🎵", label: "Concerts" },
  { key: "expositions", emoji: "🎨", label: "Expositions" },
  { key: "restaurants", emoji: "🍽️", label: "Restaurants" },
  { key: "bars", emoji: "🍻", label: "Bars" },
  { key: "sport", emoji: "⚽", label: "Sport" },
  { key: "culture", emoji: "🏛️", label: "Culture" },
  { key: "famille", emoji: "👨‍👩‍👧", label: "Famille" },
  { key: "etudiants", emoji: "🎓", label: "Étudiants" },
  { key: "networking", emoji: "🤝", label: "Networking" },
  { key: "loisirs", emoji: "🎮", label: "Loisirs" },
];

export default async function HomePage() {
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
      {/* Hero */}
      <section className="relative bg-brand-navy overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-gold rounded-full" />
          <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-brand-red rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-brand-gold text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-gold/30">
            <Zap className="w-3.5 h-3.5" />
            Paris en temps réel
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Trouvez votre prochaine<br />
            <span className="text-brand-gold">sortie à Paris</span>
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Concerts, expos, soirées, restaurants — tout ce qui se passe dans la capitale, au bon moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/fr/activities"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-bold px-8 py-3.5 rounded-2xl hover:bg-brand-gold-dark transition-colors text-base shadow-lg"
            >
              Explorer les activités
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/fr/propose"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-medium px-8 py-3.5 rounded-2xl hover:bg-white/20 transition-colors text-base border border-white/20"
            >
              Proposer un événement
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-brand-navy-mid border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center gap-8 md:gap-16 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-gold" />
            <span>Mis à jour chaque jour</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-gold" />
            <span>Toute l&apos;Île-de-France</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-gold" />
            <span>Communauté active</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Explorez par catégorie</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {CATEGORIES.map(({ key, emoji, label }) => (
              <Link
                key={key}
                href={`/fr/activities?category=${key}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-brand-navy hover:bg-brand-navy/5 transition-all group"
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

      {/* Featured activities */}
      <section className="bg-brand-cream py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Prochainement à Paris</h2>
              <p className="text-sm text-gray-500 mt-1">Les événements qui arrivent bientôt</p>
            </div>
            <Link
              href="/fr/activities"
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:underline"
            >
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucun événement à venir pour le moment.</p>
              <Link href="/fr/propose" className="mt-3 inline-block text-brand-navy font-medium hover:underline text-sm">
                Soyez le premier à proposer un événement →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-brand-navy py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Star className="w-8 h-8 text-brand-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Vous organisez un événement à Paris ?</h2>
          <p className="text-white/60 mb-6">
            Proposez votre événement et touchez une communauté passionnée par la vie parisienne.
          </p>
          <Link
            href="/fr/propose"
            className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy font-bold px-8 py-3.5 rounded-2xl hover:bg-brand-gold-dark transition-colors"
          >
            Proposer un événement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
