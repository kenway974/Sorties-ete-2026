"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, Heart, User } from "lucide-react";

const ITEMS = [
  { href: "/fr",            icon: Home,    label: "Accueil" },
  { href: "/fr/activities", icon: Compass, label: "Explorer" },
  { href: "/fr/favorites",  icon: Heart,   label: "Favoris" },
  { href: "/fr/profile",    icon: User,    label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/fr" ? pathname === "/fr" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-gray-100 dark:border-white/[0.06]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {ITEMS.slice(0, 2).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-2xl transition-colors ${
              isActive(href) ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
            }`}
          >
            <Icon className="w-[22px] h-[22px]" strokeWidth={isActive(href) ? 2.5 : 1.7} />
          </Link>
        ))}

        {/* Centre — Proposer */}
        <Link
          href="/fr/propose"
          aria-label="Proposer une activité"
          className="flex items-center justify-center w-12 h-12 -mt-4 rounded-2xl bg-gray-900 dark:bg-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2.5} />
        </Link>

        {ITEMS.slice(2).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-2xl transition-colors ${
              isActive(href) ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
            }`}
          >
            <Icon
              className="w-[22px] h-[22px]"
              strokeWidth={isActive(href) ? 2.5 : 1.7}
              fill={isActive(href) && (href === "/fr/favorites") ? "currentColor" : "none"}
            />
          </Link>
        ))}
      </div>
    </nav>
  );
}
