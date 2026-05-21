"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Coffee, UtensilsCrossed, Wine, Pizza, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { services as fallbackServices } from "@/lib/catalog";
import { formatTND } from "@/lib/utils";
import type { ServiceMeta } from "@/lib/service-catalog";

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "cocktails-dinatoires": Wine,
  "pauses-cafe": Coffee,
  "pauses-dejeuner": UtensilsCrossed,
  "stations-street-food": Pizza,
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function ServicesGrid({
  heading = "Nos services",
  eyebrow = "Expertises",
  description = "Quatre formules complémentaires pour adresser chaque moment de votre événement professionnel.",
  services = fallbackServices,
}: {
  heading?: string;
  eyebrow?: string;
  description?: string;
  services?: ServiceMeta[];
}) {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-2 mt-2 text-balance">{heading}</h2>
          <p className="lede mt-4 text-pretty">{description}</p>
        </div>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((svc) => {
            const Icon = ICON_BY_SLUG[svc.slug] ?? HelpCircle;
            return (
              <motion.li key={svc.slug} variants={item}>
                <Link
                  href={`/nos-services/${svc.slug}`}
                  className="group block h-full overflow-hidden rounded-xl bg-background ring-1 ring-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-teal-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={svc.image}
                      alt={svc.imageAlt}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover img-warm transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-teal-700 shadow">
                        <Icon className="size-4" />
                      </span>
                      {svc.badge && (
                        <Badge variant="amber" className="bg-amber-500/95 text-white border-transparent">
                          {svc.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold leading-tight">
                      {svc.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {svc.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        À partir de{" "}
                        <span className="font-semibold text-foreground">
                          {formatTND(svc.startingPriceTND)}
                        </span>{" "}
                        / pers.
                      </p>
                      <ArrowUpRight className="size-5 text-teal-700 opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </div>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
