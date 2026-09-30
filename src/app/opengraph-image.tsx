import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Webgent — Elite Web Solutions & Engineering Architecture";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#030712",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glows */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(3, 7, 18, 0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(3, 7, 18, 0) 70%)",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: 800,
                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)",
              }}
            >
              W
            </div>
            <span
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              Webgent
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#a5b4fc",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Elite Web Architecture
          </div>
        </div>

        {/* Main Banner Message */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            zIndex: 10,
            maxWidth: "1000px",
            margin: "auto 0",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            Engineering High-Performance Web Applications & Cloud Systems
          </div>

          <div
            style={{
              fontSize: "22px",
              lineHeight: 1.5,
              color: "#94a3b8",
              fontWeight: 400,
            }}
          >
            Custom enterprise software, modern Next.js platforms, and conversion-engineered digital experiences.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(51, 65, 85, 0.7)",
            paddingTop: "24px",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#e2e8f0" }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#818cf8" }}>
              webgent.com
            </span>
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            Next-Gen Web Solutions & Engineering
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
