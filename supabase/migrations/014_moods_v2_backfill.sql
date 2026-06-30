-- Re-infer the richer mood vocabulary (18 envies, incl. date contexts) on all
-- imported activities. Mirrors inferMoods() in the import edge functions.
-- Overwrites moods for non-user sources; leaves user-proposed rows untouched
-- (they may carry a manual choice). Safe to re-run.

UPDATE public.activities a
SET moods = sub.moods
FROM (
  SELECT
    id,
    ARRAY(SELECT DISTINCT m FROM unnest(
      (CASE category
        WHEN 'soirees'     THEN ARRAY['rencontrer','entre-amis','decompresser','nocturne']
        WHEN 'concerts'    THEN ARRAY['decompresser','decouvrir','entre-amis','nocturne']
        WHEN 'expositions' THEN ARRAY['solo','esprit','decouvrir','date-chill']
        WHEN 'restaurants' THEN ARRAY['gourmand','date-romantique','entre-amis']
        WHEN 'bars'        THEN ARRAY['entre-amis','decompresser','nocturne','rencontrer']
        WHEN 'sport'       THEN ARRAY['air','sensations','decompresser']
        WHEN 'culture'     THEN ARRAY['esprit','decouvrir','solo','date-chill']
        WHEN 'famille'     THEN ARRAY['famille','air','creatif']
        WHEN 'etudiants'   THEN ARRAY['rencontrer','entre-amis','decompresser']
        WHEN 'networking'  THEN ARRAY['rencontrer','esprit']
        WHEN 'loisirs'     THEN ARRAY['date-fun','entre-amis','decompresser','creatif']
        WHEN 'salons'      THEN ARRAY['decouvrir','insolite','entre-amis']
        ELSE ARRAY[]::text[]
      END)
      || (CASE WHEN txt ~* 'rencontre|speed.dating|afterwork|after.work|c[ée]libataire|blind.test|mixer|networking|[ée]change|\mmeet\M' THEN ARRAY['rencontrer'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'entre amis|groupe|[ée]quipe|\mteam\M|bowling|billard|quiz|jeux? de soci[ée]t[ée]' THEN ARRAY['entre-amis'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'romantique|amoureux|en couple|aux chandelles|d[îi]ner|cro[îi]si[èe]re|p[ée]niche|rooftop|coucher de soleil|cabaret|tango|s[ée]r[ée]nade|saint.valentin' THEN ARRAY['date-romantique'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'bowling|mini.?golf|karaok[ée]|escape.game|laser.game|arcade|accrobranche|patinoire|r[ée]alit[ée] virtuelle|fl[ée]chettes' THEN ARRAY['date-fun'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'caf[ée]|brunch|salon de th[ée]|balade|promenade|pique.nique|cin[ée]ma|cin[ée]' THEN ARRAY['date-chill'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'famille|enfant|\mkids\M|jeune public|b[ée]b[ée]|parent' THEN ARRAY['famille'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'yoga|m[ée]ditation|\mspa\M|bien.[êe]tre|wellness|massage|relaxation|d[ée]tente|sophrologie|sieste|\mzen\M|bain sonore|th[ée]rapie' THEN ARRAY['ressourcer'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'plein.air|outdoor|parc|jardin|nature|for[êe]t|terrasse|balade|promenade|ext[ée]rieur|rivi[èe]re|quai|bois|p[ée]niche|randonn[ée]e' THEN ARRAY['air'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'festi|f[êe]te|party|\mdj\M|club|dancefloor|danse|\mdance\M|\mbal\M|guinguette|ap[ée]ro|open.bar' THEN ARRAY['decompresser'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'sensation|adr[ée]naline|karting|paintball|accrobranche|escalade|\msaut\M|trampoline|man[èe]ge|frisson|vertige|tyrolienne' THEN ARRAY['sensations'] ELSE '{}' END)
      || (CASE WHEN txt ~* '\mnuit\M|nocturne|\mclub\M|\mafter\M|soir[ée]e|minuit|nightlife' THEN ARRAY['nocturne'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'rooftop|champagne|\mgala\M|vernissage|[ée]l[ée]gant|cocktail|palace|op[ée]ra|prestige|\mluxe\M|raffin[ée]' THEN ARRAY['chic'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'd[ée]couverte|nouveaut[ée]|initiation|exp[ée]rience|immersi|surprise|premi[èe]re' THEN ARRAY['decouvrir'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'insolite|secret|cach[ée]|dans le noir|\munique\M|[ée]trange|myst[èe]re' THEN ARRAY['insolite'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'atelier|\mdiy\M|workshop|poterie|c[ée]ramique|peinture|dessin|fabrication|cr[ée]ation|couture|cours de|sculpture' THEN ARRAY['creatif'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'd[ée]gustation|gastronomie|\mfood\M|brunch|chocolat|\mvin\M|fromage|street food|march[ée]|cuisine|\mrepas\M|bi[èe]re|cocktail|[œo]enologie' THEN ARRAY['gourmand'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'conf[ée]rence|d[ée]bat|philo|histoire|mus[ée]e|museum|exposition|litt[ée]rature|lecture|sciences|table ronde|masterclass|\mtalk\M' THEN ARRAY['esprit'] ELSE '{}' END)
      || (CASE WHEN txt ~* 'visite libre|[àa] votre rythme|sans inscription|en autonomie|individuel|self.guided' THEN ARRAY['solo'] ELSE '{}' END)
    ) AS m) AS moods
  FROM (
    SELECT id, category,
      lower(coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(array_to_string(tags,' '),'')) AS txt
    FROM public.activities
    WHERE source <> 'user'
  ) base
) sub
WHERE a.id = sub.id;

-- Safety net: never leave a row without a mood
UPDATE public.activities SET moods = ARRAY['decouvrir'] WHERE moods IS NULL OR moods = '{}';
