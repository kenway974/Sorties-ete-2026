"use client";
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon, Crosshair } from "lucide-react";
import { useActivities } from "@/lib/hooks/useActivities";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import CategoryFilter from "@/components/filters/CategoryFilter";
import SearchBar from "@/components/filters/SearchBar";
import FilterPanel from "@/components/filters/FilterPanel";
import ActivityCard from "@/components/activities/ActivityCard";
import { ActivitySkeleton, ActivitySkeletonGrid } from "@/components/activities/ActivitySkeleton";
import BottomSheet from "@/components/ui/BottomSheet";
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
  const [filters, setFilters] = useState<ActivityFilters>({ sortBy: "date" });
  const { lat, lng, locate, loading: locating } = useGeolocation();
  const { activities, loading, loadingMore, hasMore, loadMore } = useActivities(filters);

  // Read ?category=, ?q=, ?date= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const q = params.get("q");
    const date = params.get("date") as ActivityFilters["dateFilter"] | null;
    if (cat || q || date) {
      setFilters((f) => ({
        ...f,
        ...(cat ? { category: cat as ActivityFilters["category"] } : {}),
        ...(q ? { search: q } : {}),
        ...(date ? { dateFilter: date } : {}),
      }));
    }
  }, []);

  const handleActivityClick = useCallback((a: Activity) => {
    setSelectedActivity(a);
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-3 py-2.5 space-y-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={filters.search || ""}
              onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            />
          </div>
          <FilterPanel filters={filters} onChange={setFilters} />
          {/* View toggle */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
            <button
              onClick={() => setView("list")}
              className={`p-2 transition-colors ${view === "list" ? "bg-brand-navy text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("map")}
              className={`p-2 transition-colors ${view === "map" ? "bg-brand-navy text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
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
        <div className="flex-1 overflow-y-auto bg-brand-cream dark:bg-[#0d111a]">
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{activities.length} résultat(s){hasMore ? "+" : ""}</p>
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
          <aside className="hidden md:flex flex-col w-80 bg-brand-cream dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto shrink-0">
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
              className="absolute top-3 right-3 z-10 bg-white dark:bg-gray-800 shadow-md rounded-xl p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
              title="Me localiser"
            >
              <Crosshair className={`w-5 h-5 text-brand-navy dark:text-brand-gold ${locating ? "animate-spin" : ""}`} />
            </button>

            {/* Selected activity floating card (mobile, when sheet collapsed) */}
            {selectedActivity && (
              <div className="absolute bottom-[14vh] left-3 right-3 md:hidden z-10 animate-slide-up">
                <ActivityCard activity={selectedActivity} compact />
              </div>
            )}

            {/* Mobile draggable bottom sheet */}
            <div className="md:hidden">
              <BottomSheet
                snapPoints={[0.12, 0.5, 0.9]}
                header={
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 pb-1">
                    {loading ? "Chargement..." : `${activities.length} activité${activities.length !== 1 ? "s" : ""}`}
                    <span className="text-gray-400 font-normal"> · glissez pour explorer</span>
                  </p>
                }
              >
                <div className="space-y-3">
                  {loading
                    ? Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
                    : activities.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => handleActivityClick(a)}
                          className={`cursor-pointer rounded-2xl transition-all ${
                            selectedActivity?.id === a.id ? "ring-2 ring-brand-navy" : ""
                          }`}
                        >
                          <ActivityCard activity={a} />
                        </div>
                      ))}
                </div>
              </BottomSheet>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
