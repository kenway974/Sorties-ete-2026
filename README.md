# Hors-Piste — le cabinet de curiosités de Paris

PWA de découverte de **sorties insolites** à Paris et en Île-de-France.

**Le concept** : on ne peut pas chercher ce dont on ignore l'existence. Un moteur de
recherche est donc l'outil le moins adapté à l'insolite. Alors on ne demande rien —
on montre.

Deux mécaniques portent le produit :

- **L'indice d'insolite** (1–10). Une seule question posée à chaque sortie : combien
  de Parisiens savent que ça existe ? La note est attribuée par Claude à l'import.
  **En dessous de 5, ça n'entre pas au catalogue.** C'est ce filtre qui empêche les
  agendas ouverts de reconstituer un annuaire généraliste.
- **La Roulette** (`/roulette`). Une sortie plein écran à la fois, un bouton
  « Encore », et pour seul réglage le cadran d'insolite — qu'on monte comme on monte
  le son, sans avoir à se décrire soi-même.

Les sorties sont rangées en **six curiosités**, qui classent par ce qu'il en reste le
lendemain plutôt que par genre : ça remue, ça se mérite, ça se fabrique, ça se joue,
ça sort du temps, ça n'a aucun sens.

Carte interactive, stories en temps réel, agendas parisiens synchronisés puis filtrés
(Que faire à Paris + OpenAgenda). Installable, gratuit, sans inscription.

## Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Carte**: React Leaflet + OpenStreetMap
- **Emails**: Resend
- **Monitoring**: Sentry
- **Analytics**: Vercel Analytics + Speed Insights
- **PWA**: Service Worker natif + Web Push (VAPID)

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

## Variables d'environnement

### Vercel (production)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (secrète) |
| `CRON_SECRET` | Token Bearer pour sécuriser les routes cron |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clé publique VAPID (push notifications) |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry (optionnel) |
| `SENTRY_ORG` | Organisation Sentry (optionnel) |
| `SENTRY_PROJECT` | Projet Sentry (optionnel) |

### Supabase Edge Function Secrets
| Secret | Description |
|---|---|
| `VAPID_PUBLIC_KEY` | Clé publique VAPID |
| `VAPID_PRIVATE_KEY` | Clé privée VAPID |
| `RESEND_API_KEY` | Clé API Resend (emails) |
| `ANTHROPIC_API_KEY` | Clé API Claude — **requise** : scoring d'insolite + modération. Sans elle, les imports partent en attente au lieu d'être publiés. |
| `OPENAGENDA_API_KEY` | Clé API OpenAgenda (optionnel) |

## Migrations Supabase

Exécuter dans l'ordre dans le SQL Editor :

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_storage_buckets.sql
supabase/migrations/003_seed_activities.sql
supabase/migrations/004_import_sources.sql
supabase/migrations/005_activity_stories.sql
supabase/migrations/006_cron_and_moderation.sql  → seulement l'ALTER TABLE
supabase/migrations/007_import_cron.sql          → remplacer par le SQL hardcodé
supabase/migrations/008_anti_spam_policies.sql
supabase/migrations/009_add_salons_category.sql
supabase/migrations/010_global_stories.sql
supabase/migrations/011_activity_moods.sql
supabase/migrations/012_backfill_moods.sql
supabase/migrations/013_perf_security_hardening.sql
supabase/migrations/014_moods_v2_backfill.sql
supabase/migrations/015_drop_moods.sql          → retire l'axe "envie"
supabase/migrations/016_curiosites.sql          → catégories → curiosités
supabase/migrations/017_indice_insolite.sql     → colonne rarity
supabase/migrations/018_purge_generique.sql     → vide le catalogue importé
```

> Les migrations 015 à 018 portent le pivot vers l'insolite. La 018 **supprime**
> tout ce qui vient de Que Faire à Paris et d'OpenAgenda : ces lignes sont entrées
> sans filtre. Le prochain passage du cron les réimporte avec le scoring branché.

Créer aussi la table `app_config` et y insérer les clés VAPID :
```sql
CREATE TABLE IF NOT EXISTS public.app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_config (key, value) VALUES
  ('vapid_public_key', '...'),
  ('vapid_private_key', '...')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

## Edge Functions

```bash
supabase link --project-ref <PROJECT_REF>
supabase functions deploy --use-api
```

| Fonction | Déclencheur | Description |
|---|---|---|
| `cleanup-stories` | pg_cron toutes les heures | Supprime les stories expirées |
| `send-reminders` | pg_cron 08h00 UTC | Notifications push J-1 |
| `import-qfap` | pg_cron toutes les 6h | Import Que Faire à Paris, scoré puis filtré |
| `import-openagenda` | pg_cron toutes les 6h | Import OpenAgenda, scoré puis filtré |
| `moderate-activity` | Proposition utilisateur | Modération IA + attribution de l'indice d'insolite (Claude Haiku) |
| `send-confirmation` | Inscription activité | Email de confirmation |
| `delete-account` | Suppression compte | Anonymisation + suppression |

## Cron jobs Vercel (hobby plan — 1x/jour)

| Route | Schedule | Description |
|---|---|---|
| `/api/cron/cleanup-stories` | 3h UTC | Backup nettoyage stories |
| `/api/cron/send-reminders` | 8h UTC | Backup rappels push |
| `/api/cron/import-activities` | 5h UTC | Backup imports QFAP + OpenAgenda |

## Structure

```
src/
├── app/
│   ├── [locale]/              # Pages (Next.js App Router)
│   │   ├── activities/        # Liste + détail activités
│   │   ├── auth/              # Login, register, reset password
│   │   ├── profile/           # Profil, favoris, itinéraire, collections
│   │   ├── propose/           # Formulaire proposition
│   │   ├── quartiers/         # Pages SEO par quartier
│   │   ├── onboarding/        # Wizard préférences
│   │   └── ...                # Pages SEO thématiques
│   └── api/
│       ├── activities/        # GET liste, POST register
│       ├── cron/              # Routes cron Vercel
│       ├── og/                # Génération images OG
│       └── reports/           # Signalements
├── components/
│   ├── activities/            # ActivityCard, GoingButton, ProposeForm...
│   ├── auth/                  # LoginForm, RegisterForm
│   ├── layout/                # Header, Footer, BottomNav
│   ├── map/                   # MapView (Leaflet + clustering)
│   ├── roulette/              # Roulette + cadran d'insolite
│   ├── notifications/         # PushPrompt, PushToggle
│   └── ui/                    # Button, Input, Badge, StarRating...
├── lib/
│   ├── constants/             # curiosites.ts, rarity.ts (le vocabulaire)
│   ├── hooks/                 # useActivities, useFavorites, useItinerary...
│   ├── supabase/              # Client browser + server
│   └── utils/                 # formatters, rateLimit, cn...
└── types/                     # TypeScript types
```

## Seeder

> ⚠️  Le catalogue du seeder a été curé pour l'ancien positionnement généraliste.
> Ses curiosités sont un report mécanique : le contenu lui-même reste à repasser au
> crible de l'insolite.

```bash
npm run seed           # Insère les 57 activités curées
npm run seed -- --dry-run   # Prévisualisation sans insert
npm run seed -- --clear     # Supprime les activités seedées
```

## Compte admin

Après inscription, exécuter dans Supabase SQL Editor :
```sql
UPDATE public.profiles SET role = 'admin' WHERE username = 'ton_pseudo';
```
