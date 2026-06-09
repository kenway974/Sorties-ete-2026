export default function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-navy focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg focus:outline-none"
    >
      Aller au contenu principal
    </a>
  );
}
