export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Builds a public URL path for a locale. Spanish has no prefix; English lives under /en. */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}

/** Strips the locale prefix from a browser pathname. */
export function stripLocale(pathname: string): string {
  for (const l of locales) {
    if (l === defaultLocale) continue;
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname || "/";
}

export function localeFromPathname(pathname: string): Locale {
  for (const l of locales) {
    if (l !== defaultLocale && (pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return l;
  }
  return defaultLocale;
}
