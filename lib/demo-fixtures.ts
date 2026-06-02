/**
 * Demo / preview fixtures.
 *
 * When `DATABASE_URL` is missing (demo mode), every server loader in the
 * app falls back to this file so the public site AND the admin dashboard
 * both render with realistic content. Once Supabase is wired up the
 * fixtures are ignored automatically (the DB-first branch wins).
 *
 * Keep this file self-contained: no imports from `@/lib/prisma`, no
 * network. It must remain safe to import in server components running
 * without env vars.
 */
import "server-only";
import {
  REZOLI_BLOG_POSTS,
  REZOLI_REALISATIONS,
} from "./content-fixtures";

/* ──────────────────────────────────────────────────────────── BLOG */

export type DemoBlogAuthor = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export type DemoBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: DemoBlogAuthor | null;
  authorId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  content: unknown;
};

export const DEMO_BLOG_POSTS: DemoBlogPost[] = REZOLI_BLOG_POSTS.map(
  (b): DemoBlogPost => ({
    id: `blog-${b.slug}`,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    coverImageUrl: null,
    tags: b.tags,
    status: "PUBLISHED",
    publishedAt: b.publishedAt,
    createdAt: b.publishedAt,
    updatedAt: b.publishedAt,
    author: null,
    authorId: null,
    seoTitle: b.seoTitle,
    seoDescription: b.seoDescription,
    content: b.content,
  })
);

/* ──────────────────────────────────────────────────── RÉALISATIONS */

export type DemoTestimonial = {
  author: string;
  role?: string | null;
  company?: string | null;
  content: string;
  rating?: number | null;
};
export type DemoOutcome = { label: string; value: string };

export type DemoRealisation = {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  clientName: string | null;
  date: Date | null;
  location: string | null;
  guestCount: number | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  gallery: string[];
  shortPitch: string;
  longContent: unknown | null;
  outcomes: DemoOutcome[] | null;
  testimonial: DemoTestimonial | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export const DEMO_REALISATIONS: DemoRealisation[] = REZOLI_REALISATIONS.map(
  (r): DemoRealisation => ({
    id: `real-${r.slug}`,
    slug: r.slug,
    title: r.title,
    eventType: r.eventType,
    clientName: r.clientName,
    date: r.date,
    location: r.location,
    guestCount: r.guestCount,
    heroImageUrl: null,
    heroImageAlt: null,
    gallery: [],
    shortPitch: r.shortPitch,
    longContent: r.longContent,
    outcomes: r.outcomes,
    testimonial: null,
    status: "PUBLISHED",
    publishedAt: r.date,
    featured: r.featured,
    order: r.order,
    createdAt: r.date,
    updatedAt: r.date,
  })
);

/* ──────────────────────────────────────────────── DEVIS / QUOTES */

type DemoQuoteStatus =
  | "PENDING"
  | "REVIEWED"
  | "QUOTE_SENT"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type DemoQuote = {
  ref: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string | null;
  eventType: string;
  eventDate: Date | null;
  guestCount: number;
  location: string;
  budgetHint: string | null;
  message: string | null;
  status: DemoQuoteStatus;
  totalTTC: number | null;
  createdAt: Date;
};

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);
const daysAhead = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);

export const DEMO_QUOTES: DemoQuote[] = [
  {
    ref: "RZL-7K3PQ",
    firstName: "Leïla",
    lastName: "Ben Romdhane",
    email: "leila.benromdhane@nextcorp.tn",
    phone: "+216 23 456 789",
    company: "NextCorp Tunisia",
    eventType: "Cocktail dînatoire",
    eventDate: daysAhead(28),
    guestCount: 120,
    location: "Tunis · Lac 2",
    budgetHint: "15 000 — 20 000 TND",
    message:
      "Bonjour, nous organisons le lancement de notre nouvelle filiale et cherchons un format élégant pour 120 invités. Merci d'avance pour votre retour.",
    status: "PENDING",
    totalTTC: 18750.5,
    createdAt: daysAgo(1),
  },
  {
    ref: "RZL-92HMN",
    firstName: "Mehdi",
    lastName: "Khelifi",
    email: "mehdi.k@cabinet-juridique.tn",
    phone: "+216 55 122 334",
    company: "Cabinet Khelifi & Associés",
    eventType: "Pause déjeuner",
    eventDate: daysAhead(7),
    guestCount: 45,
    location: "Tunis · Centre-ville",
    budgetHint: "3 000 — 5 000 TND",
    message:
      "Formation interne sur deux jours, besoin d'un format lunch-box premium les midis. Possibilité de menu végétarien ?",
    status: "REVIEWED",
    totalTTC: 4275.0,
    createdAt: daysAgo(2),
  },
  {
    ref: "RZL-PKL31",
    firstName: "Sirine",
    lastName: "Bouzid",
    email: "s.bouzid@startuplab.tn",
    phone: "+216 98 776 543",
    company: "StartupLab",
    eventType: "Pause café",
    eventDate: daysAhead(14),
    guestCount: 70,
    location: "La Marsa",
    budgetHint: null,
    message:
      "Demo Day de notre cohorte, prévoir un format pause café avec verrerie. Image très soignée svp, presse présente.",
    status: "QUOTE_SENT",
    totalTTC: 2940.0,
    createdAt: daysAgo(4),
  },
  {
    ref: "RZL-XJ8VB",
    firstName: "Walid",
    lastName: "Saadi",
    email: "walid.saadi@banquedumaghreb.tn",
    phone: "+216 71 234 567",
    company: "Banque du Maghreb",
    eventType: "Cérémonie de fin d'année",
    eventDate: daysAhead(56),
    guestCount: 280,
    location: "Hôtel Mövenpick Gammarth",
    budgetHint: "40 000 — 55 000 TND",
    message:
      "Fête de fin d'année pour 280 collaborateurs. On vise un format mixte buffet + stations avec animation.",
    status: "CONFIRMED",
    totalTTC: 48720.0,
    createdAt: daysAgo(6),
  },
  {
    ref: "RZL-2DT6X",
    firstName: "Amal",
    lastName: "Ferchichi",
    email: "amal@ferchichi-architects.tn",
    phone: "+216 22 998 877",
    company: "Ferchichi Architects",
    eventType: "Cocktail dînatoire",
    eventDate: daysAgo(10),
    guestCount: 60,
    location: "Sidi Bou Saïd",
    budgetHint: null,
    message: "Vernissage rénovation studio. Format épuré et élégant.",
    status: "COMPLETED",
    totalTTC: 7290.0,
    createdAt: daysAgo(35),
  },
  {
    ref: "RZL-9QZ4R",
    firstName: "Tarek",
    lastName: "Najar",
    email: "tarek@najar-immo.tn",
    phone: "+216 24 556 778",
    company: "Najar Immobilier",
    eventType: "Stations street-food",
    eventDate: daysAgo(20),
    guestCount: 90,
    location: "Hammamet",
    budgetHint: "8 000 TND",
    message: "Lancement d'un programme immobilier, ambiance décontractée.",
    status: "CANCELLED",
    totalTTC: 6480.0,
    createdAt: daysAgo(45),
  },
  {
    ref: "RZL-LM1PA",
    firstName: "Houda",
    lastName: "Trabelsi",
    email: "houda.t@pharmaplus.tn",
    phone: "+216 71 112 233",
    company: "Pharma Plus",
    eventType: "Pause café",
    eventDate: daysAhead(3),
    guestCount: 35,
    location: "Tunis · Berges du Lac",
    budgetHint: null,
    message: "Réunion comité de direction.",
    status: "PENDING",
    totalTTC: 1750.0,
    createdAt: daysAgo(0),
  },
];

/* ──────────────────────────────────────────────────────── MESSAGES */

export type DemoMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company?: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: Date;
};

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: "msg-1",
    name: "Inès Bouchnak",
    email: "ines.bouchnak@nextwave.tn",
    phone: "+216 27 334 556",
    subject: "Demande d'information allergènes",
    message:
      "Bonjour, l'un de nos invités est intolérant au gluten et un autre allergique aux fruits à coque. Pouvez-vous adapter votre carte cocktail ?",
    status: "NEW",
    createdAt: daysAgo(0),
  },
  {
    id: "msg-2",
    name: "Mohamed Ghariani",
    email: "mghariani@cnss.tn",
    phone: "+216 71 449 882",
    subject: "Devis pour séminaire en septembre",
    message:
      "Nous prévoyons un séminaire de 3 jours en septembre prochain pour 180 personnes. Pouvez-vous nous transmettre vos formules pause café + déjeuner ? Merci.",
    status: "NEW",
    createdAt: daysAgo(1),
  },
  {
    id: "msg-3",
    name: "Sophia Riahi",
    email: "sophia@riahi-event.tn",
    phone: null,
    subject: "Partenariat agence d'événementiel",
    message:
      "Bonjour, je dirige une agence basée à Sousse et nous serions intéressés par un partenariat sur la zone littorale Sud. Quelles sont vos conditions ?",
    status: "READ",
    createdAt: daysAgo(3),
  },
  {
    id: "msg-4",
    name: "Yacine Trabelsi",
    email: "yt@medlux.tn",
    phone: "+216 22 776 332",
    subject: "Retour positif post-événement",
    message:
      "Juste un petit mot pour vous remercier pour la prestation du 28 avril. Tout était parfait, et plusieurs invités m'ont demandé vos coordonnées. À bientôt !",
    status: "REPLIED",
    createdAt: daysAgo(8),
  },
];

/* ──────────────────────────────────────────────────────── PARTNERS */

export type DemoPartner = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  partnerType: string;
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
};

export const DEMO_PARTNERS: DemoPartner[] = [
  {
    id: "ptn-1",
    companyName: "Florist & Co",
    contactName: "Nadia Belhadj",
    email: "nadia@florist-co.tn",
    phone: "+216 23 887 665",
    partnerType: "Fleuriste",
    message:
      "Studio de fleurs basé à La Marsa, spécialisé en compositions événementielles. 6 ans d'expérience, clients corpo et mariage. Disponible pour collab sur Tunis + Banlieue Nord.",
    status: "PENDING",
    createdAt: daysAgo(2),
  },
  {
    id: "ptn-2",
    companyName: "Sonorisation Mediterranée",
    contactName: "Sami Trabelsi",
    email: "sami@sono-med.tn",
    phone: "+216 71 998 776",
    partnerType: "Sono / DJ",
    message:
      "15 ans dans la sonorisation pro. Parc complet : enceintes line array, micros HF, console numérique, éclairage. DJ également si besoin.",
    status: "PENDING",
    createdAt: daysAgo(5),
  },
  {
    id: "ptn-3",
    companyName: "Photo Studio Bardo",
    contactName: "Khaled Bouazizi",
    email: "khaled@photobardo.tn",
    phone: "+216 24 117 339",
    partnerType: "Photographe",
    message:
      "Photographe événementiel — corporate, mariage, lifestyle. Livraison sous 72h, retouche incluse.",
    status: "APPROVED",
    createdAt: daysAgo(20),
  },
];

/* ─────────────────────────────────────────── HELPER: hasDatabase */

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
