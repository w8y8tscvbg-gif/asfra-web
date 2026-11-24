export const SITE_URL = "https://asfraservices.com";

export const contact = {
  phoneDisplay: "650-460-3470",
  phoneE164: "+16504603470",
  whatsappUrl: "https://wa.me/16504603470",
  email: "info@asfraservices.com",
  instagramHandle: "@asfraservices",
  instagramUrl: "https://instagram.com/asfraservices",
} as const;

export function whatsappLink(text?: string) {
  return text ? `${contact.whatsappUrl}?text=${encodeURIComponent(text)}` : contact.whatsappUrl;
}

/** The 13 states ASFRA works in. `fips` matches the ids in us-atlas. */
export const STATES = [
  { code: "CA", fips: "06", name: "California" },
  { code: "TX", fips: "48", name: "Texas" },
  { code: "MS", fips: "28", name: "Mississippi" },
  { code: "AL", fips: "01", name: "Alabama" },
  { code: "FL", fips: "12", name: "Florida" },
  { code: "GA", fips: "13", name: "Georgia" },
  { code: "SC", fips: "45", name: "South Carolina" },
  { code: "NC", fips: "37", name: "North Carolina" },
  { code: "VA", fips: "51", name: "Virginia" },
  { code: "MD", fips: "24", name: "Maryland" },
  { code: "PA", fips: "42", name: "Pennsylvania" },
  { code: "NJ", fips: "34", name: "New Jersey" },
  { code: "CT", fips: "09", name: "Connecticut" },
] as const;

export type StateCode = (typeof STATES)[number]["code"];
export const STATE_CODES = STATES.map((s) => s.code) as unknown as [StateCode, ...StateCode[]];

export const SERVICE_SLUGS = [
  "seguros-de-auto",
  "asistencia-en-accidentes",
  "creacion-de-llc",
  "numero-ein",
  "tramite-de-itin",
  "taxes",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const hasService = (v: string): v is ServiceSlug =>
  (SERVICE_SLUGS as readonly string[]).includes(v);
