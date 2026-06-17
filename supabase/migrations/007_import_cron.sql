-- ── Scheduled activity imports via pg_cron ───────────────────────────────────
-- Runs every 6 hours to pull fresh events from Que faire à Paris (QFAP)
-- and OpenAgenda, covering any events missed by user contributions.
-- Both functions are idempotent (upsert on source+external_id).
--
-- These jobs fire as a failsafe alongside the Vercel cron at /api/cron/import-activities.
-- Replace <PROJECT_REF> placeholder if you run this SQL manually; the
-- current_setting() calls work automatically when app.supabase_url is configured.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- QFAP import — Que faire à Paris open data (free, no API key needed)
SELECT cron.schedule(
  'import-qfap-every-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/import-qfap',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- OpenAgenda import — requires OPENAGENDA_API_KEY Supabase secret
SELECT cron.schedule(
  'import-openagenda-every-6h',
  '30 */6 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/import-openagenda',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
