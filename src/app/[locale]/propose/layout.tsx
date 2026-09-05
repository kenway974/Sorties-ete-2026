import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposer une activité",
  description:
    "Tu connais un endroit que personne ne connaît ? Propose-le : il passera par le même crible d'insolite que les autres.",
  alternates: { canonical: "/fr/propose" },
  openGraph: {
    title: "Proposer une sortie · Hors-Piste",
    description: "Les meilleures adresses ne sont dans aucun agenda — elles se transmettent. Propose la tienne.",
    type: "website",
  },
};

export default function ProposeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
