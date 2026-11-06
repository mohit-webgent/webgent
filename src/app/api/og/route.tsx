import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title")?.slice(0, 100) || "Webgent — Modern Web Development";
    const badge = searchParams.get("badge")?.slice(0, 40) || "Engineering Architecture";
    const desc =
      searchParams.get("desc")?.slice(0, 180) ||
      "Bespoke digital platforms, high-performance web applications, and resilient cloud infrastructure.";
    const author = searchParams.get("author")?.slice(0, 50) || null;

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#040405",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(242, 106, 31, 0.25) 0%, rgba(4, 4, 5, 0) 70%)",
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
            background:
              "radial-gradient(circle, rgba(255, 128, 56, 0.2) 0%, rgba(4, 4, 5, 0) 70%)",
          }}
        />

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
                background: "linear-gradient(135deg, #F26A1F 0%, #FF8038 100%)",
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: 800,
                boxShadow: "0 10px 25px rgba(242, 106, 31, 0.4)",
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
              backgroundColor: "rgba(242, 106, 31, 0.15)",
              border: "1px solid rgba(242, 106, 31, 0.4)",
              color: "#FF9F57",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </div>
        </div>

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
              fontSize: title.length > 50 ? "48px" : "58px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "22px",
              lineHeight: 1.5,
              color: "#C4C2BC",
              fontWeight: 400,
            }}
          >
            {desc}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(43, 43, 47, 0.7)",
            paddingTop: "24px",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#F0EEE8",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#F26A1F" }}>webgent.com</span>
            {author && <span style={{ fontSize: "16px", color: "#96948E" }}>• By {author}</span>}
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#96948E",
              fontWeight: 500,
            }}
          >
            High-Performance Web & Cloud Architecture
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Failed to generate dynamic OG image:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
