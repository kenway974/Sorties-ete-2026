"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity, ActivityFilters } from "@/types";

export function useActivities(filters: ActivityFilters = {}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersKey = JSON.stringify(filters);
  const prevKey = useRef("");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from("activities")
        .select(`
          *,
          creator:profiles!activities_creator_id_fkey(id, username, avatar_url),
          photos:activity_photos(id, url)
        `)
        .eq("status", "approved");

      const today = new Date().toISOString().split("T")[0];
      query = query.gte("date", today);

      if (filters.category) query = query.eq("category", filters.category);
      if (filters.search) query = query.ilike("title", `%${filters.search}%`);
      if (filters.priceFilter === "free") query = query.is("price", null);
      if (filters.priceFilter === "paid") query = query.not("price", "is", null);

      if (filters.dateFilter === "today") {
        query = query.eq("date", today);
      } else if (filters.dateFilter === "tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query.eq("date", tomorrow.toISOString().split("T")[0]);
      } else if (filters.dateFilter === "this_week") {
        const end = new Date();
        end.setDate(end.getDate() + 7);
        query = query.lte("date", end.toISOString().split("T")[0]);
      } else if (filters.dateFilter === "this_weekend") {
        const now = new Date();
        const day = now.getDay();
        const sat = new Date(now);
        sat.setDate(now.getDate() + (6 - day));
        const sun = new Date(sat);
        sun.setDate(sat.getDate() + 1);
        query = query.gte("date", sat.toISOString().split("T")[0]).lte("date", sun.toISOString().split("T")[0]);
      } else if (filters.dateFilter === "this_month") {
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        query = query.lte("date", end.toISOString().split("T")[0]);
      }

      const sortBy = filters.sortBy || "date";
      if (sortBy === "date") query = query.order("date", { ascending: true });
      else if (sortBy === "price") query = query.order("price", { ascending: true, nullsFirst: true });
      else query = query.order("date", { ascending: true });

      query = query.limit(50);

      const { data, error: err } = await query;
      if (err) throw err;
      setActivities((data as Activity[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    if (prevKey.current !== filtersKey) {
      prevKey.current = filtersKey;
      fetchActivities();
    }
  }, [filtersKey, fetchActivities]);

  useEffect(() => {
    fetchActivities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activities, loading, error, refetch: fetchActivities };
}
