import type { Metadata } from "next";
import { localePath, locales, type Locale } from "@/i18n/config";

/** Canonical URL plus hreflang alternates for a path that exists in every locale. */
export function alternates(lang: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(lang, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l === "es" ? "es-US" : "en-US", localePath(l, path)])),
      "x-default": localePath("es", path),
    },
  };
}
