import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Rejoignez ParisSorties pour sauvegarder vos activités favorites et rester informé des événements parisiens.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
