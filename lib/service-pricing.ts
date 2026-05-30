/**
 * Bracket pricing math — exact reproduction of the original HTML's getPrix() logic
 * for each service.
 */

import {
  COCKTAIL_PRICE_BRACKETS,
  CAFE_BRACKETS_SANS,
  CAFE_BRACKETS_AVEC,
  DEJEUNER_LB_BRACKETS,
  DEJEUNER_TBL_BRACKETS,
  getCocktailPack,
  getCafePack,
  getDejeunerPack,
  getStation,
  streetfoodMultiPackPricePerPerson,
  type ServiceSlug,
} from "./service-catalog";

/* ─── Cocktails ───────────────────────────────────────────────────── */

export function cocktailPricePerPerson(
  packId: string | undefined,
  nb: number
): number | null {
  if (!packId || packId === "personnalise") return null;
  const pack = getCocktailPack(packId);
  if (!pack) return null;
  let idx = 0;
  for (let i = COCKTAIL_PRICE_BRACKETS.length - 1; i >= 0; i--) {
    if (nb >= COCKTAIL_PRICE_BRACKETS[i]) {
      idx = i;
      break;
    }
  }
  return pack.prix[idx];
}

/* ─── Pauses café ─────────────────────────────────────────────────── */

export function cafePricePerPerson(
  packId: string | undefined,
  nb: number,
  withVerrerie: boolean
): number | null {
  if (!packId || packId === "personnalise") return null;
  const pack = getCafePack(packId);
  if (!pack) return null;
  const brackets = withVerrerie ? CAFE_BRACKETS_AVEC : CAFE_BRACKETS_SANS;
  const table = withVerrerie ? pack.prixAvec : pack.prixSans;
  for (const b of brackets) {
    if (nb <= b.max) return table[b.key as keyof typeof table];
  }
  return null;
}

/* ─── Pauses déjeuner ─────────────────────────────────────────────── */

function pickBracket(thresholds: readonly number[], nb: number): number {
  let idx = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (nb >= thresholds[i]) {
      idx = i;
      break;
    }
  }
  return idx;
}

export function dejeunerPricePerPerson(
  packId: string | undefined,
  nb: number,
  serviceMode: "lunch_box" | "a_table"
): number | null {
  if (!packId || packId === "personnalise") return null;
  const pack = getDejeunerPack(packId);
  if (!pack) return null;
  if (serviceMode === "a_table") {
    if (!pack.tblPrix) return null;
    return pack.tblPrix[pickBracket(DEJEUNER_TBL_BRACKETS, nb)];
  }
  return pack.lbPrix[pickBracket(DEJEUNER_LB_BRACKETS, nb)];
}

/* ─── Stations street-food ────────────────────────────────────────── */

function streetfoodBracketIndex(nb: number): 0 | 1 {
  // 2 brackets: 100-149 → idx 0, 150+ → idx 1
  return nb >= 150 ? 1 : 0;
}

export type StationSelection = {
  stationId: string;
  variant?: string;
  /** Mixable stations (Pizza, Crêpe): 1 variety, or a mix of max 2 (price = average). */
  variants?: string[];
  piecesPerPerson: number;
};

export function streetfoodLinePrice(
  selection: StationSelection,
  nb: number
): { unitPrice: number; total: number } | null {
  const station = getStation(selection.stationId);
  if (!station) return null;
  const idx = streetfoodBracketIndex(nb);

  let unit: number;
  if (selection.variants && selection.variants.length > 0 && station.variants) {
    // Mixable station (Pizza, Crêpe): price/person = average of the selected
    // variants (1 or 2). Pieces are fixed at 1/pers. for these stations.
    const variants = station.variants;
    const prices = selection.variants.map((label) => {
      const v = variants.find((x) => x.label === label);
      return v ? v.prix[idx] : station.prix[idx];
    });
    unit = +(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(3);
  } else if (selection.variant && station.variants) {
    const v = station.variants.find((x) => x.label === selection.variant);
    unit = v ? v.prix[idx] : station.prix[idx];
  } else {
    unit = station.prix[idx];
  }

  const total = unit * selection.piecesPerPerson * nb;
  return { unitPrice: unit, total };
}

export function streetfoodSubtotal(
  selections: StationSelection[],
  nb: number,
  multiPackId?: string
): {
  subtotalHT: number;
  lines: Array<{ selection: StationSelection; unitPrice: number; total: number }>;
  multiPackLine?: { unitPrice: number; total: number };
} {
  const lines = selections
    .map((s) => {
      const r = streetfoodLinePrice(s, nb);
      return r ? { selection: s, ...r } : null;
    })
    .filter(Boolean) as Array<{
    selection: StationSelection;
    unitPrice: number;
    total: number;
  }>;
  let subtotalHT = lines.reduce((sum, l) => sum + l.total, 0);

  let multiPackLine: { unitPrice: number; total: number } | undefined;
  if (multiPackId) {
    const unit = streetfoodMultiPackPricePerPerson(multiPackId, nb);
    if (unit != null) {
      multiPackLine = { unitPrice: unit, total: unit * nb };
      subtotalHT += multiPackLine.total;
    }
  }

  return { subtotalHT: +subtotalHT.toFixed(3), lines, multiPackLine };
}

/* ─── Shared totals (HT / TVA / TTC) ──────────────────────────────── */

import { BUSINESS } from "./utils";

export type TotalsFromUnitPrice = {
  unitPriceHT: number | null;
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
};

export function totalsFromUnitPrice(
  unitPriceHT: number | null,
  guestCount: number
): TotalsFromUnitPrice {
  const tvaRate = BUSINESS.tva;
  const subtotalHT =
    unitPriceHT == null ? 0 : +(unitPriceHT * guestCount).toFixed(3);
  const tvaAmount = +(subtotalHT * (tvaRate / 100)).toFixed(3);
  const totalTTC = +(subtotalHT + tvaAmount).toFixed(3);
  return { unitPriceHT, subtotalHT, tvaRate, tvaAmount, totalTTC };
}

export function totalsFromSubtotal(subtotalHT: number): {
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
} {
  const tvaRate = BUSINESS.tva;
  const tvaAmount = +(subtotalHT * (tvaRate / 100)).toFixed(3);
  const totalTTC = +(subtotalHT + tvaAmount).toFixed(3);
  return { subtotalHT, tvaRate, tvaAmount, totalTTC };
}

/* ─── Service dispatch ────────────────────────────────────────────── */

export function pricePerPersonForService(
  slug: ServiceSlug,
  packId: string | undefined,
  nb: number,
  opts: { withVerrerie?: boolean; serviceMode?: "lunch_box" | "a_table" } = {}
): number | null {
  switch (slug) {
    case "cocktails-dinatoires":
      return cocktailPricePerPerson(packId, nb);
    case "pauses-cafe":
      return cafePricePerPerson(packId, nb, !!opts.withVerrerie);
    case "pauses-dejeuner":
      return dejeunerPricePerPerson(packId, nb, opts.serviceMode ?? "lunch_box");
    case "stations-street-food":
      return null;
  }
}
