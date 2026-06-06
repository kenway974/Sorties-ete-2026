"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useGoingStatus(activityId: string, userId: string | null) {
  const [going, setGoing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("activity_interest_counts")
      .select("going_count")
      .eq("activity_id", activityId)
      .single()
      .then(({ data }) => setCount(Number(data?.going_count ?? 0)));

    if (userId) {
      supabase
        .from("activity_interest")
        .select("id")
        .eq("activity_id", activityId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data }) => setGoing(!!data));
    }
  }, [activityId, userId]);

  const toggle = useCallback(async () => {
    if (!userId || loading) return;
    setLoading(true);
    const supabase = createClient();
    if (going) {
      await supabase.from("activity_interest").delete().match({ activity_id: activityId, user_id: userId });
      setGoing(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("activity_interest").insert({ activity_id: activityId, user_id: userId });
      setGoing(true);
      setCount((c) => c + 1);
    }
    setLoading(false);
  }, [activityId, userId, going, loading]);

  return { going, count, toggle, loading };
}
