"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ApprovalsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-52 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Menunggu Review section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Skeleton className="h-4 w-40 mb-1.5" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[200px] rounded-lg" />
            <Skeleton className="h-9 w-[180px] rounded-lg" />
          </div>
        </div>

        {/* Pending cards */}
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 bg-secondary/30 border-b flex items-center gap-2.5">
                <Skeleton className="w-4 h-4 rounded-md" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-10 rounded-full ml-auto" />
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat Verifikasi section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-[200px] rounded-lg" />
        </div>
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}