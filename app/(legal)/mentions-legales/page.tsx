import type { Metadata } from "next";
import { BUSINESS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Rezoli : éditeur, hébergement, propriété intellectuelle et contact.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        <strong>{BUSINESS.legalName}</strong>
        <br />
        Siège social : {BUSINESS.address.locality}, {BUSINESS.address.region}
        <br />
        Email :{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
        <br />
        Téléphone :{" "}
        <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>
          {BUSINESS.phoneDisplay}
        </a>
      </p>

      <h2>Directeur de la publication</h2>
      <p>Mohamed Aziz Bachtarzi, en sa qualité de représentant légal.</p>

      <h2>Hébergement</h2>
      <p>
        Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
        91789, États-Unis.{" "}
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
          vercel.com
        </a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur ce site (textes, images,
        logos, photographies, marques) est la propriété exclusive de{" "}
        {BUSINESS.legalName} ou de ses partenaires. Toute reproduction, même
        partielle, sans autorisation écrite préalable est interdite et
        constituerait une contrefaçon sanctionnée par les articles applicables
        du Code de la propriété intellectuelle tunisien.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Pour toute question relative au traitement de vos données personnelles,
        consultez notre{" "}
        <a href="/politique-confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Crédits</h2>
      <p>
        Photographies : Unsplash et photographes Rezoli. Icônes : Lucide.
        Polices : Playfair Display, DM Sans (Google Fonts).
      </p>
    </>
  );
}
