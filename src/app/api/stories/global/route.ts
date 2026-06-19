import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Uses the user's session for auth; service role for moderation updates (no UPDATE RLS policy)
async function getSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function moderateWithClaude(
  imageUrl: string,
  caption: string
): Promise<{ approved: boolean; reason: string | null }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { approved: true, reason: null };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "url", url: imageUrl } },
              {
                type: "text",
                text: `Tu es un modérateur pour une app sociale parisienne grand public. Analyse cette image. Réponds UNIQUEMENT avec du JSON valide sur une seule ligne: {"approved":true,"reason":null} ou {"approved":false,"reason":"motif court"}. Refuse SEULEMENT si: nudité/contenu sexuel explicite, violence extrême/gore, symboles haineux, contenu illégal. Approuve tout le reste (personnes, nourriture, lieux, sorties, selfies, événements, animaux, paysages). Légende: "${(caption || "").slice(0, 100)}"`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return { approved: true, reason: null };

    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? "";
    const m = text.match(/\{[\s\S]*?\}/);
    if (m) {
      const parsed = JSON.parse(m[0]);
      return {
        approved: parsed.approved !== false,
        reason: parsed.reason ?? null,
      };
    }
    return { approved: true, reason: null };
  } catch {
    // Fail open — never block a story due to moderation API error
    return { approved: true, reason: null };
  }
}

export async function POST(req: NextRequest) {
  const supabase = await getSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const { media_url, media_type, caption, location_text } = body as {
    media_url: string;
    media_type: "photo" | "video";
    caption?: string;
    location_text?: string;
  };

  if (!media_url || !media_type) {
    return Response.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Rate-limit: max 10 global stories per user per 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("global_stories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  if ((count ?? 0) >= 10) {
    return Response.json(
      { error: "Limite de 10 stories par 24h atteinte." },
      { status: 429 }
    );
  }

  // Insert as pending
  const { data: story, error: insertErr } = await admin
    .from("global_stories")
    .insert({
      user_id: user.id,
      media_url,
      media_type,
      caption: caption?.trim() || null,
      location_text: location_text?.trim() || null,
      moderation_status: "pending",
    })
    .select("id")
    .single();

  if (insertErr || !story) {
    return Response.json({ error: insertErr?.message ?? "Erreur DB" }, { status: 500 });
  }

  // Moderate photos with Claude Haiku (videos: auto-approve, only caption screened)
  let status: "approved" | "rejected" = "approved";
  let reason: string | null = null;

  if (media_type === "photo") {
    const result = await moderateWithClaude(media_url, caption ?? "");
    status = result.approved ? "approved" : "rejected";
    reason = result.reason;
  }

  await admin
    .from("global_stories")
    .update({ moderation_status: status, moderation_reason: reason })
    .eq("id", story.id);

  // If rejected, remove from storage too
  if (status === "rejected") {
    try {
      const url = new URL(media_url);
      const marker = "/object/public/global-stories/";
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const path = url.pathname.slice(idx + marker.length);
        await admin.storage.from("global-stories").remove([path]);
      }
    } catch {
      // non-critical
    }
    await admin.from("global_stories").delete().eq("id", story.id);
  }

  return Response.json({ id: story.id, status, reason });
}
