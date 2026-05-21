import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  Building,
  Quote,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareLinks } from "@/components/ui/share-links";
import { GalleryLightbox } from "@/components/realisations/GalleryLightbox";
import { BreadcrumbJsonLd, EventJsonLd } from "@/components/seo/JsonLd";
import { TipTapRender } from "@/lib/tiptap-render";
import { SITE_URL, formatDateFr } from "@/lib/utils";
import { getRealisationBySlug } from "@/lib/realisations";

type Outcome = { label: string; value: string };
type Testimonial = {
  author: string;
  role?: string | null;
  company?: string | null;
  content: string;
  rating?: number | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r || r.status !== "PUBLISHED") return { title: "Réalisation introuvable" };
  return {
    title: r.title,
    description: r.shortPitch,
    alternates: { canonical: `/realisations/${r.slug}` },
    openGraph: {
      title: r.title,
      description: r.shortPitch,
      images: r.heroImageUrl ? [{ url: r.heroImageUrl }] : undefined,
    },
  };
}

export default async function RealisationDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r || r.status !== "PUBLISHED") notFound();

  const outcomes = (r.outcomes as Outcome[] | null) ?? null;
  const testimonial = (r.testimonial as Testimonial | null) ?? null;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: SITE_URL },
          { name: "Réalisations", url: `${SITE_URL}/realisations` },
          { name: r.title, url: `${SITE_URL}/realisations/${r.slug}` },
        ]}
      />
      <EventJsonLd
        name={r.title}
        description={r.shortPitch}
        url={`${SITE_URL}/realisations/${r.slug}`}
        startDate={r.date}
        location={r.location}
        imageUrl={r.heroImageUrl}
      />

      <article>
        {/* Header */}
        <header className="bg-gradient-to-b from-teal-50/40 to-background pt-12 pb-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/realisations"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-teal-700 mb-6"
            >
              <ArrowLeft className="size-3.5" /> Toutes les réalisations
            </Link>
            <Badge variant="neutral">{r.eventType}</Badge>
            <h1 className="display-1 mt-3 text-balance">{r.title}</h1>
            <p className="lede mt-4 text-pretty max-w-3xl">{r.shortPitch}</p>
            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {r.date && (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4 text-teal-600" />
                  {formatDateFr(r.date)}
                </span>
              )}
              {r.location && (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-teal-600" />
                  {r.location}
                </span>
              )}
              {r.guestCount != null && (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Users className="size-4 text-teal-600" />
                  {r.guestCount} invités
                </span>
              )}
              {r.clientName && (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Building className="size-4 text-teal-600" />
                  {r.clientName}
                </span>
              )}
            </dl>
          </div>
        </header>

        {/* Hero image */}
        {r.heroImageUrl && (
          <div className="relative aspect-[16/9] w-full bg-cream-100">
            <Image
              src={r.heroImageUrl}
              alt={r.heroImageAlt ?? r.title}
              fill
              priority
              sizes="(min-width:1280px) 1280px, 100vw"
              className="object-cover img-warm-strong"
            />
          </div>
        )}

        {/* Outcomes strip */}
        {outcomes && outcomes.length > 0 && (
          <section className="py-12 md:py-16 bg-cream-50">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <p className="eyebrow text-center">Résultats clés</p>
              <ul className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                {outcomes.map((o, i) => (
                  <li key={i}>
                    <p className="font-display text-3xl md:text-4xl font-bold text-teal-700 tabular-nums">
                      {o.value}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">
                      {o.label}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Long content */}
        {r.longContent ? (
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <TipTapRender doc={r.longContent as object} />
            </div>
          </section>
        ) : null}

        {/* Gallery */}
        {r.gallery.length > 0 && (
          <section className="py-12 md:py-16 bg-cream-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="eyebrow text-center mb-8">Galerie</p>
              <GalleryLightbox images={r.gallery} title={r.title} />
            </div>
          </section>
        )}

        {/* Testimonial */}
        {testimonial && (
          <section className="py-12 md:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
              <Quote className="size-10 mx-auto text-amber-500 fill-amber-500/20 mb-4" />
              {testimonial.rating && (
                <div className="flex justify-center gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-5 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>
              )}
              <blockquote className="font-display text-xl md:text-2xl leading-relaxed text-balance">
                « {testimonial.content} »
              </blockquote>
              <figcaption className="mt-5">
                <p className="font-medium">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {[testimonial.role, testimonial.company]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </figcaption>
            </div>
          </section>
        )}

        {/* Share */}
        <section className="py-10 border-t border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex justify-center">
            <ShareLinks
              url={`/realisations/${r.slug}`}
              title={r.title}
              description={r.shortPitch}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-neutral-900 text-cream-50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="eyebrow text-amber-400">À votre tour</p>
            <h2 className="display-2 mt-2 text-white text-balance">
              Vous voulez organiser un événement similaire ?
            </h2>
            <p className="lede mt-4 text-cream-50/80">
              Notre équipe revient vers vous sous 24 heures ouvrées avec une
              proposition personnalisée.
            </p>
            <div className="mt-6">
              <Button asChild variant="accent" size="lg">
                <Link href="/nos-services">
                  Demander un devis <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
