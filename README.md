# MoodMap — Découverte de sorties à Paris

PWA de découverte d'activités, événements et sorties à Paris et en Île-de-France.

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
| `ANTHROPIC_API_KEY` | Clé API Claude (modération IA) |
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
```

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
| `import-qfap` | pg_cron toutes les 6h | Import Que Faire à Paris |
| `import-openagenda` | pg_cron toutes les 6h | Import OpenAgenda |
| `moderate-activity` | Proposition utilisateur | Modération IA (Claude Haiku) |
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
│   ├── notifications/         # PushPrompt, PushToggle
│   └── ui/                    # Button, Input, Badge, StarRating...
├── lib/
│   ├── hooks/                 # useActivities, useFavorites, useItinerary...
│   ├── supabase/              # Client browser + server
│   └── utils/                 # formatters, rateLimit, cn...
└── types/                     # TypeScript types
```

## Seeder

```bash
npm run seed           # Insère les 58 activités curées
npm run seed -- --dry-run   # Prévisualisation sans insert
npm run seed -- --clear     # Supprime les activités seedées
```

## Compte admin

Après inscription, exécuter dans Supabase SQL Editor :
```sql
UPDATE public.profiles SET role = 'admin' WHERE username = 'ton_pseudo';
```
