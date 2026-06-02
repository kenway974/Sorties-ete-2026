"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity } from "@/types";

export function useRealtimeActivities(
  onInsert?: (activity: Activity) => void,
  onUpdate?: (activity: Activity) => void
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("activities_realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "activities",
        filter: "status=eq.approved",
      }, (payload) => {
        onInsert?.(payload.new as Activity);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "activities",
      }, (payload) => {
        onUpdate?.(payload.new as Activity);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
