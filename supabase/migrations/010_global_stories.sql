-- Global stories: 24h live Paris feed with per-user visibility and moderation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'global-stories', 'global-stories', true, 52428800,
  ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "gs_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'global-stories');

CREATE POLICY "gs_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'global-stories' AND auth.role() = 'authenticated');

CREATE POLICY "gs_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'global-stories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE TABLE public.global_stories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url         TEXT NOT NULL,
  media_type        TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption           TEXT,
  location_text     TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_reason TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  expires_at        TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX idx_global_stories_feed
  ON public.global_stories(created_at DESC)
  WHERE moderation_status = 'approved';

CREATE INDEX idx_global_stories_user ON public.global_stories(user_id, created_at DESC);

ALTER TABLE public.global_stories ENABLE ROW LEVEL SECURITY;

-- Public sees approved + non-expired; own user sees all their stories (including pending)
CREATE POLICY "gs_select" ON public.global_stories
  FOR SELECT USING (
    (moderation_status = 'approved' AND expires_at > now())
    OR auth.uid() = user_id
  );

CREATE POLICY "gs_insert" ON public.global_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gs_delete" ON public.global_stories
  FOR DELETE USING (auth.uid() = user_id);
