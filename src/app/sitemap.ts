import type { MetadataRoute } from "next";
import { localePath, locales } from "@/i18n/config";
import { SERVICE_SLUGS, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/agencias", "/contacto", ...SERVICE_SLUGS.map((s) => `/servicios/${s}`)];
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: `${SITE_URL}${localePath(l, p) === "/" ? "" : localePath(l, p)}`,
      alternates: {
        languages: Object.fromEntries(locales.map((x) => [x, `${SITE_URL}${localePath(x, p) === "/" ? "" : localePath(x, p)}`])),
      },
      priority: p === "/" ? 1 : 0.7,
    })),
  );
}
