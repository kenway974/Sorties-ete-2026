"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Menu, X, MapPin, User, LogOut } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "@/components/notifications/NotificationBell";
import type { Profile } from "@/types";

interface HeaderProps {
  locale: string;
  user: Profile | null;
  onLogout: () => void;
}

export default function Header({ locale, user, onLogout }: HeaderProps) {
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);
  const base = `/${locale}`;

  return (
    <header className="sticky top-0 z-30 bg-brand-navy text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={base} className="flex items-center gap-2 font-bold text-lg shrink-0">
          <MapPin className="w-5 h-5 text-brand-gold" />
          <span className="hidden sm:inline">ParisSorties</span>
          <span className="sm:hidden">PS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <NavLink href={base}>{t("home")}</NavLink>
          <NavLink href={`${base}/activities`}>{t("activities")}</NavLink>
          {user && <NavLink href={`${base}/favorites`}>{t("favorites")}</NavLink>}
          {user && <NavLink href={`${base}/propose`}>{t("propose")}</NavLink>}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <NavLink href={`${base}/admin`}>{t("admin")}</NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-1">
              <NotificationBell userId={user.id} />
              <Link
                href={`${base}/profile`}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{user.username}</span>
              </Link>
              <button
                onClick={onLogout}
                className="hidden md:flex p-2 rounded-xl hover:bg-white/10 transition-colors"
                aria-label={t("logout")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={`${base}/auth/login`}
                className="px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href={`${base}/auth/register`}
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-brand-gold hover:bg-brand-gold-dark transition-colors"
              >
                {t("register")}
              </Link>
            </div>
          )}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-navy-dark border-t border-white/10 py-3 px-4 flex flex-col gap-1 animate-fade-in">
          <MobileLink href={base} onClick={() => setMenuOpen(false)}>{t("home")}</MobileLink>
          <MobileLink href={`${base}/activities`} onClick={() => setMenuOpen(false)}>{t("activities")}</MobileLink>
          {user && <MobileLink href={`${base}/favorites`} onClick={() => setMenuOpen(false)}>{t("favorites")}</MobileLink>}
          {user && <MobileLink href={`${base}/propose`} onClick={() => setMenuOpen(false)}>{t("propose")}</MobileLink>}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <MobileLink href={`${base}/admin`} onClick={() => setMenuOpen(false)}>{t("admin")}</MobileLink>
          )}
          <div className="pt-2 mt-2 border-t border-white/10">
            {user ? (
              <>
                <MobileLink href={`${base}/profile`} onClick={() => setMenuOpen(false)}>{t("profile")}</MobileLink>
                <button
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-red-300 hover:bg-white/10 transition-colors"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <MobileLink href={`${base}/auth/login`} onClick={() => setMenuOpen(false)}>{t("login")}</MobileLink>
                <MobileLink href={`${base}/auth/register`} onClick={() => setMenuOpen(false)}>{t("register")}</MobileLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
      {children}
    </Link>
  );
}
