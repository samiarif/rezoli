"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/catalog";

export function Testimonials({
  heading = "Ce que disent nos clients",
  eyebrow = "Témoignages",
}: {
  heading?: string;
  eyebrow?: string;
}) {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-2 mt-2 text-balance">{heading}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, idx) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative rounded-xl bg-cream-50 p-6 ring-1 ring-cream-100"
            >
              <Quote
                aria-hidden
                className="absolute -top-3 left-4 size-7 text-amber-500 fill-amber-500/30"
              />
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className="size-4 text-amber-500 fill-amber-500"
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
                « {t.content} »
              </blockquote>
              <figcaption className="mt-5 border-t border-border/60 pt-3">
                <p className="font-medium text-sm">{t.author}</p>
                <p className="text-xs text-muted-foreground">
                  {t.role} · {t.company}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
