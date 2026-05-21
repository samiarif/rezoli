"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/utils";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-cream-50 to-background">
      <div
        aria-hidden
        className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-100/40 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-[24rem] w-[24rem] rounded-full bg-teal-200/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:grid-cols-2 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-start gap-2 rounded-2xl border border-teal-500/30 bg-white/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-teal-700 max-w-md leading-snug">
            <Sparkles className="size-3.5 mt-0.5 shrink-0" />
            <span>
              1ère solution tout-en-un pour l&apos;organisation culinaire de vos
              événements en Tunisie
            </span>
          </span>
          <h1 className="display-1 mt-5 text-balance">
            Vos événements{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-teal-700">prennent goût</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 h-3 bg-amber-300/60 -z-0 rounded"
              />
            </span>
            .
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl">
            De la pause café aux cocktails dînatoires, nous concevons des
            expériences culinaires sur-mesure pour vos rendez-vous professionnels.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="solid" size="lg">
              <Link href="/nos-services">
                Demander un devis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/nos-services">Découvrir nos services</Link>
            </Button>
            <a
              href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:underline ml-2"
            >
              <Phone className="size-4" />
              {BUSINESS.phoneDisplay}
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 max-w-md">
            {[
              { k: "100+", v: "événements réalisés" },
              { k: "20+", v: "partenaires" },
              { k: "98%", v: "satisfaction clients" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-2xl font-bold text-teal-700">
                  {s.k}
                </dt>
                <dd className="text-xs text-muted-foreground mt-1">{s.v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-teal-500/10">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
              alt="Table de banquet dressée avec finesse"
              fill
              priority
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover img-warm-strong"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute -bottom-6 -left-6 hidden md:block rounded-xl bg-white p-4 shadow-lg ring-1 ring-border max-w-xs"
          >
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              ★★★★★ · 4.9 / 5
            </p>
            <p className="mt-1.5 text-sm text-foreground leading-snug">
              « Service impeccable, bouchées créatives. Nos invités en parlent
              encore. »
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              — Yasmine T., Carthage Group
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
