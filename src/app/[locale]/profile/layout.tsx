import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Gérez vos informations personnelles, vos préférences et vos notifications Hors-Piste.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
