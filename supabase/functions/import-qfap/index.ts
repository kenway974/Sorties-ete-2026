// Supabase Edge Function: import-qfap
// Imports & syncs events from the City of Paris open-data agenda
// ("Que faire à Paris") into the activities table. Idempotent upsert keyed on
// (source='qfap', external_id). Deletes past imported events. Runs daily via cron.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { inferCuriosity, type CuriosityKey } from "../_shared/curiosites.ts";
import { scoreEvents, passesFloor } from "../_shared/scoring.ts";

const QFAP_BASE =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records";
const SELECT =
  "id,title,lead_text,description,date_start,date_end,lat_lon,price_type,price_detail,qfap_tags,address_zipcode,address_street,address_name,cover_url,url,access_link";
const PAGE = 100;
/**
 * Budget de temps de l'import. Le scoring appelle Claude, donc un passage
 * complet peut dépasser la limite d'exécution de la fonction. On s'arrête
 * proprement avant : mieux vaut importer une partie du catalogue et exécuter
 * le nettoyage final que se faire couper au milieu et ne rien conclure. Le
 * cron suivant reprend là où on s'est arrêté (l'upsert est idempotent).
 */
const BUDGET_MS = 9 * 60 * 1000;

const MAX_RECORDS = 4000;


// Tags d'ambiance : curiosité + mots-clés de la source + texte
function inferVibeTags(curiosity: CuriosityKey, rawTags: string[], title: string, desc: string): string[] {
  const vibes: string[] = [];
  const text = [...rawTags, title, desc].join(" ").toLowerCase();

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


function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à")
    .replace(/&ldquo;|&rdquo;|&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// gratuit -> null (free). payant -> first euro amount found, else null.
function parsePrice(priceType: string | null, priceDetail: string | null): number | null {
  const type = (priceType ?? "").toLowerCase();
  if (type.startsWith("gratuit")) return null;
  const text = stripHtml(priceDetail);
  const m = text.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro)/i) ?? text.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (m) {
    const n = parseFloat(m[1].replace(",", "."));
    if (!isNaN(n) && n > 0) return n;
  }
  return null;
}

interface QfapRecord {
  id: string;
  title: string | null;
  lead_text: string | null;
  description: string | null;
  date_start: string | null;
  date_end: string | null;
  lat_lon: { lat: number; lon: number } | null;
  price_type: string | null;
  price_detail: string | null;
  qfap_tags: string | null;
  address_zipcode: string | null;
  address_street: string | null;
  address_name: string | null;
  cover_url: string | null;
  url: string | null;
  access_link: string | null;
}

Deno.serve(async (req) => {
  const startedAt = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().split("T")[0];
  let tooTame = 0, unscored = 0, aCourtDeTemps = false;
  let imported = 0, skipped = 0, photos = 0, offset = 0;

  try {
    while (offset < MAX_RECORDS) {
      if (Date.now() - startedAt > BUDGET_MS) {
        aCourtDeTemps = true;
        break;
      }
      const url =
        `${QFAP_BASE}?limit=${PAGE}&offset=${offset}` +
        `&where=${encodeURIComponent("date_end>=now()")}` +
        `&order_by=${encodeURIComponent("date_start")}` +
        `&select=${encodeURIComponent(SELECT)}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const json = await res.json();
      const records: QfapRecord[] = json.results ?? [];
      if (records.length === 0) break;

      let rows: Record<string, unknown>[] = [];
      const photoMap: Record<string, string> = {}; // external_id -> cover_url

      for (const r of records) {
        const lat = r.lat_lon?.lat ?? 0;
        const lng = r.lat_lon?.lon ?? 0;
        const dateStart = r.date_start;
        // Quality filter: real Paris coords + a start date
        if (!dateStart || !lat || !lng || (lat === 0 && lng === 0)) { skipped++; continue; }

        const date = dateStart.slice(0, 10);
        if (date < today) { skipped++; continue; }
        const time = dateStart.slice(11, 19) || "00:00:00";

        const desc = stripHtml(r.description) || stripHtml(r.lead_text) || r.title || "";
        const address = [r.address_street, r.address_zipcode]
          .filter(Boolean).join(", ") || r.address_name || "Paris";
        const rawTags = (r.qfap_tags ?? "").split(";").map((s) => s.trim()).filter(Boolean).slice(0, 6);
        const curiosity = inferCuriosity(r.title ?? "", desc, rawTags);
        const vibeTags = inferVibeTags(curiosity, rawTags, r.title ?? "", desc);
        const tags = [...new Set([...rawTags, ...vibeTags])].slice(0, 12);

        rows.push({
          source: "qfap",
          external_id: r.id,
          title: (r.title ?? "Sans titre").slice(0, 300),
          description: desc.slice(0, 4000),
          curiosity,
          tags,
          address: address.slice(0, 300),
          lat,
          lng,
          date,
          time,
          price: parsePrice(r.price_type, r.price_detail),
          external_url: r.access_link || r.url || null,
          status: "approved",
          creator_id: null,
          max_participants: null,
          current_participants: 0,
          updated_at: new Date().toISOString(),
        });
        if (r.cover_url) photoMap[r.id] = r.cover_url;
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

        // Link cover photos (idempotent via unique (activity_id, url))
        const photoRows = (upserted ?? [])
          .filter((a) => photoMap[a.external_id as string])
          .map((a) => ({ activity_id: a.id, url: photoMap[a.external_id as string], uploaded_by: null }));
        if (photoRows.length > 0) {
          const { error: pErr } = await supabase
            .from("activity_photos")
            .upsert(photoRows, { onConflict: "activity_id,url", ignoreDuplicates: true });
          if (!pErr) photos += photoRows.length;
        }
      }

      offset += PAGE;
    }

    // Remove past imported events — to the HOUR — in Europe/Paris time.
    const now = new Date();
    const pDate = now.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
    const pTime = now.toLocaleTimeString("en-GB", { timeZone: "Europe/Paris", hour12: false });
    const { count: deleted } = await supabase
      .from("activities")
      .delete({ count: "exact" })
      .eq("source", "qfap")
      .or(`date.lt.${pDate},and(date.eq.${pDate},time.lt.${pTime})`);

    return new Response(
      JSON.stringify({
        ok: true, imported, tooTame, unscored, aCourtDeTemps, photos, skipped, deleted: deleted ?? 0,
        ms: Date.now() - startedAt,
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