/**
 * Canonical list of admin-side rejection reasons for QuoteRequest.CANCELLED.
 *
 * The 15 entries match Sami's specification verbatim — labels are shown in
 * the admin UI radio list and re-used in the rejection email body sent to
 * the customer. The enum keys are also pushed to HubSpot as
 * `hs_closed_lost_reason` (or a custom property).
 */

export const REJECTION_REASONS = [
  {
    key: "DATE_UNAVAILABLE",
    label: "Indisponibilité sur la date demandée",
  },
  {
    key: "LOGISTIC_CAPACITY",
    label: "Capacité logistique atteinte pour cette période",
  },
  {
    key: "ZONE_UNCOVERED",
    label: "Zone de livraison ou d'intervention non couverte",
  },
  {
    key: "MIN_QUANTITY_NOT_MET",
    label: "Quantité minimale non atteinte pour ce type de prestation",
  },
  {
    key: "TOO_LATE",
    label:
      "Demande reçue trop tard par rapport au délai nécessaire de préparation",
  },
  {
    key: "PARTNERS_UNAVAILABLE",
    label: "Prestataires partenaires indisponibles pour ce format d'événement",
  },
  {
    key: "TECHNICAL_CONSTRAINTS",
    label: "Contraintes techniques ou logistiques incompatibles avec la demande",
  },
  {
    key: "BUDGET_INSUFFICIENT",
    label:
      "Budget proposé ne permettant pas d'assurer la qualité de service souhaitée",
  },
  {
    key: "FORMAT_NOT_OFFERED",
    label:
      "Format de l'événement ne correspondant pas aux prestations proposées par Rezoli",
  },
  {
    key: "EQUIPMENT_UNAVAILABLE",
    label:
      "Demande nécessitant des équipements ou ressources non disponibles actuellement",
  },
  {
    key: "VENUE_CONDITIONS",
    label:
      "Conditions du lieu ne permettant pas d'assurer le service dans de bonnes conditions",
  },
  {
    key: "PRIORITY_CONFLICT",
    label: "Priorisation d'événements déjà confirmés sur la même période",
  },
  {
    key: "INCOMPLETE_INFO",
    label: "Informations incomplètes malgré plusieurs relances",
  },
  {
    key: "OUT_OF_SCOPE",
    label: "Demande en dehors du périmètre d'activité actuel de Rezoli",
  },
  {
    key: "GUEST_COUNT_TOO_HIGH",
    label:
      "Nombre d'invités trop élevé par rapport à la capacité opérationnelle disponible",
  },
] as const;

export type RejectionReasonKey = (typeof REJECTION_REASONS)[number]["key"];

export const REJECTION_REASON_LABEL: Record<RejectionReasonKey, string> =
  Object.fromEntries(REJECTION_REASONS.map((r) => [r.key, r.label])) as Record<
    RejectionReasonKey,
    string
  >;

export function isRejectionReason(value: unknown): value is RejectionReasonKey {
  return (
    typeof value === "string" &&
    REJECTION_REASONS.some((r) => r.key === value)
  );
}
