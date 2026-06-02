import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-brand-navy/10 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
      <p className="text-gray-500 mb-6">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link
        href="/fr"
        className="px-6 py-3 bg-brand-navy text-white rounded-xl font-medium hover:bg-brand-navy-dark transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
