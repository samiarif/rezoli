import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea, Label } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatTND, formatDateFr } from "@/lib/utils";
import { STATUS_LABELS, statusBadgeVariant, STATUS_ORDER } from "@/lib/quote-status";
import { updateQuoteStatus, addInternalNote } from "../actions";
import { ReplyButton } from "@/components/admin/QuoteDetailActions";
import { AcceptQuoteButton } from "@/components/admin/AcceptQuoteButton";
import { RejectQuoteDialog } from "@/components/admin/RejectQuoteDialog";
import { renderDetailsBlocks } from "@/components/service-flow/details-render";
import type { QuoteDetails } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Admin · Détail demande",
  robots: { index: false, follow: false },
};

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  if (!process.env.DATABASE_URL) {
    const { DEMO_QUOTES } = await import("@/lib/demo-fixtures");
    const demo = DEMO_QUOTES.find((q) => q.ref === ref);
    if (!demo) notFound();
    return (
      <div className="px-6 sm:px-10 py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/admin/devis">
            <ArrowLeft className="size-4" /> Toutes les demandes
          </Link>
        </Button>

        <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <p className="eyebrow">Demande</p>
            <h1 className="display-2 mt-1 flex items-center gap-3 flex-wrap">
              {demo.ref}
              <Badge variant={statusBadgeVariant(demo.status)}>
                {STATUS_LABELS[demo.status]}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Reçue le {formatDateFr(demo.createdAt)} ·{" "}
              <span className="text-amber-700">Mode démo</span>
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl bg-background ring-1 ring-border p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Client</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Info icon={Users} label="Nom">
                  {demo.firstName} {demo.lastName}
                </Info>
                <Info icon={Mail} label="Email">
                  <a
                    href={`mailto:${demo.email}`}
                    className="text-teal-700 hover:underline"
                  >
                    {demo.email}
                  </a>
                </Info>
                <Info icon={Phone} label="Téléphone">
                  <a
                    href={`tel:${demo.phone.replace(/\s/g, "")}`}
                    className="text-teal-700 hover:underline"
                  >
                    {demo.phone}
                  </a>
                </Info>
                {demo.company && (
                  <Info icon={Building} label="Société">
                    {demo.company}
                  </Info>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-background ring-1 ring-border p-6">
              <h2 className="font-display text-lg font-semibold mb-4">
                Événement
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Info icon={Calendar} label="Date">
                  {demo.eventDate
                    ? formatDateFr(demo.eventDate)
                    : "À préciser"}
                </Info>
                <Info icon={Users} label="Invités">
                  {demo.guestCount}
                </Info>
                <Info icon={Calendar} label="Type">
                  {demo.eventType}
                </Info>
                <Info icon={MapPin} label="Lieu">
                  {demo.location}
                </Info>
                {demo.budgetHint && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Budget indiqué
                    </p>
                    <p className="mt-1 text-sm">{demo.budgetHint}</p>
                  </div>
                )}
                {demo.message && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Message du client
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {demo.message}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-background ring-1 ring-border p-6">
              <h2 className="font-display text-lg font-semibold mb-3">
                Total estimé
              </h2>
              <p className="font-display text-3xl font-bold tabular-nums">
                {demo.totalTTC != null ? formatTND(demo.totalTTC) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Hors actions admin (changement de statut, notes, réponse email) —
                celles-ci nécessitent une base de données connectée.
              </p>
            </section>
          </div>

          <aside className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-6 h-fit sticky top-6">
            <h2 className="font-display text-lg font-semibold mb-2 text-amber-900">
              Mode démo
            </h2>
            <p className="text-sm text-amber-800/90 leading-relaxed">
              Cette page affiche un devis fictif. Les actions (changement de
              statut, envoi d&apos;email, prise de note) seront disponibles dès
              que Supabase sera connecté.
            </p>
          </aside>
        </div>
      </div>
    );
  }
  const { prisma } = await import("@/lib/prisma");
  const quote = await prisma.quoteRequest.findUnique({
    where: { ref },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!quote) notFound();

  return (
    <div className="px-6 sm:px-10 py-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/admin/devis">
          <ArrowLeft className="size-4" /> Toutes les demandes
        </Link>
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="eyebrow">Demande</p>
          <h1 className="display-2 mt-1 flex items-center gap-3 flex-wrap">
            {quote.ref}
            <Badge variant={statusBadgeVariant(quote.status)}>
              {STATUS_LABELS[quote.status]}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Reçue le {formatDateFr(quote.createdAt)}
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-3">
          {/* Primary actions */}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <AcceptQuoteButton quoteRef={quote.ref} />
            <RejectQuoteDialog quoteRef={quote.ref} />
            <ReplyButton
              quoteRef={quote.ref}
              customerEmail={quote.email}
              customerName={`${quote.firstName} ${quote.lastName}`}
            />
          </div>

          {/* Advanced — manual status transitions */}
          <details className="rounded-md border border-border bg-background p-3 text-sm">
            <summary className="cursor-pointer text-xs text-muted-foreground select-none">
              Avancé · changer le statut manuellement
            </summary>
            <form
              action={updateQuoteStatus}
              className="mt-3 flex flex-wrap items-center gap-2 justify-end"
            >
              <input type="hidden" name="ref" value={quote.ref} />
              <Label htmlFor="status" className="sr-only">
                Changer le statut
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={quote.status}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline" size="sm">
                Mettre à jour
              </Button>
              <label className="flex w-full items-center gap-2 justify-end text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  name="notify"
                  defaultChecked
                  className="rounded border-neutral-300 text-teal-500 focus:ring-teal-500"
                />
                <span>Notifier le client</span>
              </label>
            </form>
          </details>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Client card */}
          <section className="rounded-xl bg-background ring-1 ring-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Client</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Info icon={Users} label="Nom">
                {quote.firstName} {quote.lastName}
              </Info>
              <Info icon={Mail} label="Email">
                <a
                  href={`mailto:${quote.email}`}
                  className="text-teal-700 hover:underline"
                >
                  {quote.email}
                </a>
              </Info>
              <Info icon={Phone} label="Téléphone">
                <a
                  href={`tel:${quote.phone.replace(/\s/g, "")}`}
                  className="text-teal-700 hover:underline"
                >
                  {quote.phone}
                </a>
              </Info>
              {quote.company && (
                <Info icon={Building} label="Société">{quote.company}</Info>
              )}
            </div>
          </section>

          {/* Event card */}
          <section className="rounded-xl bg-background ring-1 ring-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Événement</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Info icon={Calendar} label="Date">
                {quote.eventDate ? formatDateFr(quote.eventDate) : "À préciser"}
              </Info>
              <Info icon={Users} label="Invités">
                {quote.guestCount}
              </Info>
              <Info icon={Calendar} label="Type">
                {quote.eventType}
              </Info>
              <Info icon={MapPin} label="Lieu">
                {quote.location}
              </Info>
              {quote.budgetHint && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Budget indiqué
                  </p>
                  <p className="mt-1 text-sm">{quote.budgetHint}</p>
                </div>
              )}
              {quote.message && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Message du client
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{quote.message}</p>
                </div>
              )}
            </div>
          </section>

          {/* Items + details card */}
          <section className="rounded-xl bg-background ring-1 ring-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">
              Prestation demandée
            </h2>
            <ul className="divide-y divide-border mb-4">
              {quote.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {it.quantity} invités
                      {it.tier ? ` · ${it.tier}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {quote.details ? (
              <div className="rounded-md bg-cream-50 p-4 space-y-2">
                {renderDetailsBlocks(quote.details as QuoteDetails)}
              </div>
            ) : null}
            <Separator className="my-4" />
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Sous-total HT</dt>
                <dd className="tabular-nums">
                  {quote.subtotalHTSnapshot
                    ? formatTND(Number(quote.subtotalHTSnapshot))
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>TVA {quote.tvaRateSnapshot?.toString() ?? "—"}%</dt>
                <dd className="tabular-nums">
                  {quote.subtotalHTSnapshot && quote.tvaRateSnapshot
                    ? formatTND(
                        (Number(quote.subtotalHTSnapshot) *
                          Number(quote.tvaRateSnapshot)) /
                          100
                      )
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total TTC estimé</dt>
                <dd className="tabular-nums">
                  {quote.totalTTCSnapshot
                    ? formatTND(Number(quote.totalTTCSnapshot))
                    : "—"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Notes */}
          <section className="rounded-xl bg-background ring-1 ring-border p-6">
            <h2 className="font-display text-lg font-semibold mb-3">
              Notes internes
            </h2>
            {quote.internalNotes && (
              <pre className="rounded-md bg-cream-50 p-3 text-xs whitespace-pre-wrap text-foreground/80 leading-relaxed mb-4 font-sans">
                {quote.internalNotes}
              </pre>
            )}
            <form action={addInternalNote} className="space-y-2">
              <input type="hidden" name="ref" value={quote.ref} />
              <Label htmlFor="note">Ajouter une note</Label>
              <Textarea
                id="note"
                name="note"
                rows={3}
                placeholder="Suivi, contraintes, échanges téléphoniques…"
              />
              <Button type="submit" variant="solid" size="sm">
                Enregistrer la note
              </Button>
            </form>
          </section>
        </div>

        {/* Timeline */}
        <aside className="rounded-xl bg-background ring-1 ring-border p-6 h-fit sticky top-6">
          <h2 className="font-display text-lg font-semibold mb-4">Historique</h2>
          <ol className="space-y-4 text-sm">
            {quote.events.map((e) => (
              <li key={e.id} className="relative pl-6">
                <span
                  aria-hidden
                  className="absolute left-0 top-1 size-3 rounded-full bg-teal-500 ring-4 ring-teal-100"
                />
                <p className="font-medium">
                  {e.toStatus
                    ? STATUS_LABELS[e.toStatus]
                    : e.type.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateFr(e.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function Info({
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
        <div className="text-sm mt-0.5">{children}</div>
      </div>
    </div>
  );
}
