import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ParisSorties — Toutes les sorties à Paris cet été",
    template: "%s · ParisSorties",
  },
  description:
    "Concerts, expos, soirées, sport, restos… Découvrez et filtrez toutes les activités et événements à Paris et en Île-de-France. Gratuit, sans inscription.",
  keywords: [
    "sorties Paris", "que faire à Paris", "événements Paris", "concerts Paris",
    "expositions Paris", "activités Paris", "agenda Paris", "soirées Paris",
  ],
  applicationName: "ParisSorties",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ParisSorties" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "ParisSorties — Toutes les sorties à Paris cet été",
    description: "Découvrez les meilleures sorties à Paris : concerts, expos, soirées, sport et plus.",
    url: SITE_URL,
    siteName: "ParisSorties",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ParisSorties — Toutes les sorties à Paris cet été",
    description: "Découvrez les meilleures sorties à Paris : concerts, expos, soirées, sport et plus.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1B3A6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ParisSorties",
      description: "Découvrez et filtrez toutes les activités et événements à Paris.",
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/fr/activities?search={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "ParisSorties",
      url: SITE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ParisSorties",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Dark mode init — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('ps_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch{}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')); }`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
