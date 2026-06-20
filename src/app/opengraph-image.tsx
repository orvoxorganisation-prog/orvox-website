import { ImageResponse } from "next/og";

export const alt = "ORVOX — Argue better. Win louder.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bars = [
  { h: 70, c: "#FFD02F" },
  { h: 150, c: "#FFD02F" },
  { h: 110, c: "#0FBCB0" },
  { h: 190, c: "#0FBCB0" },
  { h: 90, c: "#FFD02F" },
  { h: 140, c: "#0FBCB0" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0C0F",
          padding: 72,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* ghost bars */}
        <div style={{ position: "absolute", right: 64, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 18, opacity: 0.55 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ width: 44, height: b.h, borderRadius: 999, background: "#18191E" }} />
          ))}
        </div>

        {/* top mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 34 }}>
            <div style={{ width: 6, height: 14, borderRadius: 3, background: "#FFD02F" }} />
            <div style={{ width: 6, height: 30, borderRadius: 3, background: "#FFD02F" }} />
            <div style={{ width: 6, height: 20, borderRadius: 3, background: "#0FBCB0" }} />
            <div style={{ width: 6, height: 34, borderRadius: 3, background: "#0FBCB0" }} />
          </div>
          <div style={{ color: "#fff", fontSize: 30, fontStyle: "italic", fontWeight: 700, letterSpacing: -1 }}>
            rvox
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", color: "#fff" }}>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            <span>Argue&nbsp;</span>
            <span style={{ color: "#FFD02F", fontStyle: "italic" }}>better.</span>
          </div>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            <span>Win&nbsp;</span>
            <span style={{ color: "#0FBCB0", fontStyle: "italic" }}>louder.</span>
          </div>
        </div>

        {/* bottom strap */}
        <div style={{ display: "flex", color: "#6B6F7A", fontSize: 24, letterSpacing: 2, textTransform: "uppercase" }}>
          Debate &amp; public speaking · S03 · Mumbai
        </div>
      </div>
    ),
    size,
  );
}
