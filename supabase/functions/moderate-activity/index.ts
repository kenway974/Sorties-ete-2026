// Supabase Edge Function: moderate-activity
// AI-powered moderation for newly submitted activities.
// Called via a Supabase DB webhook (or directly from the propose API) with POST { activityId }.
// Uses Anthropic Claude to classify the submission and auto-approve safe activities.

import { createClient } from "npm:@supabase/supabase-js@2";

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

async function moderateWithClaude(title: string, description: string, category: string): Promise<ModerationResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // No API key – send to human review
    return { decision: "review", confidence: 0, reason: "ANTHROPIC_API_KEY not configured" };
  }

  const prompt = `You are a content moderator for ParisSorties, a Paris activities platform for a French audience.

Evaluate this activity submission and decide whether to APPROVE, REJECT, or flag for REVIEW.

Title: ${title}
Category: ${category}
Description: ${description ?? "(none)"}

Rules:
- APPROVE if it's a legitimate Paris activity (concert, restaurant, expo, sport, networking, etc.)
- REJECT if it contains explicit sexual content, illegal activities, dangerous content, spam, or off-topic (not in or near Paris)
- REVIEW if you are unsure or the content is borderline

Reply with ONLY a JSON object (no markdown):
{"decision":"approve|reject|review","confidence":0.0-1.0,"reason":"one sentence"}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
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
    .select("id, title, description, category, status")
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
    activity.category,
  );

  console.log(`[moderate-activity] ${activityId} → ${result.decision} (${result.confidence}) — ${result.reason}`);

  const newStatus =
    result.decision === "approve" ? "approved" :
    result.decision === "reject"  ? "rejected" :
    "pending"; // keep pending for human review

  await supabase
    .from("activities")
    .update({
      status: newStatus,
      moderation_note: result.reason,
    })
    .eq("id", activityId);

  return new Response(
    JSON.stringify({ ok: true, decision: result.decision, newStatus, reason: result.reason }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
