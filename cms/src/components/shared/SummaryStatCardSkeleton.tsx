import { Skeleton } from "@/components/ui/skeleton";

export default function SummaryStatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-secondary-300 min-w-0 flex-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-20 mb-2" />

          {/* Value skeleton */}
          <Skeleton className="h-7 w-16 mb-1" />

          {/* Subtitle skeleton */}
          <Skeleton className="h-3 w-28" />
        </div>

        {/* Icon skeleton */}
        <div className="ml-4">
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
    </div>
  );
}