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

/** Helper: TipTap JSON paragraph */
const p = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
const h2 = (text: string) => ({
  type: "heading",
  attrs: { level: 2 },
  content: [{ type: "text", text }],
});
const ul = (items: string[]) => ({
  type: "bulletList",
  content: items.map((t) => ({
    type: "listItem",
    content: [p(t)],
  })),
});

const yasmine: DemoBlogAuthor = {
  firstName: "Yasmine",
  lastName: "Trabelsi",
  email: "yasmine@rezoli.tn",
};
const omar: DemoBlogAuthor = {
  firstName: "Omar",
  lastName: "Ben Salah",
  email: "omar@rezoli.tn",
};

export const DEMO_BLOG_POSTS: DemoBlogPost[] = [
  {
    id: "demo-blog-1",
    slug: "5-idees-pauses-cafe-reunions",
    title: "5 idées de pauses café qui dynamisent vos réunions",
    excerpt:
      "Sortez du combo croissant-café tiède. Voici cinq formats de pauses pensés pour relancer l'attention de vos équipes en pleine session.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1600&q=80",
    tags: ["Pauses café", "Inspiration", "Productivité"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-05-02T09:30:00Z"),
    createdAt: new Date("2026-04-28T14:00:00Z"),
    updatedAt: new Date("2026-05-02T09:30:00Z"),
    author: yasmine,
    authorId: "demo-author-1",
    seoTitle: "5 idées de pauses café pour vos réunions — Rezoli",
    seoDescription:
      "Cinq formats de pauses café premium pour redonner de l'énergie à vos sessions d'entreprise.",
    content: {
      type: "doc",
      content: [
        p(
          "Une pause café réussie, c'est trois minutes pour souffler, dix minutes pour reconnecter avec ses collègues, et un goût qui reste en tête jusqu'à la fin de la journée. Voici cinq formats que nous recommandons à nos clients pour casser la routine du gobelet en carton."
        ),
        h2("1. La pause « réveil épicé »"),
        p(
          "Un café fort de spécialité, un thé vert à la menthe servi sur plateau, et trois bouchées salées — feuilleté harissa, mini pizza halloumi, mini quiche thon-câpres. Énergisant sans être lourd."
        ),
        h2("2. La pause healthy"),
        p(
          "Shots de gingembre frais, jus pressés, fruits coupés en cuillère individuelle, granolas maison. Parfaite pour les sessions de l'après-midi quand les paupières pèsent."
        ),
        ul([
          "Bowl de fruits de saison",
          "Granola croquant + yaourt grec",
          "Eau infusée concombre / basilic",
          "Mini muffins son d'avoine et myrtille",
        ]),
        h2("3. La pause tunisoise"),
        p(
          "On joue local : thé à la menthe versé de haut, mlaoui chaud, makroud miel, dates Deglet Nour, et un espresso intense pour ceux qui en redemandent. Souvenir mémorable garanti pour vos invités étrangers."
        ),
        h2("4. La pause sucrée signature"),
        p(
          "Cafés et chocolats chauds, viennoiseries pur beurre, financiers, cookies tièdes. Le combo confort qu'on adore servir en fin d'événement de lancement produit."
        ),
        h2("5. La pause cocktail sans alcool"),
        p(
          "Vers 17h, après une longue journée, un mocktail détox-citron, des bouchées salées, et une boisson chaude pour ceux qui finissent encore en réunion. Élégant et structurant pour la fin de journée."
        ),
        p(
          "Envie d'un format sur-mesure ? Nos équipes adaptent les pauses à votre charte de marque et au timing de votre événement."
        ),
      ],
    },
  },
  {
    id: "demo-blog-2",
    slug: "cocktail-dinatoire-vs-buffet",
    title: "Cocktail dînatoire vs buffet : comment choisir pour votre événement",
    excerpt:
      "Format debout ou assis, durée, budget, image de marque… Le bon choix dépend de trois questions que nous posons à chaque client.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80",
    tags: ["Cocktails", "Conseils", "Événementiel"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-04-22T11:00:00Z"),
    createdAt: new Date("2026-04-19T09:00:00Z"),
    updatedAt: new Date("2026-04-22T11:00:00Z"),
    author: omar,
    authorId: "demo-author-2",
    seoTitle: "Cocktail dînatoire ou buffet : comment choisir ?",
    seoDescription:
      "Notre méthode en trois questions pour décider entre un format cocktail debout et un buffet assis pour votre événement.",
    content: {
      type: "doc",
      content: [
        p(
          "C'est la première question qu'on nous pose après « combien d'invités ? ». Et la réponse n'est jamais la même — elle dépend de l'expérience que vous voulez offrir et de la dynamique que vous cherchez."
        ),
        h2("Question 1 — Quelle est la durée de l'événement ?"),
        p(
          "Sous 2h, le cocktail dînatoire gagne presque toujours : il maintient l'énergie, permet le networking, et évite l'effet « repas qui s'éternise ». Au-delà de 3h, le buffet ou le service à table créent un point d'ancrage qui structure la soirée."
        ),
        h2("Question 2 — Quelle image souhaitez-vous projeter ?"),
        p(
          "Le cocktail dînatoire signale modernité, fluidité, dynamisme — parfait pour lancement produit, networking pro, vernissage. Le buffet ou le service signalent générosité, prise en charge, marque qui « reçoit » ses invités — adapté pour fêtes de fin d'année, événements clients VIP."
        ),
        h2("Question 3 — Quel est le profil de vos invités ?"),
        p(
          "Avec des invités qui se connaissent peu, le cocktail force les interactions. Avec un groupe soudé, le buffet ou la table permettent d'approfondir les échanges. Et n'oubliez pas la dimension senior : passé un certain seuil, les invités préfèrent généralement s'asseoir."
        ),
        h2("Notre recommandation"),
        ul([
          "0-80 invités, lancement produit : cocktail dînatoire (compter 12-15 pièces par invité)",
          "80-150, événement client : buffet semi-assis avec mange-debout",
          "150+, fête fin d'année : buffet en îlots de 30-40 invités, espaces lounge",
          "Évènement VIP < 30 : service à table en trois services",
        ]),
        p(
          "Dans tous les cas, on commence par une heure de réunion ensemble pour cadrer le format avant de proposer un devis. Pas de menu sur catalogue — chaque événement a son tempo."
        ),
      ],
    },
  },
  {
    id: "demo-blog-3",
    slug: "coulisses-lancement-marque",
    title: "Pourquoi le sur-mesure change tout — coulisses d'un lancement de marque",
    excerpt:
      "Trois semaines de préparation, deux dégustations, une logistique millimétrée. Récit d'un événement où chaque détail comptait.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80",
    tags: ["Coulisses", "Sur-mesure", "Lancement"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-04-08T10:00:00Z"),
    createdAt: new Date("2026-04-05T08:00:00Z"),
    updatedAt: new Date("2026-04-08T10:00:00Z"),
    author: yasmine,
    authorId: "demo-author-1",
    seoTitle: "Coulisses d'un lancement de marque sur-mesure",
    seoDescription:
      "Comment notre équipe a conçu un cocktail dînatoire 100 % sur-mesure pour un lancement produit à Tunis.",
    content: {
      type: "doc",
      content: [
        p(
          "Quand Carthage Group nous a contactés pour le lancement de sa nouvelle ligne premium, le cahier des charges tenait en une phrase : « on veut que les invités en parlent encore dans trois mois »."
        ),
        h2("Semaine -3 : cadrage et dégustation"),
        p(
          "Première réunion avec l'équipe marketing pour aligner ton, palette de couleurs, contraintes diététiques. Notre chef Walid propose un menu d'une dizaine de bouchées inspirées des trois régions phares de la marque. Première dégustation à J-15 : trois pièces sont validées, deux sont refaites, une est abandonnée."
        ),
        h2("Semaine -1 : répétition logistique"),
        p(
          "Visite du lieu, mesure du flux invités, validation des points de service. On commande la verrerie sur-mesure (verres siglés), on aligne la brigade — un chef pour 30 invités sur ce format. Briefing serveurs avec speech d'accueil intégré, parce que l'expérience commence à la porte."
        ),
        h2("Le jour J"),
        ul([
          "16h : arrivée sur site, dressage des îlots",
          "17h30 : mise en place finale, dégustation contrôle",
          "18h00 : ouverture, accueil au verre de bienvenue siglé",
          "21h30 : fin de service, démontage en 90 minutes",
        ]),
        h2("Le résultat"),
        p(
          "350 invités servis. Trois articles dans la presse économique. Et surtout, un client qui nous rappelle six semaines plus tard pour son séminaire annuel. C'est ça, le vrai indicateur de succès."
        ),
      ],
    },
  },
];

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

export const DEMO_REALISATIONS: DemoRealisation[] = [
  {
    id: "demo-real-1",
    slug: "lancement-carthage-group",
    title: "Lancement de la collection Carthage Premium",
    eventType: "Cocktail dînatoire",
    clientName: "Carthage Group",
    date: new Date("2026-03-14T18:00:00Z"),
    location: "Villa des Arts, Sidi Bou Saïd",
    guestCount: 350,
    heroImageUrl:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1600&q=80",
    heroImageAlt: "Cocktail dînatoire à la villa des Arts",
    gallery: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=80",
    ],
    shortPitch:
      "Un cocktail dînatoire ultra-personnalisé pour le lancement de la nouvelle ligne premium de Carthage Group. Trois semaines de préparation, dix bouchées signature, 350 invités émerveillés.",
    longContent: {
      type: "doc",
      content: [
        h2("Brief"),
        p(
          "Carthage Group nous a confié l'animation gastronomique du lancement de sa collection Premium. Objectif : marquer les invités, faire parler la presse, refléter l'ADN haut-de-gamme de la marque."
        ),
        h2("Notre proposition"),
        p(
          "Dix bouchées sur-mesure inspirées de trois régions tunisoises emblématiques. Verrerie siglée, mange-debout en bois clair, brigade de 12 personnes en tenue brand. Un parcours de dégustation pensé comme un voyage."
        ),
        ul([
          "10 bouchées signature dont 3 créées spécialement",
          "Brigade de 12 personnes (chef + 2 sous-chefs + 9 serveurs)",
          "Verrerie et vaisselle siglées",
          "Mange-debout bois et îlots cuivre",
        ]),
        h2("Résultat"),
        p(
          "Une presse économique conquise (3 articles), une équipe client ravie, et — six semaines plus tard — la signature du contrat séminaire annuel. Le sur-mesure paie."
        ),
      ],
    },
    outcomes: [
      { label: "Invités servis", value: "350" },
      { label: "Articles presse", value: "3" },
      { label: "Note client", value: "4.9/5" },
    ],
    testimonial: {
      author: "Yasmine Trabelsi",
      role: "Directrice Marketing",
      company: "Carthage Group",
      content:
        "Service impeccable, bouchées créatives, équipe ultra-pro. Nos invités en parlent encore six semaines après. On a déjà signé pour notre séminaire annuel.",
      rating: 5,
    },
    status: "PUBLISHED",
    publishedAt: new Date("2026-03-25T10:00:00Z"),
    featured: true,
    order: 1,
    createdAt: new Date("2026-03-20T10:00:00Z"),
    updatedAt: new Date("2026-03-25T10:00:00Z"),
  },
  {
    id: "demo-real-2",
    slug: "fete-fin-annee-banque-mediterranee",
    title: "Cérémonie de fin d'année Banque Méditerranée",
    eventType: "Cérémonie de fin d'année",
    clientName: "Banque Méditerranée",
    date: new Date("2025-12-18T19:00:00Z"),
    location: "Hôtel Laico Tunis",
    guestCount: 220,
    heroImageUrl:
      "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1600&q=80",
    heroImageAlt: "Cérémonie de fin d'année au Laico Tunis",
    gallery: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1530021232320-687d8e3dba54?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80",
    ],
    shortPitch:
      "Soirée de fin d'année pour 220 collaborateurs avec stations gourmandes, bar à mocktails et discours scénographié. Une logistique millimétrée pour une atmosphère chaleureuse.",
    longContent: null,
    outcomes: [
      { label: "Collaborateurs", value: "220" },
      { label: "Stations", value: "6" },
      { label: "Satisfaction", value: "97%" },
    ],
    testimonial: {
      author: "Karim Mansour",
      role: "RH Director",
      company: "Banque Méditerranée",
      content:
        "Une équipe qui anticipe tout. La soirée a tourné comme une horloge et nos équipes en parlent encore.",
      rating: 5,
    },
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-10T10:00:00Z"),
    featured: true,
    order: 2,
    createdAt: new Date("2026-01-08T10:00:00Z"),
    updatedAt: new Date("2026-01-10T10:00:00Z"),
  },
  {
    id: "demo-real-3",
    slug: "soutenance-polytechnique-tunis",
    title: "Soutenance de fin d'études — Polytechnique Tunis",
    eventType: "Soutenance",
    clientName: "École Polytechnique de Tunis",
    date: new Date("2026-02-04T14:00:00Z"),
    location: "Campus de La Marsa",
    guestCount: 90,
    heroImageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80",
    heroImageAlt: "Cocktail post-soutenance",
    gallery: [
      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80",
    ],
    shortPitch:
      "Cocktail honorifique pour 90 invités à l'issue de la soutenance d'une promotion d'ingénieurs. Format élégant, sobre, à la hauteur du moment.",
    longContent: null,
    outcomes: [
      { label: "Diplômés célébrés", value: "32" },
      { label: "Invités", value: "90" },
    ],
    testimonial: null,
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-08T10:00:00Z"),
    featured: false,
    order: 3,
    createdAt: new Date("2026-02-06T10:00:00Z"),
    updatedAt: new Date("2026-02-08T10:00:00Z"),
  },
  {
    id: "demo-real-4",
    slug: "soiree-bac-lycee-pierre-mendes",
    title: "Soirée Bac Lycée Pierre-Mendès-France",
    eventType: "Soirée Bac",
    clientName: "Lycée Pierre-Mendès-France",
    date: new Date("2025-07-12T20:00:00Z"),
    location: "Plage Sidi Bou Saïd",
    guestCount: 140,
    heroImageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",
    heroImageAlt: "Soirée Bac sur la plage",
    gallery: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    ],
    shortPitch:
      "Une soirée plage pour 140 bacheliers avec stations street-food, bar à mocktails et DJ. L'événement de l'été 2025.",
    longContent: null,
    outcomes: [
      { label: "Bacheliers", value: "140" },
      { label: "Stations", value: "5" },
    ],
    testimonial: {
      author: "Sirine Belkhiria",
      role: "Présidente BDE",
      company: "Lycée Pierre-Mendès-France",
      content:
        "Tout le monde a parlé de cette soirée pendant des semaines. Merci pour la flexibilité — vous avez géré comme des pros.",
      rating: 5,
    },
    status: "PUBLISHED",
    publishedAt: new Date("2025-07-20T10:00:00Z"),
    featured: false,
    order: 4,
    createdAt: new Date("2025-07-18T10:00:00Z"),
    updatedAt: new Date("2025-07-20T10:00:00Z"),
  },
];

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
