"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Crosshair, Search, ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { useActivities } from "@/lib/hooks/useActivities";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import CategoryFilter from "@/components/filters/CategoryFilter";
import ActivityCard from "@/components/activities/ActivityCard";
import { ActivitySkeleton } from "@/components/activities/ActivitySkeleton";
import type { Activity, ActivityFilters } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-brand-navy-mid">
      <div className="text-center text-white/50">
        <div className="w-8 h-8 border-4 border-white/20 border-t-brand-gold rounded-full animate-spin mx-auto mb-2" />
        <span className="text-sm">Chargement de la carte...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({ sortBy: "date" });
  const [searchInput, setSearchInput] = useState("");
  const { lat, lng, locate, loading: locating } = useGeolocation();
  const { activities, loading } = useActivities(filters);

  const handleActivityClick = useCallback((a: Activity) => {
    setSelectedActivity(a);
    setBottomSheetExpanded(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/fr/activities?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="bg-brand-navy relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold rounded-full -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-red rounded-full translate-y-1/2" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Paris<span className="text-brand-gold">Sorties</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg mb-6 max-w-xl mx-auto">
            Découvrez les meilleures activités, concerts, expos et soirées à Paris
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Concert, expo, soirée..."
              className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-gold text-brand-navy px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-gold-dark transition-colors"
            >
              Chercher
            </button>
          </form>

          {/* Category pills */}
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
            <CategoryFilter
              selected={filters.category || null}
              onChange={(cat) => setFilters((f) => ({ ...f, category: cat || undefined }))}
            />
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="relative" style={{ height: "calc(100vh - 360px)", minHeight: "400px" }}>
        <MapView
          activities={activities}
          userLat={lat}
          userLng={lng}
          onActivityClick={handleActivityClick}
          selectedId={selectedActivity?.id}
        />

        {/* Locate button */}
        <button
          onClick={locate}
          disabled={locating}
          className="absolute top-3 right-3 z-10 bg-white shadow-md rounded-xl p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-60"
          title="Me localiser"
        >
          <Crosshair className={`w-5 h-5 text-brand-navy ${locating ? "animate-spin" : ""}`} />
        </button>

        {/* Mobile: Selected activity card */}
        {selectedActivity && !bottomSheetExpanded && (
          <div className="absolute bottom-16 left-3 right-3 md:hidden z-10 animate-slide-up">
            <ActivityCard activity={selectedActivity} compact />
          </div>
        )}

        {/* Mobile bottom sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 md:hidden z-20 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${
            bottomSheetExpanded ? "h-[55vh]" : "h-12"
          }`}
        >
          <button
            onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="font-semibold text-sm text-gray-900">
              {loading ? "..." : `${activities.length} activité(s) sur la carte`}
            </span>
            {bottomSheetExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
          </button>
          {bottomSheetExpanded && (
            <div className="overflow-y-auto h-[calc(100%-48px)] px-3 pb-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
              ) : (
                activities.map((a) => (
                  <div key={a.id} onClick={() => { handleActivityClick(a); setBottomSheetExpanded(false); }}>
                    <ActivityCard activity={a} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Featured activities strip */}
      <div className="hidden md:block bg-brand-cream border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? "Activités à venir" : `${activities.length} activité(s) disponible(s)`}
            </h2>
            <Link
              href="/fr/activities"
              className="flex items-center gap-1 text-sm font-medium text-brand-navy hover:underline"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-64">
                  <ActivitySkeleton />
                </div>
              ))
            ) : activities.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">Aucune activité pour le moment.</p>
            ) : (
              activities.slice(0, 8).map((a) => (
                <div
                  key={a.id}
                  className={`shrink-0 w-64 cursor-pointer rounded-2xl transition-all ${
                    selectedActivity?.id === a.id ? "ring-2 ring-brand-navy" : ""
                  }`}
                  onClick={() => handleActivityClick(a)}
                >
                  <ActivityCard activity={a} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
