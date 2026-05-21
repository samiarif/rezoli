import type { BadgeProps } from "@/components/ui/badge";

export const STATUS_LABELS = {
  PENDING: "En attente",
  REVIEWED: "En cours d'étude",
  QUOTE_SENT: "Devis envoyé",
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
} as const;

export type Status = keyof typeof STATUS_LABELS;

export function statusBadgeVariant(status: Status): BadgeProps["variant"] {
  switch (status) {
    case "PENDING":
      return "neutral";
    case "REVIEWED":
      return "amber";
    case "QUOTE_SENT":
      return "default";
    case "CONFIRMED":
      return "success";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "danger";
  }
}

export const STATUS_ORDER: Status[] = [
  "PENDING",
  "REVIEWED",
  "QUOTE_SENT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];
