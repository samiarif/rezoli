import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Users, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";
import type { RealisationSummary } from "@/lib/realisations";

export function RealisationCard({ r }: { r: RealisationSummary }) {
  return (
    <article className="group h-full">
      <Link
        href={`/realisations/${r.slug}`}
        className="block h-full rounded-xl overflow-hidden bg-background ring-1 ring-border shadow-xs hover:ring-teal-500/30 hover:-translate-y-1 hover:shadow-md transition-all"
      >
        <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden">
          {r.heroImageUrl && (
            <Image
              src={r.heroImageUrl}
              alt={r.heroImageAlt ?? r.title}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover img-warm transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {r.featured && (
            <span className="absolute top-3 right-3">
              <Badge variant="amber">À la une</Badge>
            </span>
          )}
        </div>
        <div className="p-5">
          <Badge variant="neutral" className="text-[10px]">
            {r.eventType}
          </Badge>
          <h3 className="mt-3 font-display text-lg font-semibold leading-tight text-balance line-clamp-2">
            {r.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {r.shortPitch}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {r.date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" /> {formatDateFr(r.date)}
              </span>
            )}
            {r.guestCount != null && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" /> {r.guestCount}
              </span>
            )}
            {r.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {r.location}
              </span>
            )}
          </dl>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
            Découvrir{" "}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
