// Supabase Edge Function: cleanup-stories
// Deletes expired activity_stories + global_stories rows and their storage objects.
// Runs every hour via pg_cron → net.http_post().

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async () => {
  const startedAt = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Fetch expired stories so we can delete their storage objects
  const { data: expired, error: fetchErr } = await supabase
    .from("activity_stories")
    .select("id, media_url")
    .lt("expires_at", new Date().toISOString());

  if (fetchErr) {
    console.error("cleanup-stories fetch error:", fetchErr.message);
    return new Response(JSON.stringify({ ok: false, error: fetchErr.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  if (!expired || expired.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, deleted: 0, ms: Date.now() - startedAt }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  // Extract storage paths from media_url (format: .../storage/v1/object/public/stories/<path>)
  const storagePaths: string[] = expired
    .map((s) => {
      try {
        const url = new URL(s.media_url);
        const marker = "/object/public/stories/";
        const idx = url.pathname.indexOf(marker);
        return idx !== -1 ? url.pathname.slice(idx + marker.length) : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[];

  // Delete storage objects in batches of 100
  const BATCH = 100;
  for (let i = 0; i < storagePaths.length; i += BATCH) {
    const batch = storagePaths.slice(i, i + BATCH);
    const { error: storageErr } = await supabase.storage.from("stories").remove(batch);
    if (storageErr) console.warn("storage delete partial error:", storageErr.message);
  }

  // Delete DB rows (RLS bypassed via service role)
  const ids = expired.map((s) => s.id);
  const { error: deleteErr } = await supabase
    .from("activity_stories")
    .delete()
    .in("id", ids);

  if (deleteErr) {
    console.error("cleanup-stories delete error:", deleteErr.message);
    return new Response(JSON.stringify({ ok: false, error: deleteErr.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  // Also clean expired global_stories
  const { data: expiredGlobal } = await supabase
    .from("global_stories")
    .select("id, media_url")
    .lt("expires_at", new Date().toISOString());

  let deletedGlobal = 0;
  if (expiredGlobal && expiredGlobal.length > 0) {
    const globalPaths: string[] = expiredGlobal
      .map((s) => {
        try {
          const url = new URL(s.media_url);
          const marker = "/object/public/global-stories/";
          const idx = url.pathname.indexOf(marker);
          return idx !== -1 ? url.pathname.slice(idx + marker.length) : null;
        } catch { return null; }
      })
      .filter(Boolean) as string[];

    for (let i = 0; i < globalPaths.length; i += BATCH) {
      await supabase.storage.from("global-stories").remove(globalPaths.slice(i, i + BATCH));
    }
    await supabase.from("global_stories").delete().in("id", expiredGlobal.map((s) => s.id));
    deletedGlobal = expiredGlobal.length;
  }

  console.log(`[cleanup-stories] activity: ${expired.length}, global: ${deletedGlobal}`);
  return new Response(
    JSON.stringify({ ok: true, deleted: expired.length, deletedGlobal, ms: Date.now() - startedAt }),
    { headers: { "Content-Type": "application/json" } },
  );
});
