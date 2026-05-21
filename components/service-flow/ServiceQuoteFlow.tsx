"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "./Stepper";
import { Step1Event } from "./Step1Event";
import { Step2Formula } from "./Step2Formula";
import { Step2Streetfood } from "./Step2Streetfood";
import { Step3Recap } from "./Step3Recap";
import { CustomizationModal } from "./CustomizationModal";
import {
  flowReducer,
  makeInitialState,
  isStep1Valid,
  isStep2Valid,
} from "./state";
import type {
  ServiceSlug,
  ServiceMeta,
  CocktailPack,
  CafePack,
  DejeunerPack,
  StreetfoodStation,
} from "@/lib/service-catalog";

export type ServiceFlowCustomOptions = {
  boissons: string[];
  sale: string[];
  sucre: string[];
};

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function ServiceQuoteFlow({
  service,
  meta,
  packs,
  stations,
  customOptions,
  blockedDates,
  preselectFormula,
}: {
  service: ServiceSlug;
  meta: ServiceMeta;
  packs: Array<CocktailPack | CafePack | DejeunerPack>;
  stations: StreetfoodStation[];
  customOptions: ServiceFlowCustomOptions;
  blockedDates?: string[];
  preselectFormula?: string;
}) {
  const [state, dispatch] = React.useReducer(
    flowReducer,
    makeInitialState(service, preselectFormula)
  );

  const step1Done = isStep1Valid(state, meta.minGuests);
  const step2Done = isStep2Valid(state);
  const currentStep = state.step;

  const canGoTo = React.useCallback(
    (step: 1 | 2 | 3) => {
      if (step === 1) return true;
      if (step === 2) return step1Done;
      return step1Done && step2Done;
    },
    [step1Done, step2Done]
  );

  const goTo = React.useCallback(
    (step: 1 | 2 | 3) => {
      if (!canGoTo(step)) return;
      dispatch({ type: "GO_STEP", step });
      scrollToTop();
    },
    [canGoTo]
  );

  return (
    <section className="py-12 md:py-16 bg-cream-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Sticky stepper */}
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 mb-8 bg-cream-50/95 backdrop-blur py-4 px-4 sm:px-6 lg:px-8 border-b border-cream-100">
          <Stepper
            current={currentStep}
            canGoTo={canGoTo}
            doneSteps={{ 1: step1Done, 2: step2Done, 3: false }}
            onJump={(step) => goTo(step)}
          />
        </div>

        <article className="rounded-2xl bg-background ring-1 ring-border shadow-sm p-6 sm:p-10">
          {currentStep > 1 && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goTo((currentStep - 1) as 1 | 2 | 3)}
              >
                <ArrowLeft className="size-4" /> Étape précédente
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <Step1Event
              state={state}
              dispatch={dispatch}
              minGuests={meta.minGuests}
              showVerrerie={service === "pauses-cafe"}
              blockedDates={blockedDates}
              service={service}
              onContinue={() => goTo(2)}
            />
          )}

          {currentStep === 2 &&
            (service === "stations-street-food" ? (
              <Step2Streetfood
                state={state}
                dispatch={dispatch}
                stations={stations}
                onContinue={() => goTo(3)}
              />
            ) : (
              <Step2Formula
                state={state}
                dispatch={dispatch}
                service={service}
                packs={packs}
                onContinue={() => goTo(3)}
              />
            ))}

          {currentStep === 3 && (
            <Step3Recap
              state={state}
              dispatch={dispatch}
              service={service}
            />
          )}
        </article>

        {service !== "stations-street-food" && (
          <CustomizationModal
            state={state}
            dispatch={dispatch}
            customOptions={customOptions}
          />
        )}
      </div>
    </section>
  );
}
