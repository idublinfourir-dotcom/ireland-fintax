import { ImageResponse } from "next/og";

/* The picture shown when a page is shared (Open Graph, and X through
   twitter-image.tsx). Blog posts use their own cover instead. English, like
   the site's default title; brand colours from globals.css. */

export const alt = "Irish Fintax: learn how Irish tax and money work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0b0d14 0%, #14171f 60%, #1b2350 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>IRISH</div>
          <div style={{ fontSize: 18, letterSpacing: 6, color: "#a1afff" }}>FINTAX</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Learn how Irish tax and money work.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, lineHeight: 1.35, color: "#c9cfe6" }}>
            Free calculators and plain-English guides: income tax, VAT, CGT, mortgages and more.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: "#a1afff" }}>
          <div style={{ width: 48, height: 4, background: "#2540a8", marginRight: 16 }} />
          irishfintax.ie
        </div>
      </div>
    ),
    size,
  );
}
