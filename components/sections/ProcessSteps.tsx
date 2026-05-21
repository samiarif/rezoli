"use client";

import { motion } from "framer-motion";
import { MessageSquare, ClipboardCheck, ChefHat, Sparkles } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: MessageSquare,
    title: "Échange & écoute",
    body: "Nous comprenons votre événement, vos invités, vos contraintes.",
  },
  {
    n: "02",
    icon: ClipboardCheck,
    title: "Devis sur-mesure",
    body: "Un menu et un service adaptés à votre budget et vos objectifs.",
  },
  {
    n: "03",
    icon: ChefHat,
    title: "Préparation soignée",
    body: "Nos chefs préparent vos plats avec des produits frais sélectionnés.",
  },
  {
    n: "04",
    icon: Sparkles,
    title: "Service le jour J",
    body: "Notre équipe assure une prestation impeccable, du dressage au départ.",
  },
];

export function ProcessSteps() {
  return (
    <section className="py-20 md:py-28 bg-cream-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <p className="eyebrow">Notre méthode</p>
          <h2 className="display-2 mt-2 text-balance">
            Une organisation sans stress
          </h2>
          <p className="lede mt-4 text-pretty">
            Quatre étapes simples, et nous nous occupons du reste.
          </p>
        </div>
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative rounded-xl bg-background p-6 ring-1 ring-border shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl font-bold text-teal-700/20">
                    {s.n}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon className="size-5" />
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
