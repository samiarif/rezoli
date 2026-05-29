/**
 * Canonical editorial content — blog articles + réalisations.
 *
 * Authored from the client-provided briefs ("Blog & Réalisations"). This is a
 * PLAIN module (no `server-only`) so it can be imported by BOTH the demo
 * fixtures (`lib/demo-fixtures.ts`, used when no DATABASE_URL) AND the DB seed
 * (`prisma/seed.ts`, used when Supabase is wired up). Same pattern as
 * `lib/service-catalog.ts`.
 *
 * No `coverImageUrl` / `heroImageUrl`: the source docs ship no photography, so
 * the cards fall back to a branded placeholder. Add image URLs here (or via the
 * admin CMS) once real event photos are available.
 */

/* ─── TipTap helpers ─────────────────────────────────────────────── */

type TipTapNode = Record<string, unknown>;

export const p = (text: string): TipTapNode => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
export const h2 = (text: string): TipTapNode => ({
  type: "heading",
  attrs: { level: 2 },
  content: [{ type: "text", text }],
});
export const ul = (items: string[]): TipTapNode => ({
  type: "bulletList",
  content: items.map((t) => ({ type: "listItem", content: [p(t)] })),
});
export const doc = (content: TipTapNode[]): TipTapNode => ({
  type: "doc",
  content,
});

/* ─── Blog ───────────────────────────────────────────────────────── */

export type ContentBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: Date;
  seoTitle: string;
  seoDescription: string;
  content: TipTapNode;
};

export const REZOLI_BLOG_POSTS: ContentBlogPost[] = [
  {
    slug: "pourquoi-les-entreprises-choisissent-rezoli",
    title: "Pourquoi des entreprises choisissent Rezoli pour leurs événements ?",
    excerpt:
      "Un aperçu des raisons qui poussent des entreprises et organisateurs à nous confier la gestion complète de leur catering événementiel.",
    tags: ["Événementiel", "Catering", "Coulisses"],
    publishedAt: new Date("2026-05-20T09:00:00Z"),
    seoTitle: "Pourquoi les entreprises choisissent Rezoli pour leurs événements",
    seoDescription:
      "Réseau de partenaires sélectionnés, gestion de A à Z, formules sur-mesure : pourquoi des entreprises confient leur catering événementiel à Rezoli.",
    content: doc([
      p(
        "L’organisation d’un événement repose sur une multitude de détails, mais l’expérience culinaire reste l’un des éléments les plus visibles et les plus mémorables pour les participants. C’est souvent ce qui marque un événement… ou ce qui le fragilise."
      ),
      p(
        "Chez Rezoli, nous accompagnons des entreprises et des organisateurs d’événements dans la gestion complète de leur catering, avec un objectif simple : rendre cette partie fluide, fiable et sans charge mentale."
      ),
      p("Voici pourquoi nos partenaires nous font confiance."),
      h2("Un réseau de partenaires sélectionnés"),
      p(
        "La qualité d’un service de restauration événementielle dépend directement des partenaires qui le composent."
      ),
      p(
        "Nous travaillons avec un réseau d’enseignes et de prestataires sélectionnés pour leur régularité, leur qualité produit et leur capacité à répondre à des volumes événementiels."
      ),
      p(
        "Chaque commande repose sur des acteurs fiables, capables de maintenir un niveau constant, que ce soit pour une pause café de 50 personnes ou un événement de plusieurs centaines d’invités."
      ),
      h2("Une gestion complète de A à Z"),
      p("L’un des principaux enjeux dans l’événementiel est la coordination."),
      p(
        "Entre les commandes, les timings, la livraison et l’installation, la moindre erreur peut impacter l’expérience globale."
      ),
      p(
        "Rezoli prend en charge l’ensemble du processus : commande, préparation, coordination des fournisseurs, livraison, installation et service sur site."
      ),
      p(
        "Nos clients n’ont pas à gérer plusieurs interlocuteurs ni à synchroniser les différents prestataires. Tout est centralisé."
      ),
      h2("Des formules adaptées à chaque événement"),
      p("Tous les événements n’ont pas les mêmes besoins."),
      p(
        "Une pause café interne, un séminaire d’entreprise ou un grand événement public ne requièrent ni les mêmes volumes, ni les mêmes formats."
      ),
      p("C’est pour cela que nous proposons des formules flexibles :"),
      ul([
        "Pauses café simples",
        "Formules premium",
        "Déjeuners avec stations culinaires",
        "Dispositifs sur mesure selon le lieu et le budget",
      ]),
      p(
        "L’objectif est de garantir une expérience cohérente, quel que soit le format."
      ),
      h2("Conclusion"),
      p(
        "Choisir un partenaire de catering événementiel, c’est choisir la tranquillité d’exécution autant que la qualité des produits."
      ),
      p(
        "C’est cette combinaison que nous construisons à chaque événement : fiabilité, adaptation et coordination complète."
      ),
      p(
        "Envie de simplifier la gestion de votre prochain événement ? Notre équipe est prête à vous accompagner."
      ),
    ]),
  },
  {
    slug: "5-erreurs-pause-cafe-reussie-entreprise",
    title: "5 erreurs à éviter pour une pause café réussie en entreprise",
    excerpt:
      "Une pause café réussie repose sur des détails souvent négligés. Voici les erreurs les plus fréquentes et comment les éviter.",
    tags: ["Pauses café", "Conseils", "Organisation"],
    publishedAt: new Date("2026-05-20T09:00:00Z"),
    seoTitle: "5 erreurs à éviter pour une pause café réussie en entreprise",
    seoDescription:
      "Format, équilibre sucré-salé, présentation, anticipation, délégation : les 5 erreurs les plus fréquentes sur les pauses café en entreprise, et comment les éviter.",
    content: doc([
      p(
        "Une pause café en entreprise peut sembler simple à organiser. Pourtant, c’est souvent l’un des moments où l’expérience des participants est la plus sensible. Mauvais équilibre, mauvaise anticipation ou choix logistiques approximatifs peuvent rapidement impacter la perception globale d’un événement."
      ),
      p(
        "Voici les erreurs les plus fréquentes que nous observons sur le terrain, et comment les éviter."
      ),
      h2("1. Ne pas adapter la pause café au format de l’événement"),
      p("Tous les événements ne nécessitent pas la même approche."),
      p(
        "Une réunion interne, un séminaire ou un événement client n’impliquent ni les mêmes volumes, ni les mêmes attentes. Adapter les produits, les quantités et le format de service est essentiel pour garantir une expérience cohérente."
      ),
      p("Une pause café réussie est toujours pensée en fonction du contexte."),
      h2("2. Oublier les options salées"),
      p("Se limiter au sucré est une erreur fréquente."),
      p(
        "En milieu de matinée ou lors d’événements longs, les participants attendent un minimum d’équilibre. Proposer des options salées permet de répondre à des habitudes alimentaires variées et d’améliorer le confort global."
      ),
      p("L’équilibre sucré-salé est un standard simple mais souvent négligé."),
      h2("3. Négliger la présentation"),
      p("La qualité perçue ne dépend pas uniquement du produit."),
      p(
        "Un buffet mal organisé ou peu soigné peut dégrader l’expérience, même si les produits sont de qualité. À l’inverse, une présentation propre et structurée valorise immédiatement l’événement."
      ),
      p("La première impression joue un rôle déterminant."),
      h2("4. Commander à la dernière minute"),
      p("L’anticipation est un facteur clé de réussite."),
      p(
        "Une organisation de dernière minute limite les options disponibles et augmente les risques d’erreur. Pour garantir la qualité et la disponibilité des produits, un minimum de 48 heures est généralement nécessaire."
      ),
      p("Plus l’anticipation est bonne, plus l’expérience est fluide."),
      h2("5. Tout gérer soi-même"),
      p(
        "Coordonner livraison, installation et service demande du temps et de l’expérience."
      ),
      p(
        "Vouloir tout gérer en interne peut rapidement devenir une source de stress et d’imprévus. Déléguer cette partie permet de se concentrer sur le contenu de l’événement et les invités."
      ),
      p("L’exécution opérationnelle est souvent ce qui fait la différence."),
      h2("Conclusion"),
      p(
        "Une pause café réussie ne dépend pas uniquement des produits, mais de la manière dont elle est pensée, anticipée et exécutée."
      ),
      p(
        "En évitant ces erreurs, les entreprises améliorent directement l’expérience de leurs collaborateurs et invités."
      ),
      p("Une bonne organisation reste la clé d’un moment simple, fluide et efficace."),
    ]),
  },
];

/* ─── Réalisations ───────────────────────────────────────────────── */

export type ContentOutcome = { label: string; value: string };

export type ContentRealisation = {
  slug: string;
  title: string;
  eventType: string;
  clientName: string | null;
  date: Date;
  location: string;
  guestCount: number;
  shortPitch: string;
  outcomes: ContentOutcome[];
  longContent: TipTapNode;
  featured: boolean;
  order: number;
};

export const REZOLI_REALISATIONS: ContentRealisation[] = [
  {
    slug: "new-year-party-2026-pwc-tunisie",
    title: "New Year Party 2026 de PwC Tunisie — soirée corporate au Casino Gammarth",
    eventType: "Cocktail dînatoire & street food",
    clientName: "PwC Tunisie",
    date: new Date("2026-01-08T20:00:00Z"),
    location: "Casino Gammarth",
    guestCount: 550,
    shortPitch:
      "Une New Year Party corporate haut de gamme au Casino Gammarth pour 550 invités, combinant cocktail dînatoire et stations street food dans un univers branding PwC.",
    outcomes: [
      { label: "Invités servis", value: "550" },
      { label: "Fournisseurs coordonnés", value: "7" },
      { label: "Note client", value: "4,5/5" },
    ],
    featured: true,
    order: 1,
    longContent: doc([
      h2("Brief"),
      p(
        "Pour célébrer la nouvelle année, PwC Tunisie a organisé sa New Year Party 2026 au Casino Gammarth dans un format entièrement pensé autour de son identité de marque."
      ),
      p(
        "L’objectif était de proposer une expérience premium à 550 invités, dans un environnement à la fois festif, structuré et fidèle au branding PwC. Rezoli a assuré la coordination culinaire de l’ensemble de l’événement, en collaboration avec plusieurs prestataires, dans un dispositif mêlant cocktail dînatoire et stations street food."
      ),
      h2("Le dispositif culinaire"),
      p("L’offre gastronomique reposait sur une combinaison de mises en bouche et de stations live :"),
      ul([
        "Layouni Events pour les mises en bouche salées",
        "Gourmandise pour les créations sucrées",
        "Ju’Top pour les jus et rafraîchissements",
        "King Shawarma — station shawarma et station fricassé",
        "El Bio — station pâtes puttanesca",
        "Pizzagram — station pizzas (thon, 4 fromages et pepperoni)",
      ]),
      h2("Résultat"),
      p(
        "L’enjeu principal résidait dans la coordination simultanée de 7 fournisseurs dans un contexte VIP, avec un haut niveau d’exigence en termes de fluidité de service, de timing et de qualité d’exécution. Grâce à une équipe de 24 personnes mobilisée sur site, le service a été assuré de manière continue et maîtrisée."
      ),
      p(
        "L’événement a été particulièrement salué pour la qualité globale de l’expérience, la cohérence avec l’identité visuelle de l’entreprise et la précision de l’exécution. Les retours client positionnent cette édition comme une référence interne en matière d’événementiel corporate."
      ),
    ]),
  },
  {
    slug: "mcce-2026-cybersecurity-cloud-expo",
    title: "MCCE 2026 — restauration et pause café au salon Cybersecurity & Cloud Expo",
    eventType: "Salon B2B",
    clientName: "MCCE 2026 — Express FM & Extracom",
    date: new Date("2026-02-10T09:00:00Z"),
    location: "UTICA, Tunis",
    guestCount: 1530,
    shortPitch:
      "Un dispositif complet de restauration sur 3 jours au MCCE 2026 à l’UTICA, combinant pause café, lunch box et stations street food pour plus de 1 500 participants.",
    outcomes: [
      { label: "Participants servis", value: "1 530" },
      { label: "Fournisseurs coordonnés", value: "6" },
      { label: "Note client", value: "4,8/5" },
    ],
    featured: true,
    order: 2,
    longContent: doc([
      h2("Brief"),
      p(
        "Le Maghreb Cybersecurity & Cloud Expo 2026 (MCCE 2026) s’est tenu sur trois jours à l’UTICA, réunissant les acteurs majeurs de l’écosystème IT autour des enjeux de cybersécurité, cloud computing et souveraineté numérique."
      ),
      p(
        "Organisé par Express FM et Extracom, l’événement a adopté un format thématique par journée, chacun dédié à un secteur clé : industrie, secteur public et services. Dans ce contexte à forte affluence, Rezoli a assuré l’ensemble de la restauration et des pauses culinaires sur site."
      ),
      h2("Le dispositif culinaire"),
      p("Le dispositif mis en place combinait plusieurs formats complémentaires :"),
      ul([
        "Pause café quotidienne pour les participants et intervenants",
        "Déjeuners en lunch box pour le staff",
        "Stations street food accessibles au grand public : station pâtes et station shawarma",
      ]),
      p("L’offre culinaire s’appuyait sur plusieurs partenaires :"),
      ul([
        "Pâtisserie Ben Yedder et Gourmandise pour les pauses sucrées",
        "Ju’Top pour les boissons et jus",
        "King Shawarma pour la station shawarma et la station pâtes",
        "Chef Amine Abbes pour les lunch boxes",
        "Bhar Event pour la logistique et le matériel",
      ]),
      h2("Résultat"),
      p(
        "L’enjeu principal résidait dans la gestion simultanée de flux importants sur trois jours consécutifs, avec des pics d’affluence et une diversité de formats de service. Grâce à une présence opérationnelle continue et une équipe de 5 personnes sur site, Rezoli a assuré une coordination fluide entre les différents fournisseurs et une adaptation constante aux variations de flux."
      ),
      p(
        "L’événement a été particulièrement salué pour la qualité de la présence terrain, la réactivité de l’équipe et la capacité d’adaptation face aux demandes en temps réel. Le client souligne un très haut niveau de satisfaction sur l’ensemble de l’exécution."
      ),
    ]),
  },
  {
    slug: "15-ans-entreprise-cocktail-street-food",
    title: "15 ans d’une entreprise célébrés en soirée cocktail et street food",
    eventType: "Cocktail dînatoire & street food",
    clientName: null,
    date: new Date("2025-08-15T20:00:00Z"),
    location: "Dar Jabbes, Sidi Thabet",
    guestCount: 225,
    shortPitch:
      "Une soirée d’anniversaire d’entreprise mêlant cocktail dînatoire et 4 stations street food, servie à 225 invités dans un cadre festif à Dar Jabbes.",
    outcomes: [
      { label: "Invités servis", value: "225" },
      { label: "Fournisseurs coordonnés", value: "8" },
      { label: "Note client", value: "4,5/5" },
    ],
    featured: true,
    order: 3,
    longContent: doc([
      h2("Brief"),
      p(
        "Pour célébrer ses 15 ans d’existence, une entreprise a organisé une soirée d’anniversaire à Dar Jabbes, dans un cadre ouvert propice aux événements festifs. L’objectif était de proposer une expérience conviviale, généreuse et fluide pour 225 invités."
      ),
      p(
        "Rezoli a assuré la coordination complète de la partie culinaire en combinant un cocktail dînatoire et quatre stations street food installées sur site. L’enjeu principal résidait dans la gestion simultanée de plusieurs fournisseurs, avec des timings précis et une synchronisation parfaite des services."
      ),
      h2("Le dispositif culinaire"),
      p("Le dispositif s’articulait autour de propositions variées et complémentaires :"),
      ul([
        "Ju’Top et Gourmandise pour les rafraîchissements et douceurs",
        "Bab Bhar Events pour le matériel et l’installation",
        "King Shawarma — 225 portions de shawarma poulet",
        "Le Fumoir — 125 sandwichs et 100 burgers à la viande effilochée",
        "Crêperie Jouliano — 225 crêpes au thon",
        "Stand pizza — 225 parts (thon et 4 fromages)",
      ]),
      p(
        "L’ensemble a été pensé pour garantir une circulation fluide des invités entre les différentes stations et maintenir une qualité constante sur toute la durée de l’événement."
      ),
      h2("Résultat"),
      p(
        "Grâce à une coordination rigoureuse et une présence opérationnelle forte sur site avec une équipe de 8 personnes, le service s’est déroulé sans interruption ni friction, malgré la multiplicité des intervenants."
      ),
      p(
        "L’événement s’est conclu avec un retour client très positif, saluant la qualité de l’organisation et l’engagement de l’équipe sur le terrain."
      ),
    ]),
  },
  {
    slug: "welcome-event-2025-2026-tunis-dauphine",
    title: "Welcome Event 2025/2026 à l’Université Tunis Dauphine",
    eventType: "Stations street food",
    clientName: "Université Tunis Dauphine",
    date: new Date("2025-09-24T11:00:00Z"),
    location: "Université Tunis Dauphine",
    guestCount: 250,
    shortPitch:
      "Un welcome event festif à l’Université Tunis Dauphine avec deux stations street food servies à 250 étudiants dans une ambiance musicale et conviviale.",
    outcomes: [
      { label: "Étudiants servis", value: "250" },
      { label: "Fournisseurs coordonnés", value: "2" },
      { label: "Note client", value: "4,7/5" },
    ],
    featured: false,
    order: 4,
    longContent: doc([
      h2("Brief"),
      p(
        "Pour lancer l’année universitaire 2025/2026, l’Université Tunis Dauphine a organisé un Welcome Event destiné à accueillir les nouveaux étudiants dans une ambiance festive et conviviale."
      ),
      p(
        "Rezoli a pris en charge la partie culinaire de l’événement avec un dispositif simple, fluide et adapté à un flux important de participants. Deux stations street food ont été installées sur site pour servir 250 étudiants dans des conditions optimales."
      ),
      h2("Le dispositif culinaire"),
      p("Le menu s’articulait autour de deux propositions principales :"),
      ul([
        "King Shawarma — 250 shawarmas poulet",
        "Pizza Mizen — 250 parts de pizza au thon",
      ]),
      p(
        "L’enjeu était de proposer une expérience plus généreuse que les éditions précédentes, tout en conservant le même budget. Le dispositif a permis de doubler l’offre en variété et en volume perçu, sans complexifier la logistique sur site."
      ),
      h2("Résultat"),
      p(
        "Grâce à une coordination efficace avec les fournisseurs et une équipe opérationnelle de 4 personnes, le service s’est déroulé de manière fluide, malgré l’affluence continue des étudiants."
      ),
      p(
        "L’événement a été très bien accueilli par l’université, avec un retour client positif sur la qualité du service et l’impact global de l’animation culinaire."
      ),
    ]),
  },
];
