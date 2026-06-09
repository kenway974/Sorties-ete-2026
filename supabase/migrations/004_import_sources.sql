-- Migration: support for automated event imports from external sources
-- Adds source + external_id for idempotent upserts, makes creator_id
-- nullable so imported events don't require a user account.

-- 1. Allow imported activities to have no creator
ALTER TABLE public.activities
  ALTER COLUMN creator_id DROP NOT NULL;

-- FK now uses SET NULL so deleting a profile doesn't cascade-delete imported events
ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_creator_id_fkey;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_creator_id_fkey
  FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Source tracking columns
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT;

-- 3. Unique index for idempotent upserts (partial: only when source is set)
CREATE UNIQUE INDEX IF NOT EXISTS activities_source_external_id_idx
  ON public.activities (source, external_id)
  WHERE source IS NOT NULL AND external_id IS NOT NULL;

-- 4. Index for fast cleanup of past imported events
CREATE INDEX IF NOT EXISTS activities_source_date_idx
  ON public.activities (source, date)
  WHERE source IS NOT NULL;

-- 5. RLS: imported events (creator_id IS NULL) are readable by everyone when approved
-- The existing policy "activities_approved_public" uses:
--   status = 'approved' OR auth.uid() = creator_id
-- With creator_id nullable, auth.uid() = NULL is always false, which is correct —
-- imported approved events remain publicly readable, unapproved ones are hidden.
-- No policy change needed.
