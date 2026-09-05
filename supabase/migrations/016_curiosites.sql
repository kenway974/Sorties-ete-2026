-- Remplace les 12 catégories de genre par les 6 curiosités.
--
-- Le genre (concert / expo / resto) ne dit rien de ce qui rend une sortie
-- mémorable. Les curiosités classent par sensation : ce qu'il en reste le
-- lendemain quand on la raconte.

ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_category_check;

ALTER TABLE public.activities
  RENAME COLUMN category TO curiosity;

-- Report provisoire de l'ancienne taxonomie. Grossier par construction : les
-- deux axes ne sont pas comparables. Le scoring Claude (edge function
-- score-curiosites) repasse derrière et réaffecte sur le contenu réel.
UPDATE public.activities SET curiosity = CASE curiosity
  WHEN 'sport'       THEN 'frisson'
  WHEN 'restaurants' THEN 'savoir-faire'
  WHEN 'loisirs'     THEN 'savoir-faire'
  WHEN 'soirees'     THEN 'mise-en-scene'
  WHEN 'concerts'    THEN 'mise-en-scene'
  WHEN 'famille'     THEN 'mise-en-scene'
  WHEN 'expositions' THEN 'hors-du-temps'
  WHEN 'culture'     THEN 'hors-du-temps'
  ELSE 'bizarrerie'
END;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_curiosity_check CHECK (
    curiosity IN (
      'frisson', 'secret', 'savoir-faire',
      'mise-en-scene', 'hors-du-temps', 'bizarrerie'
    )
  );

ALTER INDEX IF EXISTS activities_category_idx RENAME TO activities_curiosity_idx;

-- Les préférences d'onboarding pointaient sur l'ancienne taxonomie : aucune
-- correspondance honnête, on repart de zéro et le wizard les redemande.
UPDATE public.profiles SET preferences = '{}' WHERE preferences <> '{}';
