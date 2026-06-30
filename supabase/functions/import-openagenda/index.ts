// Supabase Edge Function: import-openagenda
// Imports events from OpenAgenda (https://openagenda.com) filtered to Paris/Île-de-France.
// Idempotent upsert keyed on (source='openagenda', external_id). Deletes past events.
// Runs daily via cron — same pattern as import-qfap.
//
// Required env var: OPENAGENDA_API_KEY (free key from https://openagenda.com/settings)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const OA_BASE = "https://api.openagenda.com/v2/events";
const PAGE = 100;
const MAX_RECORDS = 3000;

// Paris + Île-de-France department codes
const DEPARTMENT_CODES = ["75", "77", "78", "91", "92", "93", "94", "95"];

type Category =
  | "soirees" | "concerts" | "expositions" | "restaurants" | "bars"
  | "sport" | "culture" | "famille" | "etudiants" | "networking" | "loisirs" | "salons";

interface OALocation {
  name: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  countryCode: string | null;
  department: string | null;
}

interface OATiming {
  begin: string;
  end: string;
}

interface OAImage {
  base: string | null;
  filename: string | null;
}

interface OARegistration {
  type: string;
  value: string;
}

interface OAEvent {
  uid: number;
  slug: string | null;
  title: Record<string, string> | null;
  description: Record<string, string> | null;
  longDescription: Record<string, string> | null;
  keywords: Record<string, string[]> | null;
  conditions: Record<string, string> | null;
  location: OALocation | null;
  timings: OATiming[] | null;
  image: OAImage | null;
  registration: OARegistration[] | null;
  accessibility: Record<string, boolean> | null;
  age: { min: number | null; max: number | null } | null;
}

function pickText(obj: Record<string, string> | null): string {
  if (!obj) return "";
  return obj["fr"] ?? obj["en"] ?? Object.values(obj)[0] ?? "";
}

function pickKeywords(obj: Record<string, string[]> | null): string[] {
  if (!obj) return [];
  const arr = obj["fr"] ?? obj["en"] ?? Object.values(obj)[0] ?? [];
  return arr.slice(0, 6);
}

// Infer vibe tags from category + keywords + text
function inferVibeTags(category: Category, keywords: string[], title: string, desc: string): string[] {
  const vibes: string[] = [];
  const text = [...keywords, title, desc].join(" ").toLowerCase();

  const categoryVibes: Partial<Record<Category, string[]>> = {
    soirees: ["festif"],
    concerts: ["live-music", "festif"],
    expositions: ["art", "culture"],
    restaurants: ["gastronomie"],
    bars: ["festif"],
    sport: ["sport"],
    culture: ["culture"],
    famille: ["famille"],
  };
  vibes.push(...(categoryVibes[category] ?? []));

  if (/concert|live music|jazz|rock|électro|dj|musique live/.test(text)) vibes.push("live-music");
  if (/plein.air|outdoor|parc|jardin|extérieur|forêt|nature/.test(text)) vibes.push("plein-air");
  if (/expo|galerie|musée|peinture|sculpture|vernissage/.test(text)) vibes.push("art");
  if (/gastro|dégustation|chef|cuisine raffinée/.test(text)) vibes.push("gastronomie");
  if (/famille|enfant|kids|junior|bébé/.test(text)) vibes.push("famille");
  if (/sport|fitness|yoga|running|marathon|football|basketball|tennis|natation/.test(text)) vibes.push("sport");
  if (/festival|fête|party|danse|bal/.test(text)) vibes.push("festif");
  if (/patrimoine|histoire|monument|visite guidée|château/.test(text)) vibes.push("culture");

  return [...new Set(vibes)];
}

type Mood =
  | "rencontrer" | "entre-amis" | "solo" | "famille"
  | "date-romantique" | "date-fun" | "date-chill"
  | "ressourcer" | "air" | "decompresser" | "sensations" | "nocturne" | "chic"
  | "decouvrir" | "insolite" | "creatif" | "gourmand" | "esprit";

// Infer "envie/mood" — intent & context an event suits. Category defaults + keyword refinements.
function inferMoods(category: Category, keywords: string[], title: string, desc: string): Mood[] {
  const moods = new Set<Mood>();
  const text = [...keywords, title, desc].join(" ").toLowerCase();

  const byCategory: Partial<Record<Category, Mood[]>> = {
    soirees:     ["rencontrer", "entre-amis", "decompresser", "nocturne"],
    concerts:    ["decompresser", "decouvrir", "entre-amis", "nocturne"],
    expositions: ["solo", "esprit", "decouvrir", "date-chill"],
    restaurants: ["gourmand", "date-romantique", "entre-amis"],
    bars:        ["entre-amis", "decompresser", "nocturne", "rencontrer"],
    sport:       ["air", "sensations", "decompresser"],
    culture:     ["esprit", "decouvrir", "solo", "date-chill"],
    famille:     ["famille", "air", "creatif"],
    etudiants:   ["rencontrer", "entre-amis", "decompresser"],
    networking:  ["rencontrer", "esprit"],
    loisirs:     ["date-fun", "entre-amis", "decompresser", "creatif"],
    salons:      ["decouvrir", "insolite", "entre-amis"],
  };
  for (const m of byCategory[category] ?? []) moods.add(m);

  const add = (re: RegExp, m: Mood) => { if (re.test(text)) moods.add(m); };
  add(/rencontre|speed.dating|afterwork|after.work|c[ée]libataire|blind.test|mixer|networking|[ée]change|\bmeet\b/, "rencontrer");
  add(/entre amis|groupe|[ée]quipe|\bteam\b|bowling|billard|quiz|jeux? de soci[ée]t[ée]/, "entre-amis");
  add(/romantique|amoureux|en couple|aux chandelles|d[îi]ner|cro[îi]si[èe]re|p[ée]niche|rooftop|coucher de soleil|cabaret|tango|s[ée]r[ée]nade|saint.valentin/, "date-romantique");
  add(/bowling|mini.?golf|karaok[ée]|escape.game|laser.game|arcade|accrobranche|patinoire|r[ée]alit[ée] virtuelle|fl[ée]chettes/, "date-fun");
  add(/caf[ée]|brunch|salon de th[ée]|balade|promenade|pique.nique|cin[ée]ma|cin[ée]/, "date-chill");
  add(/famille|enfant|\bkids\b|jeune public|b[ée]b[ée]|parent/, "famille");
  add(/yoga|m[ée]ditation|spa|bien.[êe]tre|wellness|massage|relaxation|d[ée]tente|sophrologie|sieste|\bzen\b|bain sonore|th[ée]rapie/, "ressourcer");
  add(/plein.air|outdoor|parc|jardin|nature|for[êe]t|terrasse|balade|promenade|ext[ée]rieur|rivi[èe]re|quai|bois|p[ée]niche|randonn[ée]e/, "air");
  add(/festi|f[êe]te|party|\bdj\b|club|dancefloor|danse|\bdance\b|\bbal\b|guinguette|ap[ée]ro|open.bar/, "decompresser");
  add(/sensation|adr[ée]naline|karting|paintball|accrobranche|escalade|\bsaut\b|trampoline|man[èe]ge|frisson|vertige|tyrolienne/, "sensations");
  add(/\bnuit\b|nocturne|\bclub\b|\bafter\b|soir[ée]e|minuit|nightlife/, "nocturne");
  add(/rooftop|champagne|\bgala\b|vernissage|[ée]l[ée]gant|cocktail|palace|op[ée]ra|prestige|\bluxe\b|raffin[ée]/, "chic");
  add(/d[ée]couverte|nouveaut[ée]|initiation|exp[ée]rience|immersi|surprise|premi[èe]re/, "decouvrir");
  add(/insolite|secret|cach[ée]|dans le noir|\bunique\b|[ée]trange|myst[èe]re/, "insolite");
  add(/atelier|\bdiy\b|workshop|poterie|c[ée]ramique|peinture|dessin|fabrication|cr[ée]ation|couture|cours de|sculpture/, "creatif");
  add(/d[ée]gustation|gastronomie|\bfood\b|brunch|chocolat|\bvin\b|fromage|street food|march[ée]|cuisine|\brepas\b|bi[èe]re|cocktail|[œo]enologie/, "gourmand");
  add(/conf[ée]rence|conference|d[ée]bat|philo|histoire|mus[ée]e|museum|exposition|litt[ée]rature|lecture|sciences|table ronde|masterclass|\btalk\b/, "esprit");
  add(/visite libre|[àa] votre rythme|sans inscription|en autonomie|individuel|self.guided/, "solo");

  if (moods.size === 0) moods.add("decouvrir");
  return [...moods];
}

function mapCategory(keywords: string[], title: string, description: string): Category {
  const text = [...keywords, title, description].join(" ").toLowerCase();
  const has = (...k: string[]) => k.some((x) => text.includes(x));

  if (has("concert", "musique", "live music", "festival music", "dj set")) return "concerts";
  if (has("exposition", "expo", "vernissage", "galerie", "musée", "museum")) return "expositions";
  if (has("soirée", "soiree", "clubbing", "nuit blanche", "after", "boîte de nuit")) return "soirees";
  if (has("restaurant", "gastronomie", "dégustation", "cuisine", "repas")) return "restaurants";
  if (has("bar", "apéro", "guinguette", "cocktail", "brasserie")) return "bars";
  if (has("salon", "convention", "foire", "japan expo", "comic con", "games week", "maison & objet", "fashion week", "trade show")) return "salons";
  if (has("sport", "running", "yoga", "fitness", "tennis", "football", "natation", "randonnée")) return "sport";
  if (has("enfant", "famille", "jeune public", "kids", "bébé")) return "famille";
  if (has("étudiant", "etudiant", "université", "campus", "bde", "jeune")) return "etudiants";
  if (has("networking", "conférence", "meetup", "startup", "professionnel", "forum")) return "networking";
  if (has("atelier", "loisir", "jeu", "escape", "quiz", "karaoké", "cinéma", "comédie")) return "loisirs";
  return "culture";
}

// Parse price from conditions string: "Gratuit" -> null, "10€" -> 10
function parsePrice(conditions: string | null): number | null {
  if (!conditions) return null;
  const c = conditions.toLowerCase();
  if (c.includes("gratuit") || c.includes("free") || c.includes("entrée libre")) return null;
  const m = c.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro)/i) ?? c.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (m) {
    const n = parseFloat(m[1].replace(",", "."));
    if (!isNaN(n) && n > 0) return n;
  }
  return null;
}

function buildImageUrl(image: OAImage | null): string | null {
  if (!image?.base || !image?.filename) return null;
  const base = image.base.endsWith("/") ? image.base : `${image.base}/`;
  return `${base}${image.filename}`;
}

function extractRegistrationUrl(reg: OARegistration[] | null): string | null {
  if (!reg || reg.length === 0) return null;
  const link = reg.find((r) => r.type === "link" || r.type === "url");
  return link?.value ?? null;
}

function isInParis(location: OALocation | null): boolean {
  if (!location) return false;
  if (location.countryCode && location.countryCode !== "FR") return false;
  const postal = location.postalCode ?? "";
  return DEPARTMENT_CODES.some((d) => postal.startsWith(d));
}

Deno.serve(async () => {
  const startedAt = Date.now();
  const apiKey = Deno.env.get("OPENAGENDA_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "OPENAGENDA_API_KEY not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  let imported = 0, skipped = 0, photos = 0, after: string | null = null;
  let pages = 0;

  try {
    while (pages * PAGE < MAX_RECORDS) {
      const params = new URLSearchParams({
        key: apiKey,
        size: String(PAGE),
        "timings[gte]": today.toISOString(),
        lang: "fr",
        // Filter to Île-de-France via department codes
        ...Object.fromEntries(DEPARTMENT_CODES.map((d, i) => [`departmentCode[${i}]`, d])),
      });
      if (after) params.set("after", after);

      const res = await fetch(`${OA_BASE}?${params}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAgenda API error ${res.status}: ${text.slice(0, 200)}`);
      }

      const json = await res.json();
      const events: OAEvent[] = json.events ?? [];
      if (events.length === 0) break;

      after = json.after ?? null;

      const rows: Record<string, unknown>[] = [];
      const photoMap: Record<string, string> = {};

      for (const e of events) {
        if (!isInParis(e.location)) { skipped++; continue; }

        const timing = e.timings?.[0];
        if (!timing?.begin) { skipped++; continue; }

        const lat = e.location?.latitude ?? 0;
        const lng = e.location?.longitude ?? 0;
        if (!lat || !lng) { skipped++; continue; }

        const eventDate = timing.begin.slice(0, 10);
        if (eventDate < todayStr) { skipped++; continue; }

        const eventTime = timing.begin.slice(11, 19) || "00:00:00";
        const title = pickText(e.title) || "Sans titre";
        const description = pickText(e.longDescription) || pickText(e.description) || title;
        const keywords = pickKeywords(e.keywords);
        const conditions = pickText(e.conditions);
        const address = [e.location?.address, e.location?.postalCode, e.location?.city]
          .filter(Boolean).join(", ") || e.location?.name || "Paris";

        const externalId = String(e.uid);
        const coverUrl = buildImageUrl(e.image);
        const externalUrl = extractRegistrationUrl(e.registration);

        const category = mapCategory(keywords, title, description);
        const vibeTags = inferVibeTags(category, keywords, title, description);
        const tags = [...new Set([...keywords, ...vibeTags])].slice(0, 12);
        const moods = inferMoods(category, keywords, title, description);

        rows.push({
          source: "openagenda",
          external_id: externalId,
          title: title.slice(0, 300),
          description: description.slice(0, 4000),
          category,
          tags,
          moods,
          address: address.slice(0, 300),
          lat,
          lng,
          date: eventDate,
          time: eventTime,
          price: parsePrice(conditions),
          external_url: externalUrl,
          status: "approved",
          creator_id: null,
          max_participants: null,
          current_participants: 0,
          updated_at: new Date().toISOString(),
        });

        if (coverUrl) photoMap[externalId] = coverUrl;
      }

      if (rows.length > 0) {
        const { data: upserted, error } = await supabase
          .from("activities")
          .upsert(rows, { onConflict: "source,external_id" })
          .select("id, external_id");
        if (error) throw error;
        imported += upserted?.length ?? 0;

        const photoRows = (upserted ?? [])
          .filter((a) => photoMap[a.external_id as string])
          .map((a) => ({
            activity_id: a.id,
            url: photoMap[a.external_id as string],
            uploaded_by: null,
          }));
        if (photoRows.length > 0) {
          const { error: pErr } = await supabase
            .from("activity_photos")
            .upsert(photoRows, { onConflict: "activity_id,url", ignoreDuplicates: true });
          if (!pErr) photos += photoRows.length;
        }
      }

      pages++;
      if (!after) break;
    }

    // Remove past OpenAgenda events (to the hour in Europe/Paris time)
    const pDate = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
    const pTime = new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Paris", hour12: false });
    const { count: deleted } = await supabase
      .from("activities")
      .delete({ count: "exact" })
      .eq("source", "openagenda")
      .or(`date.lt.${pDate},and(date.eq.${pDate},time.lt.${pTime})`);

    return new Response(
      JSON.stringify({
        ok: true, imported, photos, skipped, deleted: deleted ?? 0,
        pages, ms: Date.now() - startedAt,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e), imported, ms: Date.now() - startedAt }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
