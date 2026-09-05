import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { curiosity as curiosityOf } from "@/lib/constants/curiosites";



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title    = searchParams.get("title")    ?? "Une sortie à Paris";
  const curiosity = searchParams.get("curiosity") ?? "";
  const date     = searchParams.get("date")     ?? "";
  const price    = searchParams.get("price")    ?? "";
  const emoji    = searchParams.get("emoji")    ?? curiosityOf(curiosity).emoji;

  const curiosityLabel = curiosity ? curiosityOf(curiosity).label : "";

  // Truncate title to 2 "lines" worth (approx 80 chars)
  const displayTitle = title.length > 80 ? title.slice(0, 80) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "#1B3A6B",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {/* Top: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: 28, color: "#D4AF37", fontWeight: 800, letterSpacing: "-0.5px" }}>
            MoodMap
          </span>
        </div>

        {/* Center: emoji + title + date */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: 80, lineHeight: 1 }}>{emoji}</span>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              maxWidth: "950px",
            }}
          >
            {displayTitle}
          </div>
          {date && (
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
              {date}
            </div>
          )}
        </div>

        {/* Bottom: Paris label left, price + curiosity right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Bottom-left: Paris with "pin" */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: 22, color: "#D4AF37" }}>📍</span>
            <span style={{ fontSize: 22, color: "#D4AF37", fontWeight: 700 }}>Paris</span>
          </div>

          {/* Bottom-right: price badge + curiosity label */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {price && (
              <div
                style={{
                  background: "white",
                  color: "#1B3A6B",
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "10px 24px",
                  borderRadius: "999px",
                }}
              >
                {price}
              </div>
            )}
            {curiosityLabel && (
              <div
                style={{
                  background: "rgba(212,175,55,0.15)",
                  color: "#D4AF37",
                  fontSize: 22,
                  fontWeight: 600,
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "2px solid rgba(212,175,55,0.4)",
                }}
              >
                {curiosityLabel}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
