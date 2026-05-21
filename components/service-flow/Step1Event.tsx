"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import type { FlowState, FlowAction } from "./state";
import { isStep1Valid, isContactValid } from "./state";
import { pushStep1Lead } from "@/app/(marketing)/nos-services/[slug]/actions";
import type { ServiceSlug } from "@/lib/service-catalog";

const today = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
};

export function Step1Event({
  state,
  dispatch,
  minGuests,
  showVerrerie,
  blockedDates,
  onContinue,
  service,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  minGuests: number;
  showVerrerie?: boolean;
  blockedDates?: string[];
  onContinue: () => void;
  service: ServiceSlug;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const valid = isStep1Valid(state, minGuests);
  const contactValid = isContactValid(state);
  const isBlocked =
    state.eventDate && (blockedDates ?? []).includes(state.eventDate);

  async function handleContinue() {
    if (!valid || isBlocked) return;
    setSubmitting(true);
    try {
      const res = await pushStep1Lead({
        service,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        company: state.company || undefined,
        eventDate: state.eventDate,
        eventTime: state.eventTime,
        location: state.location,
        guestCount: state.guestCount,
      });
      if (res.hubspotContactId) {
        dispatch({
          type: "SET_HUBSPOT_CONTACT_ID",
          id: res.hubspotContactId,
        });
      }
    } catch (err) {
      // Non-blocking — HubSpot push failures must not prevent the user from continuing.
      console.error("[Step1Event] pushStep1Lead failed", err);
    } finally {
      setSubmitting(false);
      onContinue();
      toast.success("Coordonnées enregistrées — passons à la formule");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Étape 1 / 3</p>
        <h2 className="display-2 mt-1">Vos coordonnées &amp; votre événement</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Renseignez quelques informations pour que notre équipe puisse vous
          recontacter.
        </p>
      </header>

      {/* Contact — captured first so we don't lose the lead if the user bails */}
      <section className="rounded-xl bg-teal-50/40 ring-1 ring-teal-500/10 p-5 space-y-4">
        <h3 className="font-display text-base font-semibold">Vos coordonnées</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName" required>Prénom</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              value={state.firstName}
              onChange={(e) =>
                dispatch({
                  type: "SET_CONTACT",
                  patch: { firstName: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="lastName" required>Nom</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              value={state.lastName}
              onChange={(e) =>
                dispatch({
                  type: "SET_CONTACT",
                  patch: { lastName: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={state.email}
              onChange={(e) =>
                dispatch({
                  type: "SET_CONTACT",
                  patch: { email: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="phone" required>Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+216 …"
              value={state.phone}
              onChange={(e) =>
                dispatch({
                  type: "SET_CONTACT",
                  patch: { phone: e.target.value },
                })
              }
            />
          </div>
        </div>
        {!contactValid && (state.firstName || state.email || state.phone) && (
          <FieldError message="Renseignez prénom, nom, email valide et téléphone (6 chiffres min.)" />
        )}
      </section>

      {/* Event details */}
      <section className="space-y-5">
        <h3 className="font-display text-base font-semibold">Votre événement</h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="event-date" required>Date</Label>
            <Input
              id="event-date"
              type="date"
              min={today()}
              value={state.eventDate}
              onChange={(e) =>
                dispatch({ type: "SET_EVENT", patch: { eventDate: e.target.value } })
              }
              aria-invalid={!!isBlocked}
            />
            {isBlocked && (
              <p className="mt-1.5 text-xs text-danger">
                Cette date n&apos;est plus disponible. Choisissez une autre date.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="event-time" required>Heure</Label>
            <Input
              id="event-time"
              type="time"
              value={state.eventTime}
              onChange={(e) =>
                dispatch({ type: "SET_EVENT", patch: { eventTime: e.target.value } })
              }
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="event-lieu" required>Lieu</Label>
            <Input
              id="event-lieu"
              type="text"
              placeholder="Adresse ou nom du lieu"
              value={state.location}
              onChange={(e) =>
                dispatch({ type: "SET_EVENT", patch: { location: e.target.value } })
              }
            />
          </div>
          <div>
            <Label htmlFor="nb-personnes" required>
              Nombre d&apos;invités (min. {minGuests})
            </Label>
            <Input
              id="nb-personnes"
              type="number"
              min={minGuests}
              placeholder={`Min. ${minGuests} personnes`}
              value={state.guestCount || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_EVENT",
                  patch: { guestCount: parseInt(e.target.value, 10) || 0 },
                })
              }
              aria-invalid={state.guestCount > 0 && state.guestCount < minGuests}
            />
            {state.guestCount > 0 && state.guestCount < minGuests && (
              <p className="mt-1.5 text-xs text-danger">
                Minimum {minGuests} invités pour cette formule.
              </p>
            )}
          </div>
        </div>

        {showVerrerie && (
          <label className="flex items-start gap-3 rounded-lg border border-border bg-cream-50 px-4 py-3 cursor-pointer">
            <Checkbox
              id="verrerie"
              checked={state.withVerrerie}
              onCheckedChange={(v) =>
                dispatch({ type: "SET_EVENT", patch: { withVerrerie: v === true } })
              }
            />
            <span className="text-sm">
              <strong className="block">Avec verrerie &amp; service en salle</strong>
              <span className="text-muted-foreground">
                Tasses en porcelaine, verres en verre, serveur sur place. Tarifs
                différents selon l&apos;option choisie.
              </span>
            </span>
          </label>
        )}
      </section>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        En continuant, vous acceptez que vos données soient utilisées pour
        traiter votre demande, conformément à la{" "}
        <Link href="/politique-confidentialite" className="underline">
          politique de confidentialité
        </Link>
        .
      </p>

      <div className="flex justify-end pt-2">
        <Button
          variant="solid"
          size="lg"
          disabled={!valid || !!isBlocked || submitting}
          onClick={handleContinue}
        >
          {submitting ? "…" : "Continuer"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
