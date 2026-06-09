import Link from "next/link";

export default function RootNotFound() {
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
          <p style={{ fontSize: "6rem", fontWeight: 700, color: "#e5e7eb", margin: "0 0 1rem" }}>404</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0 0 0.5rem" }}>
            Page introuvable
          </h1>
          <p style={{ color: "#6b7280", margin: "0 0 1.5rem" }}>
            Cette page n&apos;existe pas ou a été déplacée.
          </p>
          <Link
            href="/fr"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#1B3A6B",
              color: "#fff",
              borderRadius: "0.75rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </body>
    </html>
  );
}
