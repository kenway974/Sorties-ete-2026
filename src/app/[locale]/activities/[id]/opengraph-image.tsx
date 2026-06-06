import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ParisSorties — sortie à Paris";

const CATEGORY_LABELS: Record<string, string> = {
  soirees: "Soirées", concerts: "Concerts", expositions: "Expositions",
  restaurants: "Restaurants", bars: "Bars", sport: "Sport", culture: "Culture",
  famille: "Famille", etudiants: "Étudiants", networking: "Networking", loisirs: "Loisirs",
};

function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return d;
  }
}

export default async function Image({ params }: { params: { locale: string; id: string } }) {
  const { id } = params;
  let title = "Une sortie à Paris";
  let cat = "Activité";
  let date = "";
  let address = "Paris";
  let price = "Gratuit";

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activities")
      .select("title, category, date, address, price")
      .eq("id", id)
      .single();
    if (data) {
      title = data.title ?? title;
      cat = CATEGORY_LABELS[data.category] ?? cat;
      date = data.date ? fmtDate(data.date) : "";
      address = data.address ?? address;
      price = data.price && data.price > 0
        ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(data.price)
        : "Gratuit";
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "64px",
          background: "linear-gradient(135deg, #12274A 0%, #1B3A6B 55%, #2A4F8A 100%)",
          color: "white", fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>📍 ParisSorties</div>
          <div style={{
            marginLeft: "auto", background: "rgba(212,160,23,0.2)", color: "#E8BC3C",
            padding: "8px 20px", borderRadius: "999px", fontSize: 26, fontWeight: 700,
            border: "2px solid rgba(212,160,23,0.5)",
          }}>{cat}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: "1000px" }}>
            {title.length > 90 ? title.slice(0, 90) + "…" : title}
          </div>
          <div style={{ display: "flex", gap: "32px", fontSize: 30, color: "rgba(255,255,255,0.75)" }}>
            {date && <div>🗓️ {date}</div>}
            <div>📍 {address.length > 40 ? address.slice(0, 40) + "…" : address}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            background: "#D4A017", color: "#12274A", padding: "14px 32px",
            borderRadius: "16px", fontSize: 34, fontWeight: 800,
          }}>{price}</div>
          <div style={{ marginLeft: "auto", fontSize: 26, color: "rgba(255,255,255,0.55)" }}>
            Toutes les sorties à Paris cet été
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}