import { BUSINESS, SITE_URL } from "@/lib/utils";

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // We control this object — safe to stringify.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FoodEstablishment",
        "@id": `${SITE_URL}#business`,
        name: BUSINESS.name,
        legalName: BUSINESS.legalName,
        description:
          "Traiteur premium pour vos événements professionnels en Tunisie.",
        url: SITE_URL,
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: BUSINESS.address.locality,
          addressRegion: BUSINESS.address.region,
          addressCountry: BUSINESS.address.country,
        },
        servesCuisine: [
          "Méditerranéenne",
          "Internationale",
          "Tunisienne",
        ],
        sameAs: [
          BUSINESS.social.instagram,
          BUSINESS.social.facebook,
          BUSINESS.social.linkedin,
        ],
      }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  url,
  startingPrice,
}: {
  name: string;
  description: string;
  url: string;
  startingPrice?: number | null;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        provider: { "@id": `${SITE_URL}#business` },
        areaServed: { "@type": "Country", name: "Tunisie" },
        url,
        ...(startingPrice != null && {
          offers: {
            "@type": "Offer",
            priceCurrency: "TND",
            price: startingPrice,
            availability: "https://schema.org/InStock",
          },
        }),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: it.url,
        })),
      }}
    />
  );
}

export function FaqJsonLd({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: it.answer,
          },
        })),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  authorName,
  coverImageUrl,
}: {
  title: string;
  description?: string | null;
  url: string;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string | null;
  coverImageUrl?: string | null;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        ...(description ? { description } : {}),
        url,
        ...(publishedAt ? { datePublished: publishedAt.toISOString() } : {}),
        ...(updatedAt ? { dateModified: updatedAt.toISOString() } : {}),
        ...(authorName
          ? { author: { "@type": "Person", name: authorName } }
          : {}),
        ...(coverImageUrl ? { image: coverImageUrl } : {}),
        publisher: { "@id": `${SITE_URL}#business` },
      }}
    />
  );
}

export function EventJsonLd({
  name,
  description,
  url,
  startDate,
  endDate,
  location,
  imageUrl,
}: {
  name: string;
  description?: string | null;
  url: string;
  startDate?: Date | null;
  endDate?: Date | null;
  location?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Event",
        name,
        ...(description ? { description } : {}),
        url,
        ...(startDate ? { startDate: startDate.toISOString() } : {}),
        ...(endDate ? { endDate: endDate.toISOString() } : {}),
        ...(location
          ? {
              location: {
                "@type": "Place",
                name: location,
              },
            }
          : {}),
        ...(imageUrl ? { image: imageUrl } : {}),
        organizer: { "@id": `${SITE_URL}#business` },
      }}
    />
  );
}
