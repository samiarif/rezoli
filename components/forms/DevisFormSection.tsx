import { DevisForm } from "./DevisForm";

/**
 * Home-page devis section. Mirrors the bottom-of-index form of the original
 * HTML, wrapped with a tinted background + a teaser headline.
 */
export function DevisFormSection() {
  return (
    <section
      id="devis"
      className="py-20 md:py-24 bg-gradient-to-b from-teal-50/40 via-cream-50 to-background border-y border-cream-100"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="eyebrow">Demande de devis</p>
          <h2 className="display-2 mt-2 text-balance">
            Décrivez votre événement, on revient sous 48 h
          </h2>
          <p className="lede mt-4 text-pretty">
            Un seul formulaire pour démarrer. Notre équipe vous propose une
            offre adaptée à votre format, votre lieu et votre budget.
          </p>
        </div>
        <DevisForm variant="section" />
      </div>
    </section>
  );
}
