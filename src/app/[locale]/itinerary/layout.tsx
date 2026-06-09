import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon itinéraire",
  description: "Planifiez votre journée parisienne en organisant vos activités favorites en un itinéraire optimisé.",
  robots: { index: false, follow: false },
};

export default function ItineraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
