"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-1.5" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>

      {/* AO table */}
      <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
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