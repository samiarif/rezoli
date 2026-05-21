import type { Metadata } from "next";
import Link from "next/link";
import { ChefHat, Layers, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin · Catalogue",
  robots: { index: false, follow: false },
};

const CARDS = [
  {
    href: "/admin/catalog/services",
    icon: ChefHat,
    title: "Services",
    desc: "Cocktails dînatoires, pauses café, pauses déjeuner, stations street-food. Formules, prix, options de personnalisation.",
  },
  {
    href: "/admin/catalog/event-packs",
    icon: Layers,
    title: "Packs événementiels",
    desc: "Soirée Bac, Cérémonies fin d'année, Soutenance. Tiers, contenus, prix paliers, options.",
  },
];

export default function CatalogHome() {
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-8">
        <h1 className="display-2">Catalogue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toute la donnée publique du site : formules, prix, contenus,
          options.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <li key={c.href}>
              <Link
                href={c.href}
                className="group block rounded-xl bg-background ring-1 ring-border p-6 hover:ring-teal-500/40 hover:-translate-y-0.5 transition-all"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-display text-xl font-semibold mt-4">
                  {c.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {c.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
                  Ouvrir <ArrowRight className="size-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
