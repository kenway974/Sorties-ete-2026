// L'indice d'insolite — 1 à 10.
//
// Une seule question : combien de Parisiens savent que ça existe ? C'est le
// seul curseur du produit, et il se règle comme un bouton, pas comme un
// formulaire. Les notes sont attribuées par Claude à l'import.

export interface RarityBand {
  /** Borne basse incluse. */
  min: number;
  /** Borne haute incluse. */
  max: number;
  label: string;
  /** Ce que la note veut dire, en clair. */
  desc: string;
  hex: string;
}

export const RARITY_BANDS: RarityBand[] = [
  { min: 1, max: 2,  label: "Sage",        desc: "Dans tous les agendas",              hex: "#94A3B8" },
  { min: 3, max: 4,  label: "Décalé",      desc: "Un peu à côté du chemin",            hex: "#3B62D9" },
  { min: 5, max: 6,  label: "Peu commun",  desc: "Il faut chercher pour tomber dessus", hex: "#0E8A6E" },
  { min: 7, max: 8,  label: "Rare",        desc: "On en parle en rentrant",            hex: "#D97A26" },
  { min: 9, max: 10, label: "Introuvable", desc: "Presque personne ne sait que ça existe", hex: "#D6288F" },
];

/** Seuil d'admission : en dessous, un import est rejeté. */
export const RARITY_FLOOR = 5;

/** Note par défaut quand le scoring n'a pas encore tourné. */
export const RARITY_UNKNOWN = null;

export function rarityBand(rarity: number | null | undefined): RarityBand | null {
  if (rarity == null) return null;
  const r = Math.max(1, Math.min(10, Math.round(rarity)));
  return RARITY_BANDS.find((b) => r >= b.min && r <= b.max) ?? null;
}

export function rarityLabel(rarity: number | null | undefined): string {
  return rarityBand(rarity)?.label ?? "Non noté";
}

export function rarityHex(rarity: number | null | undefined): string {
  return rarityBand(rarity)?.hex ?? "#94A3B8";
}
