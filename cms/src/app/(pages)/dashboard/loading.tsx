import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border border-secondary-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4 p-4 border rounded border-secondary-300">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}