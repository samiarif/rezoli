"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { FlowState, FlowAction } from "./state";
import type { QuoteDetails } from "@/lib/schemas";
import { CocktailsCustomization } from "./customization/Cocktails";
import { CafeCustomization } from "./customization/Cafe";
import { DejeunerCustomization } from "./customization/Dejeuner";

export type CustomOptionsByCategory = {
  boissons: string[];
  sale: string[];
  sucre: string[];
};

/** Submits the full custom request; resolves true on success (redirecting). */
export type CustomSubmit = (
  details: QuoteDetails,
  consent: boolean
) => Promise<boolean>;

export function CustomizationModal({
  state,
  dispatch,
  customOptions,
  onSubmit,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  customOptions: CustomOptionsByCategory;
  onSubmit: CustomSubmit;
}) {
  return (
    <Dialog
      open={state.modalOpen}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: "CLOSE_MODAL" });
      }}
    >
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogTitle>Personnalisez votre formule</DialogTitle>
        <DialogDescription>
          Quelques choix et nous préparons votre devis sur-mesure.
        </DialogDescription>
        {state.service === "cocktails-dinatoires" && (
          <CocktailsCustomization
            state={state}
            options={customOptions}
            onSubmit={onSubmit}
          />
        )}
        {state.service === "pauses-cafe" && (
          <CafeCustomization
            state={state}
            options={customOptions}
            onSubmit={onSubmit}
          />
        )}
        {state.service === "pauses-dejeuner" && (
          <DejeunerCustomization
            state={state}
            options={customOptions}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
