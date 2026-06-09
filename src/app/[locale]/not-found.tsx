import Link from "next/link";
import { Search, Home, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-brand-navy/10 dark:text-white/5 mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page introuvable</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        Cette page n&apos;existe pas ou a été déplacée. Voici quelques liens utiles :
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/fr"
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-navy text-white rounded-xl font-medium hover:bg-brand-navy/90 transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Accueil
        </Link>
        <Link
          href="/fr/activities"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Calendar className="w-4 h-4" aria-hidden="true" />
          Toutes les activités
        </Link>
        <Link
          href="/fr/activities?search="
          className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Rechercher
        </Link>
      </div>
    </div>
  );
}
