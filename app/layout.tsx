import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { BUSINESS, SITE_URL } from "@/lib/utils";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { CookieBanner } from "@/components/gdpr/CookieBanner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1d8080",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    template: `%s · ${BUSINESS.name}`,
  },
  description:
    "Rezoli, traiteur premium en Tunisie pour vos événements professionnels : cocktails dînatoires, pauses café, pauses déjeuner et stations street-food sur-mesure.",
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.legalName }],
  generator: "Next.js",
  keywords: [
    "traiteur Tunis",
    "événements entreprise",
    "cocktail dînatoire",
    "pause café",
    "pause déjeuner",
    "street food",
    "catering Tunisie",
  ],
  openGraph: {
    type: "website",
    locale: "fr_TN",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    description:
      "Traiteur premium pour entreprises et événements en Tunisie. Cocktails, pauses café, déjeuners et stations street-food.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${BUSINESS.name} — Traiteur événementiel`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    description:
      "Traiteur premium pour entreprises et événements en Tunisie.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/blog/feed.xml", title: `${BUSINESS.name} — Blog` },
      ],
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground antialiased flex flex-col">
        <a href="#main" className="skip-link">
          Aller au contenu principal
        </a>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          theme="light"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
            },
          }}
        />
        <CookieBanner />
        <GoogleAnalytics />
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
