// Shared "mood / envie" vocabulary — the emotional intent behind going out.
// Distinct from category (WHAT) and vibe tags (the atmosphere): moods answer
// WHY / in which state of mind the user wants to go out.
//
// Keep slugs in sync with:
//   - DB column `activities.moods` (text[])
//   - import edge functions (inferMoods) in supabase/functions/import-*/index.ts

export interface MoodDef {
  key: string;
  emoji: string;
  label: string;
  /** Short description shown on the home mood selector. */
  desc: string;
}

export const MOODS: MoodDef[] = [
  { key: "rencontrer",   emoji: "🤝", label: "Rencontrer du monde", desc: "Faire de nouvelles rencontres" },
  { key: "solo",         emoji: "🎭", label: "Sortir solo",          desc: "Profiter seul, sans avoir à parler" },
  { key: "ressourcer",   emoji: "🧘", label: "Se ressourcer",        desc: "Calme, détente, recharger les batteries" },
  { key: "air",          emoji: "🌿", label: "Prendre l'air",        desc: "Plein air, nature, respirer" },
  { key: "decouvrir",    emoji: "✨", label: "Découvrir",            desc: "Curiosité, sortir de sa zone de confort" },
  { key: "decompresser", emoji: "🔥", label: "Décompresser",         desc: "Fun, festif, lâcher prise" },
  { key: "esprit",       emoji: "🧠", label: "Nourrir l'esprit",     desc: "Apprendre, culture, réfléchir" },
];

export const MOOD_LABELS: Record<string, string> = Object.fromEntries(
  MOODS.map((m) => [m.key, m.label])
);

export const MOOD_EMOJIS: Record<string, string> = Object.fromEntries(
  MOODS.map((m) => [m.key, m.emoji])
);
