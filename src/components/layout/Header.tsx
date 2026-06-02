"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, MapPin, Bell, Heart, User, LogOut, ShieldCheck } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
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
          <span>ParisSorties</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <NavLink href={base}>{t("home")}</NavLink>
          <NavLink href={`${base}/activities`}>{t("activities")}</NavLink>
          {user && <NavLink href={`${base}/favorites`}>{t("favorites")}</NavLink>}
          {user && <NavLink href={`${base}/propose`}>{t("propose")}</NavLink>}
          {user?.role !== "user" && <NavLink href={`${base}/admin`}>{t("admin")}</NavLink>}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href={`${base}/profile`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{user.username}</span>
              </Link>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
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
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-navy-dark border-t border-white/10 py-3 px-4 flex flex-col gap-1 animate-fade-in">
          <MobileNavLink href={base} onClick={() => setMenuOpen(false)}>{t("home")}</MobileNavLink>
          <MobileNavLink href={`${base}/activities`} onClick={() => setMenuOpen(false)}>{t("activities")}</MobileNavLink>
          {user && <MobileNavLink href={`${base}/favorites`} onClick={() => setMenuOpen(false)}>{t("favorites")}</MobileNavLink>}
          {user && <MobileNavLink href={`${base}/propose`} onClick={() => setMenuOpen(false)}>{t("propose")}</MobileNavLink>}
          {user?.role !== "user" && <MobileNavLink href={`${base}/admin`} onClick={() => setMenuOpen(false)}>{t("admin")}</MobileNavLink>}
          <div className="pt-2 mt-2 border-t border-white/10">
            {user ? (
              <>
                <MobileNavLink href={`${base}/profile`} onClick={() => setMenuOpen(false)}>{t("profile")}</MobileNavLink>
                <button onClick={() => { onLogout(); setMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-red-300 hover:bg-white/10 transition-colors">
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <MobileNavLink href={`${base}/auth/login`} onClick={() => setMenuOpen(false)}>{t("login")}</MobileNavLink>
                <MobileNavLink href={`${base}/auth/register`} onClick={() => setMenuOpen(false)}>{t("register")}</MobileNavLink>
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

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
      {children}
    </Link>
  );
}
