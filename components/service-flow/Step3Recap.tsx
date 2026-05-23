"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Calendar, MapPin, Users, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Separator } from "@/components/ui/separator";
import type { FlowState, FlowAction } from "./state";
import { formatDateFr } from "@/lib/utils";
import { PriceSummary } from "./PriceSummary";
import { renderDetailsBlocks } from "./details-render";
import { submitServiceQuote } from "@/app/(marketing)/nos-services/[slug]/actions";
import {
  pricePerPersonForService,
  streetfoodSubtotal,
  totalsFromUnitPrice,
  totalsFromSubtotal,
} from "@/lib/service-pricing";
import type { ServiceSlug } from "@/lib/service-catalog";

export function Step3Recap({
  state,
  dispatch,
  service,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  service: ServiceSlug;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const totals = computeTotals(state, service);

  async function onSubmit() {
    setErrors({});
    setSubmitting(true);
    try {
      if (!state.details) {
        toast.error("Aucune formule sélectionnée.");
        return;
      }
      const result = await submitServiceQuote({
        eventDate: state.eventDate,
        eventTime: state.eventTime,
        location: state.location,
        guestCount: state.guestCount,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        company: state.company || undefined,
        message: state.message || undefined,
        consentRgpd: state.consentRgpd,
        details: state.details,
        hubspotContactId: state.hubspotContactId,
      });

      if (result.ok) {
        router.push(`/devis-confirmation?ref=${encodeURIComponent(result.ref)}`);
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message ?? "Veuillez corriger les erreurs.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  const contactSummary = [
    state.firstName,
    state.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Étape 3 / 3</p>
        <h2 className="display-2 mt-1">Récapitulatif &amp; envoi</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Vérifiez vos choix puis envoyez votre demande. Notre équipe revient
          vers vous sous 48 h.
        </p>
      </header>

      {/* Contact recap (read-only from step 1) */}
      <section className="rounded-xl bg-teal-50/40 ring-1 ring-teal-500/10 p-5">
        <h3 className="font-display text-base font-semibold mb-3">
          Vos coordonnées
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Item icon={Users} label="Nom">
            {contactSummary || "—"}
          </Item>
          <Item icon={Mail} label="Email">
            {state.email || "—"}
          </Item>
        </dl>
        {state.company && (
          <p className="mt-2 text-xs text-muted-foreground">
            Société : {state.company}
          </p>
        )}
      </section>

      {/* Event recap */}
      <section className="rounded-xl bg-cream-50 ring-1 ring-cream-100 p-5">
        <h3 className="font-display text-base font-semibold mb-3">Événement</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Item icon={Calendar} label="Date">
            {state.eventDate ? formatDateFr(state.eventDate) : "—"}
          </Item>
          <Item icon={Clock} label="Heure">
            {state.eventTime || "—"}
          </Item>
          <Item icon={MapPin} label="Lieu">
            {state.location || "—"}
          </Item>
          <Item icon={Users} label="Invités">
            {state.guestCount}
          </Item>
        </dl>
      </section>

      {/* Formula recap */}
      <section className="rounded-xl bg-background ring-1 ring-border p-5">
        <h3 className="font-display text-base font-semibold mb-3">Formule</h3>
        {state.details ? (
          <div className="space-y-3 text-sm">
            {renderDetailsBlocks(state.details)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune formule sélectionnée.
          </p>
        )}
      </section>

      {state.details && (
        <PriceSummary
          unitPriceHT={totals.unitPriceHT}
          subtotalHT={totals.subtotalHT}
          tvaRate={totals.tvaRate}
          tvaAmount={totals.tvaAmount}
          totalTTC={totals.totalTTC}
          note={
            state.formulaId === "personnalise"
              ? "Tarif final établi par notre équipe après étude de votre demande."
              : undefined
          }
        />
      )}

      <Separator />

      {/* Optional message + RGPD consent */}
      <section>
        <Label htmlFor="msg">Message complémentaire (optionnel)</Label>
        <Textarea
          id="msg"
          rows={3}
          placeholder="Allergies, contraintes, préférences…"
          value={state.message}
          onChange={(e) =>
            dispatch({ type: "SET_CONTACT", patch: { message: e.target.value } })
          }
        />

        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={state.consentRgpd}
            onCheckedChange={(v) =>
              dispatch({ type: "SET_CONTACT", patch: { consentRgpd: v === true } })
            }
            aria-invalid={!!errors.consentRgpd}
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            J&apos;accepte que mes données soient utilisées pour traiter ma
            demande, conformément à la{" "}
            <Link
              href="/politique-confidentialite"
              className="underline hover:text-teal-700"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        <FieldError message={errors.consentRgpd} />
      </section>

      <div className="flex justify-end pt-2">
        <Button
          variant="accent"
          size="lg"
          disabled={submitting || !state.details}
          onClick={onSubmit}
        >
          <Send className="size-4" />
          {submitting ? "Envoi…" : "Envoyer ma demande"}
        </Button>
      </div>
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-teal-600 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium mt-0.5">{children}</p>
      </div>
    </div>
  );
}

function computeTotals(state: FlowState, service: ServiceSlug) {
  if (
    service === "stations-street-food" &&
    state.details?.service === "stations-street-food"
  ) {
    const { subtotalHT } = streetfoodSubtotal(
      state.details.stations,
      state.guestCount,
      state.details.multiPackId
    );
    const t = totalsFromSubtotal(subtotalHT);
    return { unitPriceHT: null, ...t };
  }
  const unit = pricePerPersonForService(
    service,
    state.formulaId ?? undefined,
    state.guestCount,
    {
      withVerrerie: state.withVerrerie,
      serviceMode:
        state.details?.service === "pauses-dejeuner"
          ? state.details.serviceMode
          : undefined,
    }
  );
  return totalsFromUnitPrice(unit, state.guestCount);
}
