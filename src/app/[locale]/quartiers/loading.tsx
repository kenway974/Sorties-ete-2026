function QuartierCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-3">
      <div className="flex items-start justify-between">
        <div className="h-5 shimmer-bg rounded-full w-2/5" />
        <div className="w-5 h-5 shimmer-bg rounded-full" />
      </div>
      <div className="h-3 shimmer-bg rounded-full w-full" />
      <div className="h-3 shimmer-bg rounded-full w-4/5" />
      <div className="h-3 shimmer-bg rounded-full w-16 mt-2" />
    </div>
  );
}

export default function QuartiersLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-brand-navy py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="h-9 bg-white/10 rounded-full w-64" />
          <div className="h-4 bg-white/10 rounded-full w-96 max-w-full" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 10 }).map((_, i) => <QuartierCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
