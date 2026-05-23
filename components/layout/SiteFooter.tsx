import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { BUSINESS } from "@/lib/utils";

// Brand icons dropped from lucide v1 — ship minimal inline SVGs.
const Instagram = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const Facebook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Linkedin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FOOTER_NAV = [
  {
    heading: "Services",
    links: [
      { href: "/nos-services/cocktails-dinatoires", label: "Cocktails dînatoires" },
      { href: "/nos-services/pauses-cafe", label: "Pauses café" },
      { href: "/nos-services/pauses-dejeuner", label: "Pauses déjeuner" },
      { href: "/nos-services/stations-street-food", label: "Stations street-food" },
    ],
  },
  {
    heading: "Société",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/nos-packs", label: "Nos packs" },
      { href: "/realisations", label: "Réalisations" },
      { href: "/blog", label: "Blog" },
      { href: "/nos-partenaires", label: "Partenaires" },
      { href: "/devenir-partenaire", label: "Devenir partenaire" },
    ],
  },
  {
    heading: "Légal",
    links: [
      { href: "/cgu", label: "CGU" },
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/politique-confidentialite", label: "Confidentialité" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-neutral-900 text-cream-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand block */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              aria-label={BUSINESS.name}
              className="inline-flex items-center transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo-rezoli.png"
                alt={BUSINESS.name}
                width={1131}
                height={348}
                sizes="180px"
                className="h-10 w-auto invert brightness-0"
              />
            </Link>
            <p className="mt-4 text-sm text-cream-50/70 max-w-xs leading-relaxed">
              {BUSINESS.tagline}. Traiteur premium pour vos événements
              professionnels en Tunisie.
            </p>
            <div className="mt-6 space-y-2 text-sm text-cream-50/80">
              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Mail className="size-4" />
                {BUSINESS.email}
              </a>
              <a
                href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Phone className="size-4" />
                {BUSINESS.phoneDisplay}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="size-4" />
                {BUSINESS.address.locality}, {BUSINESS.address.region}
              </span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={BUSINESS.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full bg-white/10 p-2 hover:bg-amber-500 transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={BUSINESS.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full bg-white/10 p-2 hover:bg-amber-500 transition-colors"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href={BUSINESS.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded-full bg-white/10 p-2 hover:bg-amber-500 transition-colors"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500/90">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream-50/75 hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-cream-50/50">
          <p>
            © {new Date().getFullYear()} {BUSINESS.legalName}. Tous droits
            réservés.
          </p>
          <p>
            Fait avec passion en Tunisie 🇹🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
