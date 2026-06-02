# ParisSorties — Paris Activities Discovery

PWA pour découvrir les activités, événements et sorties à Paris.

## Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Carte**: React Leaflet + OpenStreetMap
- **i18n**: next-intl (FR, EN, ES, IT, PT, ZH)
- **PWA**: Service Worker natif

## Démarrage rapide

```bash
npm install
cp .env.local.example .env.local
# Remplir les variables Supabase dans .env.local
npm run dev
```

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter les migrations dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_buckets.sql`
3. Remplir `.env.local` avec l'URL et les clés API

### Créer un compte admin

Après inscription, exécuter dans Supabase SQL Editor :
```sql
UPDATE public.profiles SET role = 'admin' WHERE username = 'votre_pseudo';
```

## Structure

```
src/
├── app/[locale]/         # Pages (Next.js App Router)
├── components/
│   ├── activities/       # Cartes, formulaires, détail
│   ├── auth/             # Login, Register
│   ├── filters/          # Recherche, catégories, filtres
│   ├── layout/           # Header, Footer, LanguageSwitcher
│   ├── map/              # MapView (Leaflet)
│   └── ui/               # Button, Input, Modal, Badge, StarRating
├── i18n/                 # Configuration next-intl
├── lib/
│   ├── hooks/            # useActivities, useFavorites, useGeolocation
│   ├── supabase/         # Client browser + server
│   └── utils/            # cn, formatters, distance
├── messages/             # Traductions (fr, en, es, it, pt, zh)
└── types/                # TypeScript types
```

## Pages

| Route | Description |
|-------|-------------|
| `/[locale]` | Accueil avec carte interactive |
| `/[locale]/activities` | Liste des activités avec filtres |
| `/[locale]/activities/[id]` | Détail d'une activité |
| `/[locale]/auth/login` | Connexion |
| `/[locale]/auth/register` | Inscription |
| `/[locale]/profile` | Profil utilisateur |
| `/[locale]/favorites` | Favoris |
| `/[locale]/propose` | Proposer une activité |
| `/[locale]/admin` | Administration (admin/modérateur) |

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
