import { ImageResponse } from "next/og";
import { getRealisationBySlug } from "@/lib/realisations";
import { BUSINESS } from "@/lib/utils";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function RealisationOG({
  params,
}: {
  params: { slug: string };
}) {
  const r = await getRealisationBySlug(params.slug);
  const title = r?.title ?? "Réalisation Rezoli";
  const eventType = r?.eventType ?? "";
  const guests = r?.guestCount ? `${r.guestCount} invités` : null;

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
            "linear-gradient(135deg, #0c3a3a 0%, #145c5c 50%, #c98a2c 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
            {BUSINESS.name}
            <span style={{ color: "#fbf7f1" }}>.</span>
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
            Réalisation
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              marginBottom: 16,
              fontSize: 20,
              fontFamily: "sans-serif",
              color: "#fbf7f1",
              opacity: 0.85,
            }}
          >
            {eventType}
            {guests ? ` · ${guests}` : ""}
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
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
