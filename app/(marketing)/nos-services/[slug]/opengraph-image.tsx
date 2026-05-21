import { ImageResponse } from "next/og";
import { getServiceMeta } from "@/lib/service-catalog";
import { BUSINESS } from "@/lib/utils";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ServiceOG({
  params,
}: {
  params: { slug: string };
}) {
  const svc = getServiceMeta(params.slug);
  const title = svc?.name ?? "Service Rezoli";
  const tagline = svc?.tagline ?? BUSINESS.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #145c5c 0%, #1d8080 70%, #4fb3b3 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
            {BUSINESS.name}
            <span style={{ color: "#c98a2c" }}>.</span>
          </div>
          <div
            style={{
              fontSize: 14,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              fontFamily: "sans-serif",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Service
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              marginBottom: 18,
              fontSize: 22,
              fontFamily: "sans-serif",
              color: "#fbf7f1",
              opacity: 0.9,
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.02,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    size
  );
}
