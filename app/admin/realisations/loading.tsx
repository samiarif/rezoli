import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRealisationsLoading() {
  return (
    <div className="px-6 sm:px-10 py-8 space-y-5">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="rounded-xl overflow-hidden bg-background ring-1 ring-border">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
