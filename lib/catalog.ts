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
  | "restaurant";

export const PARTNER_CATEGORIES: Array<{
  id: PartnerCategory;
  label: string;
}> = [
  { id: "traiteur", label: "Traiteurs" },
  { id: "patisserie", label: "Pâtisseries" },
  { id: "street-food", label: "Street food" },
  { id: "restaurant", label: "Restaurants" },
];

/**
 * Culinary partners — traiteurs, pâtisseries, restaurants, food concepts.
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

export const partners: Partner[] = [
  // Cocktails dînatoires
  { id: "vedge", name: "Vedge", category: "restaurant", services: ["cocktails-dinatoires", "pauses-cafe"] },
  { id: "jutop", name: "Ju'Top", category: "restaurant", services: ["cocktails-dinatoires", "pauses-cafe"] },
  { id: "gourmandise", name: "Gourmandise", category: "patisserie", services: ["cocktails-dinatoires", "pauses-cafe"] },

  // Pauses café (additional)
  { id: "symphonie-gourmande", name: "Symphonie Gourmande", category: "patisserie", services: ["pauses-cafe"] },
  { id: "traiteur-ben-yedder", name: "Traiteur Ben Yedder", category: "traiteur", services: ["pauses-cafe", "pauses-dejeuner"] },

  // Pauses déjeuner
  { id: "chef-amine", name: "Chef Amine", category: "traiteur", services: ["pauses-dejeuner"] },
  { id: "best-food-catering", name: "Best Food Catering", category: "traiteur", services: ["pauses-dejeuner"] },

  // Stations street-food
  { id: "king-shawarma", name: "King Shawarma", category: "street-food", services: ["stations-street-food"] },
  { id: "pizza-mizen", name: "Pizza Mizen", category: "street-food", services: ["stations-street-food"] },
  { id: "pizzagram", name: "Pizzagram", category: "street-food", services: ["stations-street-food"] },
  { id: "creperie-jouliano", name: "Crêperie Jouliano", category: "street-food", services: ["stations-street-food"] },
  { id: "le-fumoir", name: "Le Fumoir", category: "restaurant", services: ["stations-street-food"] },
  { id: "munchies", name: "Munchies", category: "street-food", services: ["stations-street-food"] },
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
