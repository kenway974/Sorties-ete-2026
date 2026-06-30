-- Add "moods" (envie / intent) dimension to activities.
-- Distinct from category (what) and tags (vibe): why / in which state of mind.
-- Vocabulary (slugs): rencontrer, solo, ressourcer, air, decouvrir, decompresser, esprit

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS moods text[] NOT NULL DEFAULT '{}';

-- GIN index so overlaps() / && queries on moods stay fast
CREATE INDEX IF NOT EXISTS idx_activities_moods
  ON public.activities USING GIN (moods);
