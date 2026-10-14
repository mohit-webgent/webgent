import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#080808",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F5F5F3",
          fontWeight: 800,
          borderRadius: 6,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        W
      </div>
    ),
    {
      ...size,
    },
  );
}
