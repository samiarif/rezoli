/**
 * Event-specific pre-bundled packs.
 * Source of truth: 3 markdown spec files provided by client (Soutenance,
 * Soirée Bac, Fêtes de Fin d'Année). Prices are TOTAL HT (not per person).
 */

export type PackCategorySlug = "soutenance" | "soiree-bac" | "fetes-fin-annee";

export type PackTierId = "essentiel" | "vibe" | "business" | "premium" | "signature";

export type PackContent = {
  boissons?: string[];
  sucre?: { items: string[]; quantity?: string };
  sale?: { items: string[]; quantity?: string };
  stations?: Array<{ name: string; detail: string }>;
  bar?: string[];
  mobilier?: string[];
  materiel?: string[];
};

export type PackTier = {
  id: PackTierId;
  badge: string;
  name: string;
  description: string;
  content: PackContent;
  /**
   * Either:
   * - fixed: a flat HT price (Soutenance packs)
   * - scaled: a map keyed by guest count to HT price (Bac, Fêtes)
   */
  price:
    | { kind: "fixed"; ht: number }
    | { kind: "scaled"; table: Record<number, number> };
};

export type PackOption = {
  id: string;
  name: string;
  description?: string;
  priceHT: number;
};

export type PackCategory = {
  slug: PackCategorySlug;
  name: string;
  description: string;
  badge: string;
  tagline: string;
  /**
   * Guest-count selector configuration. Soutenance is fixed (no selector).
   */
  guestCount:
    | { kind: "fixed"; value: number; label: string } // e.g. Soutenance ~30 pers.
    | {
        kind: "stepper";
        min: number;
        max: number;
        step: number;
        default: number;
      };
  tiers: PackTier[];
  options: PackOption[];
};

/* ─── SOUTENANCE ──────────────────────────────────────────────────── */

const soutenance: PackCategory = {
  slug: "soutenance",
  name: "Packs Soutenance",
  description:
    "Formules prêtes à commander pour les soutenances universitaires. Boissons, sucré et salé adaptés au jury et aux invités.",
  badge: "Soutenance · Universités",
  tagline: "Soutenances universitaires — formules tout-en-un.",
  guestCount: { kind: "fixed", value: 30, label: "~ 30 personnes" },
  tiers: [
    {
      id: "essentiel",
      badge: "Essentiel",
      name: "Pack Soutenance Essentiel",
      description:
        "Pack soutenance simple et accessible avec assortiment sucré/salé classique.",
      content: {
        boissons: [
          "30 bouteilles d'eau 0,5 L",
          "30 bouteilles de jus 250 ml (citronnade · fraise)",
        ],
        sucre: {
          items: ["Gâteaux soirées & cocktails"],
          quantity: "75 pièces",
        },
        sale: {
          items: ["Mini sandwichs & mini pizzas"],
          quantity: "75 pièces",
        },
      },
      price: { kind: "fixed", ht: 370 },
    },
    {
      id: "vibe",
      badge: "Vibe",
      name: "Pack Soutenance Vibe",
      description:
        "Pack moderne et premium avec assortiment raffiné de bouchées et pâtisseries.",
      content: {
        boissons: [
          "30 bouteilles d'eau 0,5 L",
          "30 bouteilles de jus 250 ml (citronnade · citronnade menthe · fraise)",
        ],
        sucre: { items: ["Macarons & gâteaux salon"], quantity: "75 pièces" },
        sale: { items: ["Bouchées gourmandes"], quantity: "75 pièces" },
      },
      price: { kind: "fixed", ht: 450 },
    },
    {
      id: "premium",
      badge: "Premium",
      name: "Pack Soutenance Premium",
      description:
        "Pack haut de gamme avec pâtisserie fine et bouchées élégantes.",
      content: {
        boissons: [
          "30 bouteilles d'eau 0,5 L",
          "30 bouteilles de jus 250 ml (citronnade · fraise · ananas)",
        ],
        sucre: {
          items: ["Perle Pistache Framboise", "Calisson Amande"],
          quantity: "60 pièces",
        },
        sale: { items: ["Bouchées froides"], quantity: "75 pièces" },
      },
      price: { kind: "fixed", ht: 550 },
    },
    {
      id: "signature",
      badge: "Signature",
      name: "Pack Soutenance Signature",
      description:
        "Pack signature Rezoli avec sélection premium complète pour soutenance haut de gamme.",
      content: {
        boissons: [
          "45 bouteilles d'eau 0,5 L",
          "45 bouteilles de jus 250 ml (fraise · ananas · kiwi banane)",
        ],
        sucre: {
          items: ["Chocolat Cœur Chocoframboise", "Chocolat Bourgeois"],
          quantity: "90 pièces",
        },
        sale: {
          items: ["Bouchées gourmandes & bouchées froides"],
          quantity: "100 pièces",
        },
      },
      price: { kind: "fixed", ht: 710 },
    },
  ],
  options: [
    {
      id: "service-materiel",
      name: "Service & Matériel",
      description: "Serveur · Plateaux de service",
      priceHT: 150,
    },
    {
      id: "coffrets",
      name: "Coffrets Jury",
      description: "4 coffrets gourmands · 10 pièces par coffret",
      priceHT: 120,
    },
    {
      id: "bouquets",
      name: "Bouquets Jury",
      description: "4 bouquets jury",
      priceHT: 120,
    },
  ],
};

/* ─── SOIRÉE BAC ──────────────────────────────────────────────────── */

const BAC_STEPS = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

const bacEssentielPrices: Record<number, number> = {
  80: 2300, 90: 2700, 100: 2800, 110: 3250, 120: 3400, 130: 3750, 140: 3900,
  150: 4100, 160: 4250, 170: 4550, 180: 4700, 190: 4950, 200: 5050,
};
const bacVibePrices: Record<number, number> = {
  80: 4300, 90: 4800, 100: 5100, 110: 5900, 120: 6300, 130: 6700, 140: 7100,
  150: 7500, 160: 7900, 170: 8300, 180: 8700, 190: 9200, 200: 9500,
};
const bacPremiumPrices: Record<number, number> = {
  80: 6200, 90: 6900, 100: 7500, 110: 8400, 120: 8900, 130: 9500, 140: 10100,
  150: 10700, 160: 11300, 170: 12200, 180: 12700, 190: 13400, 200: 13900,
};
const bacSignaturePrices: Record<number, number> = {
  80: 8650, 90: 9500, 100: 10200, 110: 11500, 120: 12300, 130: 13350, 140: 14200,
  150: 15000, 160: 16100, 170: 17200, 180: 18000, 190: 19000, 200: 19700,
};

const soireeBac: PackCategory = {
  slug: "soiree-bac",
  name: "Packs Soirée Bac",
  description:
    "Soirées du bac clés-en-main : boissons, salé, sucré, mobilier et service inclus, ajustés au nombre d'invités.",
  badge: "Soirée Bac · Lycées",
  tagline: "Pour faire vibrer la promo, en toute tranquillité.",
  guestCount: {
    kind: "stepper",
    min: 80,
    max: 200,
    step: 10,
    default: 100,
  },
  tiers: [
    {
      id: "essentiel",
      badge: "Essentiel",
      name: "Pack Soirée Bac Essentiel",
      description:
        "Pack d'entrée de gamme idéal pour une soirée bac simple et élégante avec boissons, salé, sucré et service inclus.",
      content: {
        boissons: ["Eau", "Jus citronnade", "Jus fraise", "Boissons gazeuses"],
        sale: {
          items: [
            "Mini sandwich",
            "Mini pizza",
            "Bouchées gourmandes",
            "Bouchées froides",
          ],
          quantity: "5 pièces / pers.",
        },
        sucre: {
          items: ["Gâteaux cocktail"],
          quantity: "2 pièces / pers.",
        },
        materiel: [
          "Verrerie",
          "Plateaux dressage & débarrassage",
          "Tables buffet (3 m)",
          "Gobelets",
          "Glaçons",
          "Serveur",
          "Livraison",
        ],
      },
      price: { kind: "scaled", table: bacEssentielPrices },
    },
    {
      id: "vibe",
      badge: "Vibe",
      name: "Pack Soirée Bac Vibe",
      description:
        "Pack soirée bac premium avec mobilier lounge, assortiment salé/sucré enrichi et expérience plus immersive.",
      content: {
        boissons: [
          "Eau",
          "Jus citronnade",
          "Jus fraise",
          "Jus ananas",
          "Boissons gazeuses",
        ],
        sale: {
          items: [
            "Mini sandwich",
            "Bouchées gourmandes",
            "Bouchées froides",
            "L'Orient thon",
            "Carré feuilleté saumon",
          ],
          quantity: "6 pièces / pers.",
        },
        sucre: {
          items: [
            "Gâteaux cocktail",
            "Mini-éclair caramel",
            "Mini-éclair framboise",
          ],
          quantity: "3 pièces / pers.",
        },
        mobilier: [
          "Chaises blanches",
          "Chaises hautes",
          "Poufs",
          "Canapés",
          "Tables basses",
          "Tables hautes",
        ],
        materiel: [
          "Verrerie",
          "Plateaux dressage & débarrassage",
          "Tables buffet (3 m)",
          "Gobelets",
          "Glaçons",
          "Serveur",
          "Livraison",
        ],
      },
      price: { kind: "scaled", table: bacVibePrices },
    },
    {
      id: "premium",
      badge: "Premium",
      name: "Pack Soirée Bac Premium",
      description:
        "Pack haut de gamme avec stations chaudes, sélection premium salée/sucrée et mobilier lounge complet.",
      content: {
        boissons: [
          "Eau",
          "Jus citronnade",
          "Jus fraise",
          "Jus ananas",
          "Boissons gazeuses",
        ],
        stations: [
          { name: "Station Shawarma", detail: "Shawarma poulet" },
          { name: "Station Fricassé", detail: "Fricassé thon" },
        ],
        sale: {
          items: [
            "Mini sandwich",
            "Mini pizza",
            "Bouchées gourmandes",
            "Bouchées froides",
            "Brochette crevette citron",
            "Bouquet filet",
          ],
          quantity: "6 pièces / pers.",
        },
        sucre: {
          items: ["Macaron", "Gâteaux cocktail", "Opérette"],
          quantity: "3 pièces / pers.",
        },
        mobilier: [
          "Chaises blanches",
          "Chaises hautes",
          "Poufs",
          "Canapés",
          "Tables basses",
          "Tables hautes",
        ],
        materiel: [
          "Verrerie",
          "Plateaux dressage & débarrassage",
          "Tables buffet (3 m)",
          "Gobelets",
          "Glaçons",
          "Serveur",
          "Livraison",
        ],
      },
      price: { kind: "scaled", table: bacPremiumPrices },
    },
    {
      id: "signature",
      badge: "Signature",
      name: "Pack Soirée Bac Signature",
      description:
        "Pack signature ultra premium avec bar scénographié, boissons enrichies, stations, mobilier lounge et expérience complète.",
      content: {
        boissons: [
          "Eau",
          "Jus citronnade",
          "Jus fraise",
          "Jus ananas",
          "Boissons gazeuses",
          "Energy drinks",
          "Eau gazéifiée",
          "Sirops (3 choix)",
        ],
        stations: [
          { name: "Station Shawarma", detail: "Shawarma poulet" },
          { name: "Station Pizza", detail: "Pizza thon" },
        ],
        sale: {
          items: [
            "Mini sandwich",
            "Mini pizza",
            "Bouchées gourmandes",
            "Bouchées froides",
            "Carré feuilleté saumon",
            "Brochette crevette citron",
            "Bouquet filet",
          ],
          quantity: "7 pièces / pers.",
        },
        sucre: {
          items: [
            "Macaron",
            "Gâteaux cocktail",
            "Chocolat cœur chocoframboise",
            "Mini-éclair caramel",
            "Mini-éclair framboise",
          ],
          quantity: "5 pièces / pers.",
        },
        bar: [
          "Bar arabesque + lumière",
          "Table arrière bar",
          "Bacs à glace",
          "Vasque",
          "Seaux à glace",
        ],
        mobilier: [
          "Chaises blanches",
          "Chaises hautes",
          "Poufs",
          "Canapés",
          "Tables basses",
          "Tables hautes",
        ],
        materiel: [
          "Verrerie",
          "Plateaux dressage & débarrassage",
          "Tables buffet (3 m)",
          "Gobelets",
          "Glaçons",
          "Serveur",
          "Livraison",
        ],
      },
      price: { kind: "scaled", table: bacSignaturePrices },
    },
  ],
  options: [
    { id: "dj", name: "DJ", priceHT: 900 },
    { id: "securite", name: "Sécurité (2 agents)", priceHT: 250 },
    { id: "piste-danse", name: "Piste de danse", priceHT: 300 },
    {
      id: "guirlande-3x3",
      name: "Structure guirlande 3 m × 3 m",
      priceHT: 300,
    },
    {
      id: "guirlande-5x3",
      name: "Structure guirlande 5 m × 3 m",
      priceHT: 350,
    },
    {
      id: "guirlande-5x5",
      name: "Structure guirlande 5 m × 5 m",
      priceHT: 400,
    },
    { id: "lumiere-beam", name: "Lumière Beam (1)", priceHT: 200 },
    { id: "lumiere-led", name: "Lumière LED (1)", priceHT: 40 },
    { id: "livraison-hors-tunis", name: "Livraison hors Tunis", priceHT: 300 },
  ],
};

/* ─── FÊTES DE FIN D'ANNÉE (Cérémonies) ───────────────────────────── */

const FETES_STEPS = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

const fetesEssentielPrices: Record<number, number> = {
  100: 1800, 110: 1970, 120: 2120, 130: 2290, 140: 2430, 150: 2540, 160: 2680,
  170: 2920, 180: 3060, 190: 3230, 200: 3310,
};
const fetesBusinessPrices: Record<number, number> = {
  100: 2460, 110: 2680, 120: 2790, 130: 3060, 140: 3180, 150: 3320, 160: 3440,
  170: 3620, 180: 3730, 190: 3940, 200: 3990,
};
const fetesPremiumPrices: Record<number, number> = {
  100: 3600, 110: 3770, 120: 3930, 130: 4220, 140: 4380, 150: 4560, 160: 4700,
  170: 5030, 180: 5160, 190: 5350, 200: 5490,
};
const fetesSignaturePrices: Record<number, number> = {
  100: 4240, 110: 4460, 120: 4660, 130: 5020, 140: 5210, 150: 5430, 160: 5480,
  170: 5850, 180: 6050, 190: 6250, 200: 6450,
};

const fetesFinAnnee: PackCategory = {
  slug: "fetes-fin-annee",
  name: "Packs Fêtes de Fin d'Année",
  description:
    "Cérémonies de fin d'année universités & écoles : cocktail, stations, mobilier et service complets, dimensionnés à votre promotion.",
  badge: "Cérémonies · Universités",
  tagline: "Universités & écoles — fêtes de fin d'année.",
  guestCount: {
    kind: "stepper",
    min: 100,
    max: 200,
    step: 10,
    default: 100,
  },
  tiers: [
    {
      id: "essentiel",
      badge: "Essentiel",
      name: "Pack Fêtes de Fin d'Année Essentiel",
      description: "Cocktail élégant avec assortiment salé/sucré équilibré.",
      content: {
        boissons: ["Eau", "Jus (citronnade & fraise)"],
        sale: {
          items: ["Bouchées gourmandes", "Bouchées froides"],
          quantity: "1 pièce/pers. de chaque",
        },
        sucre: {
          items: ["Gâteaux soirée", "Gâteaux cocktail"],
          quantity: "1 pièce/pers. de chaque",
        },
      },
      price: { kind: "scaled", table: fetesEssentielPrices },
    },
    {
      id: "business",
      badge: "Business",
      name: "Pack Fêtes de Fin d'Année Business",
      description:
        "Cocktail enrichi avec une station street food et bouchées variées.",
      content: {
        boissons: ["Eau", "Jus (citronnade & fraise)"],
        stations: [{ name: "Station Shawarma", detail: "Shawarma poulet" }],
        sale: {
          items: ["Bouchées gourmandes", "Bouchées froides"],
          quantity: "1 pièce/pers. de chaque",
        },
        sucre: {
          items: ["Macarons", "Gâteaux cocktail"],
          quantity: "1 pièce/pers. de chaque",
        },
      },
      price: { kind: "scaled", table: fetesBusinessPrices },
    },
    {
      id: "premium",
      badge: "Premium",
      name: "Pack Fêtes de Fin d'Année Premium",
      description:
        "Deux stations street food et une sélection premium salée/sucrée.",
      content: {
        boissons: ["Eau", "Jus (citronnade, fraise & ananas)"],
        stations: [
          { name: "Station Shawarma", detail: "Shawarma poulet" },
          { name: "Station Pizza", detail: "Pizza tranche thon" },
        ],
        sale: {
          items: ["L'Orient Thon", "Carré Feuilleté Saumon"],
          quantity: "1 pièce/pers. de chaque",
        },
        sucre: {
          items: ["Perle Pistache Framboise", "Chocolat Bourgeois"],
          quantity: "1 pièce/pers. de chaque",
        },
      },
      price: { kind: "scaled", table: fetesPremiumPrices },
    },
    {
      id: "signature",
      badge: "Signature",
      name: "Pack Fêtes de Fin d'Année Signature",
      description:
        "Stations chefs, bouchées de haute couture et pâtisserie signature.",
      content: {
        boissons: ["Eau", "Jus (citronnade, fraise & ananas)"],
        stations: [
          { name: "Station Shawarma", detail: "Shawarma poulet" },
          { name: "Station Pâtes", detail: "Pâtes puttanesca" },
        ],
        sale: {
          items: ["Brochette Crevette Citron", "Bouquet Filet"],
          quantity: "1 pièce/pers. de chaque",
        },
        sucre: {
          items: ["Chocolat Cœur Chocoframboise", "Calisson Amande"],
          quantity: "1 pièce/pers. de chaque",
        },
      },
      price: { kind: "scaled", table: fetesSignaturePrices },
    },
  ],
  options: [
    { id: "livraison-hors-tunis", name: "Livraison hors Tunis", priceHT: 300 },
  ],
};

/* ─── Public API ──────────────────────────────────────────────────── */

export const eventPackCategories: PackCategory[] = [
  soireeBac,
  fetesFinAnnee,
  soutenance,
];

export const getPackCategory = (slug: string): PackCategory | undefined =>
  eventPackCategories.find((c) => c.slug === slug);

export const getPackTier = (
  categorySlug: string,
  tierId: string
): { category: PackCategory; tier: PackTier } | undefined => {
  const category = getPackCategory(categorySlug);
  if (!category) return undefined;
  const tier = category.tiers.find((t) => t.id === tierId);
  if (!tier) return undefined;
  return { category, tier };
};

export function priceForTier(tier: PackTier, guestCount: number): number {
  if (tier.price.kind === "fixed") return tier.price.ht;
  // scaled — use exact match if present, else nearest lower value
  const t = tier.price.table;
  if (t[guestCount] != null) return t[guestCount];
  const keys = Object.keys(t)
    .map(Number)
    .sort((a, b) => a - b);
  let result = t[keys[0]];
  for (const k of keys) {
    if (k <= guestCount) result = t[k];
    else break;
  }
  return result;
}

export { BAC_STEPS, FETES_STEPS };
