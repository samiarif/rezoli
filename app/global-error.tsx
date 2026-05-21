"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
    }
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf7f1",
          color: "#0f0b0b",
        }}
      >
        <div style={{ maxWidth: 480, padding: 24, textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: -1,
              margin: "0 0 12px",
            }}
          >
            Erreur critique
          </h1>
          <p style={{ color: "#5e5a52", lineHeight: 1.6, margin: "0 0 24px" }}>
            Une erreur grave est survenue. Rechargez la page ou revenez plus
            tard.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#1d8080",
              color: "#fff",
              border: 0,
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
