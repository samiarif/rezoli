/**
 * Lightweight cookie-consent state stored in localStorage.
 * Two categories: 'necessary' (always on) and 'analytics' (opt-in).
 */
export const CONSENT_KEY = "rezoli-cookie-consent-v2";

export type ConsentChoice = "all" | "necessary" | null;

export type ConsentState = {
  choice: ConsentChoice;
  analytics: boolean;
};

export function readConsent(): ConsentState {
  if (typeof window === "undefined") {
    return { choice: null, analytics: false };
  }
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return { choice: null, analytics: false };
    const choice = raw as ConsentChoice;
    return { choice, analytics: choice === "all" };
  } catch {
    return { choice: null, analytics: false };
  }
}

export function writeConsent(choice: Exclude<ConsentChoice, null>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* quota / private-mode */
  }
  // Notify listeners
  window.dispatchEvent(new CustomEvent("rezoli:consent", { detail: { choice } }));
}
