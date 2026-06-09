"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 1rem",
          }}
        >
          <p style={{ fontSize: "4rem", margin: "0 0 1rem" }}>⚠️</p>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: "0 0 0.5rem" }}>
            Une erreur inattendue s&apos;est produite
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>
            Nos équipes ont été notifiées. Veuillez réessayer.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#1B3A6B",
                color: "#fff",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
            <a
              href="/fr"
              style={{
                padding: "0.75rem 1.5rem",
                background: "#f3f4f6",
                color: "#374151",
                borderRadius: "0.75rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
