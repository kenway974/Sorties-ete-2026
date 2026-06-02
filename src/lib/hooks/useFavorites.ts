"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useFavorites(userId: string | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) { setFavoriteIds(new Set()); return; }
    const supabase = createClient();
    supabase
      .from("favorites")
      .select("activity_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setFavoriteIds(new Set(data.map((f) => f.activity_id)));
      });
  }, [userId]);

  const toggle = async (activityId: string) => {
    if (!userId) return;
    const supabase = createClient();
    const isFav = favoriteIds.has(activityId);
    if (isFav) {
      await supabase.from("favorites").delete().match({ user_id: userId, activity_id: activityId });
      setFavoriteIds((prev) => { const n = new Set(prev); n.delete(activityId); return n; });
    } else {
      await supabase.from("favorites").insert({ user_id: userId, activity_id: activityId });
      setFavoriteIds((prev) => new Set([...prev, activityId]));
    }
  };

  return { favoriteIds, toggle, loading };
}
