import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin · Messages",
  robots: { index: false, follow: false },
};

const STATUS_LABELS = {
  NEW: "Nouveau",
  READ: "Lu",
  REPLIED: "Répondu",
  ARCHIVED: "Archivé",
} as const;

const STATUS_VARIANT = {
  NEW: "amber",
  READ: "neutral",
  REPLIED: "success",
  ARCHIVED: "neutral",
} as const;

export default async function AdminMessagesPage() {
  const msgs = await loadMessages();
  return (
    <div className="px-6 sm:px-10 py-8">
      <header className="mb-6">
        <h1 className="display-2">Messages reçus</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {msgs.length} message{msgs.length > 1 ? "s" : ""}.
        </p>
      </header>
      {msgs.length === 0 ? (
        <div className="rounded-xl bg-background ring-1 ring-border p-12 text-center text-muted-foreground">
          Aucun message pour l&apos;instant.
        </div>
      ) : (
        <ul className="space-y-3">
          {msgs.map((m) => (
            <li
              key={m.id}
              className="rounded-xl bg-background ring-1 ring-border p-5"
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div>
                  <p className="font-semibold">{m.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.name} · {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant={STATUS_VARIANT[m.status]}>
                    {STATUS_LABELS[m.status]}
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatDateFr(m.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {m.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function loadMessages() {
  if (!process.env.DATABASE_URL) {
    const { DEMO_MESSAGES } = await import("@/lib/demo-fixtures");
    return [...DEMO_MESSAGES].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err) {
    console.error("[admin/messages] failed", err);
    return [];
  }
}
