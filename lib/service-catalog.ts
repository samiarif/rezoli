/**
 * Source of truth for the 4 service catalogs.
 * All pack names, inclusions, customization options and bracket pricing
 * are extracted verbatim from the original HTML files in /Users/mac/Downloads/rezoli-v3.0/.
 */

import type { LucideIcon } from "lucide-react";
import { Coffee, UtensilsCrossed, Wine, Pizza } from "lucide-react";

export type ServiceSlug =
  | "cocktails-dinatoires"
  | "pauses-cafe"
  | "pauses-dejeuner"
  | "stations-street-food";

export type FormulaId =
  | "essentielle"
  | "business"
  | "premium"
  | "signature"
  | "personnalise";

/* ─── Shared service display metadata ─────────────────────────────── */

export type ServiceMeta = {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  highlights: string[];
  minGuests: number;
  startingPriceTND: number;
  badge?: string;
};

export const services: ServiceMeta[] = [
  {
    slug: "cocktails-dinatoires",
    name: "Cocktails dînatoires",
    shortName: "Cocktail dînatoire",
    tagline: "L'art de recevoir, version premium",
    description:
      "Des cocktails élégants pour vos lancements de produits, vernissages et soirées corporate.",
    longDescription:
      "Bouchées chaudes et froides, mignardises sucrées, sélection de boissons et service en salle. Chaque détail est calibré pour impressionner vos invités.",
    icon: Wine,
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Service de cocktail dînatoire avec bouchées élégantes",
    highlights: [
      "Bouchées chaudes et froides sur-mesure",
      "Service en salle professionnel",
      "Sélection de boissons fines",
      "Décoration de table incluse",
    ],
    minGuests: 30,
    startingPriceTND: 16,
    badge: "Signature",
  },
  {
    slug: "pauses-cafe",
    name: "Pauses café",
    shortName: "Pause café",
    tagline: "Le rituel quotidien, sublimé",
    description:
      "Réveillez vos réunions avec des pauses café gourmandes et énergisantes.",
    longDescription:
      "Café de spécialité, viennoiseries artisanales, jus frais et corbeilles de fruits. Une pause qui donne envie de reprendre le travail.",
    icon: Coffee,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Pause café professionnelle avec viennoiseries",
    highlights: [
      "Café de spécialité torréfié localement",
      "Viennoiseries artisanales du matin",
      "Jus frais pressés",
      "Service avec ou sans verrerie",
    ],
    minGuests: 15,
    startingPriceTND: 9,
  },
  {
    slug: "pauses-dejeuner",
    name: "Pauses déjeuner",
    shortName: "Pause déjeuner",
    tagline: "Bien manger, vite et bien",
    description:
      "Box repas équilibrés et buffets : déjeunez sans interrompre la productivité.",
    longDescription:
      "Lunch boxes individuelles ou service à table. Cuisine locale et internationale, options personnalisables.",
    icon: UtensilsCrossed,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Buffet de pause déjeuner pour entreprise",
    highlights: [
      "Lunch box individuelles ou service à table",
      "Entrée, plat chaud ou sandwich au choix",
      "Sélection variée de desserts maison",
      "Livraison fraîcheur garantie",
    ],
    minGuests: 10,
    startingPriceTND: 8,
  },
  {
    slug: "stations-street-food",
    name: "Stations street-food",
    shortName: "Street-food",
    tagline: "L'expérience qui marque les esprits",
    description:
      "Animations culinaires en direct : Fricassé, Shawarma, Pâtes, Pizza, Crêpes, Burgers.",
    longDescription:
      "Stations animées par nos chefs. Composez votre événement à la carte parmi 7 stations.",
    icon: Pizza,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Station street food avec chef en action",
    highlights: [
      "7 stations solo + 4 packs multi-stations",
      "Animations culinaires en direct",
      "Pâtisseries, pizzas, burgers et plus",
      "Idéal pour événements 100+ invités",
    ],
    minGuests: 100,
    startingPriceTND: 2.5,
    badge: "Nouveau",
  },
];

export const getServiceMeta = (slug: string): ServiceMeta | undefined =>
  services.find((s) => s.slug === slug);

/* ─── COCKTAILS DÎNATOIRES ────────────────────────────────────────── */

export type CocktailPack = {
  id: Exclude<FormulaId, "personnalise">;
  name: string;
  badgeLabel: string;
  boissons: string[];
  sale: string[];
  sucre: string[];
  nbSale: number;
  nbSucre: number;
  prix: [number, number, number, number, number, number]; // brackets 30/40/50/70/100/150+
};

export const COCKTAIL_PRICE_BRACKETS = [30, 40, 50, 70, 100, 150] as const;

export const cocktailPacks: CocktailPack[] = [
  {
    id: "essentielle",
    name: "Cocktail Essentielle",
    badgeLabel: "Essentielle",
    boissons: ["Eau", "Citronnade"],
    sale: ["Mini Sandwich", "Mini Pizza"],
    sucre: ["Gâteau Soirée", "Gâteau Cocktail"],
    nbSale: 3,
    nbSucre: 2,
    prix: [28.5, 23.5, 20.5, 19, 17.5, 16],
  },
  {
    id: "business",
    name: "Cocktail Business",
    badgeLabel: "Business",
    boissons: ["Eau", "Citronnade et Jus de fraise"],
    sale: ["Bouchée Froide", "Bouchée Gourmande"],
    sucre: ["Gâteau Soirée", "Macaron"],
    nbSale: 4,
    nbSucre: 3,
    prix: [39, 35, 30, 28.5, 26.5, 24.5],
  },
  {
    id: "premium",
    name: "Cocktail Premium",
    badgeLabel: "Premium",
    boissons: ["Eau", "Citronnade et Jus de fraise"],
    sale: [
      "Orient (thon & poulet)",
      "Carré Feuilleté Saumon",
      "Brochette Crevette Citron",
      "Bouquet Filet",
      "Blini Bresaola",
    ],
    sucre: ["Gâteau Soirée", "Macaron", "Verrine Citron"],
    nbSale: 5,
    nbSucre: 3,
    prix: [61, 54.5, 51, 47.5, 45, 43],
  },
  {
    id: "signature",
    name: "Cocktail Signature",
    badgeLabel: "Signature",
    boissons: ["Eau", "Citronnade, Jus de fraise & Ananas"],
    sale: [
      "Carré Feuilleté Thon ou Poulet Pané",
      "Tartelette Crevette Champignons",
      "Brochette Crevette Citron",
      "Jardinière au Saumon",
      "Black Burger",
      "Blini Bresaola",
    ],
    sucre: ["Gâteau Soirée", "Opérette & Macaron", "Verrine Tiramisu"],
    nbSale: 6,
    nbSucre: 4,
    prix: [70.5, 63, 60, 56, 53.5, 51],
  },
];

// Aggregate option lists for the "Personnalisé" modal — union of all packs' options.
export const cocktailCustomOptions = {
  boissons: [
    "Eau",
    "Citronnade",
    "Jus de fraise",
    "Jus d'ananas",
    "Café",
    "Thé",
    "Soft (canettes)",
  ],
  sale: [
    "Mini Sandwich",
    "Mini Pizza",
    "Bouchée Froide",
    "Bouchée Gourmande",
    "Orient (thon & poulet)",
    "Carré Feuilleté Saumon",
    "Carré Feuilleté Thon ou Poulet Pané",
    "Brochette Crevette Citron",
    "Bouquet Filet",
    "Blini Bresaola",
    "Tartelette Crevette Champignons",
    "Jardinière au Saumon",
    "Black Burger",
  ],
  sucre: [
    "Gâteau Soirée",
    "Gâteau Cocktail",
    "Macaron",
    "Verrine Citron",
    "Opérette & Macaron",
    "Verrine Tiramisu",
  ],
};

/* ─── PAUSES CAFÉ ─────────────────────────────────────────────────── */

type CafeBracketsSans =
  | "15-19"
  | "20-29"
  | "30-39"
  | "40-49"
  | "50+";

type CafeBracketsAvec =
  | "15-19"
  | "20-29"
  | "30-39"
  | "40-49"
  | "50-69"
  | "70-99"
  | "100-149"
  | "150-199"
  | "200-249"
  | "250+";

export type CafePack = {
  id: Exclude<FormulaId, "personnalise">;
  name: string;
  badgeLabel: string;
  boissons: string[];
  sale: string[];
  sucre: string[];
  prixSans: Record<CafeBracketsSans, number>;
  prixAvec: Record<CafeBracketsAvec, number>;
};

export const CAFE_BRACKETS_SANS: Array<{ key: CafeBracketsSans; max: number }> = [
  { key: "15-19", max: 19 },
  { key: "20-29", max: 29 },
  { key: "30-39", max: 39 },
  { key: "40-49", max: 49 },
  { key: "50+", max: Infinity },
];
export const CAFE_BRACKETS_AVEC: Array<{ key: CafeBracketsAvec; max: number }> = [
  { key: "15-19", max: 19 },
  { key: "20-29", max: 29 },
  { key: "30-39", max: 39 },
  { key: "40-49", max: 49 },
  { key: "50-69", max: 69 },
  { key: "70-99", max: 99 },
  { key: "100-149", max: 149 },
  { key: "150-199", max: 199 },
  { key: "200-249", max: 249 },
  { key: "250+", max: Infinity },
];

export const cafePacks: CafePack[] = [
  {
    id: "essentielle",
    name: "Pause Café Essentielle",
    badgeLabel: "Essentielle",
    boissons: ["Café + Lait", "1 bouteille d'eau", "1 jus (citronnade)"],
    sucre: ["2 pièces sucrées (mini viennoiseries)"],
    sale: ["2 pièces salées (mini sandwich & mini pizza)"],
    prixSans: { "15-19": 12, "20-29": 11, "30-39": 10, "40-49": 9.5, "50+": 9 },
    prixAvec: {
      "15-19": 25, "20-29": 22, "30-39": 19, "40-49": 16, "50-69": 15,
      "70-99": 14.5, "100-149": 14, "150-199": 13.5, "200-249": 13, "250+": 12.5,
    },
  },
  {
    id: "business",
    name: "Pause Café Business",
    badgeLabel: "Business",
    boissons: ["Café + Lait", "1 bouteille d'eau", "1 jus (citronnade / fraise ou orange)"],
    sucre: ["3 pièces sucrées (gâteaux soirée, mini viennoiseries, mini madeleines)"],
    sale: ["3 pièces salées (mini sandwich & mini pizza)"],
    prixSans: { "15-19": 16.5, "20-29": 15, "30-39": 14, "40-49": 13, "50+": 12.5 },
    prixAvec: {
      "15-19": 30, "20-29": 27, "30-39": 24, "40-49": 21, "50-69": 20,
      "70-99": 19, "100-149": 18, "150-199": 16.5, "200-249": 15.5, "250+": 14.5,
    },
  },
  {
    id: "premium",
    name: "Pause Café Premium",
    badgeLabel: "Premium",
    boissons: ["Café + Lait", "1 bouteille d'eau", "1 jus (citronnade / fraise ou orange)"],
    sucre: ["4 pièces sucrées (gâteaux soirée, mini viennoiseries, mini madeleines)"],
    sale: ["4 pièces salées (mini sandwich & mini pizza)"],
    prixSans: { "15-19": 20.5, "20-29": 17.5, "30-39": 16.5, "40-49": 15.5, "50+": 14.5 },
    prixAvec: {
      "15-19": 35, "20-29": 32, "30-39": 29, "40-49": 26, "50-69": 24.5,
      "70-99": 23, "100-149": 21.5, "150-199": 20, "200-249": 18.5, "250+": 17,
    },
  },
  {
    id: "signature",
    name: "Pause Café Signature",
    badgeLabel: "Signature",
    boissons: ["Café + Lait", "1 bouteille d'eau", "1 jus (citronnade / fraise ou orange)"],
    sucre: ["3 pièces sucrées (gâteau soirée & gâteau cocktail)"],
    sale: ["3 bouchées gourmandes (Orient au Thon & Tartelette Méditerranéenne)"],
    prixSans: { "15-19": 22, "20-29": 18.5, "30-39": 17.5, "40-49": 16.5, "50+": 15.5 },
    prixAvec: {
      "15-19": 38, "20-29": 35, "30-39": 32, "40-49": 29, "50-69": 27.5,
      "70-99": 26, "100-149": 24.5, "150-199": 23, "200-249": 21.5, "250+": 20,
    },
  },
];

export const cafeCustomOptions = {
  boissons: [
    "Café",
    "Lait",
    "Bouteille d'eau",
    "Jus citronnade",
    "Jus fraise",
    "Jus orange",
    "Thé",
  ],
  sale: [
    "Mini sandwich",
    "Mini pizza",
    "Mini quiche",
    "Bouchée gourmande",
    "Orient au thon",
    "Tartelette méditerranéenne",
  ],
  sucre: [
    "Mini viennoiseries",
    "Mini madeleines",
    "Gâteau soirée",
    "Gâteau cocktail",
    "Macarons",
    "Verrines sucrées",
  ],
};

/* ─── PAUSES DÉJEUNER ─────────────────────────────────────────────── */

export type DejeunerPack = {
  id: Exclude<FormulaId, "personnalise">;
  name: string;
  badgeLabel: string;
  entree: string[] | null;
  plat: string[];
  dessert: string[];
  boisson: string[] | null;
  lbPrix: [number, number, number, number]; // 4 brackets
  tblPrix: number[] | null; // only Signature has table service pricing
};

// Bracket thresholds for lunch-box pricing (4 brackets, ascending).
// Source HTML uses simple index lookup: roughly 10-19 / 20-39 / 40-69 / 70+.
export const DEJEUNER_LB_BRACKETS = [10, 20, 40, 70] as const;
export const DEJEUNER_TBL_BRACKETS = [10, 20, 30, 50, 80, 120, 200] as const;

export const dejeunerPacks: DejeunerPack[] = [
  {
    id: "essentielle",
    name: "Pause Déjeuner Essentielle",
    badgeLabel: "Essentielle",
    entree: null,
    plat: ["Sandwich (thon, jambon, poulet)"],
    dessert: ["Tarte aux fruits ou chocolat"],
    boisson: null,
    lbPrix: [10, 9, 8.5, 8],
    tblPrix: null,
  },
  {
    id: "business",
    name: "Pause Déjeuner Business",
    badgeLabel: "Business",
    entree: ["Salade variée"],
    plat: ["Sandwich (thon, jambon, poulet)"],
    dessert: ["Tarte aux fruits ou chocolat"],
    boisson: null,
    lbPrix: [12.5, 11, 10.5, 10],
    tblPrix: null,
  },
  {
    id: "premium",
    name: "Pause Déjeuner Premium",
    badgeLabel: "Premium",
    entree: [
      "Salade tunisienne",
      "Salade russe",
      "Salade de lentille",
      "Salade Mechouia",
      "Salade de riz",
    ],
    plat: [
      "Couscous poulet",
      "Nwasser poulet",
      "Riz oriental poulet amande",
      "Dwida poulet",
    ],
    dessert: ["Salade de fruit", "Gâteau"],
    boisson: ["Eau"],
    lbPrix: [24.5, 24, 23.5, 22.5],
    tblPrix: null,
  },
  {
    id: "signature",
    name: "Pause Déjeuner Signature",
    badgeLabel: "Signature",
    entree: [
      "Salade César",
      "Salade Niçoise",
      "Salade Burrata",
      "Salade de Riz",
      "Salade de pâtes",
    ],
    plat: [
      "Émincé de bœuf & riz aux légumes",
      "Couscous à l'agneau",
      "Couscous au poisson",
      "Penne Poulet Pesto",
      "Poisson Pannée & pomme de terre au four",
      "Cordon bleu & légumes sautés",
    ],
    dessert: [
      "Verrine de cheesecake",
      "Salade de fruits",
      "Gâteau au chocolat",
      "Tiramisu",
      "Mousse au Chocolat",
    ],
    boisson: ["Eau"],
    lbPrix: [37.5, 36.5, 35.5, 34.5],
    tblPrix: [83, 72.5, 65.5, 63.5, 61.5, 60, 57.5],
  },
];

export const dejeunerOptions = {
  boissons: ["Eau", "Boisson gazeuse", "Jus (250ml)"],
};

/* ─── STATIONS STREET-FOOD ────────────────────────────────────────── */

export type StreetfoodStation = {
  id: string;
  name: string;
  description: string;
  prix: [number, number]; // 2 brackets: 100-149 / 150+
  variants?: Array<{ label: string; prix: [number, number] }>; // variant-specific override pricing
  multiVariant?: boolean; // Pizza picks multiple variants; others pick 1
};

export const STREETFOOD_BRACKETS = [100, 150] as const;

export const streetfoodStations: StreetfoodStation[] = [
  {
    id: "fricasse",
    name: "Station Fricassé",
    description: "Thon Fromage",
    prix: [3, 2.5],
  },
  {
    id: "shawarma",
    name: "Station Shawarma",
    description: "Shawarma Poulet",
    prix: [6.5, 6],
  },
  {
    id: "pates",
    name: "Station Pâtes",
    description: "Au choix : Puttanesca ou Sauce blanche poulet champignons",
    prix: [11, 10],
    variants: [
      { label: "Puttanesca", prix: [11, 10] },
      { label: "Sauce blanche poulet champignons", prix: [9.5, 8.5] },
    ],
  },
  {
    id: "sandwich",
    name: "Station Sandwich",
    description: "Viande Effilochée",
    prix: [10, 9.5],
  },
  {
    id: "pizza",
    name: "Station Pizza",
    description: "Thon · 4 Fromages · Pepperoni · Pastrami · Végétarienne",
    prix: [10, 8.5],
    multiVariant: true,
    variants: [
      { label: "Thon", prix: [10, 8.5] },
      { label: "4 Fromages", prix: [13, 11.5] },
      { label: "Pepperoni", prix: [10, 8.5] },
      { label: "Pastrami", prix: [14.5, 13.5] },
      { label: "Végétarienne", prix: [10, 8.5] },
    ],
  },
  {
    id: "crepe",
    name: "Station Crêpe",
    description: "Au choix : Thon Fromage ou Nutella",
    prix: [13, 12],
    variants: [
      { label: "Thon Fromage", prix: [13, 12] },
      { label: "Nutella", prix: [13, 12] },
    ],
  },
  {
    id: "burger",
    name: "Station Burger",
    description: "Au choix : Smashed Burger Classic ou Double",
    prix: [15, 14],
    variants: [
      { label: "Smashed Burger Classic", prix: [15, 14] },
      { label: "Smashed Burger Double", prix: [23, 22] },
    ],
  },
];

export const getStation = (id: string) =>
  streetfoodStations.find((s) => s.id === id);

/**
 * Multi-station "packs" — pre-bundled combinations of 2–4 stations at a fixed
 * per-person price. Ported from the source HTML (duoStations). Prices follow
 * the same 2-bracket logic as solo stations (100-149 / 150+ guests).
 */
export type StreetfoodMultiPack = {
  id: string;
  name: string;
  items: string[];
  prix: [number, number]; // 100-149 / 150+ TND HT per person
};

export const streetfoodMultiPacks: StreetfoodMultiPack[] = [
  {
    id: "duo-gourmand",
    name: "Pack Duo Gourmand",
    items: ["Station Shawarma Poulet", "Station Pâtes Puttanesca"],
    prix: [16.5, 15],
  },
  {
    id: "multi-trio",
    name: "Pack Trio",
    items: [
      "Station Shawarma Poulet",
      "Station Fricassé Thon",
      "Station Pizza 4 Fromages",
    ],
    prix: [21, 18.5],
  },
  {
    id: "duo-creatif",
    name: "Pack Duo Créatif",
    items: ["Station Burger Munchies", "Station Crêpes Thon Fromage"],
    prix: [27, 25],
  },
  {
    id: "multi-quatuor",
    name: "Pack Quatuor",
    items: [
      "Station Shawarma Poulet",
      "Station Sandwich Effiloché de Bœuf",
      "Station Pizza Thon",
      "Station Crêpes Nutella",
    ],
    prix: [37.5, 34],
  },
];

export const getStreetfoodMultiPack = (id: string) =>
  streetfoodMultiPacks.find((p) => p.id === id);

/**
 * Multi-pack price lookup — 2 brackets matching STREETFOOD_BRACKETS.
 * 100-149 guests → prix[0]; 150+ → prix[1].
 */
export function streetfoodMultiPackPricePerPerson(
  packId: string,
  guestCount: number
): number | null {
  const pack = getStreetfoodMultiPack(packId);
  if (!pack) return null;
  return guestCount < 150 ? pack.prix[0] : pack.prix[1];
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

export function getPacksForService(slug: ServiceSlug):
  | CocktailPack[]
  | CafePack[]
  | DejeunerPack[]
  | null {
  switch (slug) {
    case "cocktails-dinatoires":
      return cocktailPacks;
    case "pauses-cafe":
      return cafePacks;
    case "pauses-dejeuner":
      return dejeunerPacks;
    case "stations-street-food":
      return null;
  }
}

export function getCocktailPack(id: string) {
  return cocktailPacks.find((p) => p.id === id);
}
export function getCafePack(id: string) {
  return cafePacks.find((p) => p.id === id);
}
export function getDejeunerPack(id: string) {
  return dejeunerPacks.find((p) => p.id === id);
}
