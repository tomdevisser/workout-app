import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const N = "M50,50 C78,44 84,16 50,6 C34,14 30,40 50,50 Z";
const E = "M50,50 C56,78 84,84 94,50 C86,34 60,30 50,50 Z";
const S = "M50,50 C22,56 16,84 50,94 C66,86 70,60 50,50 Z";
const W = "M50,50 C44,22 16,16 6,50 C14,66 40,70 50,50 Z";

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
          background: "#faf9f5",
          borderRadius: 96,
        }}
      >
        <svg width="368" height="368" viewBox="0 0 100 100">
          <path d={N} fill="#8bb073" />
          <path d={E} fill="#4e97a3" />
          <path d={S} fill="#b7afa1" />
          <path d={W} fill="#d97757" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
