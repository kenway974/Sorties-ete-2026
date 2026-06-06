export function ActivitySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div className="h-40 shimmer-bg" />
      <div className="p-4 space-y-3">
        <div className="h-4 shimmer-bg rounded-full w-1/3" />
        <div className="h-5 shimmer-bg rounded-full w-3/4" />
        <div className="space-y-2">
          <div className="h-3 shimmer-bg rounded-full" />
          <div className="h-3 shimmer-bg rounded-full w-2/3" />
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-gray-700/50">
          <div className="h-4 shimmer-bg rounded-full w-16" />
          <div className="h-4 shimmer-bg rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ActivitySkeleton key={i} />
      ))}
    </div>
  );
}
