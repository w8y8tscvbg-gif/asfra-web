import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hasLocale } from "@/i18n/config";

export const alt = "ASFRA SERVICES LLC · We connect. You grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource");

const copy = {
  es: {
    title: "Soluciones para ti y tu negocio",
    services: "Seguros de auto · LLC · EIN · ITIN · Taxes",
  },
  en: {
    title: "Solutions for you and your business",
    services: "Auto insurance · LLC · EIN · ITIN · Taxes",
  },
};

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = copy[hasLocale(lang) ? lang : "es"];

  const [display, displayMedium, body, logo] = await Promise.all([
    readFile(join(fontDir, "space-grotesk/files/space-grotesk-latin-700-normal.woff")),
    readFile(join(fontDir, "space-grotesk/files/space-grotesk-latin-500-normal.woff")),
    readFile(join(fontDir, "inter/files/inter-latin-500-normal.woff")),
    // Original ASFRA logo, only scaled down (see public/brand/).
    readFile(join(process.cwd(), "public/brand/asfra-logo-512.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          gap: 64,
          backgroundColor: "#0e1a3d",
          backgroundImage:
            "radial-gradient(circle at 85% 0%, #0a2f87 0%, rgba(14,26,61,0) 60%), radial-gradient(circle at 0% 100%, rgba(0,93,255,0.35) 0%, rgba(14,26,61,0) 55%)",
          color: "#fff",
          fontFamily: "Inter",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontFamily: "Space Grotesk Medium",
              fontSize: 22,
              letterSpacing: 4,
              color: "#4d8dff",
              textTransform: "uppercase",
            }}
          >
            ASFRA SERVICES LLC
          </div>
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 72,
              lineHeight: 1,
              letterSpacing: -2,
              marginTop: 20,
            }}
          >
            {t.title}
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,0.75)", marginTop: 28 }}>{t.services}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 44 }}>
            <div style={{ width: 48, height: 3, backgroundColor: "#005dff" }} />
            <div style={{ fontFamily: "Space Grotesk Medium", fontSize: 26, color: "#4d8dff" }}>We connect. You grow.</div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", marginLeft: 18 }}>asfraservices.com</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: display, style: "normal", weight: 700 },
        { name: "Space Grotesk Medium", data: displayMedium, style: "normal", weight: 500 },
        { name: "Inter", data: body, style: "normal", weight: 500 },
      ],
    },
  );
}
