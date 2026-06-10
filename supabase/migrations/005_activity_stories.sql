-- Stories bucket (24h ephemeral media for activities)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories', 'stories', true, 52428800,
  ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "stories_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'stories');

CREATE POLICY "stories_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'stories' AND auth.role() = 'authenticated');

CREATE POLICY "stories_own_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Activity stories table
CREATE TABLE public.activity_stories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url   TEXT NOT NULL,
  media_type  TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX idx_activity_stories_active ON public.activity_stories(activity_id, expires_at);

ALTER TABLE public.activity_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories_read_active" ON public.activity_stories
  FOR SELECT USING (expires_at > now());

CREATE POLICY "stories_insert_own" ON public.activity_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_delete_own" ON public.activity_stories
  FOR DELETE USING (auth.uid() = user_id);
