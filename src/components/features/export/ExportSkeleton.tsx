"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ExportSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in-0 duration-300">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 md:p-6 space-y-5">
        {/* Card title */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-12 mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Download buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}