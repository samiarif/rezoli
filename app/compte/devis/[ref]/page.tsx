import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users, MessageCircle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/auth";
import { formatTND, formatDateFr } from "@/lib/utils";
import { STATUS_LABELS, statusBadgeVariant } from "@/lib/quote-status";

export const metadata: Metadata = {
  title: "Détail de la demande",
  robots: { index: false, follow: false },
};

export default async function ClientQuoteDetail({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.DATABASE_URL) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">
        Base de données non configurée.
      </div>
    );
  }

  const session = await getSession();
  if (!session) redirect("/compte/login");

  const { prisma } = await import("@/lib/prisma");
  const quote = await prisma.quoteRequest.findUnique({
    where: { ref },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!quote) notFound();
  if (quote.email !== session.user.email && !session.isAdmin) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/compte">
          <ArrowLeft className="size-4" /> Mes demandes
        </Link>
      </Button>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="eyebrow">Demande</p>
          <h1 className="display-2 mt-1 flex items-center gap-3">
            {quote.ref}
            <Badge variant={statusBadgeVariant(quote.status)}>
              {STATUS_LABELS[quote.status]}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Soumise le {formatDateFr(quote.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-background ring-1 ring-border p-6 shadow-xs">
            <h2 className="font-display text-lg font-semibold mb-4">
              Événement
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
              <Info icon={Calendar} label="Date">
                {quote.eventDate
                  ? formatDateFr(quote.eventDate)
                  : "À préciser"}
              </Info>
              <Info icon={Users} label="Invités">
                {quote.guestCount}
              </Info>
              <Info icon={MessageCircle} label="Type">
                {quote.eventType}
              </Info>
              <Info icon={MapPin} label="Lieu">
                {quote.location}
              </Info>
            </ul>
            {quote.message && (
              <>
                <Separator className="my-5" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Message
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{quote.message}</p>
              </>
            )}
          </div>

          <div className="rounded-xl bg-background ring-1 ring-border p-6 shadow-xs">
            <h2 className="font-display text-lg font-semibold mb-4">
              Prestations
            </h2>
            <ul className="space-y-3">
              {quote.items.map((it) => (
                <li
                  key={it.id}
                  className="flex justify-between gap-3 rounded-md bg-cream-50 p-4"
                >
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {it.quantity} invités
                      {it.tier ? ` · ${it.tier}` : ""}
                    </p>
                  </div>
                  <p className="tabular-nums text-sm font-medium">
                    {it.unitPriceTND
                      ? formatTND(Number(it.unitPriceTND) * it.quantity)
                      : "Sur devis"}
                  </p>
                </li>
              ))}
            </ul>
            {quote.totalTTCSnapshot && (
              <>
                <Separator className="my-4" />
                <div className="flex justify-between text-sm">
                  <span>Total TTC estimé</span>
                  <span className="font-semibold tabular-nums">
                    {formatTND(Number(quote.totalTTCSnapshot))}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button asChild variant="solid">
              <Link href="/nos-services">
                <Repeat className="size-4" /> Nouvelle demande
              </Link>
            </Button>
          </div>
        </section>

        <aside className="rounded-xl bg-cream-50 ring-1 ring-cream-100 p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-semibold mb-4">
            Suivi de la demande
          </h2>
          <ol className="space-y-4 text-sm">
            {quote.events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-[11px] font-semibold">
                  {e.toStatus ? "•" : "•"}
                </span>
                <div>
                  <p className="font-medium">
                    {e.toStatus
                      ? STATUS_LABELS[e.toStatus]
                      : e.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateFr(e.createdAt)}
                  </p>
                </div>
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
    <li className="flex items-start gap-3">
      <Icon className="size-4 text-teal-600 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm">{children}</p>
      </div>
    </li>
  );
}
