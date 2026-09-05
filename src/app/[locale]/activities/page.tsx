"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon, Crosshair } from "lucide-react";
import { useActivities } from "@/lib/hooks/useActivities";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { usePullToRefresh } from "@/lib/hooks/usePullToRefresh";
import CuriosityFilter from "@/components/filters/CuriosityFilter";
import SearchBar from "@/components/filters/SearchBar";
import FilterPanel from "@/components/filters/FilterPanel";
import ActivityCard from "@/components/activities/ActivityCard";
import { ActivitySkeleton, ActivitySkeletonGrid } from "@/components/activities/ActivitySkeleton";
import BottomSheet from "@/components/ui/BottomSheet";
import BackToTop from "@/components/ui/BackToTop";
import { RARITY_FLOOR } from "@/lib/constants/rarity";
import type { Activity, ActivityFilters } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-parchment-dim dark:bg-ink">
      <div className="text-center text-ink/40 dark:text-parchment/40">
        <div className="w-8 h-8 border-4 border-ink/10 border-t-gold rounded-full animate-spin mx-auto mb-2" />
        <span className="text-sm">Chargement de la carte…</span>
      </div>
    </div>
  ),
});

export default function ActivitiesPage() {
  const [view, setView] = useState<"map" | "list">("list");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({
    sortBy: "rarity",
    minRarity: RARITY_FLOOR,
  });
  const { lat, lng, locate, loading: locating } = useGeolocation();
  const { activities, loading, loadingMore, hasMore, loadMore, refetch } = useActivities(filters);
  const listRef = useRef<HTMLDivElement>(null);

  // Lecture de ?curiosite= ?insolite= ?sort= ?q= ?date= ?view= au montage.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("curiosite");
    const q = params.get("q");
    const date = params.get("date") as ActivityFilters["dateFilter"] | null;
    const sort = params.get("sort") as ActivityFilters["sortBy"] | null;
    const insolite = Number(params.get("insolite"));
    if (params.get("view") === "map") setView("map");

    setFilters((f) => ({
      ...f,
      ...(cat ? { curiosity: cat as ActivityFilters["curiosity"] } : {}),
      ...(q ? { search: q } : {}),
      ...(date ? { dateFilter: date } : {}),
      ...(sort ? { sortBy: sort } : {}),
      // Le lien depuis les paliers de la home arrive avec un seuil ; on ne
      // descend jamais sous le plancher du catalogue.
      ...(Number.isFinite(insolite) && insolite >= 1
        ? { minRarity: Math.max(RARITY_FLOOR, Math.min(10, insolite)) }
        : {}),
    }));
  }, []);

  const { pullDistance, refreshing } = usePullToRefresh({
    onRefresh: refetch,
    scrollContainerRef: listRef,
  });

  const handleActivityClick = useCallback((a: Activity) => {
    setSelectedActivity(a);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100dvh-56px-64px)] md:h-[calc(100dvh-56px)]">
      {/* Toolbar */}
      <div className="sticky top-0 bg-parchment/95 dark:bg-ink/95 backdrop-blur-md border-b border-ink/8 dark:border-parchment/10 px-3 py-2.5 space-y-2.5 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={filters.search || ""}
              onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            />
          </div>
          <FilterPanel filters={filters} onChange={setFilters} />
          {/* View toggle */}
          <div className="flex rounded-xl border border-ink/12 dark:border-parchment/15 overflow-hidden shrink-0">
            <button
              onClick={() => setView("list")}
              className={`p-2 transition-colors ${view === "list" ? "bg-gold text-ink" : "bg-parchment dark:bg-ink-soft text-ink/60 dark:text-parchment/60 hover:bg-ink/5"}`}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("map")}
              className={`p-2 transition-colors ${view === "map" ? "bg-gold text-ink" : "bg-parchment dark:bg-ink-soft text-ink/60 dark:text-parchment/60 hover:bg-ink/5"}`}
              title="Vue carte"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <CuriosityFilter
            selected={filters.curiosity || null}
            onChange={(cat) => setFilters((f) => ({ ...f, curiosity: cat || undefined }))}
          />
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <div ref={listRef} className="flex-1 overflow-y-auto bg-parchment-dim dark:bg-ink-deep relative">
          {/* Pull-to-refresh indicator */}
          {(pullDistance > 0 || refreshing) && (
            <div
              className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center transition-all"
              style={{ top: Math.max(0, pullDistance - 40), opacity: Math.min(1, pullDistance / 60) }}
            >
              <div className={`w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center ${refreshing ? "animate-spin border-2 border-brand-navy border-t-transparent" : ""}`}>
                {!refreshing && <span className="text-sm" style={{ transform: `rotate(${pullDistance * 3}deg)`, display: "inline-block" }}>↓</span>}
              </div>
            </div>
          )}
          <div className="max-w-7xl mx-auto px-3 py-4">
            {loading ? (
              <ActivitySkeletonGrid />
            ) : activities.length === 0 ? (
              <div className="text-center py-20 max-w-sm mx-auto">
                <p className="text-5xl mb-4">🗝️</p>
                <p className="font-display text-xl text-ink dark:text-parchment mb-2">
                  Rien à ce niveau-là
                </p>
                <p className="text-sm text-ink/45 dark:text-parchment/45 leading-relaxed">
                  Le catalogue est volontairement petit : il vaut mieux six
                  trouvailles que six cents lignes. Baisse le cadran d&apos;insolite
                  ou élargis la date.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-ink/45 dark:text-parchment/45 mb-4">
                  {activities.length}{hasMore ? "+" : ""} trouvaille{activities.length > 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activities.map((a) => <ActivityCard key={a.id} activity={a} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-parchment dark:bg-ink-soft border border-ink/12 dark:border-parchment/15 rounded-2xl text-sm font-medium text-ink/70 dark:text-parchment/70 hover:border-gold transition-all disabled:opacity-60 shadow-card"
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-gray-300 border-t-gold rounded-full animate-spin" />
                          Chargement...
                        </span>
                      ) : "Charger plus d'activités"}
                    </button>
                  </div>
                )}
                {loadingMore && !hasMore && (
                  <div className="flex justify-center mt-6 gap-2 text-sm text-gray-400">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gold rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
          <BackToTop scrollContainerRef={listRef} />
        </div>
      )}

      {/* Map view */}
      {view === "map" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col w-80 bg-parchment-dim dark:bg-ink border-r border-ink/8 dark:border-parchment/10 overflow-y-auto shrink-0">
            <div className="p-3 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)
              ) : activities.length === 0 ? (
                <div className="text-center py-16 text-ink/40 dark:text-parchment/40">
                  <p className="text-4xl mb-3">🗝️</p>
                  <p className="text-sm">Rien à ce niveau-là</p>
                </div>
              ) : (
                activities.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleActivityClick(a)}
                    className={`cursor-pointer rounded-2xl transition-all ${
                      selectedActivity?.id === a.id ? "ring-2 ring-gold" : ""
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
              className="absolute top-3 right-3 z-10 bg-parchment dark:bg-ink-soft shadow-card rounded-xl p-2.5 hover:bg-parchment-dim transition-colors disabled:opacity-60"
              title="Me localiser"
            >
              <Crosshair className={`w-5 h-5 text-gold ${locating ? "animate-spin" : ""}`} />
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
                  <p className="font-semibold text-sm text-ink dark:text-parchment pb-1">
                    {loading ? "Chargement…" : `${activities.length} trouvaille${activities.length !== 1 ? "s" : ""}`}
                    <span className="text-ink/40 dark:text-parchment/40 font-normal"> · glisse pour explorer</span>
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
                            selectedActivity?.id === a.id ? "ring-2 ring-gold" : ""
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
