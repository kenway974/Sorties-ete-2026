// Scoring d'insolite — le filtre d'entrée du produit.
//
// Les agendas ouverts (Que Faire à Paris, OpenAgenda) déversent du tout-venant :
// c'est exactement ce qui avait fabriqué un annuaire sans ligne éditoriale.
// Chaque événement importé passe donc par Claude, qui lui attribue une
// curiosité et un indice d'insolite. En dessous du seuil, on n'importe pas.
//
// Repli : sans clé API (ou en cas de panne), on retombe sur le classement par
// mots-clés et on laisse l'indice à null — l'événement part alors en attente
// plutôt que d'être publié à l'aveugle.

import Anthropic from "npm:@anthropic-ai/sdk@0.70.1";
import { zodOutputFormat } from "npm:@anthropic-ai/sdk@0.70.1/helpers/zod";
import { z } from "npm:zod@3.25.76";
import { CURIOSITY_KEYS, inferCuriosity, type CuriosityKey } from "./curiosites.ts";

/**
 * En dessous, l'événement n'entre pas dans le catalogue.
 * Doit rester aligné sur RARITY_FLOOR dans src/lib/constants/rarity.ts —
 * les edge functions (Deno) et l'app (Next) ne partagent pas de module.
 */
export const RARITY_FLOOR = 5;

/** Nombre d'événements notés par appel. Compromis coût / taille de réponse. */
const BATCH_SIZE = 20;

export interface ScorableEvent {
  /** Identifiant local, seulement utilisé pour recoller les notes. */
  ref: string;
  title: string;
  description: string;
  tags?: string[];
  price?: number | null;
}

export interface Score {
  curiosity: CuriosityKey;
  /** 1–10, ou null si le scoring n'a pas pu tourner. */
  rarity: number | null;
  note: string | null;
}

const ScoreSchema = z.object({
  scores: z.array(
    z.object({
      ref: z.string(),
      curiosity: z.enum(CURIOSITY_KEYS as [CuriosityKey, ...CuriosityKey[]]),
      rarity: z.number().int().min(1).max(10),
      note: z.string(),
    }),
  ),
});

const RUBRIC = `Tu tries des événements parisiens pour un guide qui ne référence QUE l'insolite.
Le guide assume d'être petit : mieux vaut rejeter dix bonnes soirées qu'accepter un seul événement banal.

Pour chaque événement, donne deux choses.

1. LA CURIOSITÉ — ce qu'il en reste le lendemain quand on le raconte :
- "frisson" : vertige, adrénaline, peur maîtrisée, sensation physique forte.
- "secret" : lieu caché, accès confidentiel, souterrain, sans enseigne, il faut savoir que ça existe.
- "savoir-faire" : on y apprend un geste, on repart avec quelque chose qu'on a fait de ses mains.
- "mise-en-scene" : immersif, participatif, on n'est pas seulement spectateur.
- "hors-du-temps" : patrimoine confidentiel, lieu figé, mémoire oubliée de la ville.
- "bizarrerie" : absurde assumé, inclassable, collection improbable.
Choisis la dominante. En cas d'hésitation réelle, "bizarrerie" est le fourre-tout.

2. L'INDICE D'INSOLITE — une seule question : combien de Parisiens savent que ça existe ?
- 1-2 : dans tous les agendas. Concert en salle, expo de musée national, brocante, match, cours de yoga, marché de Noël, séance de cinéma, apéro, soirée club.
- 3-4 : un peu à côté du chemin, mais ça reste un format connu.
- 5-6 : peu commun, il faut chercher pour tomber dessus.
- 7-8 : rare, on en parle en rentrant.
- 9-10 : presque personne ne sait que ça existe.

Sois sévère. La note médiane d'un agenda municipal doit tourner autour de 2 ou 3.
Ne monte pas la note parce que l'événement est de qualité, festif ou gratuit :
la question n'est pas "est-ce bien ?" mais "est-ce que ça sort de l'ordinaire ?".
Un vocabulaire marketing ("expérience unique", "incontournable", "immanquable")
n'est pas une preuve : juge sur ce qui se passe réellement.

"note" : une phrase courte en français justifiant l'indice.
Renvoie une entrée par événement, en reprenant son "ref" à l'identique.`;

function fallback(events: ScorableEvent[]): Map<string, Score> {
  const out = new Map<string, Score>();
  for (const e of events) {
    out.set(e.ref, {
      curiosity: inferCuriosity(e.title, e.description, e.tags ?? []),
      rarity: null,
      note: null,
    });
  }
  return out;
}

async function scoreOneBatch(
  client: Anthropic,
  events: ScorableEvent[],
): Promise<Map<string, Score>> {
  const payload = events.map((e) => ({
    ref: e.ref,
    titre: e.title.slice(0, 200),
    description: e.description.slice(0, 900),
    tags: (e.tags ?? []).slice(0, 8),
    prix: e.price ?? "gratuit",
  }));

  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 4000,
    system: [
      // Barème stable en tête de requête : si le prompt dépasse le seuil de
      // cache du modèle, les lots suivants le relisent à prix réduit.
      { type: "text", text: RUBRIC, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: JSON.stringify(payload, null, 1) }],
    output_config: { format: zodOutputFormat(ScoreSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("réponse de scoring illisible");

  const out = new Map<string, Score>();
  for (const s of parsed.scores) {
    out.set(s.ref, { curiosity: s.curiosity, rarity: s.rarity, note: s.note });
  }
  return out;
}

/**
 * Note une liste d'événements. Ne lève jamais : tout lot en échec retombe sur
 * le classement par mots-clés, pour qu'une panne d'API n'interrompe pas
 * l'import — elle le met simplement en attente de modération.
 */
export async function scoreEvents(events: ScorableEvent[]): Promise<Map<string, Score>> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey || events.length === 0) return fallback(events);

  const client = new Anthropic({ apiKey });
  const out = new Map<string, Score>();

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    try {
      const scored = await scoreOneBatch(client, batch);
      for (const e of batch) {
        // Un événement que le modèle a oublié retombe sur le repli.
        out.set(e.ref, scored.get(e.ref) ?? fallback([e]).get(e.ref)!);
      }
    } catch (err) {
      console.error(`[scoring] lot ${i / BATCH_SIZE} en échec :`, String(err));
      for (const [ref, score] of fallback(batch)) out.set(ref, score);
    }
  }

  return out;
}

/** Un événement entre au catalogue s'il est noté et atteint le seuil. */
export function passesFloor(score: Score): boolean {
  return score.rarity !== null && score.rarity >= RARITY_FLOOR;
}
