-- Production hardening: fixes Supabase advisor warnings.
-- 1) RLS initplan: wrap auth.uid() in (select auth.uid()) so it's evaluated once
--    per query instead of once per row. Behavior-preserving.
-- 2) Add covering indexes for foreign keys.
-- 3) Close public-bucket file listing (object URLs keep working).

-- ─────────────────────────────────────────────────────────────
-- 1) RLS policy rewrites (behavior identical, just optimized)
-- ─────────────────────────────────────────────────────────────

-- activities
ALTER POLICY activities_approved_public ON public.activities
  USING ((status = 'approved') OR ((select auth.uid()) = creator_id));
ALTER POLICY activities_insert_authenticated ON public.activities
  WITH CHECK ((select auth.uid()) = creator_id);
ALTER POLICY activities_update_own ON public.activities
  USING (((select auth.uid()) = creator_id) OR (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['moderator','admin']))));
ALTER POLICY "max 3 proposals per day" ON public.activities
  WITH CHECK ((SELECT count(*) FROM public.activities a1
    WHERE a1.creator_id = (select auth.uid())
      AND a1.created_at >= ((now() AT TIME ZONE 'Europe/Paris'))::date) < 3);
ALTER POLICY "require verified email to propose" ON public.activities
  WITH CHECK ((SELECT users.email_confirmed_at FROM auth.users
    WHERE users.id = (select auth.uid())) IS NOT NULL);

-- activity_photos
ALTER POLICY photos_insert_authenticated ON public.activity_photos
  WITH CHECK ((select auth.uid()) = uploaded_by);

-- activity_registrations
ALTER POLICY registrations_own_delete ON public.activity_registrations
  USING ((select auth.uid()) = user_id);
ALTER POLICY registrations_own_write ON public.activity_registrations
  WITH CHECK ((select auth.uid()) = user_id);

-- activity_stories
ALTER POLICY stories_delete_own ON public.activity_stories
  USING ((select auth.uid()) = user_id);
ALTER POLICY stories_insert_own ON public.activity_stories
  WITH CHECK ((select auth.uid()) = user_id);

-- favorites
ALTER POLICY favorites_own_delete ON public.favorites
  USING ((select auth.uid()) = user_id);
ALTER POLICY favorites_own_read ON public.favorites
  USING ((select auth.uid()) = user_id);
ALTER POLICY favorites_own_write ON public.favorites
  WITH CHECK ((select auth.uid()) = user_id);

-- global_stories
ALTER POLICY gs_delete ON public.global_stories
  USING ((select auth.uid()) = user_id);
ALTER POLICY gs_insert ON public.global_stories
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY gs_select ON public.global_stories
  USING (((moderation_status = 'approved') AND (expires_at > now()))
         OR ((select auth.uid()) = user_id));

-- notifications
ALTER POLICY notifications_own ON public.notifications
  USING ((select auth.uid()) = user_id);

-- profiles
ALTER POLICY profiles_own_write ON public.profiles
  USING ((select auth.uid()) = id);

-- reports
ALTER POLICY reports_admin_read ON public.reports
  USING (((select auth.uid()) = reporter_id) OR (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['moderator','admin']))));
ALTER POLICY reports_admin_update ON public.reports
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['moderator','admin'])));
ALTER POLICY reports_own_insert ON public.reports
  WITH CHECK ((select auth.uid()) = reporter_id);

-- reviews
ALTER POLICY reviews_own_update ON public.reviews
  USING ((select auth.uid()) = user_id);
ALTER POLICY reviews_own_write ON public.reviews
  WITH CHECK ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2) Covering indexes for foreign keys
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activities_creator_id ON public.activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_activity_photos_uploaded_by ON public.activity_photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_user_id ON public.activity_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_stories_user_id ON public.activity_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- ─────────────────────────────────────────────────────────────
-- 3) Close public-bucket listing (public object URLs still work)
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "stories_public_read" ON storage.objects;
DROP POLICY IF EXISTS "gs_storage_read" ON storage.objects;
