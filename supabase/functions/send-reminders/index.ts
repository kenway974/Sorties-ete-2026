// Supabase Edge Function: send-reminders
// Sends a Web Push "J-1" reminder to users for activities they favorited
// that take place tomorrow. Runs daily via cron.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

Deno.serve(async () => {
  const startedAt = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Load VAPID keys from locked config table
    const { data: cfg } = await supabase.from("app_config").select("key, value");
    const map = Object.fromEntries((cfg ?? []).map((r) => [r.key, r.value]));
    if (!map.vapid_public_key || !map.vapid_private_key) {
      return new Response(JSON.stringify({ ok: false, error: "VAPID keys missing" }), { status: 500 });
    }
    webpush.setVapidDetails(
      map.vapid_subject || "mailto:contact@parissorties.fr",
      map.vapid_public_key,
      map.vapid_private_key,
    );

    // Tomorrow's date (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    // Favorited activities happening tomorrow
    const { data: favs } = await supabase
      .from("favorites")
      .select("user_id, activity:activities!inner(id, title, date, time)")
      .eq("activity.date", dateStr);

    if (!favs || favs.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no favorites tomorrow", ms: Date.now() - startedAt }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Group activities per user
    const perUser = new Map<string, { id: string; title: string; time: string }[]>();
    for (const f of favs) {
      const a = f.activity as unknown as { id: string; title: string; time: string };
      if (!a) continue;
      const list = perUser.get(f.user_id) ?? [];
      list.push({ id: a.id, title: a.title, time: a.time });
      perUser.set(f.user_id, list);
    }

    const userIds = [...perUser.keys()];
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .in("user_id", userIds);

    let sent = 0, removed = 0;
    for (const sub of subs ?? []) {
      const acts = perUser.get(sub.user_id);
      if (!acts || acts.length === 0) continue;

      const first = acts[0];
      const title = acts.length === 1 ? "Demain : " + first.title : acts.length + " sorties demain";
      const body = acts.length === 1
        ? "C'est demain à " + (first.time?.slice(0, 5) ?? "") + ". On y va ?"
        : acts.slice(0, 3).map((a) => "• " + a.title).join("\n");
      const url = acts.length === 1 ? "/fr/activities/" + first.id : "/fr/favorites";

      const payload = JSON.stringify({ title, body, url });
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          // Subscription expired → remove
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          removed++;
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent, removed, users: userIds.length, ms: Date.now() - startedAt }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), ms: Date.now() - startedAt }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});