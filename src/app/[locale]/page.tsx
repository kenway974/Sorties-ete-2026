"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { List, Map, Crosshair } from "lucide-react";
import { useActivities } from "@/lib/hooks/useActivities";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import CategoryFilter from "@/components/filters/CategoryFilter";
import SearchBar from "@/components/filters/SearchBar";
import FilterPanel from "@/components/filters/FilterPanel";
import ActivityCard from "@/components/activities/ActivityCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Activity, ActivityCategory, ActivityFilters } from "@/types";

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

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({ sortBy: "date" });
  const { lat, lng, locate } = useGeolocation();

  const { activities, loading } = useActivities(filters);

  const handleActivityClick = useCallback((a: Activity) => {
    setSelectedActivity(a);
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={filters.search || ""}
              onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            />
          </div>
          <FilterPanel filters={filters} onChange={setFilters} />
          {/* View toggle (mobile) */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden md:hidden">
            <button
              onClick={() => setView("map")}
              className={`p-2 transition-colors ${
                view === "map" ? "bg-brand-navy text-white" : "bg-white text-gray-600"
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 transition-colors ${
                view === "list" ? "bg-brand-navy text-white" : "bg-white text-gray-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        <CategoryFilter
          selected={filters.category || null}
          onChange={(cat) => setFilters((f) => ({ ...f, category: cat || undefined }))}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (desktop) / List view (mobile when list) */}
        <aside
          className={`${
            view === "list" ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-96 bg-brand-cream border-r border-gray-200 overflow-y-auto`}
        >
          <div className="p-3 space-y-3">
            {loading ? (
              <LoadingSpinner />
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p>{t("home.no_results")}</p>
              </div>
            ) : (
              activities.map((a) => (
                <div
                  key={a.id}
                  onClick={() => { handleActivityClick(a); setView("map"); }}
                  className="cursor-pointer"
                >
                  <ActivityCard activity={a} compact={false} />
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Map */}
        <div
          className={`${
            view === "list" ? "hidden" : "flex"
          } md:flex flex-1 relative`}
        >
          <MapView
            activities={activities}
            userLat={lat}
            userLng={lng}
            onActivityClick={handleActivityClick}
            selectedId={selectedActivity?.id}
          />

          {/* Locate me button */}
          <button
            onClick={locate}
            className="absolute top-3 right-3 z-10 bg-white shadow-md rounded-xl p-2.5 hover:bg-gray-50 transition-colors"
            title={t("map.locate_me")}
          >
            <Crosshair className="w-5 h-5 text-brand-navy" />
          </button>

          {/* Selected activity popup (mobile) */}
          {selectedActivity && (
            <div className="absolute bottom-4 left-4 right-4 md:hidden z-10 animate-slide-up">
              <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <ActivityCard activity={selectedActivity} compact />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
