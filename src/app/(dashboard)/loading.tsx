import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-7">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-7 rounded-[24px] border border-border text-center space-y-3">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-10 w-16 mx-auto" />
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-64" />
      <div className="flex items-center gap-8 flex-wrap justify-center bg-white rounded-[18px] p-5">
        <Skeleton className="h-[240px] w-[240px] rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}