"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Shuffle } from "lucide-react";

/**
 * Menait vers une fiche au hasard, ce qui gâchait le tirage : une seule carte,
 * puis un cul-de-sac. Mène maintenant à la Roulette, où l'on enchaîne.
 */
export default function DiscoverButton() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  return (
    <Link
      href={`/${locale}/roulette`}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-parchment/10 hover:bg-parchment/20 border border-parchment/20 hover:border-parchment/40 text-parchment font-medium transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm"
    >
      <Shuffle className="w-4 h-4 text-gold" />
      Fais tourner
    </Link>
  );
}
