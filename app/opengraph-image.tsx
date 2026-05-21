import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/utils";

export const runtime = "edge";
export const alt = `${BUSINESS.name} — ${BUSINESS.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #145c5c 0%, #1d8080 60%, #c98a2c 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: -1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {BUSINESS.name}
          <span style={{ color: "#fbf7f1" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 920,
            }}
          >
            Vos événements prennent goût.
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              opacity: 0.85,
              fontFamily: "sans-serif",
            }}
          >
            Traiteur premium événementiel · Tunis
          </div>
        </div>
      </div>
    ),
    size
  );
}
