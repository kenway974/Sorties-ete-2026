import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white/70 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium text-white">
          <MapPin className="w-4 h-4 text-brand-gold" />
          <span>ParisSorties</span>
        </div>
        <p>© {new Date().getFullYear()} ParisSorties — Paris &amp; Île-de-France</p>
      </div>
    </footer>
  );
}
