// Supabase Edge Function: import-openagenda
// Imports events from OpenAgenda (https://openagenda.com) filtered to Paris/Île-de-France.
// Idempotent upsert keyed on (source='openagenda', external_id). Deletes past events.
// Runs daily via cron — same pattern as import-qfap.
//
// Required env var: OPENAGENDA_API_KEY (free key from https://openagenda.com/settings)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { inferCuriosity, type CuriosityKey } from "../_shared/curiosites.ts";
import { scoreEvents, passesFloor } from "../_shared/scoring.ts";

const OA_BASE = "https://api.openagenda.com/v2/events";
const PAGE = 100;
/**
 * Budget de temps de l'import. Le scoring appelle Claude, donc un passage
 * complet peut dépasser la limite d'exécution de la fonction. On s'arrête
 * proprement avant : mieux vaut importer une partie du catalogue et exécuter
 * le nettoyage final que se faire couper au milieu et ne rien conclure. Le
 * cron suivant reprend là où on s'est arrêté (l'upsert est idempotent).
 */
const BUDGET_MS = 9 * 60 * 1000;

const MAX_RECORDS = 3000;

// Paris + Île-de-France department codes
const DEPARTMENT_CODES = ["75", "77", "78", "91", "92", "93", "94", "95"];


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

// Infer vibe tags from curiosity + keywords + text
function inferVibeTags(curiosity: CuriosityKey, keywords: string[], title: string, desc: string): string[] {
  const vibes: string[] = [];
  const text = [...keywords, title, desc].join(" ").toLowerCase();

  const curiosityVibes: Partial<Record<CuriosityKey, string[]>> = {
    "frisson":       ["sensation"],
    "secret":        ["confidentiel"],
    "savoir-faire":  ["atelier"],
    "mise-en-scene": ["immersif"],
    "hors-du-temps": ["patrimoine"],
    "bizarrerie":    ["insolite"],
  };
  vibes.push(...(curiosityVibes[curiosity] ?? []));

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
  let tooTame = 0, unscored = 0, aCourtDeTemps = false;
  let imported = 0, skipped = 0, photos = 0, after: string | null = null;
  let pages = 0;

  try {
    while (pages * PAGE < MAX_RECORDS) {
      if (Date.now() - startedAt > BUDGET_MS) {
        aCourtDeTemps = true;
        break;
      }
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

      let rows: Record<string, unknown>[] = [];
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

        const curiosity = inferCuriosity(title, description, keywords);
        const vibeTags = inferVibeTags(curiosity, keywords, title, description);
        const tags = [...new Set([...keywords, ...vibeTags])].slice(0, 12);

        rows.push({
          source: "openagenda",
          external_id: externalId,
          title: title.slice(0, 300),
          description: description.slice(0, 4000),
          curiosity,
          tags,
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


      // ── Scoring d'insolite ────────────────────────────────────────────────
      // Chaque lot passe par Claude avant l'insertion : c'est ce qui empêche
      // l'agenda municipal de reconstituer l'annuaire généraliste.
      if (rows.length > 0) {
        const scores = await scoreEvents(
          rows.map((r) => ({
            ref: String(r.external_id),
            title: String(r.title),
            description: String(r.description),
            tags: r.tags as string[],
            price: r.price as number | null,
          })),
        );

        rows = rows.filter((r) => {
          const score = scores.get(String(r.external_id));
          if (!score) return false;

          // Sans note (panne d'API, pas de clé), on n'écrit pas : l'upsert
          // écraserait une ligne déjà publiée et correctement notée en la
          // repassant en attente. Une panne de scoring doit faire sauter le
          // tour, pas dépublier le catalogue. Le prochain cron réessaiera.
          if (score.rarity === null) { unscored++; return false; }

          if (!passesFloor(score)) { tooTame++; return false; }

          r.curiosity = score.curiosity;
          r.rarity = score.rarity;
          r.rarity_note = score.note;
          r.status = "approved";
          return true;
        });
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
        ok: true, imported, tooTame, unscored, aCourtDeTemps, photos, skipped, deleted: deleted ?? 0,
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
