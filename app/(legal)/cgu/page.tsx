import type { Metadata } from "next";
import { BUSINESS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "CGU du site Rezoli : règles d'utilisation, demandes de devis, propriété intellectuelle.",
  alternates: { canonical: "/cgu" },
};

export default function CguPage() {
  return (
    <>
      <h1>Conditions générales d&apos;utilisation</h1>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales (« CGU ») régissent l&apos;utilisation
        du site rezoli.tn édité par <strong>{BUSINESS.legalName}</strong>.
      </p>

      <h2>2. Accès au site</h2>
      <p>
        Le site est accessible gratuitement à tout utilisateur disposant
        d&apos;un accès à Internet. Tous les frais nécessaires à l&apos;accès
        (matériel, connexion) sont à la charge de l&apos;utilisateur.
      </p>

      <h2>3. Demandes de devis</h2>
      <p>
        Les formulaires de demande de devis ne valent pas commande. Une
        prestation n&apos;est confirmée qu&apos;après acceptation écrite d&apos;un
        devis émis par notre équipe et règlement de l&apos;acompte demandé. Le
        site ne propose aucun paiement en ligne.
      </p>

      <h2>4. Annulation</h2>
      <ul>
        <li>Plus de 7 jours avant l&apos;événement : annulation gratuite.</li>
        <li>Entre 7 et 48 heures avant : 50 % retenu.</li>
        <li>Moins de 48 heures avant : 100 % retenu.</li>
      </ul>

      <h2>5. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu publié sur ce site est protégé par le droit
        d&apos;auteur. Toute reproduction non autorisée est interdite.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        Le site est fourni « en l&apos;état » et nous nous efforçons d&apos;en
        garantir la disponibilité, sans toutefois pouvoir l&apos;assurer en
        toute circonstance.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes CGU sont soumises au droit tunisien. Tout litige sera
        soumis aux tribunaux compétents de Tunis.
      </p>

      <h2>8. Modifications</h2>
      <p>
        Nous nous réservons le droit de modifier ces CGU à tout moment. La
        version en vigueur est celle publiée sur le site.
      </p>
    </>
  );
}
