"use client";

import * as React from "react";
import type { FlowState } from "../state";
import type { CustomSubmit } from "../CustomizationModal";
import type { QuoteDetails } from "@/lib/schemas";
import { ModalQuestion, OptionPill, PillGrid, LiveRecap, ConsentCheckbox } from "./parts";

type Options = { boissons: string[]; sale: string[]; sucre: string[] };

type LocalState = {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  boissons: string[];
  entree: boolean | null;
  plat: "chaud" | "sandwich" | null;
  dessert: boolean | null;
  dessertType: "gateau" | "fruit" | "les_deux" | null;
  serviceMode: "lunch_box" | "a_table" | null;
};

export function DejeunerCustomization({
  state,
  options,
  onSubmit,
}: {
  state: FlowState;
  options: Options;
  onSubmit: CustomSubmit;
}) {
  const initial: LocalState =
    state.details?.service === "pauses-dejeuner" && state.details.formulaId === "personnalise"
      ? {
          step: 1,
          boissons: state.details.boissons,
          entree: state.details.entree,
          plat: state.details.plat,
          dessert: state.details.dessert,
          dessertType: state.details.dessertType ?? null,
          serviceMode: state.details.serviceMode,
        }
      : {
          step: 1,
          boissons: [],
          entree: null,
          plat: null,
          dessert: null,
          dessertType: null,
          serviceMode: null,
        };

  const [s, setS] = React.useState<LocalState>(initial);
  const [consent, setConsent] = React.useState(state.consentRgpd);
  const [submitting, setSubmitting] = React.useState(false);

  const toggleBoisson = (v: string) =>
    setS((p) => ({
      ...p,
      boissons: p.boissons.includes(v)
        ? p.boissons.filter((x) => x !== v)
        : [...p.boissons, v],
    }));

  const next = () => setS((p) => ({ ...p, step: (p.step + 1) as LocalState["step"] }));
  const prev = () => setS((p) => ({ ...p, step: Math.max(1, p.step - 1) as LocalState["step"] }));

  const buildDetails = (): QuoteDetails => ({
    service: "pauses-dejeuner",
    formulaId: "personnalise",
    boissons: s.boissons,
    entree: !!s.entree,
    plat: s.plat ?? "chaud",
    dessert: !!s.dessert,
    dessertType: s.dessert ? (s.dessertType ?? "les_deux") : undefined,
    serviceMode: s.serviceMode ?? "lunch_box",
  });

  async function handleSubmit() {
    if (!consent || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit(buildDetails(), consent);
    if (!ok) setSubmitting(false);
  }

  if (s.step === 1) {
    return (
      <ModalQuestion
        index={1}
        total={7}
        title="Quelles boissons souhaitez-vous ?"
        hint="Plusieurs choix possibles"
        onNext={next}
        nextDisabled={s.boissons.length === 0}
      >
        <PillGrid>
          {options.boissons.map((b) => (
            <OptionPill
              key={b}
              label={b}
              selected={s.boissons.includes(b)}
              onClick={() => toggleBoisson(b)}
            />
          ))}
        </PillGrid>
      </ModalQuestion>
    );
  }

  if (s.step === 2) {
    return (
      <ModalQuestion
        index={2}
        total={7}
        title="Souhaitez-vous une entrée ?"
        onPrev={prev}
        onNext={next}
        nextDisabled={s.entree === null}
      >
        <div className="flex gap-2">
          <Pill label="Oui" selected={s.entree === true} onClick={() => setS({ ...s, entree: true })} />
          <Pill label="Non" selected={s.entree === false} onClick={() => setS({ ...s, entree: false })} />
        </div>
      </ModalQuestion>
    );
  }

  if (s.step === 3) {
    return (
      <ModalQuestion
        index={3}
        total={7}
        title="Préférez-vous un plat chaud ou un sandwich ?"
        onPrev={prev}
        onNext={next}
        nextDisabled={s.plat === null}
      >
        <div className="flex gap-2">
          <Pill label="Plat chaud" selected={s.plat === "chaud"} onClick={() => setS({ ...s, plat: "chaud" })} />
          <Pill label="Sandwich" selected={s.plat === "sandwich"} onClick={() => setS({ ...s, plat: "sandwich" })} />
        </div>
      </ModalQuestion>
    );
  }

  if (s.step === 4) {
    return (
      <ModalQuestion
        index={4}
        total={7}
        title="Souhaitez-vous un dessert ?"
        onPrev={prev}
        onNext={() => {
          if (s.dessert === false) {
            setS({ ...s, step: 6, dessertType: null });
          } else {
            next();
          }
        }}
        nextDisabled={s.dessert === null}
      >
        <div className="flex gap-2">
          <Pill label="Oui" selected={s.dessert === true} onClick={() => setS({ ...s, dessert: true })} />
          <Pill label="Non" selected={s.dessert === false} onClick={() => setS({ ...s, dessert: false })} />
        </div>
      </ModalQuestion>
    );
  }

  if (s.step === 5) {
    return (
      <ModalQuestion
        index={5}
        total={7}
        title="Quel type de dessert ?"
        onPrev={prev}
        onNext={next}
        nextDisabled={s.dessertType === null}
      >
        <div className="flex flex-wrap gap-2">
          <Pill label="Gâteau / Pâtisserie" selected={s.dessertType === "gateau"} onClick={() => setS({ ...s, dessertType: "gateau" })} />
          <Pill label="Fruit" selected={s.dessertType === "fruit"} onClick={() => setS({ ...s, dessertType: "fruit" })} />
          <Pill label="Les deux" selected={s.dessertType === "les_deux"} onClick={() => setS({ ...s, dessertType: "les_deux" })} />
        </div>
      </ModalQuestion>
    );
  }

  if (s.step === 6) {
    return (
      <ModalQuestion
        index={6}
        total={7}
        title="Quel mode de service préférez-vous ?"
        onPrev={() => setS({ ...s, step: s.dessert ? 5 : 4 })}
        onNext={() => setS({ ...s, step: 7 })}
        nextDisabled={s.serviceMode === null}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ServiceOption
            title="Lunch box"
            desc="Box individuelles à emporter"
            selected={s.serviceMode === "lunch_box"}
            onClick={() => setS({ ...s, serviceMode: "lunch_box" })}
          />
          <ServiceOption
            title="À table"
            desc="Service en salle, vaisselle incluse"
            selected={s.serviceMode === "a_table"}
            onClick={() => setS({ ...s, serviceMode: "a_table" })}
          />
        </div>
      </ModalQuestion>
    );
  }

  // Step 7 — récapitulatif dynamique + envoi de la demande
  return (
    <ModalQuestion
      index={7}
      total={7}
      title="Confirmez votre formule personnalisée"
      hint="Revoyez vos choix puis envoyez votre demande."
      onPrev={() => setS({ ...s, step: 6 })}
      onNext={handleSubmit}
      nextLabel={submitting ? "Envoi…" : "Envoyer ma demande"}
      nextDisabled={!consent || submitting}
      isLast
    >
      <LiveRecap
        rows={[
          { label: "Boissons", value: s.boissons },
          { label: "Entrée", value: s.entree ? "Oui" : "Non" },
          {
            label: "Plat",
            value:
              s.plat === "chaud"
                ? "Plat chaud"
                : s.plat === "sandwich"
                ? "Sandwich"
                : null,
          },
          {
            label: "Dessert",
            value: !s.dessert
              ? "Non"
              : s.dessertType === "gateau"
              ? "Gâteau / Pâtisserie"
              : s.dessertType === "fruit"
              ? "Fruit"
              : "Gâteau & fruit",
          },
          {
            label: "Service",
            value:
              s.serviceMode === "a_table"
                ? "À table — service en salle"
                : "Lunch box — individuelles à emporter",
          },
        ]}
      />
      <ConsentCheckbox checked={consent} onChange={setConsent} />
    </ModalQuestion>
  );
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-md px-5 py-2 text-sm font-medium ring-1 transition-colors " +
        (selected
          ? "bg-teal-500 text-white ring-teal-500"
          : "bg-background ring-border hover:ring-teal-500/30")
      }
    >
      {label}
    </button>
  );
}

function ServiceOption({
  title,
  desc,
  selected,
  onClick,
}: {
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg p-4 ring-1 text-left transition-all " +
        (selected
          ? "bg-teal-50 ring-2 ring-teal-500"
          : "bg-background ring-border hover:ring-teal-500/30")
      }
    >
      <p className="font-display font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </button>
  );
}
