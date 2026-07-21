import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          borderRadius: 96,
        }}
      >
        <div style={{ display: "flex", fontSize: 272 }}>🏋️</div>
      </div>
    ),
    { ...size },
  );
}
