"use client";
import { useState } from "react";
import { useActivities } from "@/lib/hooks/useActivities";
import ActivityCard from "@/components/activities/ActivityCard";
import { ActivitySkeletonGrid } from "@/components/activities/ActivitySkeleton";
import SearchBar from "@/components/filters/SearchBar";
import CategoryFilter from "@/components/filters/CategoryFilter";
import FilterPanel from "@/components/filters/FilterPanel";
import type { ActivityFilters } from "@/types";

export default function ActivitiesPage() {
  const [filters, setFilters] = useState<ActivityFilters>({ sortBy: "date" });
  const { activities, loading } = useActivities(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Activités</h1>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar value={filters.search || ""} onChange={(v) => setFilters((f) => ({ ...f, search: v }))} />
          </div>
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
        <CategoryFilter selected={filters.category || null} onChange={(cat) => setFilters((f) => ({ ...f, category: cat || undefined }))} />
      </div>

      {loading ? (
        <ActivitySkeletonGrid />
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg">Aucune activité trouvée</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{activities.length} résultat(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activities.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        </>
      )}
    </div>
  );
}
