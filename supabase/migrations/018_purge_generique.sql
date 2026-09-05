-- Purge du catalogue importé sous l'ancien régime.
--
-- Tout ce qui vient de Que Faire à Paris et d'OpenAgenda est entré sans
-- filtre d'insolite : c'est le tout-venant qui avait dilué le produit. Ces
-- lignes n'ont pas d'indice et ne peuvent pas en recevoir un honnêtement
-- (le scoring travaille sur le texte de la source, pas sur nos copies).
--
-- On efface, le prochain passage du cron réimporte avec le scoring branché.
-- Les activités proposées par des utilisateurs (source NULL) sont conservées :
-- elles repasseront par la modération.

DELETE FROM public.activities
 WHERE source IN ('qfap', 'openagenda');
