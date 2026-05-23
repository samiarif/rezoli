"use client";

import type { QuoteDetails } from "@/lib/schemas";
import type { ServiceSlug } from "@/lib/service-catalog";

export type FlowStep = 1 | 2 | 3;

export type FlowState = {
  service: ServiceSlug;
  step: FlowStep;
  // Step 1
  eventDate: string;
  eventTime: string;
  location: string;
  guestCount: number;
  withVerrerie: boolean; // pauses-cafe only
  // Step 2
  formulaId:
    | "essentielle"
    | "business"
    | "premium"
    | "signature"
    | "personnalise"
    | null;
  details: QuoteDetails | null;
  // Customization modal open?
  modalOpen: boolean;
  // Contact (collected in Step 1 — leadmagnet capture)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  consentRgpd: boolean;
  // HubSpot lead identity (populated by pushStep1Lead)
  hubspotContactId: string | null;
};

export type FlowAction =
  | { type: "GO_STEP"; step: FlowStep }
  | { type: "SET_EVENT"; patch: Partial<Pick<FlowState, "eventDate" | "eventTime" | "location" | "guestCount" | "withVerrerie">> }
  | { type: "PICK_PREBUILT"; formulaId: "essentielle" | "business" | "premium" | "signature"; details: QuoteDetails }
  | { type: "OPEN_MODAL" }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_CUSTOM_DETAILS"; details: QuoteDetails }
  | { type: "SET_CONTACT"; patch: Partial<Pick<FlowState, "firstName" | "lastName" | "email" | "phone" | "company" | "message" | "consentRgpd">> }
  | { type: "SET_HUBSPOT_CONTACT_ID"; id: string | null }
  | { type: "RESET" };

export function makeInitialState(service: ServiceSlug, preselect?: string): FlowState {
  const formulaId =
    preselect && ["essentielle", "business", "premium", "signature"].includes(preselect)
      ? (preselect as FlowState["formulaId"])
      : null;
  return {
    service,
    step: 1,
    eventDate: "",
    eventTime: "",
    location: "",
    guestCount: 0,
    withVerrerie: false,
    formulaId,
    details: null,
    modalOpen: false,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    consentRgpd: false,
    hubspotContactId: null,
  };
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "GO_STEP":
      return { ...state, step: action.step };
    case "SET_EVENT":
      return { ...state, ...action.patch };
    case "PICK_PREBUILT":
      return {
        ...state,
        formulaId: action.formulaId,
        details: action.details,
      };
    case "OPEN_MODAL":
      return { ...state, modalOpen: true };
    case "CLOSE_MODAL":
      return { ...state, modalOpen: false };
    case "SET_CUSTOM_DETAILS":
      return {
        ...state,
        formulaId: "personnalise",
        details: action.details,
        modalOpen: false,
      };
    case "SET_CONTACT":
      return { ...state, ...action.patch };
    case "SET_HUBSPOT_CONTACT_ID":
      return { ...state, hubspotContactId: action.id };
    case "RESET":
      return makeInitialState(state.service);
  }
}

// helpers
export function isContactValid(s: FlowState): boolean {
  const emailLike = /.+@.+\..+/.test(s.email.trim());
  return (
    s.firstName.trim().length >= 1 &&
    s.lastName.trim().length >= 1 &&
    emailLike &&
    s.phone.trim().length >= 6
  );
}

/**
 * Minimum event date is +48h from now (rolled forward to start-of-day).
 * Returned as `YYYY-MM-DD` for direct use in <input type="date" min={...}>.
 */
export function minEventDateISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

/**
 * Validates the event date string against the +48h rule.
 * Empty string returns `null` (no error to show yet).
 * `"past"` → date is in the past; `"too-soon"` → within 48h.
 */
export function eventDateError(
  eventDate: string
): "past" | "too-soon" | null {
  if (!eventDate) return null;
  const parsed = new Date(eventDate + "T00:00:00");
  if (Number.isNaN(parsed.getTime())) return "past";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed.getTime() < today.getTime()) return "past";
  const min = new Date();
  min.setDate(min.getDate() + 2);
  min.setHours(0, 0, 0, 0);
  if (parsed.getTime() < min.getTime()) return "too-soon";
  return null;
}

export function isStep1Valid(s: FlowState, minGuests: number): boolean {
  return (
    isContactValid(s) &&
    !!s.eventDate &&
    eventDateError(s.eventDate) === null &&
    !!s.eventTime &&
    s.location.trim().length >= 2 &&
    s.guestCount >= minGuests
  );
}

export function isStep2Valid(s: FlowState): boolean {
  return !!s.formulaId && !!s.details;
}
