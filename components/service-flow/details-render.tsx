import { Check } from "lucide-react";
import type { QuoteDetails } from "@/lib/schemas";
import { getStation } from "@/lib/service-catalog";
import { formatTND } from "@/lib/utils";
import { streetfoodLinePrice } from "@/lib/service-pricing";
import { getPackCategory } from "@/lib/event-packs-catalog";

export function renderDetailsBlocks(details: QuoteDetails) {
  switch (details.service) {
    case "cocktails-dinatoires":
      return (
        <>
          <Row label="Formule">{formulaLabel(details.formulaId)}</Row>
          <Row label="Boissons">{details.boissons.join(", ") || "—"}</Row>
          <Row label="Salé">{details.sale.join(", ") || "—"}</Row>
          <Row label="Sucré">{details.sucre.join(", ") || "—"}</Row>
          <Row label="Service">
            {details.serviceMode === "avec" ? "Avec serveur" : "Sans serveur"}
          </Row>
        </>
      );
    case "pauses-cafe":
      return (
        <>
          <Row label="Formule">{formulaLabel(details.formulaId)}</Row>
          <Row label="Verrerie">{details.withVerrerie ? "Avec" : "Sans"}</Row>
          <Row label="Boissons">{details.boissons.join(", ") || "—"}</Row>
          <Row label="Salé">
            {details.hasSale ? details.sale.join(", ") || "Inclus" : "Non"}
          </Row>
          <Row label="Sucré">
            {details.hasSucre ? details.sucre.join(", ") || "Inclus" : "Non"}
          </Row>
          <Row label="Service">
            {details.serviceMode === "avec" ? "Avec serveur" : "Sans serveur"}
          </Row>
        </>
      );
    case "pauses-dejeuner":
      return (
        <>
          <Row label="Formule">{formulaLabel(details.formulaId)}</Row>
          <Row label="Boissons">{details.boissons.join(", ") || "—"}</Row>
          <Row label="Entrée">{details.entree ? "Oui" : "Non"}</Row>
          <Row label="Plat">
            {details.plat === "chaud" ? "Plat chaud" : "Sandwich"}
          </Row>
          <Row label="Dessert">
            {details.dessert
              ? details.dessertType === "gateau"
                ? "Oui — Gâteau / Pâtisserie"
                : details.dessertType === "fruit"
                ? "Oui — Fruit"
                : "Oui — Les deux"
              : "Non"}
          </Row>
          <Row label="Service">
            {details.serviceMode === "a_table" ? "À table" : "Lunch box"}
          </Row>
        </>
      );
    case "stations-street-food":
      return (
        <ul className="space-y-1.5">
          {details.stations.map((s, idx) => {
            const meta = getStation(s.stationId);
            return (
              <li key={idx} className="flex gap-2 text-sm">
                <Check className="size-4 text-teal-600 mt-0.5 shrink-0" />
                <span>
                  <strong>{meta?.name ?? s.stationId}</strong>
                  {s.variant ? ` — ${s.variant}` : ""}{" "}
                  <span className="text-muted-foreground">
                    · {s.piecesPerPerson} pièce{s.piecesPerPerson > 1 ? "s" : ""}{" "}
                    / pers.
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      );
    case "event-pack": {
      const cat = getPackCategory(details.packCategory);
      const optionLabels = (details.options || []).map((id) => {
        const opt = cat?.options.find((o) => o.id === id);
        return opt ? `${opt.name} (${formatTND(opt.priceHT)})` : id;
      });
      return (
        <>
          <Row label="Catégorie">{cat?.name ?? details.packCategory}</Row>
          <Row label="Formule">{details.packName}</Row>
          <Row label="Invités">{details.guestCount}</Row>
          <Row label="Prix pack HT">{formatTND(details.packPriceHT)}</Row>
          {optionLabels.length > 0 && (
            <Row label="Options">{optionLabels.join(" · ")}</Row>
          )}
        </>
      );
    }
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider sm:w-24 sm:shrink-0">
        {label}
      </p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

type ServiceFormulaId =
  | "essentielle"
  | "business"
  | "premium"
  | "signature"
  | "personnalise";

export function formulaLabel(id: ServiceFormulaId): string {
  switch (id) {
    case "essentielle":
      return "Essentielle";
    case "business":
      return "Business";
    case "premium":
      return "Premium";
    case "signature":
      return "Signature";
    case "personnalise":
      return "Personnalisé";
  }
}

// Plain-text version for emails
export function renderDetailsAsText(details: QuoteDetails, nb: number): string {
  switch (details.service) {
    case "cocktails-dinatoires":
      return [
        `Formule : ${formulaLabel(details.formulaId)}`,
        `Boissons : ${details.boissons.join(", ") || "—"}`,
        `Salé : ${details.sale.join(", ") || "—"}`,
        `Sucré : ${details.sucre.join(", ") || "—"}`,
        `Service : ${details.serviceMode === "avec" ? "Avec serveur" : "Sans serveur"}`,
      ].join("\n");
    case "pauses-cafe":
      return [
        `Formule : ${formulaLabel(details.formulaId)}`,
        `Verrerie : ${details.withVerrerie ? "Avec" : "Sans"}`,
        `Boissons : ${details.boissons.join(", ") || "—"}`,
        `Salé : ${details.hasSale ? details.sale.join(", ") || "Inclus" : "Non"}`,
        `Sucré : ${details.hasSucre ? details.sucre.join(", ") || "Inclus" : "Non"}`,
        `Service : ${details.serviceMode === "avec" ? "Avec serveur" : "Sans serveur"}`,
      ].join("\n");
    case "pauses-dejeuner":
      return [
        `Formule : ${formulaLabel(details.formulaId)}`,
        `Boissons : ${details.boissons.join(", ") || "—"}`,
        `Entrée : ${details.entree ? "Oui" : "Non"}`,
        `Plat : ${details.plat === "chaud" ? "Plat chaud" : "Sandwich"}`,
        `Dessert : ${
          details.dessert
            ? details.dessertType === "gateau"
              ? "Oui — Gâteau / Pâtisserie"
              : details.dessertType === "fruit"
              ? "Oui — Fruit"
              : "Oui — Les deux"
            : "Non"
        }`,
        `Service : ${details.serviceMode === "a_table" ? "À table" : "Lunch box"}`,
      ].join("\n");
    case "stations-street-food":
      return details.stations
        .map((s) => {
          const meta = getStation(s.stationId);
          const line = streetfoodLinePrice(s, nb);
          return `• ${meta?.name ?? s.stationId}${s.variant ? " — " + s.variant : ""} · ${s.piecesPerPerson} pièce(s)/pers. · ${line ? formatTND(line.total) : "—"} HT`;
        })
        .join("\n");
    case "event-pack": {
      const cat = getPackCategory(details.packCategory);
      const optionLabels = (details.options || [])
        .map((id) => cat?.options.find((o) => o.id === id))
        .filter(Boolean)
        .map((o) => `• ${o!.name} — ${formatTND(o!.priceHT)} HT`)
        .join("\n");
      return [
        `Pack : ${details.packName}`,
        `Catégorie : ${cat?.name ?? details.packCategory}`,
        `Invités : ${details.guestCount}`,
        `Prix pack HT : ${formatTND(details.packPriceHT)}`,
        optionLabels ? `Options :\n${optionLabels}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    }
  }
}
