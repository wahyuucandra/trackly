"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TasksSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Greeting header */}
      <div>
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Filter bar */}
      <div className="h-12 bg-card rounded-2xl border border-border flex items-center gap-3 px-4">
        <Skeleton className="h-9 w-[200px] rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-[260px] rounded-lg" />
      </div>

      {/* Task cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-[20px] border border-border p-5 md:p-6">
            {/* Title */}
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-5 w-2/3" />
            </div>
            {/* Meta badges */}
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            {/* Notes */}
            <Skeleton className="h-4 w-3/4 mb-3" />
            {/* Progress */}
            <Skeleton className="h-[10px] w-full rounded-full mb-1" />
            <Skeleton className="h-3 w-28 mb-3" />
            {/* Tasks section */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}