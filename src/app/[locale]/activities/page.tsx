"use client";
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon, Crosshair, ChevronUp, ChevronDown } from "lucide-react";
import { useActivities } from "@/lib/hooks/useActivities";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import CategoryFilter from "@/components/filters/CategoryFilter";
import SearchBar from "@/components/filters/SearchBar";
import FilterPanel from "@/components/filters/FilterPanel";
import ActivityCard from "@/components/activities/ActivityCard";
import { ActivitySkeleton, ActivitySkeletonGrid } from "@/components/activities/ActivitySkeleton";
import type { Activity, ActivityFilters } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-navy rounded-full animate-spin mx-auto mb-2" />
        <span className="text-sm">Chargement de la carte...</span>
      </div>
    </div>
  ),
});

export default function ActivitiesPage() {
  const [view, setView] = useState<"map" | "list">("list");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({ sortBy: "date" });
  const { lat, lng, locate, loading: locating } = useGeolocation();
  const { activities, loading, loadingMore, hasMore, loadMore } = useActivities(filters);

  // Read ?category= and ?q= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const q = params.get("q");
    if (cat || q) {
      setFilters((f) => ({
        ...f,
        ...(cat ? { category: cat as ActivityFilters["category"] } : {}),
        ...(q ? { search: q } : {}),
      }));
    }
  }, []);

  const handleActivityClick = useCallback((a: Activity) => {
    setSelectedActivity(a);
    setBottomSheetExpanded(false);
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-100 px-3 py-2.5 space-y-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={filters.search || ""}
              onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            />
          </div>
          <FilterPanel filters={filters} onChange={setFilters} />
          {/* View toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0">
            <button
              onClick={() => setView("list")}
              className={`p-2 transition-colors ${view === "list" ? "bg-brand-navy text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("map")}
              className={`p-2 transition-colors ${view === "map" ? "bg-brand-navy text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              title="Vue carte"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <CategoryFilter
            selected={filters.category || null}
            onChange={(cat) => setFilters((f) => ({ ...f, category: cat || undefined }))}
          />
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto bg-brand-cream">
          <div className="max-w-7xl mx-auto px-3 py-4">
            {loading ? (
              <ActivitySkeletonGrid />
            ) : activities.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg">Aucune activité trouvée</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">{activities.length} résultat(s){hasMore ? "+" : ""}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activities.map((a) => <ActivityCard key={a.id} activity={a} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 shadow-sm"
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-gray-300 border-t-brand-navy rounded-full animate-spin" />
                          Chargement...
                        </span>
                      ) : "Charger plus d'activités"}
                    </button>
                  </div>
                )}
                {loadingMore && !hasMore && (
                  <div className="flex justify-center mt-6 gap-2 text-sm text-gray-400">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-brand-navy rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Map view */}
      {view === "map" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col w-80 bg-brand-cream border-r border-gray-200 overflow-y-auto shrink-0">
            <div className="p-3 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)
              ) : activities.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-sm">Aucune activité trouvée</p>
                </div>
              ) : (
                activities.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleActivityClick(a)}
                    className={`cursor-pointer rounded-2xl transition-all ${
                      selectedActivity?.id === a.id ? "ring-2 ring-brand-navy" : ""
                    }`}
                  >
                    <ActivityCard activity={a} />
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Map */}
          <div className="flex-1 relative">
            <MapView
              activities={activities}
              userLat={lat}
              userLng={lng}
              onActivityClick={handleActivityClick}
              selectedId={selectedActivity?.id}
            />
            <button
              onClick={locate}
              disabled={locating}
              className="absolute top-3 right-3 z-10 bg-white shadow-md rounded-xl p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-60"
              title="Me localiser"
            >
              <Crosshair className={`w-5 h-5 text-brand-navy ${locating ? "animate-spin" : ""}`} />
            </button>

            {selectedActivity && !bottomSheetExpanded && (
              <div className="absolute bottom-16 left-3 right-3 md:hidden z-10 animate-slide-up">
                <ActivityCard activity={selectedActivity} compact />
              </div>
            )}

            {/* Mobile bottom sheet */}
            <div
              className={`absolute bottom-0 left-0 right-0 md:hidden z-20 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${
                bottomSheetExpanded ? "h-[60vh]" : "h-12"
              }`}
            >
              <button
                onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="font-semibold text-sm text-gray-900">
                  {loading ? "..." : `${activities.length} activité(s)`}
                </span>
                {bottomSheetExpanded
                  ? <ChevronDown className="w-5 h-5 text-gray-400" />
                  : <ChevronUp className="w-5 h-5 text-gray-400" />}
              </button>
              {bottomSheetExpanded && (
                <div className="overflow-y-auto h-[calc(100%-48px)] px-3 pb-4 space-y-3">
                  {loading
                    ? Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
                    : activities.map((a) => (
                        <div key={a.id} onClick={() => { handleActivityClick(a); setBottomSheetExpanded(false); }}>
                          <ActivityCard activity={a} />
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
