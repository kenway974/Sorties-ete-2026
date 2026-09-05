import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { getSiteUrl } from "@/lib/utils/siteUrl";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

// Fraunces porte les titres : un serif à contraste marqué, un peu bancal par
// endroits — exactement le registre d'un cabinet de curiosités.
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hors-Piste — sorties insolites à Paris",
    template: "%s · Hors-Piste",
  },
  description:
    "Le cabinet de curiosités de Paris. Uniquement des sorties qui sortent de l'ordinaire : lieux secrets, savoir-faire rares, expériences immersives, bizarreries assumées. Chacune notée sur 10 et triée avant d'arriver jusqu'à toi. Gratuit, sans inscription.",
  keywords: [
    "sorties insolites Paris", "que faire d'insolite à Paris", "lieux secrets Paris",
    "activités insolites Paris", "Paris insolite", "visites insolites Paris",
    "expériences immersives Paris", "ateliers insolites Paris",
  ],
  applicationName: "Hors-Piste",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Hors-Piste" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hors-Piste — sorties insolites à Paris",
    description: "Uniquement l'insolite : lieux secrets, savoir-faire rares, bizarreries assumées. Noté et trié avant d'arriver jusqu'à toi.",
    url: SITE_URL,
    siteName: "Hors-Piste",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hors-Piste — sorties insolites à Paris",
    description: "Uniquement l'insolite : lieux secrets, savoir-faire rares, bizarreries assumées. Noté et trié avant d'arriver jusqu'à toi.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1B1425",
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
      name: "Hors-Piste",
      description: "Uniquement l'insolite : lieux secrets, savoir-faire rares, bizarreries assumées. Noté et trié avant d'arriver jusqu'à toi.",
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
      name: "Hors-Piste",
      url: SITE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Hors-Piste",
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
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
