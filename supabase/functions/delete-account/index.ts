// Supabase Edge Function: delete-account
// RGPD account deletion. A user can only delete THEIR OWN account.
// Anonymizes their approved (community) activities, then deletes the auth user,
// which cascades all personal data (profile, favorites, collections, reviews,
// registrations, interests, push subscriptions, notifications, pending activities).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: cors });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    // User-scoped client: identifies the caller from their JWT
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: cors });
    }

    // Service-role client: performs the privileged operations
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1. Anonymize the user's approved (public) activities — keep community content,
    //    sever the personal link (so they are not cascade-deleted).
    await admin
      .from("activities")
      .update({ creator_id: null })
      .eq("creator_id", user.id)
      .eq("status", "approved");

    // 2. Delete the auth user → cascades all remaining personal data via FKs.
    const { error: dErr } = await admin.auth.admin.deleteUser(user.id);
    if (dErr) {
      return new Response(JSON.stringify({ ok: false, error: dErr.message }), { status: 500, headers: cors });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: cors });
  }
});