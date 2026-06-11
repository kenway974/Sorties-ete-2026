function ItineraryItemSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <div className="w-12 h-12 rounded-2xl shimmer-bg shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 shimmer-bg rounded-full w-3/4" />
        <div className="h-3 shimmer-bg rounded-full w-1/2" />
        <div className="h-3 shimmer-bg rounded-full w-1/3" />
      </div>
    </div>
  );
}

export default function ItineraryLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="h-7 shimmer-bg rounded-full w-44" />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 px-4">
        {Array.from({ length: 5 }).map((_, i) => <ItineraryItemSkeleton key={i} />)}
      </div>
    </div>
  );
}
