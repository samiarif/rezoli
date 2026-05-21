import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDevisLoading() {
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-6">
        <Skeleton className="h-10 w-1/3 mb-3" />
        <Skeleton className="h-4 w-1/2" />
      </header>
      <div className="rounded-xl bg-background ring-1 ring-border p-2 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
