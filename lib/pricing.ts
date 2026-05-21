import { BUSINESS } from "./utils";

export type CartItemPricing = {
  unitPriceTND?: number | null;
  quantity: number;
};

export type CartTotals = {
  subtotalHT: number;
  hasQuoteOnly: boolean;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
};

export function computeTotals(items: CartItemPricing[]): CartTotals {
  const tvaRate = BUSINESS.tva;
  let subtotalHT = 0;
  let hasQuoteOnly = false;

  for (const item of items) {
    if (item.unitPriceTND == null) {
      hasQuoteOnly = true;
      continue;
    }
    subtotalHT += item.unitPriceTND * item.quantity;
  }

  const tvaAmount = +(subtotalHT * (tvaRate / 100)).toFixed(2);
  const totalTTC = +(subtotalHT + tvaAmount).toFixed(2);

  return {
    subtotalHT: +subtotalHT.toFixed(2),
    hasQuoteOnly,
    tvaRate,
    tvaAmount,
    totalTTC,
  };
}
