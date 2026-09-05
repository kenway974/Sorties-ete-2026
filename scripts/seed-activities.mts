/**
 * seed-activities.mts
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *   npx tsx scripts/seed-activities.mts
 *   npx tsx scripts/seed-activities.mts --dry-run   # preview only, no insert
 *   npx tsx scripts/seed-activities.mts --clear      # delete seeded rows first
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (service role bypasses RLS so we can insert with status=approved)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { CuriosityKey } from "../src/lib/constants/curiosites";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load env ──────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// NOTE : ce catalogue a été curé pour l'ancien positionnement généraliste. Les
// curiosités ci-dessous sont un report mécanique de l'ancienne taxonomie — le
// contenu lui-même reste à repasser au crible de l'insolite.

// ── Seed account ──────────────────────────────────────────────────────────────
const SEED_CREATOR_ID = "00000000-0000-0000-0000-000000000001"; // parissorties_seed

// ── Activity type ─────────────────────────────────────────────────────────────

interface SeedActivity {
  title: string;
  description: string;
  curiosity: CuriosityKey;
  tags: string[];
  address: string;
  lat: number;
  lng: number;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  price?: number | null;
  max_participants?: number | null;
  external_url?: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ACTIVITÉS À IMPORTER — modifiez ce tableau pour ajouter de nouvelles entrées
// ═══════════════════════════════════════════════════════════════════════════════
const ACTIVITIES: SeedActivity[] = [

  // ── Aquatique / Plein air ────────────────────────────────────────────────────

  {
    title: "Friday Night Fever — Roller en masse dans Paris",
    description: "Chaque vendredi soir, des milliers de rollers envahissent les rues de Paris pour une balade nocturne de 3h à travers la ville. Point de départ place Raoul Dautry, parcours différent chaque semaine sur routes fermées à la circulation. Roller obligatoire, protections recommandées.",
    curiosity: "frisson",
    tags: ["roller", "nocturne", "friday night", "paris", "sport", "groupe", "rue", "gratuit"],
    address: "Place Raoul Dautry, 75015 Paris",
    lat: 48.8416,
    lng: 2.3207,
    date: "2026-06-19",
    time: "21:30",
    price: 0,
    external_url: "https://www.pari-roller.com",
  },

  {
    title: "Lancer de Haches — Bar Adrénaline Indoor",
    description: "Le sport tendance venu du Canada débarque à Paris ! Lancez des haches sur des cibles en bois dans une salle dédiée, avec ou sans instructeur. Session de 45 min pour 1 à 6 joueurs, bières artisanales au bar. Idéal en groupe pour une soirée qui sort de l'ordinaire.",
    curiosity: "savoir-faire",
    tags: ["lancer de haches", "axe throwing", "bar", "insolite", "adrénaline", "groupe", "sport"],
    address: "15 Rue de la Fontaine au Roi, 75011 Paris",
    lat: 48.864,
    lng: 2.372,
    date: "2026-06-19",
    time: "18:00",
    price: 20,
    max_participants: 6,
  },

  {
    title: "Mini-Golf Street Art — Parcours Artistique Indoor",
    description: "Un mini-golf nouvelle génération dans un univers street art fluorescent ! 18 trous décorés par des artistes urbains, peintures UV et installations lumineuses. Accessible à tous les âges, bar et snack sur place. Le rendez-vous hipster de l'été parisien.",
    curiosity: "savoir-faire",
    tags: ["mini-golf", "street art", "uv", "insolite", "jeu", "famille", "bar", "lumière"],
    address: "30 Boulevard de Bonne Nouvelle, 75010 Paris",
    lat: 48.8681,
    lng: 2.3507,
    date: "2026-06-19",
    time: "14:00",
    price: 12,
  },

  {
    title: "Base de Loisirs de Cergy-Pontoise — Aquaparc & Plage",
    description:
      "Le plus grand lac de baignade d'Île-de-France ! Plage de sable fin, toboggans aquatiques, kayak, pédalo, voile et aires de jeux pour toute la famille. L'aquaparc de Cergy est l'adresse incontournable de l'été en région parisienne.",
    curiosity: "mise-en-scene",
    tags: ["aquaparc", "plage", "baignade", "toboggan", "cergy", "lac", "été"],
    address: "1 Allée de la Croix Saint-Martin, 95300 Cergy",
    lat: 49.0334,
    lng: 2.0612,
    date: "2026-06-20",
    time: "10:00",
    price: 12,
    external_url: "https://www.basedeloisirs.fr",
  },

  {
    title: "Stand Up Paddle sur la Seine — Session guidée",
    description:
      "Explorez Paris depuis la Seine sur un paddle board ! Session de 2h encadrée par des moniteurs diplômés, au départ du Pont de l'Alma. Idéal pour les débutants comme pour les pratiquants confirmés. Vue imprenable sur la Tour Eiffel.",
    curiosity: "frisson",
    tags: ["paddle", "sup", "seine", "sport nautique", "outdoor", "paris"],
    address: "Port de la Bourdonnais, Pont de l'Alma, 75007 Paris",
    lat: 48.8638,
    lng: 2.2987,
    date: "2026-06-21",
    time: "09:00",
    price: 35,
    max_participants: 12,
  },

  {
    title: "Wake Park sur câble — Lac de Jablines",
    description:
      "Le wake park de Jablines offre la sensation du wakeboard et du wakesurf sans bateau, grâce à un câble téléski qui tire les riders sur un lac de 14 hectares. Casque et gilet fournis, niveau débutant accepté. Le spot de glisse aquatique le plus populaire d'Île-de-France.",
    curiosity: "frisson",
    tags: ["wakeboard", "wakesurf", "câble", "lac", "glisse", "sport nautique"],
    address: "Base de plein air de Jablines, 77450 Jablines",
    lat: 48.9213,
    lng: 2.7641,
    date: "2026-06-28",
    time: "10:00",
    price: 28,
  },

  {
    title: "Aqualagon — Parc Aquatique Villages Nature Paris",
    description:
      "Le plus grand parc aquatique couvert d'Europe sous une canopée géante ! 5 500 m² de piscines tropicales, vagues, toboggans géants, rivière à courant et spa. Température garantie 29°C toute l'année. Un dépaysement total à 35 min de Paris.",
    curiosity: "mise-en-scene",
    tags: ["aquaparc", "piscine", "toboggan", "vague", "famille", "couvert"],
    address: "Boulevard de Village Nature, 77700 Serris",
    lat: 48.8452,
    lng: 2.7845,
    date: "2026-07-05",
    time: "10:00",
    price: 38,
    external_url: "https://www.villagesnature.com/fr/aqualagon",
  },

  {
    title: "Kayak nocturne sur la Marne — Balade étoilée",
    description:
      "Une expérience unique : descendez la Marne en kayak de nuit, à la lumière de lampes frontales et sous un ciel étoilé. Départ au coucher du soleil, retour après 3h de navigation apaisante entre forêts et villages pittoresques. Niveau débutant accepté.",
    curiosity: "savoir-faire",
    tags: ["kayak", "nuit", "marne", "nature", "nocturne", "outdoor", "insolite"],
    address: "Base nautique de Meaux, 77100 Meaux",
    lat: 48.9613,
    lng: 2.8794,
    date: "2026-07-11",
    time: "20:30",
    price: 42,
    max_participants: 16,
  },

  // ── Festivals & Concerts ─────────────────────────────────────────────────────

  {
    title: "Fête de la Musique 2026 — Paris",
    description:
      "Le 21 juin, la musique s'empare de toutes les rues, places et jardins de Paris ! Des milliers de concerts gratuits dans tous les genres musicaux, du jazz au métal en passant par le classique et l'électro. La nuit la plus musicale de l'année.",
    curiosity: "mise-en-scene",
    tags: ["fête de la musique", "gratuit", "concert", "rue", "outdoor", "paris"],
    address: "Place de la République, 75011 Paris",
    lat: 48.8674,
    lng: 2.3634,
    date: "2026-06-21",
    time: "18:00",
    price: 0,
    external_url: "https://fetedelamusique.culture.gouv.fr",
  },

  {
    title: "Solidays 2026 — Festival de la Solidarité",
    description:
      "Le festival de musique engagé qui soutient la lutte contre le Sida. Trois jours de concerts sur l'Hippodrome de Longchamp avec une programmation électro, pop et world music. Des milliers de bénévoles, un état d'esprit unique de solidarité et de fête.",
    curiosity: "mise-en-scene",
    tags: ["solidays", "festival", "solidarité", "électro", "pop", "longchamp", "outdoor", "engagement"],
    address: "Hippodrome de Paris Longchamp, 75016 Paris",
    lat: 48.8554,
    lng: 2.2421,
    date: "2026-06-26",
    time: "14:00",
    price: 49,
    external_url: "https://www.solidays.org",
  },

  {
    title: "Lollapalooza Paris 2026",
    description:
      "Le festival américain iconique débarque à nouveau à Paris ! Deux jours de concerts avec les plus grandes stars de la pop, du hip-hop, de l'électro et du rock internationale sur 4 scènes simultanées à l'Hippodrome de Longchamp. L'événement musical de l'été parisien.",
    curiosity: "mise-en-scene",
    tags: ["lollapalooza", "festival", "pop", "hip-hop", "électro", "longchamp", "outdoor", "été"],
    address: "Hippodrome de Paris Longchamp, Route des Tribunes, 75016 Paris",
    lat: 48.8554,
    lng: 2.2421,
    date: "2026-07-17",
    time: "14:00",
    price: 89,
    external_url: "https://www.lollapaloozafr.com",
  },

  {
    title: "Cinéma en Plein Air — La Villette",
    description:
      "Chaque été depuis 30 ans, la pelouse de La Villette se transforme en ciné-parc géant sous les étoiles. Apportez votre couverture, votre pique-nique et installez-vous pour des projections gratuites de films cultes et récents.",
    curiosity: "hors-du-temps",
    tags: ["cinéma", "plein air", "gratuit", "la villette", "film", "outdoor", "été"],
    address: "Parc de la Villette, 211 Avenue Jean Jaurès, 75019 Paris",
    lat: 48.8938,
    lng: 2.3887,
    date: "2026-07-22",
    time: "22:00",
    price: 0,
    external_url: "https://www.villette.com",
  },

  {
    title: "Rock en Seine 2026 — Domaine de Saint-Cloud",
    description:
      "Le festival rock et indie premium d'Île-de-France dans le cadre somptueux du Domaine National de Saint-Cloud, avec vue sur Paris. Trois jours de concerts sur plusieurs scènes, avec les plus grands noms de la scène rock internationale.",
    curiosity: "mise-en-scene",
    tags: ["festival", "rock", "indie", "saint-cloud", "outdoor", "été"],
    address: "Domaine National de Saint-Cloud, 92210 Saint-Cloud",
    lat: 48.8401,
    lng: 2.2105,
    date: "2026-08-28",
    time: "15:00",
    price: 55,
    external_url: "https://www.rockenseine.com",
  },

  {
    title: "Jazz à La Villette 2026",
    description:
      "Le grand festival de jazz parisien pour clôturer l'été en beauté. Concerts dans la Grande Halle de La Villette et en plein air, du jazz classique au jazz fusion en passant par l'electro-jazz. Une programmation éclectique pour les amateurs de musique.",
    curiosity: "mise-en-scene",
    tags: ["jazz", "festival", "la villette", "musique", "automne"],
    address: "Grande Halle de La Villette, 211 Avenue Jean Jaurès, 75019 Paris",
    lat: 48.8938,
    lng: 2.3887,
    date: "2026-09-03",
    time: "19:30",
    price: 30,
    external_url: "https://jazzalavillette.com",
  },

  // ── Expériences insolites ────────────────────────────────────────────────────

  {
    title: "Vol en Montgolfière au lever du soleil — Île-de-France",
    description:
      "Survolez les châteaux et forêts d'Île-de-France au lever du soleil depuis une montgolfière. Vol d'1h30 au-dessus de la vallée de Chevreuse ou de la plaine de Versailles, champagne à l'atterrissage. Une expérience romantique et inoubliable.",
    curiosity: "savoir-faire",
    tags: ["montgolfière", "vol", "insolite", "romantique", "survol", "île-de-france"],
    address: "Aérodrome de Saint-Cyr-l'École, 78210 Saint-Cyr-l'École",
    lat: 48.8117,
    lng: 2.0654,
    date: "2026-06-28",
    time: "06:00",
    price: 220,
    max_participants: 8,
  },

  {
    title: "Escape Game Géant en Forêt — Mission Forestière",
    description:
      "Un escape game grandeur nature en pleine forêt de Fontainebleau ! Résolvez des énigmes disséminées dans la forêt, suivez les indices et déjouez les pièges en équipe. 2h d'aventure immersive pour 4 à 8 joueurs, accessible dès 10 ans.",
    curiosity: "savoir-faire",
    tags: ["escape game", "forêt", "fontainebleau", "team building", "insolite", "aventure"],
    address: "Forêt de Fontainebleau, Route Ronde, 77300 Fontainebleau",
    lat: 48.4103,
    lng: 2.6999,
    date: "2026-07-04",
    time: "14:00",
    price: 18,
    max_participants: 8,
  },

  {
    title: "Yoga sur Paddle — Session matinale sur la Marne",
    description:
      "Démarrez votre journée en douceur sur un paddle board amarré en pleine Marne. 1h de yoga guidé au-dessus de l'eau, avec le calme de la rivière et les chants d'oiseaux comme fond sonore. Cours adaptés à tous niveaux, matériel fourni.",
    curiosity: "frisson",
    tags: ["yoga", "paddle", "marne", "bien-être", "outdoor", "matinal", "insolite"],
    address: "Base Nautique de Nogent-sur-Marne, 94130 Nogent-sur-Marne",
    lat: 48.8354,
    lng: 2.4847,
    date: "2026-07-11",
    time: "08:00",
    price: 28,
    max_participants: 10,
  },

  {
    title: "Balade à vélo nocturne — Paris secret de nuit",
    description:
      "Découvrez les rues et monuments de Paris illuminés sous un autre angle, à vélo et en petit groupe. Itinéraire de 3h à travers les arrondissements les plus beaux de la capitale, avec un guide passionné qui révèle les secrets de chaque quartier.",
    curiosity: "savoir-faire",
    tags: ["vélo", "nuit", "paris", "balade", "secret", "nocturne", "insolite"],
    address: "Place du Châtelet, 75004 Paris",
    lat: 48.8580,
    lng: 2.3469,
    date: "2026-06-27",
    time: "21:00",
    price: 24,
    max_participants: 15,
  },

  {
    title: "Dîner-Croisière sur la Seine — Soirée Belle Époque",
    description:
      "Montez à bord d'une péniche de charme pour un dîner avec spectacle tout en naviguant sur la Seine. Menu 4 plats, show de jazz et chansons françaises, et défilé devant tous les monuments illuminés de Paris. La sortie romantique parisienne par excellence.",
    curiosity: "mise-en-scene",
    tags: ["croisière", "seine", "dîner", "romantique", "jazz", "spectacle", "insolite"],
    address: "Port de la Bourdonnais, 75007 Paris",
    lat: 48.8612,
    lng: 2.2987,
    date: "2026-07-17",
    time: "19:30",
    price: 95,
    max_participants: 80,
  },

  {
    title: "Accrobranche & Tyrolienne géante — Forêt de Meudon",
    description:
      "Un parcours d'accrobranche de 14 niveaux de difficulté dans les arbres centenaires de la Forêt de Meudon, avec une tyrolienne de 200m en apothéose. Harnais et casque fournis, ouvert dès 4 ans. Le grand frisson en famille ou entre amis à 20 min de Paris.",
    curiosity: "frisson",
    tags: ["accrobranche", "tyrolienne", "forêt", "meudon", "famille", "aventure", "outdoor"],
    address: "Forêt de Meudon, Route de Villacoublay, 92360 Meudon",
    lat: 48.8020,
    lng: 2.2254,
    date: "2026-07-12",
    time: "10:00",
    price: 22,
  },

  {
    title: "Rooftop Party — Coucher de soleil sur les toits de Paris",
    description:
      "Rejoignez une soirée exclusive sur un rooftop panoramique du 8e avec vue à 360° sur les toits de Paris. DJ set, cocktails de saison et finger food premium. Le lieu le plus instagrammable de l'été parisien.",
    curiosity: "mise-en-scene",
    tags: ["rooftop", "soirée", "coucher de soleil", "cocktail", "dj", "paris", "vue"],
    address: "Avenue des Champs-Élysées, 75008 Paris",
    lat: 48.8698,
    lng: 2.3078,
    date: "2026-07-03",
    time: "19:00",
    price: 20,
    max_participants: 150,
  },

  {
    title: "Atelier Peinture en Plein Air — Impressionnisme à Giverny",
    description:
      "Installez votre chevalet face aux jardins qui ont inspiré Monet ! Atelier peinture de 3h dans le village de Giverny, encadré par un artiste professionnel. Matériel fourni, aucune expérience requise. Transport depuis Paris inclus.",
    curiosity: "hors-du-temps",
    tags: ["peinture", "atelier", "giverny", "monet", "impressionnisme", "art", "nature"],
    address: "Musée des Impressionnismes, 99 Rue Claude Monet, 27620 Giverny",
    lat: 49.0763,
    lng: 1.5314,
    date: "2026-07-19",
    time: "10:00",
    price: 65,
    max_participants: 12,
  },

  {
    title: "Pétanque Nocturne & Pastis — Tournoi en soirée",
    description:
      "Un tournoi de pétanque en nocturne sur des boulins illuminés ! Équipes de 3 joueurs, ambiance provençale garantie. Inscription sur place, ouvert à tous niveaux. Le bar est ouvert toute la soirée.",
    curiosity: "mise-en-scene",
    tags: ["pétanque", "boulodrome", "bois de boulogne", "soirée", "jeu", "convivial"],
    address: "Bois de Boulogne, Route de la Grande Cascade, 75016 Paris",
    lat: 48.8536,
    lng: 2.2461,
    date: "2026-07-09",
    time: "19:00",
    price: 8,
    max_participants: 60,
  },

  {
    title: "Marché Nocturne Artisanal — Village Lumière",
    description:
      "Le marché nocturne le plus cosy d'Île-de-France : 80 créateurs et artisans locaux exposent à la lumière de guirlandes et de lanternes. Bijoux, céramique, vêtements vintage, street food gourmande et concerts acoustiques live jusqu'à minuit.",
    curiosity: "hors-du-temps",
    tags: ["marché", "nocturne", "artisan", "créateurs", "street food", "musique", "guirlandes"],
    address: "Château de Saint-Germain-en-Laye, 78100 Saint-Germain-en-Laye",
    lat: 48.8985,
    lng: 2.0965,
    date: "2026-07-25",
    time: "18:00",
    price: 0,
  },

  {
    title: "Initiation Tir à l'Arc — Forêt de Rambouillet",
    description:
      "Devenez archer le temps d'une après-midi dans un cadre forestier magique. Initiation de 2h à la technique du tir à l'arc avec un moniteur fédéral, sur des cibles de 10 à 30 mètres. Matériel professionnel fourni, accessible dès 8 ans.",
    curiosity: "frisson",
    tags: ["tir à l'arc", "forêt", "rambouillet", "initiation", "outdoor", "nature"],
    address: "Forêt de Rambouillet, 78120 Rambouillet",
    lat: 48.6371,
    lng: 1.8200,
    date: "2026-08-02",
    time: "14:00",
    price: 30,
    max_participants: 20,
  },

  {
    title: "Visite Secrète des Égouts de Paris",
    description:
      "Plongez sous les pavés parisiens dans un labyrinthe souterrain de 2 100 km ! Une visite guidée insolite dans les galeries réelles des égouts de Paris, entre histoire, architecture et mystère. Une expérience unique à raconter, interdite aux claustrophobes légers.",
    curiosity: "hors-du-temps",
    tags: ["égouts", "souterrain", "insolite", "visite guidée", "paris", "urbain", "mystère"],
    address: "Face au 93 Quai d'Orsay, 75007 Paris",
    lat: 48.8615,
    lng: 2.3052,
    date: "2026-06-20",
    time: "14:00",
    price: 14,
    max_participants: 25,
    external_url: "https://musee-egouts.paris.fr",
  },

  {
    title: "Karting Électrique Indoor — Vitesse sans pollution",
    description:
      "Du karting 100% électrique en intérieur sur une piste de 600m avec virages relevés et dos d'âne ! Sensations de pilote sans odeur d'essence. Sessions de 10 minutes chronométrées, classement en temps réel. Accessible dès 14 ans.",
    curiosity: "savoir-faire",
    tags: ["karting", "électrique", "indoor", "vitesse", "sport", "compétition"],
    address: "3 Rue Jules Guesde, 93100 Montreuil",
    lat: 48.8603,
    lng: 2.4389,
    date: "2026-07-05",
    time: "10:00",
    price: 25,
  },

  {
    title: "Randonnée Nocturne — Forêt de Fontainebleau sous les étoiles",
    description:
      "Une randonnée nocturne de 8 km guidée en pleine forêt de Fontainebleau avec observation de la faune nocturne et étoiles filantes. Lampes frontales fournies, guide naturaliste. Une sortie contemplative qui fascine petits et grands.",
    curiosity: "savoir-faire",
    tags: ["randonnée", "nocturne", "forêt", "fontainebleau", "nature", "étoiles", "insolite"],
    address: "Parking du Cul du Chaudron, 77300 Fontainebleau",
    lat: 48.399,
    lng: 2.6897,
    date: "2026-07-18",
    time: "21:30",
    price: 15,
    max_participants: 20,
  },

  {
    title: "Visite Exclusive du Marché de Rungis à l'Aube",
    description:
      "Accédez au mythique MIN de Rungis, le plus grand marché de produits frais au monde, lors d'une visite guidée à l'aube. Pavillons de la viande, de la marée, des fruits et légumes, des fleurs... Un spectacle fascinant réservé aux lève-tôt.",
    curiosity: "hors-du-temps",
    tags: ["rungis", "marché", "gastronomie", "insolite", "visite", "cuisine", "aube"],
    address: "Marché International de Rungis, 94150 Rungis",
    lat: 48.7507,
    lng: 2.3619,
    date: "2026-07-03",
    time: "04:00",
    price: 45,
    max_participants: 20,
  },

  {
    title: "Quad & Moto-Cross — Circuit hors-piste en forêt",
    description:
      "Prenez les commandes d'un quad ou d'une moto-cross sur un circuit hors-piste de 5 km en forêt. Initiation ou perfectionnement, instructeur disponible. Équipement complet fourni. Une adrénaline garantie en pleine nature.",
    curiosity: "frisson",
    tags: ["quad", "moto-cross", "circuit", "forêt", "adrénaline", "outdoor", "vitesse"],
    address: "Circuit de Loisirs de Mortefontaine, 60128 Mortefontaine",
    lat: 49.0987,
    lng: 2.5814,
    date: "2026-08-08",
    time: "10:00",
    price: 55,
    max_participants: 15,
  },

  {
    title: "Atelier Poterie — Créez votre Bol à la Main",
    description:
      "Découvrez la technique du tournage de la poterie lors d'un atelier de 2h animé par une céramiste professionnelle. Vous repartez avec votre propre création (bol, vase ou tasse) cuite et émaillée à votre couleur. L'atelier créatif le plus satisfaisant de Paris.",
    curiosity: "hors-du-temps",
    tags: ["poterie", "céramique", "atelier", "argile", "créatif", "artisanat", "manuel"],
    address: "18 Rue de la Roquette, 75011 Paris",
    lat: 48.8548,
    lng: 2.374,
    date: "2026-07-22",
    time: "14:00",
    price: 55,
    max_participants: 8,
  },

  {
    title: "Atelier Cuisine Gastronomique — Avec un Chef Étoilé",
    description:
      "Apprenez les techniques de la grande cuisine française avec un chef diplômé lors d'un atelier de 3h. Au menu : amuse-bouche, plat principal et dessert que vous dégusterez à table avec un verre de vin. Tablier et livret de recettes fournis.",
    curiosity: "hors-du-temps",
    tags: ["cuisine", "atelier", "chef", "gastronomie", "france", "apprentissage", "dégustation", "vin"],
    address: "28 Rue Saint-Paul, 75004 Paris",
    lat: 48.853,
    lng: 2.3574,
    date: "2026-07-04",
    time: "14:00",
    price: 95,
    max_participants: 10,
  },

  {
    title: "Beach Volley Tournoi Estival — Paris Plages",
    description:
      "Rejoignez le tournoi de beach volley sur le sable de Paris Plages ! Équipes de 2 ou 4 joueurs, matchs en poule puis élimination directe. Inscription gratuite, venir avec votre équipe ou être mis en relation sur place.",
    curiosity: "frisson",
    tags: ["beach volley", "tournoi", "paris plages", "sport", "été", "compétition", "gratuit"],
    address: "Quai de la Tournelle, 75005 Paris",
    lat: 48.8504,
    lng: 2.3504,
    date: "2026-08-08",
    time: "10:00",
    price: 0,
    max_participants: 64,
  },

  {
    title: "Float Therapy — Caisson de Privation Sensorielle",
    description:
      "Flottez dans l'obscurité totale dans un caisson rempli d'eau saturée de sel d'Epsom. La privation sensorielle de 60 à 90 minutes procure une relaxation profonde, réduit le stress et favorise la créativité. L'expérience bien-être la plus insolite et efficace de Paris.",
    curiosity: "savoir-faire",
    tags: ["float", "privation sensorielle", "bien-être", "méditation", "relaxation", "insolite", "spa"],
    address: "27 Rue du Faubourg Poissonnière, 75009 Paris",
    lat: 48.8757,
    lng: 2.3483,
    date: "2026-06-20",
    time: "10:00",
    price: 65,
    max_participants: 1,
  },

  {
    title: "Réalité Virtuelle Immersive — Expérience Multi-Univers",
    description:
      "Plongez dans des univers virtuels bluffants : combats spatiaux, exploration de fonds marins, jeux d'équipe en arène VR, ou expérience d'art numérique immersive. Les casques de dernière génération offrent une immersion totale. Parfait pour les curieux de technologie.",
    curiosity: "savoir-faire",
    tags: ["réalité virtuelle", "vr", "immersif", "technologie", "insolite", "jeu", "futuriste"],
    address: "10 Rue de la Paix, 75002 Paris",
    lat: 48.8694,
    lng: 2.3305,
    date: "2026-06-20",
    time: "11:00",
    price: 18,
    max_participants: 8,
  },

  {
    title: "Escape Game «L'Affaire du Louvre» — Paris",
    description:
      "Un escape game immersif de 60 minutes dans un décor reproduisant les couloirs secrets du Louvre. Résolvez une enquête policière mêlant œuvres d'art volées, codes secrets et mécanismes cachés. 2 à 6 joueurs.",
    curiosity: "savoir-faire",
    tags: ["escape game", "louvre", "enquête", "insolite", "puzzle", "paris"],
    address: "42 Rue de Rivoli, 75001 Paris",
    lat: 48.8604,
    lng: 2.3479,
    date: "2026-06-20",
    time: "11:00",
    price: 28,
    max_participants: 6,
  },

  {
    title: "Tour de Paris en Segway — Monuments & Secrets",
    description:
      "Explorez Paris sur un Segway électrique en 2h ! Itinéraire guidé à travers les plus beaux monuments : Notre-Dame, Sainte-Chapelle, Hôtel de Ville, Centre Pompidou. Guide audio bluetooth, casque fourni. Une façon moderne et ludique de découvrir la capitale.",
    curiosity: "savoir-faire",
    tags: ["segway", "paris", "visite", "monuments", "guide", "électrique", "tourisme", "insolite"],
    address: "Parvis de Notre-Dame, 75004 Paris",
    lat: 48.853,
    lng: 2.3499,
    date: "2026-06-22",
    time: "10:00",
    price: 45,
    max_participants: 10,
  },

  {
    title: "Parcours Ninja Warrior — Franchissez tous les obstacles",
    description:
      "Testez votre force, agilité et endurance sur un parcours Ninja Warrior indoor avec obstacles aquatiques, murs d'escalade, poutres et filets. Sessions de 90 minutes, plusieurs niveaux de difficulté. Accessible dès 8 ans, buvette et vestiaires sur place.",
    curiosity: "frisson",
    tags: ["ninja warrior", "obstacles", "sport", "indoor", "parcours", "force", "agilité"],
    address: "14 Rue Cadet, 75009 Paris",
    lat: 48.8748,
    lng: 2.3445,
    date: "2026-07-01",
    time: "10:00",
    price: 18,
  },

  {
    title: "Salsa en Plein Air — Cours et Soirée Dansante sur les Berges",
    description:
      "Cours de salsa cubaine de niveau débutant sur les berges de Seine, suivi d'une soirée dansante jusqu'à minuit. Orchestre live ou DJ, ambiance latine garantie, partenaires rotatifs pour progresser vite. La meilleure soirée pour danser à Paris cet été.",
    curiosity: "mise-en-scene",
    tags: ["salsa", "danse", "berges", "seine", "cours", "soirée", "musique latine", "outdoor"],
    address: "Berges de la Seine, Quai d'Anjou, 75004 Paris",
    lat: 48.852,
    lng: 2.357,
    date: "2026-07-10",
    time: "19:00",
    price: 10,
    max_participants: 80,
  },

  {
    title: "Escape Boat — Enquête policière sur la Seine",
    description:
      "Un escape game original sur une péniche amarrée sur la Seine ! 60 minutes pour résoudre l'enquête avant que la \"bombe\" explose et que le bateau coule. 3 à 8 joueurs, ambiance thriller, acteurs présents. Le seul escape game flottant de Paris.",
    curiosity: "savoir-faire",
    tags: ["escape game", "péniche", "seine", "enquête", "insolite", "thriller", "puzzle", "original"],
    address: "Port du Louvre, Quai François Mitterrand, 75001 Paris",
    lat: 48.8604,
    lng: 2.34,
    date: "2026-07-11",
    time: "15:00",
    price: 32,
    max_participants: 8,
  },

  {
    title: "Tyrolienne de la Tour Montparnasse — Vol au-dessus de Paris",
    description:
      "Pour la première fois, une tyrolienne géante est installée depuis le sommet de la Tour Montparnasse ! Glissez à 210m de hauteur au-dessus des toits de Paris à plus de 60 km/h sur 300 mètres. Une sensation inédite et vertigineuse au cœur de la capitale.",
    curiosity: "savoir-faire",
    tags: ["tyrolienne", "montparnasse", "hauteur", "vertige", "insolite", "adrénaline", "paris", "vue"],
    address: "Tour Montparnasse, 33 Avenue du Maine, 75015 Paris",
    lat: 48.8421,
    lng: 2.3219,
    date: "2026-07-11",
    time: "10:00",
    price: 65,
  },

  {
    title: "Bal des Pompiers — Nuit du 13 au 14 Juillet",
    description:
      "La tradition parisienne par excellence : les casernes de pompiers ouvrent leurs portes pour une nuit de bal populaire festif et bon enfant. Musique live, buvette, ambiance conviviale dans une cour de caserne. Entrée gratuite ou modique selon les casernes.",
    curiosity: "mise-en-scene",
    tags: ["bal des pompiers", "14 juillet", "fête nationale", "gratuit", "populaire", "dancing", "tradition"],
    address: "Caserne des Sapeurs-Pompiers, 75011 Paris",
    lat: 48.8613,
    lng: 2.378,
    date: "2026-07-13",
    time: "21:00",
    price: 3,
  },

  {
    title: "Défilé Militaire du 14 Juillet — Champs-Élysées",
    description:
      "Le défilé militaire national du 14 juillet sur les Champs-Élysées : parade des armées de terre, de mer et de l'air, défilé des formations militaires et survol de la Patrouille de France. Le spectacle patriotique le plus impressionnant de l'année, gratuit sur invitation ou depuis les trottoirs.",
    curiosity: "hors-du-temps",
    tags: ["14 juillet", "défilé", "armée", "champs-élysées", "fête nationale", "gratuit", "patrouille de france"],
    address: "Avenue des Champs-Élysées, 75008 Paris",
    lat: 48.8698,
    lng: 2.3078,
    date: "2026-07-14",
    time: "10:00",
    price: 0,
  },

  {
    title: "Feux d'Artifice du 14 Juillet — Tour Eiffel",
    description:
      "Le plus beau feu d'artifice du monde illumine le ciel de Paris chaque 14 juillet ! Tiré depuis le Champ-de-Mars, le spectacle pyrotechnique de 40 minutes attire plus d'un million de spectateurs. Installez-vous tôt pour avoir la meilleure place face à la Tour Eiffel.",
    curiosity: "savoir-faire",
    tags: ["14 juillet", "feux d'artifice", "tour eiffel", "fête nationale", "gratuit", "spectacle"],
    address: "Champ-de-Mars, 75007 Paris",
    lat: 48.8566,
    lng: 2.2922,
    date: "2026-07-14",
    time: "23:00",
    price: 0,
  },

  {
    title: "Grandes Eaux Musicales de Versailles",
    description:
      "Chaque week-end d'été, les fontaines du château de Versailles s'animent au son de la musique baroque dans les jardins royaux. Une expérience majestueuse et immersive dans l'un des plus beaux jardins du monde, illuminé et animé comme au temps du Roi Soleil.",
    curiosity: "hors-du-temps",
    tags: ["versailles", "fontaines", "jardins", "baroque", "musique", "classique", "château", "été"],
    address: "Château de Versailles, Place d'Armes, 78000 Versailles",
    lat: 48.8049,
    lng: 2.1204,
    date: "2026-07-18",
    time: "11:00",
    price: 11,
    external_url: "https://chateauversailles-spectacles.fr",
  },

  {
    title: "Paris Plages 2026 — Rives de Seine",
    description:
      "Chaque été, les quais de Seine se transforment en véritable station balnéaire urbaine : sable, transats, animations sportives, concerts et jeux d'eau gratuits. L'événement estival emblématique de Paris, ouvert à tous et entièrement gratuit.",
    curiosity: "savoir-faire",
    tags: ["plage", "seine", "gratuit", "été", "paris", "outdoor", "famille"],
    address: "Quai de Gesvres, 75004 Paris",
    lat: 48.8571,
    lng: 2.3482,
    date: "2026-07-19",
    time: "08:00",
    price: 0,
    external_url: "https://www.paris.fr/paris-plages",
  },

  {
    title: "Soirée Péniche — DJ Set au fil de la Seine",
    description:
      "Montez à bord d'une péniche pour une soirée électro et house en naviguant sur la Seine. Le bateau fait des aller-retours entre la Bastille et le Pont de l'Alma pendant 4h. Bar ouvert toute la nuit, DJ set non-stop, terrasse extérieure sur le pont.",
    curiosity: "mise-en-scene",
    tags: ["péniche", "dj set", "seine", "électro", "house", "soirée", "bateau", "nocturne"],
    address: "Port de Plaisance de Paris-Arsenal, 75012 Paris",
    lat: 48.8497,
    lng: 2.3635,
    date: "2026-07-24",
    time: "22:00",
    price: 15,
    max_participants: 200,
  },

  {
    title: "Paintball en Forêt — Scénarios Tactiques",
    description:
      "Une partie de paintball intense dans un terrain boisé de 3 hectares avec décors militaires, bunkers et véhicules. 6 scénarios différents : capture de drapeau, assaut de base, zombie mode... Équipement complet fourni, 200 billes incluses par joueur.",
    curiosity: "frisson",
    tags: ["paintball", "forêt", "tactique", "adrénaline", "groupe", "team building", "jeu"],
    address: "Forêt de Sénart, 91350 Brunoy",
    lat: 48.6808,
    lng: 2.4917,
    date: "2026-07-25",
    time: "10:00",
    price: 35,
    max_participants: 30,
  },

  {
    title: "Dégustation Champagne & Visite Cave — Épernay",
    description:
      "Rejoignez une excursion d'une journée à Épernay, capitale mondiale du champagne. Visite des caves souterraines d'une grande maison de champagne, dégustation de 5 cuvées différentes commentées par un sommelier. Transport depuis Paris inclus.",
    curiosity: "savoir-faire",
    tags: ["champagne", "dégustation", "épernay", "vin", "cave", "excursion", "gastronomie"],
    address: "Avenue de Champagne, 51200 Épernay",
    lat: 49.0453,
    lng: 3.958,
    date: "2026-07-26",
    time: "08:30",
    price: 89,
    max_participants: 25,
  },

  {
    title: "Catacombes de Paris — Visite Guidée Nocturne",
    description:
      "Descendez à 20m sous Paris dans l'ossuaire municipal qui abrite les restes de 6 millions de Parisiens. En visite guidée nocturne aux flambeaux, les galeries prennent une atmosphère encore plus mystérieuse. La visite souterraine la plus troublante et fascinante de la capitale.",
    curiosity: "hors-du-temps",
    tags: ["catacombes", "souterrain", "nocturne", "histoire", "insolite", "mystère", "paris", "mort"],
    address: "1 Avenue du Colonel Henri Rol-Tanguy, 75014 Paris",
    lat: 48.8338,
    lng: 2.3322,
    date: "2026-07-31",
    time: "19:00",
    price: 29,
    max_participants: 20,
    external_url: "https://www.catacombes.paris.fr",
  },

  {
    title: "Nuit des Étoiles — Observation astronomique en forêt",
    description:
      "La nuit des étoiles filantes de l'été : sortie astronomique en forêt de Fontainebleau pour observer les Perséides avec des télescopes professionnels. Astronome bénévole présent pour guider les observations. Apportez une couverture et vos yeux grand ouverts !",
    curiosity: "savoir-faire",
    tags: ["astronomie", "étoiles", "perséides", "forêt", "fontainebleau", "observation", "nuit", "gratuit"],
    address: "Forêt de Fontainebleau, 77300 Fontainebleau",
    lat: 48.399,
    lng: 2.6897,
    date: "2026-08-08",
    time: "22:00",
    price: 0,
  },

  {
    title: "Cirque Électrique — Nouveau Cirque Contemporain",
    description:
      "Un spectacle de cirque contemporain époustouflant qui mêle acrobaties, danse, vidéo-mapping et musique électronique live. Loin des cirques traditionnels, ce show de 90 minutes surprend par sa créativité visuelle et ses performances athlétiques extrêmes.",
    curiosity: "hors-du-temps",
    tags: ["cirque", "contemporain", "acrobatie", "spectacle", "danse", "insolite", "vidéo-mapping"],
    address: "La Villette, 75019 Paris",
    lat: 48.8938,
    lng: 2.3887,
    date: "2026-08-14",
    time: "20:00",
    price: 28,
    max_participants: 300,
  },

  {
    title: "Concert Classique — Symphonie sous les Étoiles à Versailles",
    description:
      "L'Orchestre National de France joue sous les étoiles dans le parc du Château de Versailles lors des Grandes Nuits de Versailles. Œuvres de Mozart, Beethoven et Debussy interprétées devant les fontaines illuminées. Le concert le plus majestueux de l'été.",
    curiosity: "mise-en-scene",
    tags: ["classique", "symphonie", "versailles", "orchestre", "étoiles", "outdoor", "majestueux"],
    address: "Parc du Château de Versailles, 78000 Versailles",
    lat: 48.8049,
    lng: 2.1204,
    date: "2026-08-21",
    time: "21:00",
    price: 48,
    external_url: "https://chateauversailles-spectacles.fr",
  },

  {
    title: "Trail des Châteaux — Course Nature à Versailles",
    description:
      "Une course à pied de 10 ou 20 km à travers les forêts et jardins autour du Château de Versailles. Parcours balisé, ravitaillements, médaille finisher. Ouverte aux coureurs de tous niveaux, ambiance conviviale et décor royal. La course la plus belle d'Île-de-France.",
    curiosity: "frisson",
    tags: ["trail", "running", "versailles", "nature", "course", "forêt", "châteaux", "sport"],
    address: "Château de Versailles, 78000 Versailles",
    lat: 48.8049,
    lng: 2.1204,
    date: "2026-09-06",
    time: "09:00",
    price: 25,
    max_participants: 500,
  },

  {
    title: "Journées Européennes du Patrimoine — Paris",
    description:
      "Chaque 3e week-end de septembre, des centaines de monuments habituellement fermés ouvrent leurs portes gratuitement : ministères, palais, ambassades, châteaux, ateliers d'artistes, coulisses de théâtres. La plus grande fête culturelle populaire de France.",
    curiosity: "hors-du-temps",
    tags: ["patrimoine", "monuments", "gratuit", "visites", "histoire", "architecture", "culture"],
    address: "Hôtel de Ville de Paris, 75004 Paris",
    lat: 48.8566,
    lng: 2.3522,
    date: "2026-09-19",
    time: "09:00",
    price: 0,
    external_url: "https://journeesdupatrimoine.culture.gouv.fr",
  },

  {
    title: "Techno Parade Paris 2026",
    description:
      "Le plus grand défilé de musique électronique au monde revient dans les rues de Paris ! Des chars musicaux traversent la capitale de la Bastille à Montparnasse, suivis par des dizaines de milliers de fêtards. La fête de la musique électronique parisienne, gratuite et ouverte à tous.",
    curiosity: "mise-en-scene",
    tags: ["techno parade", "électro", "défilé", "gratuit", "fête", "rue", "danse", "techno"],
    address: "Place de la Bastille, 75011 Paris",
    lat: 48.8533,
    lng: 2.3692,
    date: "2026-09-19",
    time: "14:00",
    price: 0,
    external_url: "https://www.technoparade.fr",
  },

  {
    title: "Nuit Blanche 2026 — Art et Culture toute la nuit",
    description:
      "La nuit où Paris ne dort pas ! Des dizaines d'installations artistiques, performances et expositions envahissent les rues et monuments de la capitale de la nuit tombée jusqu'au lever du soleil. Entrée libre dans tous les lieux participants. La nuit culturelle la plus folle de l'année.",
    curiosity: "hors-du-temps",
    tags: ["nuit blanche", "art", "installations", "gratuit", "nuit", "culture", "paris", "contemporain"],
    address: "Centre Pompidou, Place Georges Pompidou, 75004 Paris",
    lat: 48.8607,
    lng: 2.3523,
    date: "2026-10-03",
    time: "19:00",
    price: 0,
    external_url: "https://www.paris.fr/nuitblanche",
  },

];
// ═══════════════════════════════════════════════════════════════════════════════

const isDryRun = process.argv.includes("--dry-run");
const isClear  = process.argv.includes("--clear");

async function main() {
  console.log(`\n🌟  Hors-Piste — Seed Script`);
  console.log(`📋  ${ACTIVITIES.length} activités à importer\n`);

  if (isDryRun) {
    console.log("🔍  DRY RUN — aucune insertion effectuée\n");
    for (const a of ACTIVITIES) {
      console.log(`  • [${a.curiosity}] ${a.title} (${a.date} ${a.time}) — ${a.price ?? "gratuit"}€`);
    }
    return;
  }

  if (isClear) {
    console.log("🗑️   Suppression des activités seedées précédemment...");
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("source", "curated")
      .eq("creator_id", SEED_CREATOR_ID);
    if (error) { console.error("  ❌", error.message); process.exit(1); }
    console.log("  ✅  Supprimées\n");
  }

  // Check for duplicates by (title, date)
  const { data: existing } = await supabase
    .from("activities")
    .select("title, date")
    .eq("source", "curated");

  const existingKeys = new Set(
    (existing ?? []).map((a: { title: string; date: string }) => `${a.title}__${a.date}`)
  );

  let inserted = 0;
  let skipped  = 0;

  for (const activity of ACTIVITIES) {
    const key = `${activity.title}__${activity.date}`;
    if (existingKeys.has(key)) {
      console.log(`  ⏭️   Déjà présent : ${activity.title}`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from("activities").insert({
      ...activity,
      creator_id: SEED_CREATOR_ID,
      status:     "approved",
      source:     "curated",
    });

    if (error) {
      console.error(`  ❌  Erreur pour "${activity.title}":`, error.message);
    } else {
      console.log(`  ✅  Ajouté : ${activity.title}`);
      inserted++;
    }
  }

  console.log(`\n🎉  Import terminé : ${inserted} ajoutées, ${skipped} ignorées (doublons)\n`);
}

main().catch(console.error);
