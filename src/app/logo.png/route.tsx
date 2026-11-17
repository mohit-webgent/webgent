import { ImageResponse } from "next/og";

// The square brand mark used as the Organization logo in structured data. Search engines want a
// real logo here, not the wide social-share banner. Same orange "W" as the favicon.
export const dynamic = "force-static";

const SIZE = 512;

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F26A1F",
          color: "#140802",
          fontSize: 340,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        W
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    },
  );
}
