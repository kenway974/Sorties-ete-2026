-- Add "salons" to the activities category enum/check constraint
-- Covers: conventions, trade fairs, comic cons, Japan Expo, Salon du Livre, etc.

DO $$
BEGIN
  -- Drop existing check constraint on category (name may vary)
  ALTER TABLE public.activities
    DROP CONSTRAINT IF EXISTS activities_category_check;

  -- Re-add with "salons" included
  ALTER TABLE public.activities
    ADD CONSTRAINT activities_category_check CHECK (
      category IN (
        'soirees', 'concerts', 'expositions', 'restaurants', 'bars',
        'sport', 'culture', 'famille', 'etudiants', 'networking', 'loisirs',
        'salons'
      )
    );
END
$$;
