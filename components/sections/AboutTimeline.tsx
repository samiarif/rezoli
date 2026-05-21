import { Lightbulb, Rocket, Sparkles, TrendingUp } from "lucide-react";

const MILESTONES = [
  {
    year: "2023",
    icon: Lightbulb,
    title: "L'idée prend forme",
    body: "Face aux difficultés d'organisation culinaire pour les événements professionnels, l'équipe fondatrice imagine une plateforme centralisée pour simplifier ce processus.",
  },
  {
    year: "2024",
    icon: Rocket,
    title: "Lancement de Rezoli",
    body: "Premiers partenariats signés, premières commandes livrées. Rezoli devient la première solution tout-en-un pour l'organisation culinaire en Tunisie.",
  },
  {
    year: "2025",
    icon: Sparkles,
    title: "Expansion des services",
    body: "Pauses café, cocktails dînatoires, stations street food, packs événementiels — l'offre s'étoffe pour couvrir tous les formats d'événements.",
  },
  {
    year: "2026",
    icon: TrendingUp,
    title: "La plateforme évolue",
    body: "Commande en ligne, configurateur interactif, Rezoli continue d'innover pour rendre chaque événement encore plus simple à organiser.",
  },
];

export function AboutTimeline() {
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow">Notre parcours</p>
          <h2 className="display-2 mt-2 text-balance">De l&apos;idée à la réalité</h2>
        </div>

        <ol
          className="relative space-y-10 md:space-y-12 pl-10 md:pl-0"
          aria-label="Étapes clés de Rezoli"
        >
          {/* vertical line (mobile only — desktop uses per-card decoration) */}
          <span
            aria-hidden
            className="md:hidden absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-teal-500/40 via-amber-400/30 to-teal-500/40"
          />

          {MILESTONES.map((m, i) => {
            const Icon = m.icon;
            const isEven = i % 2 === 0;
            return (
              <li
                key={m.year}
                className="md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 md:items-start relative"
              >
                {/* mobile dot */}
                <span
                  aria-hidden
                  className="md:hidden absolute -left-7 top-1 inline-flex size-6 items-center justify-center rounded-full bg-teal-500 text-white ring-4 ring-teal-100 shadow-sm"
                >
                  <Icon className="size-3" />
                </span>

                {/* left side (even-indexed entries on desktop) */}
                <div
                  className={
                    "md:text-right " +
                    (isEven
                      ? "md:block"
                      : "md:hidden")
                  }
                >
                  {isEven && <MilestoneCard m={m} alignRight />}
                </div>

                {/* center connector (desktop only) */}
                <div
                  aria-hidden
                  className="hidden md:flex flex-col items-center"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-teal-500 text-white ring-4 ring-teal-100 shadow-sm">
                    <Icon className="size-4" />
                  </span>
                  {i < MILESTONES.length - 1 && (
                    <span className="grow w-px mt-1 bg-gradient-to-b from-teal-500/30 to-amber-400/30 min-h-32" />
                  )}
                </div>

                {/* right side (odd-indexed entries on desktop) */}
                <div
                  className={
                    "md:text-left " +
                    (isEven
                      ? "md:hidden"
                      : "md:block")
                  }
                >
                  {!isEven && <MilestoneCard m={m} />}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function MilestoneCard({
  m,
  alignRight = false,
}: {
  m: (typeof MILESTONES)[number];
  alignRight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl bg-cream-50 ring-1 ring-cream-100 p-5 md:p-6 shadow-xs " +
        (alignRight ? "md:ml-auto" : "")
      }
    >
      <p className="font-display text-2xl font-bold text-teal-700 tabular-nums">
        {m.year}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold">{m.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {m.body}
      </p>
    </div>
  );
}
