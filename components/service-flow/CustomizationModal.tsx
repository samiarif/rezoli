"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { FlowState, FlowAction } from "./state";
import { CocktailsCustomization } from "./customization/Cocktails";
import { CafeCustomization } from "./customization/Cafe";
import { DejeunerCustomization } from "./customization/Dejeuner";

export type CustomOptionsByCategory = {
  boissons: string[];
  sale: string[];
  sucre: string[];
};

export function CustomizationModal({
  state,
  dispatch,
  customOptions,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  customOptions: CustomOptionsByCategory;
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
            dispatch={dispatch}
            options={customOptions}
          />
        )}
        {state.service === "pauses-cafe" && (
          <CafeCustomization
            state={state}
            dispatch={dispatch}
            options={customOptions}
          />
        )}
        {state.service === "pauses-dejeuner" && (
          <DejeunerCustomization
            state={state}
            dispatch={dispatch}
            options={customOptions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
