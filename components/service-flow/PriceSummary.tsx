"use client";

import { formatTND } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function PriceSummary({
  subtotalHT,
  tvaRate,
  tvaAmount,
  totalTTC,
  unitPriceHT,
  note,
}: {
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  unitPriceHT?: number | null;
  note?: string;
}) {
  return (
    <div className="rounded-xl bg-teal-50 ring-1 ring-teal-100 p-5 text-sm">
      {unitPriceHT != null && (
        <p className="text-xs text-teal-900/70 mb-3">
          Tarif unitaire HT : <strong>{formatTND(unitPriceHT)}</strong> / personne
        </p>
      )}
      <dl className="space-y-1.5">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Sous-total HT</dt>
          <dd className="tabular-nums">{formatTND(subtotalHT)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">TVA {tvaRate}%</dt>
          <dd className="tabular-nums">{formatTND(tvaAmount)}</dd>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-base font-semibold">
          <dt>Total TTC estimé</dt>
          <dd className="tabular-nums">{formatTND(totalTTC)}</dd>
        </div>
      </dl>
      {note && (
        <p className="mt-3 text-xs text-amber-700 leading-relaxed">{note}</p>
      )}
    </div>
  );
}
