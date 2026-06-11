function ActivityCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden">
      <div className="aspect-video shimmer-bg" />
      <div className="px-3 pt-3 pb-3.5 space-y-2">
        <div className="h-4 shimmer-bg rounded-full w-3/4" />
        <div className="h-3 shimmer-bg rounded-full w-full" />
        <div className="h-3 shimmer-bg rounded-full w-1/2" />
      </div>
    </div>
  );
}

export default function ActivitesGratuitesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-brand-navy py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="h-6 bg-white/10 rounded-full w-20" />
          <div className="h-9 bg-white/10 rounded-full w-72 max-w-full" />
          <div className="h-4 bg-white/10 rounded-full w-96 max-w-full" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-3 shimmer-bg rounded-full w-40 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ActivityCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
