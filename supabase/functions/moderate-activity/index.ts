// Supabase Edge Function: moderate-activity
//
// Deux passages sur chaque proposition d'utilisateur :
//   1. sûreté — le contenu est-il publiable ? (approuver / rejeter / relire)
//   2. insolite — quelle curiosité, quel indice ? (même barème que les imports)
//
// Le second passage n'est pas cosmétique : une activité sans indice est
// invisible côté public, puisque le catalogue filtre sur le seuil. Une
// proposition trop banale n'est pas rejetée pour autant — elle part en
// relecture humaine, le refus éditorial ne s'automatise pas.
//
// Appelée par webhook Supabase (ou par l'API propose) avec POST { activityId }.

import { createClient } from "npm:@supabase/supabase-js@2";
import { scoreEvents, RARITY_FLOOR } from "../_shared/scoring.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ModerationResult {
  decision: "approve" | "reject" | "review";
  confidence: number;
  reason: string;
}

async function moderateWithClaude(title: string, description: string, curiosity: string): Promise<ModerationResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // No API key – send to human review
    return { decision: "review", confidence: 0, reason: "ANTHROPIC_API_KEY not configured" };
  }

  const prompt = `Tu modères les propositions d'un guide parisien qui ne référence que des sorties insolites.

Décide s'il faut APPROUVER, REJETER, ou envoyer en RELECTURE humaine.

Titre : ${title}
Curiosité : ${curiosity}
Description : ${description ?? "(aucune)"}

Règles :
- APPROUVER si c'est une vraie sortie parisienne et qu'elle sort de l'ordinaire.
- REJETER si le contenu est sexuellement explicite, illégal, dangereux, du spam,
  ou hors périmètre (pas à Paris ni en proche banlieue).
- RELECTURE si tu hésites, si le contenu est limite, ou si la sortie a l'air
  parfaitement banale — la banalité n'est pas un motif de rejet automatique,
  c'est un motif de relecture.

Réponds UNIQUEMENT par un objet JSON, sans balises markdown :
{"decision":"approve|reject|review","confidence":0.0-1.0,"reason":"une phrase en français"}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("Anthropic API error:", err);
    return { decision: "review", confidence: 0, reason: "Claude API error – routed to human review" };
  }

  const data = await resp.json();
  const text: string = data.content?.[0]?.text ?? "";

  try {
    // Strip any accidental markdown code fences
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as ModerationResult;
    if (!["approve", "reject", "review"].includes(parsed.decision)) throw new Error("bad decision");
    return parsed;
  } catch {
    console.error("Failed to parse Claude response:", text);
    return { decision: "review", confidence: 0, reason: "Unparseable response – routed to human review" };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let activityId: string;
  try {
    const body = await req.json();
    activityId = body.activityId ?? body.record?.id;
    if (!activityId) throw new Error("activityId required");
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: activity, error } = await supabase
    .from("activities")
    .select("id, title, description, curiosity, status")
    .eq("id", activityId)
    .single();

  if (error || !activity) {
    return new Response(JSON.stringify({ error: "Activity not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Only moderate pending activities
  if (activity.status !== "pending") {
    return new Response(JSON.stringify({ ok: true, skipped: true, reason: "not pending" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = await moderateWithClaude(
    activity.title,
    activity.description ?? "",
    activity.curiosity,
  );

  console.log(`[moderate-activity] ${activityId} → ${result.decision} (${result.confidence}) — ${result.reason}`);

  let newStatus =
    result.decision === "approve" ? "approved" :
    result.decision === "reject"  ? "rejected" :
    "pending"; // relecture humaine

  const update: Record<string, unknown> = {
    status: newStatus,
    moderation_note: result.reason,
  };

  // Second passage : noter l'insolite. Inutile sur un contenu rejeté.
  if (newStatus !== "rejected") {
    const scores = await scoreEvents([{
      ref: activityId,
      title: activity.title,
      description: activity.description ?? "",
    }]);
    const score = scores.get(activityId);

    if (score) {
      update.curiosity = score.curiosity;
      update.rarity = score.rarity;
      update.rarity_note = score.note;

      // Sans note (repli hors ligne) ou sous le seuil : un humain tranche.
      // La banalité est un avis éditorial, pas une infraction.
      if (score.rarity === null || score.rarity < RARITY_FLOOR) {
        newStatus = "pending";
        update.status = "pending";
        update.moderation_note = score.rarity === null
          ? `${result.reason} · indice d'insolite non calculé`
          : `${result.reason} · indice ${score.rarity}/10, sous le seuil de ${RARITY_FLOOR}`;
      }
    }
  }

  await supabase.from("activities").update(update).eq("id", activityId);

  return new Response(
    JSON.stringify({
      ok: true,
      decision: result.decision,
      newStatus,
      reason: update.moderation_note,
      rarity: update.rarity ?? null,
      curiosity: update.curiosity ?? null,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
