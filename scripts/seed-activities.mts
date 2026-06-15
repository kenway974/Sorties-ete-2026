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

// ── Seed account ──────────────────────────────────────────────────────────────
const SEED_CREATOR_ID = "00000000-0000-0000-0000-000000000001"; // parissorties_seed

// ── Activity type ─────────────────────────────────────────────────────────────
type Category =
  | "soirees" | "concerts" | "expositions" | "restaurants"
  | "bars" | "sport" | "culture" | "famille" | "etudiants"
  | "networking" | "loisirs";

interface SeedActivity {
  title: string;
  description: string;
  category: Category;
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
    title: "Base de Loisirs de Cergy-Pontoise — Aquaparc & Plage",
    description:
      "Le plus grand lac de baignade d'Île-de-France ! Plage de sable fin, toboggans aquatiques, kayak, pédalo, voile et aires de jeux pour toute la famille. L'aquaparc de Cergy est l'adresse incontournable de l'été en région parisienne.",
    category: "famille",
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
    title: "Paris Plages — Rives de Seine 2026",
    description:
      "Chaque été, les quais de Seine se transforment en véritable station balnéaire urbaine : sable, transats, animations sportives, concerts et jeux d'eau gratuits. L'événement estival emblématique de Paris, ouvert à tous et entièrement gratuit.",
    category: "loisirs",
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
    title: "Stand Up Paddle sur la Seine — Session guidée",
    description:
      "Explorez Paris depuis la Seine sur un paddle board ! Session de 2h encadrée par des moniteurs diplômés, au départ du Pont de l'Alma. Idéal pour les débutants comme pour les pratiquants confirmés. Vue imprenable sur la Tour Eiffel.",
    category: "sport",
    tags: ["paddle", "sup", "seine", "sport nautique", "outdoor", "paris"],
    address: "Port de la Bourdonnais, Pont de l'Alma, 75007 Paris",
    lat: 48.8638,
    lng: 2.2987,
    date: "2026-06-21",
    time: "09:00",
    price: 35,
    max_participants: 12,
    external_url: null,
  },

  {
    title: "Wake Park — Glisse sur câble à Jablines",
    description:
      "Le wake park de Jablines offre la sensation du wakeboard et du wakesurf sans bateau, grâce à un câble téléski qui tire les riders sur un lac de 14 hectares. Casque et gilet fournis, niveau débutant accepté. Le spot de glisse aquatique le plus populaire d'Île-de-France.",
    category: "sport",
    tags: ["wakeboard", "wakesurf", "câble", "lac", "glisse", "sport nautique"],
    address: "Base de plein air de Jablines, 77450 Jablines",
    lat: 48.9213,
    lng: 2.7641,
    date: "2026-06-28",
    time: "10:00",
    price: 28,
    external_url: null,
  },

  {
    title: "Aqualagon — Parc aquatique Villages Nature Paris",
    description:
      "Le plus grand parc aquatique couvert d'Europe sous une canopée géante ! 5 500 m² de piscines tropicales, vagues, toboggans géants, rivière à courant et spa. Température garantie 29°C toute l'année. Un dépaysement total à 35 min de Paris.",
    category: "famille",
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
    category: "loisirs",
    tags: ["kayak", "nuit", "marne", "nature", "nocturne", "outdoor", "insolite"],
    address: "Base nautique de Meaux, 77100 Meaux",
    lat: 48.9613,
    lng: 2.8794,
    date: "2026-07-11",
    time: "20:30",
    price: 42,
    max_participants: 16,
    external_url: null,
  },

  // ── Festivals & Concerts ─────────────────────────────────────────────────────

  {
    title: "Fête de la Musique 2026 — Paris",
    description:
      "Le 21 juin, la musique s'empare de toutes les rues, places et jardins de Paris ! Des milliers de concerts gratuits dans tous les genres musicaux, du jazz au métal en passant par le classique et l'électro. La nuit la plus musicale de l'année.",
    category: "concerts",
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
    title: "We Love Green 2026 — Festival éco-responsable",
    description:
      "Le festival incontournable de la scène électro et indie en plein cœur du Bois de Vincennes. Scènes multiples, artistes internationaux, restauration bio et zéro plastique. Un week-end de musique dans un écrin de verdure à deux pas de Paris.",
    category: "concerts",
    tags: ["festival", "électro", "indie", "bois de vincennes", "éco", "outdoor"],
    address: "Bois de Vincennes, Pelouse de Reuilly, 75012 Paris",
    lat: 48.8327,
    lng: 2.4447,
    date: "2026-06-05",
    time: "14:00",
    price: 69,
    external_url: "https://www.welovegreen.fr",
  },

  {
    title: "Cinéma en Plein Air — La Villette",
    description:
      "Chaque été depuis 30 ans, la Géode de La Villette se transforme en ciné-parc géant sous les étoiles. Apportez votre couverture, votre pique-nique et installez-vous sur la grande pelouse pour des projections gratuites de films cultes et récents.",
    category: "culture",
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
    category: "concerts",
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
    category: "concerts",
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
    category: "loisirs",
    tags: ["montgolfière", "vol", "insolite", "romantique", "survol", "île-de-france"],
    address: "Aérodrome de Saint-Cyr-l'École, 78210 Saint-Cyr-l'École",
    lat: 48.8117,
    lng: 2.0654,
    date: "2026-06-28",
    time: "06:00",
    price: 220,
    max_participants: 8,
    external_url: null,
  },

  {
    title: "Escape Game Géant en Forêt — Mission Forestière",
    description:
      "Un escape game grandeur nature en pleine forêt de Fontainebleau ! Résolvez des énigmes disséminées dans la forêt, suivez les indices et déjouez les pièges en équipe. 2h d'aventure immersive pour 4 à 8 joueurs, accessible dès 10 ans.",
    category: "loisirs",
    tags: ["escape game", "forêt", "fontainebleau", "team building", "insolite", "aventure"],
    address: "Forêt de Fontainebleau, Route Ronde, 77300 Fontainebleau",
    lat: 48.4103,
    lng: 2.6999,
    date: "2026-07-04",
    time: "14:00",
    price: 18,
    max_participants: 8,
    external_url: null,
  },

  {
    title: "Yoga sur paddle — Session matinale sur la Marne",
    description:
      "Démarrez votre journée en douceur sur un paddle board amarré en pleine Marne. 1h de yoga guidé au-dessus de l'eau, avec le calme de la rivière et les chants d'oiseaux comme fond sonore. Cours adaptés à tous niveaux, matériel fourni.",
    category: "sport",
    tags: ["yoga", "paddle", "marne", "bien-être", "outdoor", "matinal", "insolite"],
    address: "Base Nautique de Nogent-sur-Marne, 94130 Nogent-sur-Marne",
    lat: 48.8354,
    lng: 2.4847,
    date: "2026-07-11",
    time: "08:00",
    price: 28,
    max_participants: 10,
    external_url: null,
  },

  {
    title: "Balade à vélo nocturne — Paris secret de nuit",
    description:
      "Découvrez les rues et monuments de Paris illuminés sous un autre angle, à vélo et en petit groupe. Itinéraire de 3h à travers les arrondissements les plus beaux de la capitale, avec un guide passionné qui révèle les secrets de chaque quartier.",
    category: "loisirs",
    tags: ["vélo", "nuit", "paris", "balade", "secret", "nocturne", "insolite"],
    address: "Place du Châtelet, 75004 Paris",
    lat: 48.8580,
    lng: 2.3469,
    date: "2026-06-27",
    time: "21:00",
    price: 24,
    max_participants: 15,
    external_url: null,
  },

  {
    title: "Dîner-croisière sur la Seine — Soirée Belle Époque",
    description:
      "Montez à bord d'une péniche de charme pour un dîner avec spectacle tout en naviguant sur la Seine. Menu 4 plats, show de jazz et chansons françaises, et défilé devant tous les monuments illuminés de Paris. La sortie romantique parisienne par excellence.",
    category: "soirees",
    tags: ["croisière", "seine", "dîner", "romantique", "jazz", "spectacle", "insolite"],
    address: "Port de la Bourdonnais, 75007 Paris",
    lat: 48.8612,
    lng: 2.2987,
    date: "2026-07-18",
    time: "19:30",
    price: 95,
    max_participants: 80,
    external_url: null,
  },

  {
    title: "Accrobranche & Tyrolienne géante — Forêt de Meudon",
    description:
      "Un parcours d'accrobranche de 14 niveaux de difficulté dans les arbres centenaires de la Forêt de Meudon, avec une tyrolienne de 200m en apothéose. Harnais et casque fournis, ouvert dès 4 ans. Le grand frisson en famille ou entre amis à 20 min de Paris.",
    category: "sport",
    tags: ["accrobranche", "tyrolienne", "forêt", "meudon", "famille", "aventure", "outdoor"],
    address: "Forêt de Meudon, Route de Villacoublay, 92360 Meudon",
    lat: 48.8020,
    lng: 2.2254,
    date: "2026-07-12",
    time: "10:00",
    price: 22,
    external_url: null,
  },

  {
    title: "Rooftop Party — Soirée coucher de soleil sur les toits de Paris",
    description:
      "Rejoignez une soirée exclusive sur un rooftop panoramique du 8e arrondissement avec vue à 360° sur les toits de Paris. DJ set, cocktails de saison et finger food premium. Le lieu le plus instagrammable de l'été parisien.",
    category: "soirees",
    tags: ["rooftop", "soirée", "coucher de soleil", "cocktail", "dj", "paris", "vue"],
    address: "Avenue des Champs-Élysées, 75008 Paris",
    lat: 48.8698,
    lng: 2.3078,
    date: "2026-07-03",
    time: "19:00",
    price: 20,
    max_participants: 150,
    external_url: null,
  },

  {
    title: "Peinture en plein air — Atelier impressionniste à Giverny",
    description:
      "Installez votre chevalet face aux jardins qui ont inspiré Monet ! Un atelier peinture de 3h dans le village de Giverny, encadré par un artiste professionnel. Matériel fourni, aucune expérience requise. Transport depuis Paris inclus.",
    category: "culture",
    tags: ["peinture", "atelier", "giverny", "monet", "impressionnisme", "art", "nature"],
    address: "Musée des Impressionnismes, 99 Rue Claude Monet, 27620 Giverny",
    lat: 49.0763,
    lng: 1.5314,
    date: "2026-07-19",
    time: "10:00",
    price: 65,
    max_participants: 12,
    external_url: null,
  },

  {
    title: "Soirée Pétanque & Pastis — Tournoi nocturne",
    description:
      "Un tournoi de pétanque en nocturne sur les boulins illuminés du Bois de Boulogne ! Équipes de 3 joueurs, boulettes dorées, pastis et ambiance provençale garantie. Inscription sur place, ouvert à tous niveaux. Le bar est ouvert toute la soirée.",
    category: "soirees",
    tags: ["pétanque", "boulodrome", "bois de boulogne", "soirée", "jeu", "convivial"],
    address: "Bois de Boulogne, Route de la Grande Cascade, 75016 Paris",
    lat: 48.8536,
    lng: 2.2461,
    date: "2026-07-09",
    time: "19:00",
    price: 8,
    max_participants: 60,
    external_url: null,
  },

  {
    title: "Marché Nocturne Artisanal — Village Lumière",
    description:
      "Le marché nocturne le plus cosy d'Île-de-France : 80 créateurs et artisans locaux exposent à la lumière de guirlandes et de lanternes. Bijoux, céramique, vêtements vintage, street food gourmande et concerts acoustiques live jusqu'à minuit.",
    category: "culture",
    tags: ["marché", "nocturne", "artisan", "créateurs", "street food", "musique", "guirlandes"],
    address: "Château de Saint-Germain-en-Laye, 78100 Saint-Germain-en-Laye",
    lat: 48.8985,
    lng: 2.0965,
    date: "2026-07-25",
    time: "18:00",
    price: 0,
    external_url: null,
  },

  {
    title: "Initiation Tir à l'Arc — Forêt de Rambouillet",
    description:
      "Devenez archer le temps d'une après-midi dans un cadre forestier magique. Initiation de 2h à la technique du tir à l'arc avec un moniteur fédéral, sur des cibles de 10 à 30 mètres. Matériel professionnel fourni, accessible dès 8 ans.",
    category: "sport",
    tags: ["tir à l'arc", "forêt", "rambouillet", "initiation", "outdoor", "nature"],
    address: "Forêt de Rambouillet, 78120 Rambouillet",
    lat: 48.6371,
    lng: 1.8200,
    date: "2026-08-02",
    time: "14:00",
    price: 30,
    max_participants: 20,
    external_url: null,
  },

  {
    title: "Visite Secrète des Égouts de Paris",
    description:
      "Plongez sous les pavés parisiens dans un labyrinthe souterrain de 2 100 km ! Une visite guidée insolite dans les galeries réelles des égouts de Paris, entre histoire, architecture et mystère. Une expérience unique à raconter, interdite aux claustrophobes légers.",
    category: "culture",
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
    title: "Karting Électrique Indoor — Paris",
    description:
      "Du karting 100% électrique en intérieur sur une piste de 600 m avec virages relevés et dos d'âne ! Sensations de pilote sans odeur d'essence. Sessions de 10 minutes chronométrées, classement en temps réel. Accessible dès 14 ans.",
    category: "loisirs",
    tags: ["karting", "électrique", "indoor", "vitesse", "sport", "compétition"],
    address: "3 Rue Jules Guesde, 93100 Montreuil",
    lat: 48.8603,
    lng: 2.4389,
    date: "2026-07-05",
    time: "10:00",
    price: 25,
    external_url: null,
  },

  {
    title: "Randonnée Nocturne Bioluminescente — Forêt de Fontainebleau",
    description:
      "Une randonnée nocturne de 8 km guidée en pleine forêt de Fontainebleau avec observation de champignons bioluminescents et étoiles filantes. Lampes frontales fournies, guide naturaliste. Une sortie contemplative et scientifique qui fascine petits et grands.",
    category: "loisirs",
    tags: ["randonnée", "nocturne", "forêt", "fontainebleau", "nature", "bioluminescence", "étoiles"],
    address: "Parking du Cul du Chaudron, 77300 Fontainebleau",
    lat: 48.3990,
    lng: 2.6897,
    date: "2026-07-18",
    time: "21:30",
    price: 15,
    max_participants: 20,
    external_url: null,
  },

  {
    title: "Visite du Marché Rungis — Le plus grand marché du monde",
    description:
      "Accédez au mythique MIN de Rungis, le plus grand marché de produits frais au monde, lors d'une visite guidée exclusive à l'aube. Pavillons de la viande, de la marée, des fruits et légumes, des fleurs... Un spectacle fascinant réservé aux lève-tôt.",
    category: "culture",
    tags: ["rungis", "marché", "gastronomie", "insolite", "visite", "cuisine", "aube"],
    address: "Marché International de Rungis, 94150 Rungis",
    lat: 48.7507,
    lng: 2.3619,
    date: "2026-07-03",
    time: "04:00",
    price: 45,
    max_participants: 20,
    external_url: null,
  },

  {
    title: "Quad & Moto-Cross — Circuit en forêt",
    description:
      "Prenez les commandes d'un quad ou d'une moto-cross sur un circuit hors-piste de 5 km en forêt. Initiation ou perfectionnement, instructeur disponible. Équipement complet fourni (casque, gants, bottes). Une adrénaline garantie en pleine nature.",
    category: "sport",
    tags: ["quad", "moto-cross", "circuit", "forêt", "adrénaline", "outdoor", "vitesse"],
    address: "Circuit de Loisirs de Mortefontaine, 60128 Mortefontaine",
    lat: 49.0987,
    lng: 2.5814,
    date: "2026-08-08",
    time: "10:00",
    price: 55,
    max_participants: 15,
    external_url: null,
  },

  {
    title: "Atelier Mosaïque Romaine — Musée de l'Arles Antique",
    description:
      "Créez votre propre mosaïque dans les ateliers d'un artisan spécialisé en techniques romaines antiques. 3h d'atelier pour repartir avec une œuvre authentique aux motifs inspirés de l'Antiquité. Matériaux et outillage fournis, aucune expérience requise.",
    category: "culture",
    tags: ["mosaïque", "atelier", "art", "romain", "créatif", "artisanat"],
    address: "12 Rue du Faubourg Saint-Antoine, 75011 Paris",
    lat: 48.8530,
    lng: 2.3726,
    date: "2026-07-26",
    time: "14:00",
    price: 55,
    max_participants: 8,
    external_url: null,
  },

  {
    title: "Beach Volley Tournament — Paris Plages",
    description:
      "Rejoignez le tournoi de beach volley estival sur le sable de Paris Plages ! Équipes de 2 ou 4 joueurs, matchs en poule puis élimination directe. Trophée et prix pour les vainqueurs. Inscription gratuite, venir avec votre équipe ou être mis en relation sur place.",
    category: "sport",
    tags: ["beach volley", "tournoi", "paris plages", "sport", "été", "compétition", "gratuit"],
    address: "Quai de la Tournelle, 75005 Paris",
    lat: 48.8504,
    lng: 2.3504,
    date: "2026-08-08",
    time: "10:00",
    price: 0,
    max_participants: 64,
    external_url: null,
  },

  {
    title: "Escape Game «L'Affaire du Louvre» — Paris",
    description:
      "Un escape game immersif de 60 minutes dans un décor reproduisant les couloirs secrets du Louvre. Résolvez une enquête policière mêlant œuvres d'art volées, codes secrets et mécanismes cachés. 2 à 6 joueurs, 3 niveaux de difficulté disponibles.",
    category: "loisirs",
    tags: ["escape game", "louvre", "enquête", "insolite", "puzzle", "paris"],
    address: "42 Rue de Rivoli, 75001 Paris",
    lat: 48.8604,
    lng: 2.3479,
    date: "2026-06-20",
    time: "11:00",
    price: 28,
    max_participants: 6,
    external_url: null,
  },
];
// ═══════════════════════════════════════════════════════════════════════════════

const isDryRun = process.argv.includes("--dry-run");
const isClear  = process.argv.includes("--clear");

async function main() {
  console.log(`\n🌟  ParisSorties — Seed Script`);
  console.log(`📋  ${ACTIVITIES.length} activités à importer\n`);

  if (isDryRun) {
    console.log("🔍  DRY RUN — aucune insertion effectuée\n");
    for (const a of ACTIVITIES) {
      console.log(`  • [${a.category}] ${a.title} (${a.date} ${a.time}) — ${a.price ?? "gratuit"}€`);
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
