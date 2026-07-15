import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="w-full max-w-[440px] bg-white/97 backdrop-blur-[20px] p-10 px-9 rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,.3)] relative z-10 space-y-5">
      <div className="flex justify-center mb-3">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <Skeleton className="h-10 w-48 mx-auto" />
      <Skeleton className="h-4 w-40 mx-auto" />
      <div className="space-y-4 pt-2">
        <Skeleton className="h-12 w-full rounded-[14px]" />
        <Skeleton className="h-12 w-full rounded-[14px]" />
      </div>
      <Skeleton className="h-12 w-full rounded-[14px]" />
    </div>
  );
}