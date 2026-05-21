"use client";

import * as React from "react";
import type { FlowState, FlowAction } from "../state";
import { ModalQuestion, OptionPill, PillGrid } from "./parts";

type Options = { boissons: string[]; sale: string[]; sucre: string[] };

type LocalState = {
  step: 1 | 2 | 3 | 4;
  boissons: string[];
  sale: string[];
  sucre: string[];
  serviceMode: "sans" | "avec";
};

export function CocktailsCustomization({
  state,
  dispatch,
  options,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  options: Options;
}) {
  const initial: LocalState =
    state.details?.service === "cocktails-dinatoires" &&
    state.details.formulaId === "personnalise"
      ? {
          step: 1,
          boissons: state.details.boissons,
          sale: state.details.sale,
          sucre: state.details.sucre,
          serviceMode: state.details.serviceMode,
        }
      : { step: 1, boissons: [], sale: [], sucre: [], serviceMode: "avec" };

  const [s, setS] = React.useState<LocalState>(initial);

  const toggle = (key: "boissons" | "sale" | "sucre", v: string) => {
    setS((p) => ({
      ...p,
      [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v],
    }));
  };

  function commit() {
    dispatch({
      type: "SET_CUSTOM_DETAILS",
      details: {
        service: "cocktails-dinatoires",
        formulaId: "personnalise",
        boissons: s.boissons,
        sale: s.sale,
        sucre: s.sucre,
        serviceMode: s.serviceMode,
      },
    });
  }

  if (s.step === 1) {
    return (
      <ModalQuestion
        index={1}
        total={4}
        title="Quelles boissons souhaitez-vous ?"
        hint="Sélectionnez une ou plusieurs options"
        onNext={() => setS({ ...s, step: 2 })}
        nextDisabled={s.boissons.length === 0}
      >
        <PillGrid>
          {options.boissons.map((b) => (
            <OptionPill
              key={b}
              label={b}
              selected={s.boissons.includes(b)}
              onClick={() => toggle("boissons", b)}
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
        total={4}
        title="Quelles pièces salées souhaitez-vous ?"
        hint="Choisissez librement (5–6 recommandé)"
        onPrev={() => setS({ ...s, step: 1 })}
        onNext={() => setS({ ...s, step: 3 })}
        nextDisabled={s.sale.length === 0}
      >
        <PillGrid>
          {options.sale.map((b) => (
            <OptionPill
              key={b}
              label={b}
              selected={s.sale.includes(b)}
              onClick={() => toggle("sale", b)}
            />
          ))}
        </PillGrid>
      </ModalQuestion>
    );
  }

  if (s.step === 3) {
    return (
      <ModalQuestion
        index={3}
        total={4}
        title="Quelles pièces sucrées souhaitez-vous ?"
        onPrev={() => setS({ ...s, step: 2 })}
        onNext={() => setS({ ...s, step: 4 })}
        nextDisabled={s.sucre.length === 0}
      >
        <PillGrid>
          {options.sucre.map((b) => (
            <OptionPill
              key={b}
              label={b}
              selected={s.sucre.includes(b)}
              onClick={() => toggle("sucre", b)}
            />
          ))}
        </PillGrid>
      </ModalQuestion>
    );
  }

  return (
    <ModalQuestion
      index={4}
      total={4}
      title="Quelle option de service ?"
      onPrev={() => setS({ ...s, step: 3 })}
      onNext={commit}
      nextLabel="Valider mes choix"
      isLast
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ServiceOption
          title="Sans serveur"
          desc="Livraison + matériel jetable"
          selected={s.serviceMode === "sans"}
          onClick={() => setS({ ...s, serviceMode: "sans" })}
        />
        <ServiceOption
          title="Avec serveur"
          desc="Service en salle, vaisselle incluse"
          selected={s.serviceMode === "avec"}
          onClick={() => setS({ ...s, serviceMode: "avec" })}
        />
      </div>
    </ModalQuestion>
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
      aria-pressed={selected}
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
