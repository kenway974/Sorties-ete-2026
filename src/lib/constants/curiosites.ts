// Les curiosités — la seule taxonomie du produit.
//
// On ne classe plus les sorties par genre (concert, expo, resto…) : le genre
// ne dit rien de ce qui rend une sortie mémorable. On les classe par ce qui
// les rend racontables — la sensation qu'il en reste le lendemain.
//
// Garder les slugs synchronisés avec :
//   - la colonne `activities.curiosity` (CHECK en base)
//   - le scoring des imports (supabase/functions/_shared/scoring.ts)

export type CuriosityKey =
  | "frisson"
  | "secret"
  | "savoir-faire"
  | "mise-en-scene"
  | "hors-du-temps"
  | "bizarrerie";

export interface CuriosityDef {
  key: CuriosityKey;
  emoji: string;
  /** Ce que ça fait, pas ce que c'est. */
  label: string;
  /** Une ligne pour la home et les en-têtes de page. */
  tagline: string;
  /** Ce qu'on y range concrètement — sert aussi de rubrique au scoring. */
  desc: string;
  /** Teinte principale (texte sur fond clair, accents). */
  hex: string;
  /** Variante sombre, pour le texte sur fond clair saturé. */
  hexDeep: string;
  /** Classes Tailwind du dégradé de vignette. */
  gradient: string;
}

export const CURIOSITES: CuriosityDef[] = [
  {
    key: "frisson",
    emoji: "🫀",
    label: "Ça remue",
    tagline: "Le cœur qui cogne, les jambes qui flanchent",
    desc: "Vertige, adrénaline, peur maîtrisée, sensations physiques fortes.",
    hex: "#E4383F",
    hexDeep: "#8E1620",
    gradient: "from-[#E4383F] to-[#8E1620]",
  },
  {
    key: "secret",
    emoji: "🗝️",
    label: "Ça se mérite",
    tagline: "Il faut savoir que ça existe",
    desc: "Lieux cachés, accès confidentiel, sur réservation, souterrains, adresses sans enseigne.",
    hex: "#0E8A6E",
    hexDeep: "#064E3F",
    gradient: "from-[#12B48F] to-[#064E3F]",
  },
  {
    key: "savoir-faire",
    emoji: "🔨",
    label: "Ça se fabrique",
    tagline: "Tu repars avec quelque chose",
    desc: "Ateliers, gestes rares, artisanat, apprentissage par les mains.",
    hex: "#D97A26",
    hexDeep: "#8A4409",
    gradient: "from-[#F2A03D] to-[#8A4409]",
  },
  {
    key: "mise-en-scene",
    emoji: "🎭",
    label: "Ça se joue",
    tagline: "Tu n'es pas seulement spectateur",
    desc: "Immersif, participatif, jeu, enquête, spectacle qui déborde de la scène.",
    hex: "#8B45D6",
    hexDeep: "#4C1D95",
    gradient: "from-[#A96BF0] to-[#4C1D95]",
  },
  {
    key: "hors-du-temps",
    emoji: "🕰️",
    label: "Ça sort du temps",
    tagline: "Un endroit que le siècle a oublié",
    desc: "Patrimoine confidentiel, lieux figés, ateliers d'un autre âge, mémoire de la ville.",
    hex: "#3B62D9",
    hexDeep: "#1E3A8A",
    gradient: "from-[#5B84F5] to-[#1E3A8A]",
  },
  {
    key: "bizarrerie",
    emoji: "🛸",
    label: "Ça n'a aucun sens",
    tagline: "Et c'est très bien comme ça",
    desc: "Absurde assumé, inclassable, collections improbables, tout ce qui ne rentre nulle part.",
    hex: "#D6288F",
    hexDeep: "#831843",
    gradient: "from-[#F056A5] to-[#831843]",
  },
];

export const CURIOSITY_KEYS = CURIOSITES.map((c) => c.key) as CuriosityKey[];

const byKey = new Map(CURIOSITES.map((c) => [c.key, c]));

/** Toujours une curiosité en retour — la "bizarrerie" est le fourre-tout assumé. */
export function curiosity(key: string | null | undefined): CuriosityDef {
  return byKey.get(key as CuriosityKey) ?? CURIOSITES[CURIOSITES.length - 1];
}

export function isCuriosity(key: string): key is CuriosityKey {
  return byKey.has(key as CuriosityKey);
}
