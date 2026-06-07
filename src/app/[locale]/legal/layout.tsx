export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <article className="prose-legal space-y-4 text-gray-700 dark:text-gray-300">
        {children}
      </article>
    </div>
  );
}