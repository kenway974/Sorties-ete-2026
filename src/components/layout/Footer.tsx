import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer({ locale = "fr" }: { locale?: string }) {
  const base = `/${locale}`;
  return (
    <footer role="contentinfo" className="bg-brand-navy text-white/70 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href={base} className="flex items-center gap-2 font-medium text-white">
            <MapPin className="w-4 h-4 text-brand-gold" />
            <span>Hors-Piste</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href={`${base}/activities`} className="hover:text-white transition-colors">Activités</Link>
            <Link href={`${base}/collections`} className="hover:text-white transition-colors">Collections</Link>
            <Link href={`${base}/propose`} className="hover:text-white transition-colors">Proposer</Link>
            <Link href={`${base}/legal/mentions-legales`} className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href={`${base}/legal/confidentialite`} className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href={`${base}/legal/cgu`} className="hover:text-white transition-colors">CGU</Link>
          </nav>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-white/10 text-xs">
          <p>© {new Date().getFullYear()} Hors-Piste — Paris &amp; Île-de-France 🇫🇷</p>
          <p className="text-white/40">Données : Open Data Ville de Paris &amp; OpenAgenda — triées à la main et à la machine</p>
        </div>
      </div>
    </footer>
  );
}