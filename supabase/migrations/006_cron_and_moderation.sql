-- ── Moderation note column ──────────────────────────────────────────────────
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS moderation_note TEXT;

-- ── pg_cron scheduled jobs ───────────────────────────────────────────────────
-- Requires the pg_cron extension (enabled by default on Supabase).
-- These jobs call Edge Functions via the pg_net extension which is also available.
-- Replace <PROJECT_REF> and <SERVICE_ROLE_KEY> with real values, or inject via
-- a one-time SQL execution in the Supabase dashboard after deployment.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Hourly cleanup of expired stories
SELECT cron.schedule(
  'cleanup-stories-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/cleanup-stories',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Daily J-1 reminder push notifications (runs at 08:00 UTC = 10:00 Paris time)
SELECT cron.schedule(
  'send-reminders-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
