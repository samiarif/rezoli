import type { Metadata } from "next";
import { BUSINESS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Rezoli collecte, utilise et protège vos données personnelles, en conformité avec le RGPD et la loi tunisienne.",
  alternates: { canonical: "/politique-confidentialite" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement de vos données est <strong>{BUSINESS.legalName}</strong>.
        Pour toute question, contactez-nous à{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>

      <h2>2. Données collectées</h2>
      <p>Nous collectons uniquement les données nécessaires aux services proposés :</p>
      <ul>
        <li>Identité et coordonnées : nom, prénom, email, téléphone, société.</li>
        <li>
          Détails d&apos;événement : date, lieu, nombre d&apos;invités, type
          d&apos;événement, contenu de votre panier.
        </li>
        <li>
          Données techniques : adresse IP, navigateur, statistiques de
          navigation anonymisées (avec votre consentement).
        </li>
      </ul>

      <h2>3. Finalités</h2>
      <ul>
        <li>Traiter vos demandes de devis et y répondre.</li>
        <li>Gérer notre relation commerciale et nos prestations.</li>
        <li>Améliorer notre service (mesure d&apos;audience anonyme).</li>
        <li>Respecter nos obligations légales et comptables.</li>
      </ul>

      <h2>4. Bases légales</h2>
      <ul>
        <li>
          <strong>Consentement</strong> pour les cookies non essentiels.
        </li>
        <li>
          <strong>Exécution d&apos;un contrat</strong> pour les demandes de
          devis et prestations.
        </li>
        <li>
          <strong>Obligations légales</strong> pour la facturation et la
          conservation comptable.
        </li>
      </ul>

      <h2>5. Durées de conservation</h2>
      <ul>
        <li>Demandes de devis : 3 ans après la dernière interaction.</li>
        <li>Messages de contact : 12 mois.</li>
        <li>Candidatures partenaires : 24 mois.</li>
        <li>Factures et données comptables : 10 ans (obligation légale).</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>
        Nous utilisons uniquement des cookies strictement nécessaires au
        fonctionnement du site. Les cookies de mesure d&apos;audience ne sont
        activés qu&apos;avec votre consentement explicite via notre bandeau de
        cookies. Vous pouvez modifier vos préférences à tout moment.
      </p>

      <h2>7. Vos droits</h2>
      <p>
        Conformément à la réglementation, vous disposez d&apos;un droit
        d&apos;accès, de rectification, d&apos;effacement, de limitation,
        d&apos;opposition et de portabilité de vos données. Pour exercer ces
        droits, écrivez à{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Vos données sont stockées sur des serveurs sécurisés (Supabase /
        Vercel), avec chiffrement en transit (TLS) et au repos. L&apos;accès
        est restreint aux personnes autorisées au sein de notre équipe.
      </p>

      <h2>9. Sous-traitants</h2>
      <p>
        Nous faisons appel à des prestataires techniques limités :
      </p>
      <ul>
        <li>Vercel Inc. (hébergement)</li>
        <li>Supabase Inc. (base de données et authentification)</li>
        <li>Hébergeur de messagerie (envoi d&apos;emails transactionnels via SMTP)</li>
      </ul>

      <h2>10. Contact &amp; réclamation</h2>
      <p>
        En cas de doute ou de réclamation, contactez-nous à{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. Vous pouvez
        également saisir l&apos;Instance Nationale de Protection des Données
        Personnelles (INPDP) en Tunisie.
      </p>
    </>
  );
}
