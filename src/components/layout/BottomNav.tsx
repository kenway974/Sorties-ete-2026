"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, PlusCircle, Heart, User } from "lucide-react";

const ITEMS = [
  { href: "/fr",            icon: Home,         label: "Accueil" },
  { href: "/fr/activities", icon: CalendarDays, label: "Explorer" },
  { href: "/fr/favorites",  icon: Heart,        label: "Favoris" },
  { href: "/fr/profile",    icon: User,         label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/fr" ? pathname === "/fr" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-pb"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {ITEMS.slice(0, 2).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px] ${
              isActive(href)
                ? "text-brand-navy dark:text-brand-gold"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${isActive(href) ? "scale-110" : ""}`}
              strokeWidth={isActive(href) ? 2.5 : 1.8}
            />
            <span className={`text-[10px] font-medium ${isActive(href) ? "font-semibold" : ""}`}>
              {label}
            </span>
          </Link>
        ))}

        {/* Centre CTA — Proposer */}
        <Link
          href="/fr/propose"
          className="flex flex-col items-center gap-0.5 -mt-5"
          aria-label="Proposer une activité"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            pathname.startsWith("/fr/propose")
              ? "bg-brand-gold scale-105"
              : "bg-brand-navy"
          }`}>
            <PlusCircle className="w-7 h-7 text-white" strokeWidth={1.8} />
          </div>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
            Proposer
          </span>
        </Link>

        {ITEMS.slice(2).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px] ${
              isActive(href)
                ? "text-brand-navy dark:text-brand-gold"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${isActive(href) ? "scale-110" : ""}`}
              strokeWidth={isActive(href) ? 2.5 : 1.8}
            />
            <span className={`text-[10px] font-medium ${isActive(href) ? "font-semibold" : ""}`}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
