"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin, User, LogOut, Moon, Sun } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import type { Profile } from "@/types";

interface HeaderProps {
  locale: string;
  user: Profile | null;
  onLogout: () => void;
}

export default function Header({ locale, user, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const pathname = usePathname();
  const base = `/${locale}`;

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("ps_theme", next ? "dark" : "light"); } catch {}
  };

  const isActive = (href: string) => pathname === href || (href !== base && pathname.startsWith(href));

  return (
    <header
      role="banner"
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-brand-navy/95 backdrop-blur-md shadow-lg"
          : "bg-brand-navy"
      } text-white`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={base} className="flex items-center gap-2 font-bold text-lg shrink-0 group">
          <div className="relative">
            <MapPin className="w-5 h-5 text-brand-gold transition-transform group-hover:scale-110" />
          </div>
          <span className="hidden sm:inline tracking-tight">ParisSorties</span>
          <span className="sm:hidden font-black text-brand-gold">PS</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {[
            { href: base, label: "Accueil" },
            { href: `${base}/activities`, label: "Activités" },
            { href: `${base}/collections`, label: "Collections" },
            { href: `${base}/itinerary`, label: "Itinéraire" },
            ...(user ? [{ href: `${base}/favorites`, label: "Favoris" }] : []),
            ...(user ? [{ href: `${base}/propose`, label: "Proposer" }] : []),
            ...((user?.role === "admin" || user?.role === "moderator") ? [{ href: `${base}/admin`, label: "Admin" }] : []),
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(href)
                  ? "text-white bg-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
              {isActive(href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-gold" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDark}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            aria-label={dark ? "Mode clair" : "Mode sombre"}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-1">
              <NotificationBell userId={user.id} />
              <Link
                href={`${base}/profile`}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-white/80 hover:text-white"
              >
                <div className="w-6 h-6 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold text-xs font-bold">
                  {user.username?.[0]?.toUpperCase() ?? <User className="w-3 h-3" />}
                </div>
                <span>{user.username}</span>
              </Link>
              <button
                onClick={onLogout}
                className="hidden md:flex p-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={`${base}/auth/login`}
                className="px-4 py-1.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href={`${base}/auth/register`}
                className="px-4 py-1.5 rounded-xl text-sm font-bold bg-brand-gold text-brand-navy hover:bg-brand-gold-light transition-colors shadow-sm"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav aria-label="Menu mobile" className="md:hidden bg-brand-navy-dark border-t border-white/10 py-3 px-4 flex flex-col gap-0.5 animate-slide-down">
          {[
            { href: base, label: "Accueil" },
            { href: `${base}/activities`, label: "Activités" },
            { href: `${base}/collections`, label: "Collections" },
            { href: `${base}/itinerary`, label: "Itinéraire" },
            ...(user ? [{ href: `${base}/favorites`, label: "Favoris" }] : []),
            ...(user ? [{ href: `${base}/propose`, label: "Proposer" }] : []),
            ...((user?.role === "admin" || user?.role === "moderator") ? [{ href: `${base}/admin`, label: "Admin" }] : []),
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(href) ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-white/10">
            {user ? (
              <>
                <Link href={`${base}/profile`} onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  Mon profil
                </Link>
                <button
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-red-300 hover:bg-white/10 transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link href={`${base}/auth/login`} onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  Se connecter
                </Link>
                <Link href={`${base}/auth/register`} onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-xl text-sm font-bold text-brand-gold hover:bg-white/10 transition-colors">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
