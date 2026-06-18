-- ── Anti-spam RLS policies on activities ─────────────────────────────────────
-- These are server-side enforcement for checks already done client-side.
-- Even if someone bypasses the frontend, the DB will reject the insert.

-- 1. Email must be verified before proposing an activity
CREATE POLICY "require verified email to propose"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL
  );

-- 2. Max 3 proposals per user per calendar day (Europe/Paris)
CREATE POLICY "max 3 proposals per day"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      SELECT COUNT(*) FROM public.activities
      WHERE creator_id = auth.uid()
        AND created_at >= (NOW() AT TIME ZONE 'Europe/Paris')::date
    ) < 3
  );
