import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activités à Paris",
  description:
    "Concerts, expositions, soirées, sport, restaurants… Filtrez toutes les activités et événements à Paris par date, catégorie et budget.",
  alternates: { canonical: "/fr/activities" },
  openGraph: {
    title: "Activités à Paris · ParisSorties",
    description:
      "Filtrez concerts, expos, soirées, sport et restos à Paris. Vue carte ou liste, gratuit ou payant, aujourd'hui ou ce week-end.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Activités à Paris · ParisSorties",
    description: "Filtrez toutes les activités à Paris : concerts, expos, soirées, sport et plus.",
  },
};

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
