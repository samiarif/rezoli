import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealisationCard } from "./RealisationCard";
import { listPublishedRealisations } from "@/lib/realisations";

export async function RealisationFeaturedStrip() {
  const rows = await listPublishedRealisations({ take: 3 });
  if (rows.length === 0) return null;

  return (
    <section className="py-20 md:py-24 bg-cream-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow">Réalisations</p>
            <h2 className="display-2 mt-2 text-balance">
              Ils nous ont fait confiance
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/realisations">
              Voir toutes les réalisations <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {rows.map((r) => (
            <li key={r.id}>
              <RealisationCard r={r} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
