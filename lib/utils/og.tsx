import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = `${site.name} — ${site.role}`;

/** Fetch a static TTF from Google Fonts at build time; fall back to the default font if offline. */
async function loadFont(family: string, axes: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:${axes}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; og-image)" },
    }).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/** The share card: the hero's name set large, the role line, and the loader's chain of blocks. */
export async function renderOgImage() {
  const [display, mono] = await Promise.all([loadFont("Archivo", "wdth,wght@75,600"), loadFont("IBM+Plex+Mono", "wght@400")]);
  const fonts = [
    ...(display ? [{ name: "Archivo", data: display, weight: 600 as const, style: "normal" as const }] : []),
    ...(mono ? [{ name: "Plex", data: mono, weight: 400 as const, style: "normal" as const }] : []),
  ];
  const label = { fontFamily: mono ? "Plex" : undefined, fontSize: 18, letterSpacing: 1.5, color: "#8e897f" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0a",
          color: "#ece7dc",
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", ...label }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12, color: "#ece7dc" }}>
            <span style={{ width: 10, height: 10, background: "#ff5a1f" }} />
            ABUBAKAR
          </span>
          <span>{site.location.city.toUpperCase()} · {site.location.country.toUpperCase()}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: display ? "Archivo" : undefined,
              fontSize: 150,
              lineHeight: 0.86,
              letterSpacing: -2,
              textTransform: "uppercase",
            }}
          >
            <span>{site.firstName}</span>
            <span style={{ display: "flex", alignItems: "flex-end" }}>
              {site.lastName}
              <span style={{ width: 22, height: 22, background: "#ff5a1f", marginLeft: 6, marginBottom: 18 }} />
            </span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: "#ece7dc" }}>
            {site.positioning}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...label }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 ? <div style={{ width: 10, height: 1, background: "rgba(236,231,220,0.3)" }} /> : null}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: i === 11 ? "#ff5a1f" : "#ece7dc",
                    opacity: i === 11 ? 1 : 0.25 + i * 0.06,
                  }}
                />
              </div>
            ))}
          </div>
          <span style={{ color: "#ece7dc" }}>{site.url.replace("https://", "").toUpperCase()}</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
