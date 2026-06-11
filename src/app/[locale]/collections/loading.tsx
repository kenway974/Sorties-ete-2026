function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
      <div className="h-4 shimmer-bg rounded-full w-1/4" />
      <div className="h-5 shimmer-bg rounded-full w-3/5" />
      <div className="h-3 shimmer-bg rounded-full w-full" />
      <div className="h-3 shimmer-bg rounded-full w-4/5" />
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
        <div className="h-3 shimmer-bg rounded-full w-20" />
        <div className="h-3 shimmer-bg rounded-full w-16" />
      </div>
    </div>
  );
}

export default function CollectionsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 shimmer-bg rounded-full w-40" />
        <div className="h-9 shimmer-bg rounded-xl w-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}
