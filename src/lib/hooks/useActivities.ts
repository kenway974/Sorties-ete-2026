"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity, ActivityFilters } from "@/types";

export function useActivities(filters: ActivityFilters = {}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from("activities")
        .select(`
          *,
          creator:profiles!activities_creator_id_fkey(id, username, avatar_url),
          photos:activity_photos(id, url),
          registrations:activity_registrations(count)
        `)
        .eq("status", "approved");

      if (filters.category) query = query.eq("category", filters.category);
      if (filters.search) query = query.ilike("title", `%${filters.search}%`);
      if (filters.priceFilter === "free") query = query.is("price", null);
      if (filters.priceFilter === "paid") query = query.not("price", "is", null);

      const today = new Date().toISOString().split("T")[0];
      if (filters.dateFilter === "today") query = query.eq("date", today);
      if (filters.dateFilter === "this_week") {
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        query = query.gte("date", today).lte("date", endOfWeek.toISOString().split("T")[0]);
      }

      query = query.gte("date", today).order("date", { ascending: true }).limit(50);

      const { data, error: err } = await query;
      if (err) throw err;
      setActivities((data as Activity[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { activities, loading, error, refetch: fetch };
}
