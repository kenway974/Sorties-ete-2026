import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/siteUrl";

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/fr`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/fr/activities`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/fr/propose`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  let activityRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activities")
      .select("id, updated_at, date")
      .eq("status", "approved")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(5000);

    activityRoutes = (data ?? []).map((a) => ({
      url: `${base}/fr/activities/${a.id}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Sitemap should never throw the build; fall back to static routes.
  }

  return [...staticRoutes, ...activityRoutes];
}
