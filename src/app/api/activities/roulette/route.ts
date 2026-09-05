import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { futureOrClause } from "@/lib/utils/parisTime";
import { rateLimit, getRateLimitKey } from "@/lib/utils/rateLimit";
import { CURIOSITY_KEYS } from "@/lib/constants/curiosites";
import { RARITY_FLOOR } from "@/lib/constants/rarity";

/** Taille d'un paquet. Assez pour tenir quelques tirages sans re-solliciter. */
const DECK_SIZE = 12;

/** Garde-fou : au-delà, on ne trie plus les identifiants côté serveur. */
const MAX_POOL = 2000;

const querySchema = z.object({
  rarity: z.coerce.number().int().min(1).max(10).optional(),
  curiosite: z.enum(CURIOSITY_KEYS as [string, ...string[]]).optional(),
  // Identifiants déjà vus dans la session, séparés par des virgules.
  vus: z.string().max(3000).optional(),
});

export async function GET(request: NextRequest) {
  const limited = rateLimit(getRateLimitKey(request, "roulette"), { limit: 60, windowSecs: 60 });
  if (limited) return limited;

  const parsed = querySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }
  const { rarity, curiosite, vus } = parsed.data;

  const seen = (vus ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const supabase = await createClient();

  // Deux temps : on ne rapatrie d'abord que les identifiants du vivier (léger),
  // on tire dedans, puis on ne charge que les lignes du paquet. Sans ça, un
  // tirage aléatoire coûterait le catalogue entier à chaque « Encore ».
  let pool = supabase
    .from("activities")
    .select("id")
    .eq("status", "approved")
    .or(futureOrClause())
    .gte("rarity", rarity ?? RARITY_FLOOR)
    .limit(MAX_POOL);

  if (curiosite) pool = pool.eq("curiosity", curiosite);

  const { data: ids, error } = await pool;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const candidates = (ids ?? []).map((r) => r.id).filter((id) => !seen.includes(id));
  if (candidates.length === 0) {
    return NextResponse.json({ activities: [], epuise: true });
  }

  // Fisher-Yates partiel : on ne mélange que ce qu'on va distribuer.
  const take = Math.min(DECK_SIZE, candidates.length);
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(Math.random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const { data: activities, error: err2 } = await supabase
    .from("activities")
    .select("*, photos:activity_photos(id, url)")
    .in("id", candidates.slice(0, take));

  if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });

  // `.in()` ne garantit pas l'ordre : on réapplique celui du tirage.
  const order = new Map(candidates.slice(0, take).map((id, i) => [id, i]));
  const deck = (activities ?? []).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );

  return NextResponse.json({
    activities: deck,
    epuise: candidates.length <= take,
    restant: candidates.length,
  });
}
