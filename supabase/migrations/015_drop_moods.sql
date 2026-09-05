-- Retire l'axe "mood / envie" : le produit ne trie plus les sorties par état
-- d'esprit déclaré. La découverte passe désormais par la sérendipité et par
-- les curiosités (cf. migration suivante).

DROP INDEX IF EXISTS public.idx_activities_moods;

ALTER TABLE public.activities
  DROP COLUMN IF EXISTS moods;
