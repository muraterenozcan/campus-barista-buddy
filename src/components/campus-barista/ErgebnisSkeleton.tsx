import { Skeleton } from "@/components/ui/skeleton";

export function ErgebnisSkeleton() {
  return (
    <div className="rounded-2xl border border-haw-soft/60 bg-card p-5 shadow-sm">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="mt-5 h-7 w-1/2" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-4 h-3 w-3/5" />
      <Skeleton className="mt-4 h-8 w-40" />
    </div>
  );
}