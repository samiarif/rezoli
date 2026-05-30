/**
 * Non-service content: partners, testimonials, FAQ.
 * Service-specific data (packs, modal options, pricing brackets) lives in
 * `lib/service-catalog.ts`.
 */

import type { ServiceSlug } from "./service-catalog";

export { services, getServiceMeta as getServiceBySlug } from "./service-catalog";
export type { ServiceSlug, ServiceMeta as Service } from "./service-catalog";

/* ─── Partners ───────────────────────────────────────────────────── */

/**
 * Culinary partner categories — used by the filter on /nos-partenaires.
 * The 4 categories back the "4 Catégories culinaires" stat.
 */
export type PartnerCategory =
  | "traiteur"
  | "patisserie"
  | "street-food"
  | "boissons";

export const PARTNER_CATEGORIES: Array<{
  id: PartnerCategory;
  label: string;
}> = [
  { id: "traiteur", label: "Traiteurs" },
  { id: "patisserie", label: "Pâtisseries" },
  { id: "street-food", label: "Street food" },
  { id: "boissons", label: "Boissons" },
];

/**
 * Culinary partners — traiteurs, pâtisseries, boissons, food concepts.
 * Each partner is scoped to one or more services so they can be surfaced on
 * the matching service detail pages (bottom of /nos-services/[slug]), and
 * carries a single culinary `category` used by the partners-page filter.
 *
 * `logo` is an optional path under /public (e.g. "/partners/vedge.png").
 * When absent, the UI renders an elegant text capsule.
 */
export type Partner = {
  id: string;
  name: string;
  /** Optional logo path under /public — UI falls back to a text capsule when absent. */
  logo?: string;
  /** Culinary category — drives the filter on /nos-partenaires. */
  category: PartnerCategory;
  /** Services this partner is associated with (used to filter the per-service section). */
  services: ServiceSlug[];
};

/**
 * The 18 official enseignes partenaires, each with its logo under
 * /public/partners. Categories and service associations are derived from the
 * brand roster and the partner usage documented in our réalisations
 * (e.g. King Shawarma + El Bio + Pizzagram on street-food events). A few
 * category guesses are flagged inline and can be adjusted by the team.
 */
export const partners: Partner[] = [
  // ── Traiteurs ──
  { id: "best-food-catering", name: "Best Food", logo: "/partners/best-food-catering.jpg", category: "traiteur", services: ["pauses-dejeuner", "cocktails-dinatoires"] },
  { id: "fusion-traiteur", name: "Fusion Traiteur", logo: "/partners/fusion-traiteur.jpg", category: "traiteur", services: ["pauses-dejeuner", "cocktails-dinatoires"] },
  { id: "traiteur-ben-yedder", name: "Traiteur Ben Yedder", logo: "/partners/traiteur-ben-yedder.jpg", category: "traiteur", services: ["pauses-cafe", "pauses-dejeuner"] },
  { id: "me-gusta", name: "Me Gusta", logo: "/partners/me-gusta.jpg", category: "traiteur", services: ["cocktails-dinatoires"] },

  // ── Pâtisseries ──
  { id: "gourmandise", name: "Gourmandise", logo: "/partners/gourmandise.png", category: "patisserie", services: ["cocktails-dinatoires", "pauses-cafe"] },
  { id: "symphonie-gourmande", name: "Symphonie Gourmande", logo: "/partners/symphonie-gourmande.jpg", category: "patisserie", services: ["pauses-cafe"] },
  { id: "masmoudi-events", name: "Masmoudi Events", logo: "/partners/masmoudi-events.jpg", category: "patisserie", services: ["cocktails-dinatoires", "pauses-cafe"] },
  { id: "mme-fathallah", name: "Mme Fathallah", logo: "/partners/mme-fathallah.png", category: "patisserie", services: ["pauses-dejeuner", "cocktails-dinatoires"] },
  { id: "magenta", name: "Magenta", logo: "/partners/magenta.jpg", category: "patisserie", services: ["cocktails-dinatoires"] },

  // ── Boissons ──
  { id: "vedge", name: "Vedge", logo: "/partners/vedge.jpg", category: "boissons", services: ["cocktails-dinatoires", "pauses-cafe"] },
  { id: "jutop", name: "Ju'Top", logo: "/partners/jutop.jpg", category: "boissons", services: ["cocktails-dinatoires", "pauses-cafe"] },

  // ── Street food ──
  { id: "king-shawarma", name: "King Shawarma", logo: "/partners/king-shawarma.jpg", category: "street-food", services: ["stations-street-food"] },
  { id: "pizza-mizen", name: "Pizza Mizen", logo: "/partners/pizza-mizen.jpg", category: "street-food", services: ["stations-street-food"] },
  { id: "pizzagram", name: "Pizzagram", logo: "/partners/pizzagram.jpg", category: "street-food", services: ["stations-street-food"] },
  { id: "creperie-jouliano", name: "Crêperie Jouliano", logo: "/partners/creperie-jouliano.jpg", category: "street-food", services: ["stations-street-food"] },
  { id: "el-bio", name: "El Bio", logo: "/partners/el-bio.png", category: "street-food", services: ["stations-street-food"] },
  { id: "taco-and-co", name: "Taco & Co", logo: "/partners/taco-and-co.jpg", category: "street-food", services: ["stations-street-food"] },
  { id: "le-fumoir", name: "Le Fumoir", logo: "/partners/le-fumoir.jpg", category: "street-food", services: ["stations-street-food", "cocktails-dinatoires"] },
];

export function partnersForService(slug: ServiceSlug): Partner[] {
  return partners.filter((p) => p.services.includes(slug));
}

/* ─── Testimonials ───────────────────────────────────────────────── */

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
  serviceType: ServiceSlug | "general";
  rating: 5;
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    author: "Yasmine Trabelsi",
    role: "Directrice Communication",
    company: "Carthage Group",
    content:
      "Rezoli a transformé notre lancement produit en un événement mémorable. Le service en salle était impeccable et chaque bouchée était une découverte. Nos invités en parlent encore.",
    serviceType: "cocktails-dinatoires",
    rating: 5,
  },
  {
    id: "t2",
    author: "Karim Ben Salah",
    role: "Head of People",
    company: "Tunisie Telecom",
    content:
      "Nos pauses café hebdomadaires sont devenues un vrai moment d'équipe. Café exceptionnel, viennoiseries fraîches, livraison toujours à l'heure. On les recommande les yeux fermés.",
    serviceType: "pauses-cafe",
    rating: 5,
  },
  {
    id: "t3",
    author: "Inès Khaled",
    role: "Office Manager",
    company: "Banque de Tunisie",
    content:
      "Pour 200 collaborateurs, leurs box déjeuner sont parfaits : variés, équilibrés, et avec les options spécifiques que nous avions demandées. Un vrai partenaire de confiance.",
    serviceType: "pauses-dejeuner",
    rating: 5,
  },
  {
    id: "t4",
    author: "Mohamed Aziz Bachtarzi",
    role: "CEO",
    company: "Startup Tunis",
    content:
      "Les stations street-food ont fait sensation à notre soirée de lancement. Les chefs en direct apportent un vrai show. C'est une expérience, pas juste de la nourriture.",
    serviceType: "stations-street-food",
    rating: 5,
  },
];

/* ─── FAQ ────────────────────────────────────────────────────────── */

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqGeneral: FaqItem[] = [
  {
    question: "Combien de temps à l'avance dois-je réserver ?",
    answer:
      "Pour garantir la disponibilité et personnaliser au mieux votre événement, nous recommandons une réservation 2 à 4 semaines à l'avance. Pour les pauses café et déjeuner récurrentes, 48h suffisent.",
  },
  {
    question: "Proposez-vous des options végétariennes, halal ou sans gluten ?",
    answer:
      "Oui, toutes nos formules sont déclinables en versions végétarienne, vegan, halal et sans gluten. Précisez vos besoins lors de la demande de devis.",
  },
  {
    question: "Quel est le nombre minimum d'invités ?",
    answer:
      "Cocktails dînatoires : 30 personnes. Pauses café : 15. Pauses déjeuner : 10. Stations street-food : 100.",
  },
  {
    question: "Livrez-vous partout en Tunisie ?",
    answer:
      "Oui, nous couvrons l'ensemble du Grand Tunis (Tunis, Ariana, Ben Arous, La Marsa) sans supplément, et nous nous déplaçons partout en Tunisie sur demande.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "Après validation du devis, un acompte de 50 % est demandé pour confirmer la réservation. Le solde est dû le jour de l'événement. Aucun paiement en ligne — tout passe par virement ou chèque.",
  },
  {
    question: "Que se passe-t-il en cas d'annulation ?",
    answer:
      "Annulation gratuite jusqu'à 7 jours avant l'événement. Entre 7 et 48h : 50 % retenu. Moins de 48h : 100 %. Détails dans nos CGU.",
  },
];
