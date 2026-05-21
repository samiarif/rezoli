import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTND(amount: number | null | undefined): string {
  if (amount == null) return "Sur devis";
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rezoli.tn";

export const BUSINESS = {
  name: "Rezoli",
  legalName: "Société Rezoli Solution",
  tagline: "Vos événements prennent goût",
  email: "contact@rezoli.tn",
  phone: "+216 57 095 240",
  phoneDisplay: "+216 57 095 240",
  address: {
    street: "Tunis",
    region: "Tunisie",
    country: "TN",
    locality: "Tunis",
  },
  social: {
    instagram: "https://www.instagram.com/rezoli.tn",
    facebook: "https://www.facebook.com/rezoli.tn",
    linkedin: "https://www.linkedin.com/company/rezoli",
  },
  tva: 19, // Tunisia standard rate; will be configurable in production
} as const;
