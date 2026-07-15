"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UsersSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="mb-4">
        <div className="h-12 bg-card rounded-2xl border border-border flex items-center gap-3 px-4">
          <Skeleton className="h-9 w-[170px] rounded-lg" />
          <Skeleton className="h-9 w-[140px] rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-[220px] rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl overflow-hidden border border-border">
        <div className="hidden md:block">
          <div className="bg-secondary/50 px-4 py-3 flex items-center gap-4 border-b">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <div className="flex-1" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <div className="flex-1 flex justify-end gap-1.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
              <div className="flex gap-1.5 pt-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}