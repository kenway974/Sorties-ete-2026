import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposer une activité",
  description:
    "Vous organisez un événement à Paris ? Proposez-le gratuitement sur ParisSorties et touchez des milliers de Parisiens.",
  alternates: { canonical: "/fr/propose" },
  openGraph: {
    title: "Proposer une activité · ParisSorties",
    description: "Partagez votre événement avec la communauté ParisSorties. Soumission gratuite, visible après validation.",
    type: "website",
  },
};

export default function ProposeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
