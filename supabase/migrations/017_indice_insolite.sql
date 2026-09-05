-- L'indice d'insolite : à quel point une sortie sort des sentiers battus.
--
-- C'est la mesure qui tient tout le produit. Sans elle, brancher les agendas
-- ouverts (Que Faire à Paris, OpenAgenda) revient à réimporter le tout-venant
-- qu'on vient justement d'arrêter de faire. L'indice est calculé par Claude
-- à l'import (edge function score-curiosites) et sert de seuil d'admission.
--
-- Échelle 1–10 :
--   1-2  se trouve dans n'importe quel agenda
--   3-4  un peu à côté du chemin
--   5-6  peu commun, il faut chercher
--   7-8  rare, on en parle
--   9-10 la plupart des Parisiens ignorent que ça existe

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS rarity smallint;

ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_rarity_check;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_rarity_check
  CHECK (rarity IS NULL OR (rarity >= 1 AND rarity <= 10));

-- Note du scoring : pourquoi Claude a mis cette note. Sert à la modération
-- humaine et au débogage des seuils.
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS rarity_note text;

-- Le tri et le filtrage se font presque toujours sur rarity décroissant parmi
-- les activités approuvées et à venir.
CREATE INDEX IF NOT EXISTS activities_rarity_idx
  ON public.activities (rarity DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS activities_curiosity_rarity_idx
  ON public.activities (curiosity, rarity DESC NULLS LAST);
