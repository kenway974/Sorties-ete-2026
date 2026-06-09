import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/siteUrl";

export const revalidate = 3600;

const CATEGORIES = [
  "soirees", "concerts", "expositions", "restaurants", "bars",
  "sport", "culture", "famille", "etudiants", "networking", "loisirs",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/fr`,             lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/fr/activities`,  lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/fr/propose`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/fr/collections`, lastModified: now, changeFrequency: "daily",   priority: 0.6 },
    { url: `${base}/fr/legal/mentions-legales`,  lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/fr/legal/cgu`,              lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/fr/legal/confidentialite`,  lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${base}/fr/activities?category=${cat}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  let activityRoutes: MetadataRoute.Sitemap = [];
  let collectionRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    const [activitiesResult, collectionsResult] = await Promise.all([
      supabase
        .from("activities")
        .select("id, updated_at")
        .eq("status", "approved")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(5000),
      supabase
        .from("collections")
        .select("id, updated_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    activityRoutes = (activitiesResult.data ?? []).map((a) => ({
      url: `${base}/fr/activities/${a.id}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    collectionRoutes = (collectionsResult.data ?? []).map((c) => ({
      url: `${base}/fr/collections/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    // Never block the build on sitemap errors.
  }

  return [...staticRoutes, ...categoryRoutes, ...activityRoutes, ...collectionRoutes];
}
