"use client";

import { partners } from "@/lib/catalog";

export function PartnerScroller({
  heading = "Ils cuisinent pour vous",
  eyebrow = "Partenaires",
}: {
  heading?: string;
  eyebrow?: string;
}) {
  const loop = [...partners, ...partners];
  return (
    <section className="py-16 md:py-20 bg-cream-50 border-y border-cream-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-2 mt-2">{heading}</h2>
        </div>

        <div className="relative mask-fade-x overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap will-change-transform">
            {loop.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="flex shrink-0 items-center justify-center h-14 px-6 rounded-lg bg-background ring-1 ring-border shadow-xs"
              >
                <span className="font-display text-lg font-semibold text-neutral-700">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation: none; }
        }
      `}</style>
    </section>
  );
}
