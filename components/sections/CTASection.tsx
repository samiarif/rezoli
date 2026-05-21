import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/utils";

export function CTASection({
  title = "Prêt à organiser votre prochain événement ?",
  description = "Notre équipe vous accompagne du devis personnalisé à la dernière bouchée servie.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="relative py-20 md:py-24 bg-neutral-900 text-cream-50 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pattern-dots opacity-10 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-teal-700/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="eyebrow text-amber-400">À votre service</p>
        <h2 className="display-2 mt-2 text-white text-balance max-w-3xl mx-auto">
          {title}
        </h2>
        <p className="mt-4 text-base text-cream-50/80 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="accent" size="lg">
            <Link href="/nos-services">
              Demander un devis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-cream-50/30 text-cream-50 hover:bg-white/10 bg-transparent"
          >
            <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>
              <Phone className="size-4" />
              {BUSINESS.phoneDisplay}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
