-- One-shot backfill of activities.moods for rows imported/created before
-- migration 011. Mirrors the inferMoods() logic from the import edge functions:
-- category defaults + keyword refinements. Idempotent: only touches rows whose
-- moods is still empty, so it's safe to re-run.

UPDATE public.activities a
SET moods = sub.moods
FROM (
  SELECT
    id,
    ARRAY(
      SELECT DISTINCT m FROM unnest(
        -- 1) Category defaults
        (CASE category
          WHEN 'soirees'     THEN ARRAY['rencontrer','decompresser']
          WHEN 'concerts'    THEN ARRAY['decompresser','solo','decouvrir']
          WHEN 'expositions' THEN ARRAY['solo','esprit','decouvrir']
          WHEN 'restaurants' THEN ARRAY['rencontrer']
          WHEN 'bars'        THEN ARRAY['rencontrer','decompresser']
          WHEN 'sport'       THEN ARRAY['ressourcer','air']
          WHEN 'culture'     THEN ARRAY['esprit','solo','decouvrir']
          WHEN 'famille'     THEN ARRAY['air']
          WHEN 'etudiants'   THEN ARRAY['rencontrer','decompresser']
          WHEN 'networking'  THEN ARRAY['rencontrer','esprit']
          WHEN 'loisirs'     THEN ARRAY['decompresser','decouvrir']
          WHEN 'salons'      THEN ARRAY['decouvrir','rencontrer']
          ELSE ARRAY[]::text[]
        END)
        -- 2) Keyword refinements (case-insensitive on title + description + tags)
        || (CASE WHEN txt ~* 'rencontre|speed.dating|afterwork|after.work|c[ée]libataire|blind.test|karaok[ée]|mixer|networking|[ée]change' THEN ARRAY['rencontrer'] ELSE ARRAY[]::text[] END)
        || (CASE WHEN txt ~* 'plein.air|parc|jardin|nature|for[êe]t|terrasse|balade|promenade|ext[ée]rieur|rivi[èe]re|quai|bois|p[ée]niche' THEN ARRAY['air'] ELSE ARRAY[]::text[] END)
        || (CASE WHEN txt ~* 'yoga|m[ée]ditation|spa|bien.[êe]tre|massage|relaxation|d[ée]tente|sophrologie|sieste|zen|bain sonore|th[ée]rapie' THEN ARRAY['ressourcer'] ELSE ARRAY[]::text[] END)
        || (CASE WHEN txt ~* 'd[ée]couverte|insolite|nouveaut[ée]|initiation|atelier|exp[ée]rience|immersi|surprise' THEN ARRAY['decouvrir'] ELSE ARRAY[]::text[] END)
        || (CASE WHEN txt ~* 'festi|f[êe]te|party|\mdj\M|club|dancefloor|danse|\mbal\M|guinguette|ap[ée]ro|open.bar' THEN ARRAY['decompresser'] ELSE ARRAY[]::text[] END)
        || (CASE WHEN txt ~* 'conf[ée]rence|d[ée]bat|philo|histoire|mus[ée]e|exposition|litt[ée]rature|lecture|sciences|table ronde|masterclass' THEN ARRAY['esprit'] ELSE ARRAY[]::text[] END)
        || (CASE WHEN txt ~* 'visite libre|[àa] votre rythme|sans inscription|en autonomie|individuel' THEN ARRAY['solo'] ELSE ARRAY[]::text[] END)
      ) AS m
    ) AS moods
  FROM (
    SELECT
      id,
      category,
      lower(
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(array_to_string(tags, ' '), '')
      ) AS txt
    FROM public.activities
  ) base
) sub
WHERE a.id = sub.id
  AND (a.moods IS NULL OR a.moods = '{}');

-- Safety net: any row still without a mood gets 'decouvrir' (mirrors inferMoods fallback)
UPDATE public.activities
SET moods = ARRAY['decouvrir']
WHERE moods IS NULL OR moods = '{}';
