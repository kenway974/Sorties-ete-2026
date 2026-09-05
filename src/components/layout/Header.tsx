"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, Moon, Sun } from "lucide-react";
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
    const onScroll = () => setScrolled(window.scrollY > 4);
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

  const isActive = (href: string) =>
    pathname === href || (href !== base && pathname.startsWith(href));

  const navItems = [
    { href: base,                  label: "Accueil" },
    { href: `${base}/activities`,  label: "Activités" },
    { href: `${base}/collections`, label: "Collections" },
    { href: `${base}/itinerary`,   label: "Itinéraire" },
    ...(user ? [{ href: `${base}/favorites`, label: "Favoris" }] : []),
    ...(user ? [{ href: `${base}/propose`,   label: "Proposer" }] : []),
    ...((user?.role === "admin" || user?.role === "moderator")
      ? [{ href: `${base}/admin`, label: "Admin" }]
      : []),
  ];

  return (
    <header
      role="banner"
      className={`sticky top-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-all duration-200 ${
        scrolled ? "border-b border-gray-100 dark:border-white/[0.06] shadow-[0_1px_0_rgba(0,0,0,0.04)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={base} className="flex items-center gap-2 shrink-0">
          <Image src="/logo.webp" alt="Hors-Piste" width={28} height={28} priority className="rounded-lg shadow-sm" />
          <span className="font-display font-black text-[16px] tracking-tight text-ink dark:text-parchment">
            Hors<span className="text-gold">-</span>Piste
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDark}
            aria-label={dark ? "Mode clair" : "Mode sombre"}
            className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {user ? (
            <div className="flex items-center gap-1">
              <NotificationBell userId={user.id} />
              <Link
                href={`${base}/profile`}
                className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.username || ""} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-[10px] font-bold">
                    {user.username?.[0]?.toUpperCase() ?? <User className="w-3 h-3" />}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.username}</span>
              </Link>
              <button
                onClick={onLogout}
                aria-label="Se déconnecter"
                className="hidden md:flex p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={`${base}/auth/login`}
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href={`${base}/auth/register`}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
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
        <div className="md:hidden border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-black animate-slide-down">
          <nav aria-label="Menu mobile" className="py-2 px-3 flex flex-col gap-0.5">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="py-2 px-3 border-t border-gray-100 dark:border-white/[0.06] flex flex-col gap-0.5">
            {user ? (
              <>
                <Link href={`${base}/profile`} onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Mon profil
                </Link>
                <button onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="text-left py-2.5 px-3 rounded-xl text-sm font-medium text-red-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link href={`${base}/auth/login`} onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Se connecter
                </Link>
                <Link href={`${base}/auth/register`} onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
