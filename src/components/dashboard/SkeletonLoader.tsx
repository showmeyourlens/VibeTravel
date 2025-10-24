/**
 * Skeleton Loader Component
 * Placeholder component shown during initial data fetch
 * Mimics the structure of PlanCard with shimmering animation
 */

export default function SkeletonLoader() {
  return (
    <div>
      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              {/* Header skeleton */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-2"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded-full animate-pulse w-16 ml-2"></div>
              </div>

              {/* Content skeleton */}
              <div className="mb-4">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-full mb-2"></div>
                <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3"></div>
              </div>

              {/* Footer skeleton */}
              <div className="pt-3 border-t border-slate-100">
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
