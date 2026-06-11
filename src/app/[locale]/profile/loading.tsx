export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="h-7 shimmer-bg rounded-full w-32" />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full shimmer-bg shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 shimmer-bg rounded-full w-1/3" />
            <div className="h-3 shimmer-bg rounded-full w-1/2" />
          </div>
        </div>
        {/* Fields */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 shimmer-bg rounded-full w-20" />
            <div className="h-10 shimmer-bg rounded-xl w-full" />
          </div>
        ))}
        <div className="h-10 shimmer-bg rounded-xl w-full" />
      </div>
    </div>
  );
}
