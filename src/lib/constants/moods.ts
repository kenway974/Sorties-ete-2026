// Shared "mood / envie" vocabulary — the emotional intent & context behind going out.
// Distinct from category (WHAT) and vibe tags (the atmosphere): moods answer
// WHY / WITH WHOM / in which state of mind the user wants to go out.
//
// Keep slugs in sync with:
//   - DB column `activities.moods` (text[], no CHECK — free values)
//   - import edge functions (inferMoods) in supabase/functions/import-*/index.ts
//   - the backfill migration

export interface MoodDef {
  key: string;
  emoji: string;
  label: string;
  /** Short description shown on the home mood selector. */
  desc: string;
  /** Optional grouping for UI sections. */
  group: "ambiance" | "date" | "social" | "interet";
}

export const MOODS: MoodDef[] = [
  // — Social / avec qui —
  { key: "rencontrer",      emoji: "🤝", label: "Rencontrer du monde", desc: "Faire de nouvelles rencontres", group: "social" },
  { key: "entre-amis",      emoji: "🍻", label: "Entre amis",          desc: "Un bon moment à plusieurs", group: "social" },
  { key: "solo",            emoji: "🎭", label: "Sortir solo",         desc: "Profiter seul, à son rythme", group: "social" },
  { key: "famille",         emoji: "👨‍👩‍👧", label: "En famille",       desc: "Avec les enfants", group: "social" },

  // — Date / rendez-vous —
  { key: "date-romantique", emoji: "💘", label: "Date romantique",     desc: "Un rendez-vous en amoureux", group: "date" },
  { key: "date-fun",        emoji: "😄", label: "Date fun",            desc: "Un rdv joueur et décontracté", group: "date" },
  { key: "date-chill",      emoji: "☕", label: "Date tranquille",     desc: "Un rdv simple et posé", group: "date" },

  // — Ambiance / état d'esprit —
  { key: "ressourcer",      emoji: "🧘", label: "Se ressourcer",       desc: "Calme, détente, bien-être", group: "ambiance" },
  { key: "air",             emoji: "🌿", label: "Prendre l'air",       desc: "Plein air, nature", group: "ambiance" },
  { key: "decompresser",    emoji: "🔥", label: "Décompresser",        desc: "Fun, festif, lâcher prise", group: "ambiance" },
  { key: "sensations",      emoji: "🎢", label: "Sensations fortes",   desc: "Adrénaline, frissons", group: "ambiance" },
  { key: "nocturne",        emoji: "🌃", label: "Vie nocturne",        desc: "Sortir le soir, la nuit", group: "ambiance" },
  { key: "chic",            emoji: "🥂", label: "Chic & classe",       desc: "Élégant, raffiné", group: "ambiance" },

  // — Centres d'intérêt —
  { key: "decouvrir",       emoji: "✨", label: "Découvrir",           desc: "Curiosité, nouveauté", group: "interet" },
  { key: "insolite",        emoji: "🤯", label: "Insolite",            desc: "Hors du commun", group: "interet" },
  { key: "creatif",         emoji: "🎨", label: "Créatif / DIY",       desc: "Mettre la main à la pâte", group: "interet" },
  { key: "gourmand",        emoji: "😋", label: "Gourmand",            desc: "Manger, déguster", group: "interet" },
  { key: "esprit",          emoji: "🧠", label: "Nourrir l'esprit",    desc: "Apprendre, culture", group: "interet" },
];

export const MOOD_LABELS: Record<string, string> = Object.fromEntries(
  MOODS.map((m) => [m.key, m.label])
);

export const MOOD_EMOJIS: Record<string, string> = Object.fromEntries(
  MOODS.map((m) => [m.key, m.emoji])
);

export const MOOD_GROUPS: { key: MoodDef["group"]; label: string }[] = [
  { key: "date", label: "Pour un rendez-vous" },
  { key: "social", label: "Avec qui" },
  { key: "ambiance", label: "Quelle ambiance" },
  { key: "interet", label: "Centres d'intérêt" },
];
