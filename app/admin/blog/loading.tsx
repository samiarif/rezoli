import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBlogLoading() {
  return (
    <div className="px-6 sm:px-10 py-8 space-y-5">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
      <div className="rounded-xl bg-background ring-1 ring-border p-2 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
