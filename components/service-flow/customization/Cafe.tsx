"use client";

import * as React from "react";
import type { FlowState, FlowAction } from "../state";
import { ModalQuestion, OptionPill, PillGrid } from "./parts";

type Options = { boissons: string[]; sale: string[]; sucre: string[] };

type LocalState = {
  step: 1 | 2 | 3 | 4;
  boissons: string[];
  hasSale: boolean | null;
  sale: string[];
  hasSucre: boolean | null;
  sucre: string[];
  serviceMode: "sans" | "avec";
};

export function CafeCustomization({
  state,
  dispatch,
  options,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  options: Options;
}) {
  const initial: LocalState =
    state.details?.service === "pauses-cafe" && state.details.formulaId === "personnalise"
      ? {
          step: 1,
          boissons: state.details.boissons,
          hasSale: state.details.hasSale,
          sale: state.details.sale,
          hasSucre: state.details.hasSucre,
          sucre: state.details.sucre,
          serviceMode: state.details.serviceMode,
        }
      : {
          step: 1,
          boissons: [],
          hasSale: null,
          sale: [],
          hasSucre: null,
          sucre: [],
          serviceMode: state.withVerrerie ? "avec" : "sans",
        };

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
        service: "pauses-cafe",
        formulaId: "personnalise",
        withVerrerie: state.withVerrerie,
        boissons: s.boissons,
        hasSale: !!s.hasSale,
        sale: s.hasSale ? s.sale : [],
        hasSucre: !!s.hasSucre,
        sucre: s.hasSucre ? s.sucre : [],
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
        hint="Sélection multiple"
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
        title="Souhaitez-vous du salé ?"
        hint={s.hasSale ? "Choisissez vos pièces salées" : ""}
        onPrev={() => setS({ ...s, step: 1 })}
        onNext={() => setS({ ...s, step: 3 })}
        nextDisabled={s.hasSale === null || (s.hasSale && s.sale.length === 0)}
      >
        <div className="flex gap-2 mb-4">
          <YesNoButton
            label="Oui"
            selected={s.hasSale === true}
            onClick={() => setS({ ...s, hasSale: true })}
          />
          <YesNoButton
            label="Non"
            selected={s.hasSale === false}
            onClick={() => setS({ ...s, hasSale: false, sale: [] })}
          />
        </div>
        {s.hasSale && (
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
        )}
      </ModalQuestion>
    );
  }

  if (s.step === 3) {
    return (
      <ModalQuestion
        index={3}
        total={4}
        title="Souhaitez-vous du sucré ?"
        hint={s.hasSucre ? "Choisissez vos pièces sucrées" : ""}
        onPrev={() => setS({ ...s, step: 2 })}
        onNext={() => setS({ ...s, step: 4 })}
        nextDisabled={s.hasSucre === null || (s.hasSucre && s.sucre.length === 0)}
      >
        <div className="flex gap-2 mb-4">
          <YesNoButton
            label="Oui"
            selected={s.hasSucre === true}
            onClick={() => setS({ ...s, hasSucre: true })}
          />
          <YesNoButton
            label="Non"
            selected={s.hasSucre === false}
            onClick={() => setS({ ...s, hasSucre: false, sucre: [] })}
          />
        </div>
        {s.hasSucre && (
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
        )}
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
          title="Sans service"
          desc="Livraison avec matériel jetable"
          selected={s.serviceMode === "sans"}
          onClick={() => setS({ ...s, serviceMode: "sans" })}
        />
        <ServiceOption
          title="Avec service"
          desc="Livraison + serveur sur place"
          selected={s.serviceMode === "avec"}
          onClick={() => setS({ ...s, serviceMode: "avec" })}
        />
      </div>
    </ModalQuestion>
  );
}

function YesNoButton({
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
