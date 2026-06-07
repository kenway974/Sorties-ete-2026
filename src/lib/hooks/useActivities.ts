"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { futureOrClause } from "@/lib/utils/parisTime";
import type { Activity, ActivityFilters } from "@/types";

const PAGE_SIZE = 20;

export function useActivities(filters: ActivityFilters = {}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const filtersKey = JSON.stringify(filters);
  const prevKey = useRef("");

  const buildQuery = useCallback((supabase: ReturnType<typeof createClient>, offset: number) => {
    let query = supabase
      .from("activities")
      .select(`
        *,
        creator:profiles!activities_creator_id_fkey(id, username, avatar_url),
        photos:activity_photos(id, url)
      `)
      .eq("status", "approved");

    const today = new Date().toISOString().split("T")[0];
    // Hide events that are already past — to the HOUR (future date, or today but
    // start time not yet passed). Uses Paris-local now.
    query = query.or(futureOrClause());

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.search) query = query.ilike("title", `%${filters.search}%`);
    if (filters.priceFilter === "free") query = query.is("price", null);
    if (filters.priceFilter === "paid") query = query.not("price", "is", null);

    // Custom date range
    if (filters.dateFrom) query = query.gte("date", filters.dateFrom);
    if (filters.dateTo) query = query.lte("date", filters.dateTo);
    // Time-of-day range (applies across all matching dates)
    if (filters.timeFrom) query = query.gte("time", filters.timeFrom.length === 5 ? filters.timeFrom + ":00" : filters.timeFrom);
    if (filters.timeTo) query = query.lte("time", filters.timeTo.length === 5 ? filters.timeTo + ":00" : filters.timeTo);

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

    return query.range(offset, offset + PAGE_SIZE - 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    offsetRef.current = 0;
    try {
      const supabase = createClient();
      const { data, error: err } = await buildQuery(supabase, 0);
      if (err) throw err;
      const fetched = (data as Activity[]) || [];
      setActivities(fetched);
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextOffset = offsetRef.current + PAGE_SIZE;
    offsetRef.current = nextOffset;
    try {
      const supabase = createClient();
      const { data, error: err } = await buildQuery(supabase, nextOffset);
      if (err) throw err;
      const fetched = (data as Activity[]) || [];
      setActivities((prev) => [...prev, ...fetched]);
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoadingMore(false);
    }
  }, [buildQuery, loadingMore, hasMore]);

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

  return { activities, loading, loadingMore, hasMore, error, refetch: fetchActivities, loadMore };
}
