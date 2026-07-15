"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({ rows = 4, columns = 2 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Filter bar */}
      <div className="h-12 bg-card rounded-2xl border border-border" />

      {/* Card grid */}
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-card rounded-[20px] border border-border p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-5 w-2/3" />
            </div>
            <Skeleton className="h-4 w-20 mb-3 rounded-full" />
            <Skeleton className="h-3 w-full mb-1.5" />
            <Skeleton className="h-3 w-3/4 mb-3" />
            <Skeleton className="h-[10px] w-full rounded-full mb-1" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="h-12 bg-card rounded-2xl border border-border" />
      <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}