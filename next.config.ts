import type { NextConfig } from "next";

const HTML_REDIRECTS: Array<{ source: string; destination: string }> = [
  { source: "/index.html", destination: "/" },
  { source: "/nos-services.html", destination: "/nos-services" },
  { source: "/cocktails-dinatoires.html", destination: "/nos-services/cocktails-dinatoires" },
  { source: "/pauses-cafe.html", destination: "/nos-services/pauses-cafe" },
  { source: "/pauses-dejeuner.html", destination: "/nos-services/pauses-dejeuner" },
  { source: "/stations-street-food.html", destination: "/nos-services/stations-street-food" },
  { source: "/nos-packs.html", destination: "/nos-packs" },
  { source: "/nos-partenaires.html", destination: "/nos-partenaires" },
  { source: "/devenir-partenaire.html", destination: "/devenir-partenaire" },
  { source: "/a-propos.html", destination: "/a-propos" },
  { source: "/contact.html", destination: "/contact" },
  { source: "/cgu.html", destination: "/cgu" },
  { source: "/mentions-legales.html", destination: "/mentions-legales" },
  { source: "/politique-confidentialite.html", destination: "/politique-confidentialite" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async redirects() {
    return HTML_REDIRECTS.map((r) => ({ ...r, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
