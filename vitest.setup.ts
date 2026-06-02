import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach } from "vitest";
import React from "react";

// Make React available globally for JSX transforms in tests
global.React = React;

// ── next/navigation ──────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => "/fr",
  useParams: () => ({ locale: "fr" }),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// ── next/link ────────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement("a", { href, ...props }, children),
}));

// ── next-intl ────────────────────────────────────────────────
vi.mock("next-intl", () => ({
  useTranslations: (ns?: string) => (key: string, params?: Record<string, string | number>) => {
    const full = ns ? `${ns}.${key}` : key;
    if (!params) return full;
    return Object.entries(params).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)),
      full
    );
  },
  useLocale: () => "fr",
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  getTranslations: async (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
  getMessages: async () => ({}),
}));

// ── Supabase client (default global mock — override per file) ─
const makeSupabaseMock = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    match: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    nullsFirst: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })),
  removeChannel: vi.fn(),
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => makeSupabaseMock(),
}));

// ── Leaflet (no DOM in jsdom) ─────────────────────────────────
vi.mock("leaflet", () => ({
  default: {
    map: vi.fn(() => ({ setView: vi.fn(), remove: vi.fn(), addLayer: vi.fn() })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => ({ addTo: vi.fn(), bindPopup: vi.fn(), on: vi.fn(), remove: vi.fn() })),
    divIcon: vi.fn(() => ({})),
    control: { zoom: vi.fn(() => ({ addTo: vi.fn() })) },
  },
}));

// ── Misc ─────────────────────────────────────────────────────
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => { vi.clearAllMocks(); });
