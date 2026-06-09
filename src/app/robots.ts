import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/fr/admin",
          "/fr/profile",
          "/fr/favorites",
          "/fr/itinerary",
          "/fr/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
