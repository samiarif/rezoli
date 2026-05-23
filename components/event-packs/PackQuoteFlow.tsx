"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriceSummary } from "@/components/service-flow/PriceSummary";
import { Stepper } from "@/components/service-flow/Stepper";
import {
  minEventDateISO,
  eventDateError,
} from "@/components/service-flow/state";
import { cn, formatTND, formatDateFr } from "@/lib/utils";
import { totalsFromSubtotal } from "@/lib/service-pricing";
import { submitPackRequest } from "@/app/(marketing)/nos-packs/actions";
import type {
  PackCategory,
  PackTier,
} from "@/lib/event-packs-catalog";
import { priceForTier } from "@/lib/event-packs-catalog";

type PackFlowState = {
  step: 1 | 2 | 3;
  // Step 1 — contact + event
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  eventDate: string;
  eventTime: string;
  location: string;
  guestCount: number;
  // Step 2 — pack pick
  tierId: string | null;
  selectedOptions: string[];
  // Step 3 — message + consent
  message: string;
  consentRgpd: boolean;
};

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function PackQuoteFlow({ category }: { category: PackCategory }) {
  const initialGuestCount =
    category.guestCount.kind === "fixed"
      ? category.guestCount.value
      : category.guestCount.default;

  const [state, setState] = React.useState<PackFlowState>({
    step: 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    eventDate: "",
    eventTime: "",
    location: "",
    guestCount: initialGuestCount,
    tierId: category.tiers[0]?.id ?? null,
    selectedOptions: [],
    message: "",
    consentRgpd: false,
  });

  const update = React.useCallback(
    (patch: Partial<PackFlowState>) =>
      setState((prev) => ({ ...prev, ...patch })),
    []
  );

  // Validation
  const dateError = eventDateError(state.eventDate);
  const contactValid =
    state.firstName.trim().length >= 1 &&
    state.lastName.trim().length >= 1 &&
    /.+@.+\..+/.test(state.email.trim()) &&
    state.phone.trim().length >= 6;
  const step1Valid =
    contactValid &&
    !!state.eventDate &&
    !dateError &&
    !!state.eventTime &&
    state.location.trim().length >= 2 &&
    state.guestCount >= 1;
  const tier =
    category.tiers.find((t) => t.id === state.tierId) ?? category.tiers[0];
  const step2Valid = !!tier;

  const canGoTo = (step: 1 | 2 | 3) => {
    if (step === 1) return true;
    if (step === 2) return step1Valid;
    return step1Valid && step2Valid;
  };

  const goTo = (step: 1 | 2 | 3) => {
    if (!canGoTo(step)) return;
    update({ step });
    scrollToTop();
  };

  return (
    <section className="py-12 md:py-16 bg-cream-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Sticky stepper */}
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 mb-8 bg-cream-50/95 backdrop-blur py-4 px-4 sm:px-6 lg:px-8 border-b border-cream-100">
          <Stepper
            current={state.step}
            canGoTo={canGoTo}
            doneSteps={{ 1: step1Valid, 2: step2Valid && state.step > 2, 3: false }}
            onJump={(step) => goTo(step)}
          />
        </div>

        <article className="rounded-2xl bg-background ring-1 ring-border shadow-sm p-6 sm:p-10">
          {state.step > 1 && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  goTo((state.step - 1) as 1 | 2 | 3)
                }
              >
                <ArrowLeft className="size-4" /> Étape précédente
              </Button>
            </div>
          )}

          {state.step === 1 && (
            <PackStep1
              state={state}
              update={update}
              dateError={dateError}
              contactValid={contactValid}
              step1Valid={step1Valid}
              onContinue={() => goTo(2)}
            />
          )}

          {state.step === 2 && (
            <PackStep2
              state={state}
              update={update}
              category={category}
              onContinue={() => goTo(3)}
            />
          )}

          {state.step === 3 && tier && (
            <PackStep3
              state={state}
              update={update}
              category={category}
              tier={tier}
            />
          )}
        </article>
      </div>
    </section>
  );
}

/* ─── Step 1 — Événement + contact ────────────────────────────────── */

function PackStep1({
  state,
  update,
  dateError,
  contactValid,
  step1Valid,
  onContinue,
}: {
  state: PackFlowState;
  update: (patch: Partial<PackFlowState>) => void;
  dateError: "past" | "too-soon" | null;
  contactValid: boolean;
  step1Valid: boolean;
  onContinue: () => void;
}) {
  const minDate = React.useMemo(() => minEventDateISO(), []);
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Étape 1 / 3</p>
        <h2 className="display-2 mt-1">
          Vos coordonnées &amp; votre événement
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Renseignez quelques informations pour que notre équipe puisse vous
          recontacter.
        </p>
      </header>

      {/* Contact */}
      <section className="rounded-xl bg-teal-50/40 ring-1 ring-teal-500/10 p-5 space-y-4">
        <h3 className="font-display text-base font-semibold">Vos coordonnées</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pack-fn" required>Prénom</Label>
            <Input
              id="pack-fn"
              autoComplete="given-name"
              value={state.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="pack-ln" required>Nom</Label>
            <Input
              id="pack-ln"
              autoComplete="family-name"
              value={state.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="pack-email" required>Email</Label>
            <Input
              id="pack-email"
              type="email"
              autoComplete="email"
              value={state.email}
              onChange={(e) => update({ email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="pack-phone" required>Téléphone</Label>
            <Input
              id="pack-phone"
              type="tel"
              placeholder="+216 …"
              autoComplete="tel"
              value={state.phone}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pack-company">Société (optionnel)</Label>
            <Input
              id="pack-company"
              autoComplete="organization"
              value={state.company}
              onChange={(e) => update({ company: e.target.value })}
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
            <Label htmlFor="pack-date" required>Date</Label>
            <Input
              id="pack-date"
              type="date"
              min={minDate}
              value={state.eventDate}
              onChange={(e) => update({ eventDate: e.target.value })}
              aria-invalid={!!dateError}
              aria-describedby="pack-date-help"
            />
            <p
              id="pack-date-help"
              className="mt-1.5 text-xs text-muted-foreground"
            >
              Délai minimum : 48&nbsp;heures avant l&apos;événement.
            </p>
            {dateError === "past" && (
              <p className="mt-1.5 text-xs text-danger">
                Date dans le passé&nbsp;: veuillez choisir une date future.
              </p>
            )}
            {dateError === "too-soon" && (
              <p className="mt-1.5 text-xs text-danger">
                Trop proche&nbsp;: la date doit être au moins 48&nbsp;h après
                aujourd&apos;hui.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="pack-time" required>Heure</Label>
            <Input
              id="pack-time"
              type="time"
              value={state.eventTime}
              onChange={(e) => update({ eventTime: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="pack-lieu" required>Lieu</Label>
            <Input
              id="pack-lieu"
              placeholder="Adresse ou nom du lieu"
              value={state.location}
              onChange={(e) => update({ location: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="pack-nb" required>Nombre d&apos;invités</Label>
            <Input
              id="pack-nb"
              type="number"
              min={1}
              value={state.guestCount || ""}
              onChange={(e) =>
                update({ guestCount: parseInt(e.target.value, 10) || 0 })
              }
            />
          </div>
        </div>
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
          disabled={!step1Valid}
          onClick={onContinue}
        >
          Continuer <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Step 2 — Formules du pack ───────────────────────────────────── */

function PackStep2({
  state,
  update,
  category,
  onContinue,
}: {
  state: PackFlowState;
  update: (patch: Partial<PackFlowState>) => void;
  category: PackCategory;
  onContinue: () => void;
}) {
  const adjustGuests = (delta: number) => {
    if (category.guestCount.kind !== "stepper") return;
    const { min, max, step } = category.guestCount;
    update({
      guestCount: Math.max(min, Math.min(max, state.guestCount + delta * step)),
    });
  };

  const toggleOption = (id: string) => {
    update({
      selectedOptions: state.selectedOptions.includes(id)
        ? state.selectedOptions.filter((x) => x !== id)
        : [...state.selectedOptions, id],
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Étape 2 / 3</p>
        <h2 className="display-2 mt-1">Choisissez votre formule</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {category.tagline}
        </p>
      </header>

      {/* Guest count selector (stepper categories only) */}
      {category.guestCount.kind === "stepper" && (
        <div className="rounded-xl bg-cream-50 ring-1 ring-cream-100 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Nombre d&apos;invités
            </p>
            <p className="font-display text-xl font-semibold mt-0.5">
              {state.guestCount} personnes
            </p>
          </div>
          <div className="inline-flex items-center rounded-md ring-1 ring-border bg-background overflow-hidden">
            <button
              type="button"
              onClick={() => adjustGuests(-1)}
              className="p-2 hover:bg-cream-100"
              aria-label="Diminuer"
            >
              <Minus className="size-4" />
            </button>
            <span className="px-4 text-sm font-medium tabular-nums">
              {state.guestCount}
            </span>
            <button
              type="button"
              onClick={() => adjustGuests(1)}
              className="p-2 hover:bg-cream-100"
              aria-label="Augmenter"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tier cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {category.tiers.map((t) => {
          const selected = state.tierId === t.id;
          const unitTotal = priceForTier(t, state.guestCount);
          return (
            <button
              type="button"
              key={t.id}
              aria-pressed={selected}
              onClick={() => update({ tierId: t.id })}
              className={cn(
                "text-left rounded-xl bg-background p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md",
                selected
                  ? "ring-2 ring-teal-500 shadow-md"
                  : "ring-border hover:ring-teal-500/40"
              )}
            >
              {selected && (
                <span className="absolute -mt-2 ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              )}
              <p className="eyebrow">{t.badge}</p>
              <h3 className="font-display text-lg font-semibold mt-1">
                {t.name}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {t.description}
              </p>
              <p className="mt-3">
                <span className="font-display text-2xl font-bold text-teal-700">
                  {formatTND(unitTotal)}
                </span>
                <span className="text-xs text-muted-foreground"> HT total</span>
              </p>
              <ul className="mt-3 space-y-1">
                {summarizeTier(t).map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-xs text-muted-foreground leading-snug"
                  >
                    <Check className="size-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Options */}
      {category.options.length > 0 && (
        <section className="rounded-xl bg-amber-50/40 ring-1 ring-amber-200 p-5">
          <h3 className="font-display text-base font-semibold mb-3">
            Options (facultatif)
          </h3>
          <ul className="space-y-2">
            {category.options.map((opt) => {
              const checked = state.selectedOptions.includes(opt.id);
              return (
                <li key={opt.id}>
                  <label className="flex items-start gap-3 cursor-pointer rounded-lg bg-background ring-1 ring-border p-3 hover:ring-amber-400/40">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOption(opt.id)}
                    />
                    <span className="flex-1 text-sm">
                      <span className="font-medium">{opt.name}</span>
                      {opt.description && (
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {opt.description}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-amber-700 tabular-nums">
                      +{formatTND(opt.priceHT)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex justify-end pt-2">
        <Button
          variant="solid"
          size="lg"
          disabled={!state.tierId}
          onClick={onContinue}
        >
          Continuer <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function summarizeTier(tier: PackTier): string[] {
  const lines: string[] = [];
  const { content } = tier;
  if (content.boissons?.length) {
    lines.push(`Boissons : ${content.boissons.slice(0, 3).join(", ")}`);
  }
  if (content.sale) {
    lines.push(
      `Salé : ${content.sale.items.join(", ")}${
        content.sale.quantity ? ` (${content.sale.quantity})` : ""
      }`
    );
  }
  if (content.sucre) {
    lines.push(
      `Sucré : ${content.sucre.items.join(", ")}${
        content.sucre.quantity ? ` (${content.sucre.quantity})` : ""
      }`
    );
  }
  if (content.stations?.length) {
    lines.push(
      `Stations : ${content.stations.map((s) => s.name).join(", ")}`
    );
  }
  if (content.bar?.length) {
    lines.push(`Bar : ${content.bar.slice(0, 3).join(", ")}`);
  }
  if (content.mobilier?.length) {
    lines.push(`Mobilier : ${content.mobilier.length} éléments`);
  }
  if (content.materiel?.length) {
    lines.push(`Matériel : ${content.materiel.length} éléments`);
  }
  return lines;
}

/* ─── Step 3 — Récapitulatif + envoi ──────────────────────────────── */

function PackStep3({
  state,
  update,
  category,
  tier,
}: {
  state: PackFlowState;
  update: (patch: Partial<PackFlowState>) => void;
  category: PackCategory;
  tier: PackTier;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const packPriceHT = priceForTier(tier, state.guestCount);
  const optionsTotalHT = state.selectedOptions.reduce((sum, id) => {
    const opt = category.options.find((o) => o.id === id);
    return sum + (opt?.priceHT ?? 0);
  }, 0);
  const subtotalHT = +(packPriceHT + optionsTotalHT).toFixed(3);
  const totals = totalsFromSubtotal(subtotalHT);

  async function onSubmit() {
    setErrors({});
    setSubmitting(true);
    try {
      const result = await submitPackRequest({
        packCategory: category.slug,
        packTier: tier.id,
        guestCount: state.guestCount,
        options: state.selectedOptions,
        eventDate: state.eventDate,
        eventTime: state.eventTime || undefined,
        location: state.location,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        company: state.company || undefined,
        message: state.message || undefined,
        consentRgpd: state.consentRgpd,
      });
      if (result.ok) {
        router.push(
          `/devis-confirmation?ref=${encodeURIComponent(result.ref)}`
        );
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

  const optionLabels = state.selectedOptions
    .map((id) => category.options.find((o) => o.id === id))
    .filter(Boolean) as Array<{ name: string; priceHT: number }>;

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

      <section className="rounded-xl bg-teal-50/40 ring-1 ring-teal-500/10 p-5">
        <h3 className="font-display text-base font-semibold mb-3">
          Vos coordonnées
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <RecapItem icon={Users} label="Nom">
            {[state.firstName, state.lastName].filter(Boolean).join(" ") || "—"}
          </RecapItem>
          <RecapItem icon={Mail} label="Email">
            {state.email || "—"}
          </RecapItem>
        </dl>
        {state.company && (
          <p className="mt-2 text-xs text-muted-foreground">
            Société : {state.company}
          </p>
        )}
      </section>

      <section className="rounded-xl bg-cream-50 ring-1 ring-cream-100 p-5">
        <h3 className="font-display text-base font-semibold mb-3">Événement</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <RecapItem icon={Calendar} label="Date">
            {state.eventDate ? formatDateFr(state.eventDate) : "—"}
          </RecapItem>
          <RecapItem icon={Clock} label="Heure">
            {state.eventTime || "—"}
          </RecapItem>
          <RecapItem icon={MapPin} label="Lieu">
            {state.location || "—"}
          </RecapItem>
          <RecapItem icon={Users} label="Invités">
            {state.guestCount}
          </RecapItem>
        </dl>
      </section>

      <section className="rounded-xl bg-background ring-1 ring-border p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="eyebrow">{category.badge}</p>
            <h3 className="font-display text-base font-semibold mt-0.5">
              {tier.name}
            </h3>
          </div>
          <Badge variant="neutral">{tier.badge}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{tier.description}</p>
        <ul className="mt-3 space-y-1 text-sm">
          {summarizeTier(tier).map((line) => (
            <li key={line} className="flex gap-2">
              <Check className="size-4 text-teal-600 mt-0.5 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {optionLabels.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Options sélectionnées
            </p>
            <ul className="space-y-1 text-sm">
              {optionLabels.map((opt) => (
                <li key={opt.name} className="flex justify-between gap-2">
                  <span>{opt.name}</span>
                  <span className="tabular-nums text-amber-700">
                    +{formatTND(opt.priceHT)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <PriceSummary
        unitPriceHT={null}
        subtotalHT={totals.subtotalHT}
        tvaRate={totals.tvaRate}
        tvaAmount={totals.tvaAmount}
        totalTTC={totals.totalTTC}
      />

      <Separator />

      <section>
        <Label htmlFor="pack-msg">
          Message complémentaire (optionnel)
        </Label>
        <Textarea
          id="pack-msg"
          rows={3}
          placeholder="Allergies, contraintes, préférences…"
          value={state.message}
          onChange={(e) => update({ message: e.target.value })}
        />
        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={state.consentRgpd}
            onCheckedChange={(v) => update({ consentRgpd: v === true })}
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
          disabled={submitting}
          onClick={onSubmit}
        >
          <Send className="size-4" />
          {submitting ? "Envoi…" : "Envoyer ma demande"}
        </Button>
      </div>
    </div>
  );
}

function RecapItem({
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
