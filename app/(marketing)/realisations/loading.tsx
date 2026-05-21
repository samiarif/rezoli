import { Skeleton } from "@/components/ui/skeleton";

export default function RealisationsLoading() {
  return (
    <>
      <section className="bg-gradient-to-b from-teal-50/60 via-cream-50 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="rounded-xl overflow-hidden bg-background ring-1 ring-border"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
