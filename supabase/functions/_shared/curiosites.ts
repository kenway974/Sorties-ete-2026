// Vocabulaire des curiosités, côté edge functions.
// Doit rester aligné sur src/lib/constants/curiosites.ts et sur le CHECK
// de la colonne activities.curiosity.

export type CuriosityKey =
  | "frisson"
  | "secret"
  | "savoir-faire"
  | "mise-en-scene"
  | "hors-du-temps"
  | "bizarrerie";

export const CURIOSITY_KEYS: CuriosityKey[] = [
  "frisson", "secret", "savoir-faire", "mise-en-scene", "hors-du-temps", "bizarrerie",
];

export function isCuriosity(v: string): v is CuriosityKey {
  return (CURIOSITY_KEYS as string[]).includes(v);
}

/**
 * Classement par mots-clés — repli hors ligne quand le scoring Claude n'est pas
 * disponible (pas de clé API, quota, panne). Volontairement grossier : il ne
 * sert qu'à ne jamais écrire de valeur invalide en base.
 */
export function inferCuriosity(title: string, description: string, tags: string[] = []): CuriosityKey {
  const text = [title, description, ...tags].join(" ").toLowerCase();
  const has = (re: RegExp) => re.test(text);

  if (has(/vertige|adr[ée]nalin|saut|tyrolienne|escalad|karting|paintball|accrobranch|frisson|chute libre|apn[ée]e|plong[ée]e|parachut|acrobat/))
    return "frisson";
  if (has(/secret|cach[ée]|confidentiel|souterrain|catacombe|carri[èe]re|sur r[ée]servation|acc[èe]s limit[ée]|clandestin|spe?akeasy|derri[èe]re la porte|insoup[çc]onn/))
    return "secret";
  if (has(/atelier|initiation|apprend|fabriqu|poterie|c[ée]ramique|forge|reliure|verrerie|souffl(age|eur) de verre|savoir.faire|artisan|cours de|masterclass|s[ée]rigraphie/))
    return "savoir-faire";
  if (has(/immersi|participatif|escape.game|enqu[êe]te|murder|d[ée]ambulatoire|spectateur.acteur|jeu de r[ôo]le|interactif|d[ée]guis/))
    return "mise-en-scene";
  if (has(/patrimoine|h[ôo]tel particulier|xix|xviii|si[èe]cle|ancienne? (usine|gare|station)|vestige|conservatoire|m[ée]moire|d'antan|historique|archive/))
    return "hors-du-temps";

  return "bizarrerie";
}
