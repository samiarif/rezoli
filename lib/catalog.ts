/**
 * Non-service content: partners, testimonials, FAQ.
 * Service-specific data (packs, modal options, pricing brackets) lives in
 * `lib/service-catalog.ts`.
 */

export { services, getServiceMeta as getServiceBySlug } from "./service-catalog";
export type { ServiceSlug, ServiceMeta as Service } from "./service-catalog";

/* ─── Partners ───────────────────────────────────────────────────── */

export type Partner = {
  id: string;
  name: string;
  category: "client" | "supplier" | "venue";
};

export const partners: Partner[] = [
  { id: "p1", name: "Carthage Group", category: "client" },
  { id: "p2", name: "Tunisie Telecom", category: "client" },
  { id: "p3", name: "Banque de Tunisie", category: "client" },
  { id: "p4", name: "Université de Carthage", category: "client" },
  { id: "p5", name: "Marriott Tunis", category: "venue" },
  { id: "p6", name: "Four Seasons", category: "venue" },
  { id: "p7", name: "Mövenpick", category: "venue" },
  { id: "p8", name: "Café Bondin", category: "supplier" },
  { id: "p9", name: "Domaine Magon", category: "supplier" },
  { id: "p10", name: "Pâtisserie Hosni", category: "supplier" },
  { id: "p11", name: "Boucherie Excellence", category: "supplier" },
  { id: "p12", name: "Fleurs de Sidi Bou", category: "supplier" },
];

/* ─── Testimonials ───────────────────────────────────────────────── */

import type { ServiceSlug } from "./service-catalog";

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
