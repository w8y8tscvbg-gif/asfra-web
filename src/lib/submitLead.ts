import "server-only";
import es from "@/i18n/dictionaries/es";
import type { Lead } from "./leads";
import { STATES, type ServiceSlug } from "./site";

export type SubmitResult = { ok: true } | { ok: false; reason: "not_configured" | "delivery_failed" };

/** US numbers typed as 10 digits (or 1 + 10) become E.164 (+1...), which is what CRMs expect. */
function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.trim().startsWith("+") ? `+${digits}` : digits;
}

/**
 * Option values of the "Requested Service" dropdown (contact.requested_service) in ASFRA's
 * GoHighLevel sub-account. The "Auto New Lead Processing" workflow branches on these exact values.
 * ITIN has no option of its own there, so it maps to "Other".
 */
const GHL_REQUESTED_SERVICE: Record<ServiceSlug, string> = {
  "seguros-de-auto": "Auto Insurance",
  "asistencia-en-accidentes": "Accident Attorney",
  "creacion-de-llc": "LLC Formation",
  "numero-ein": "EIN Registration",
  "tramite-de-itin": "Other",
  taxes: "Tax Preparation",
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

/**
 * Flat payload with the same keys for both forms, so the CRM (GoHighLevel inbound webhook)
 * can map them once: name, phone, email, state, service, lead type, etc.
 */
export function toCrmPayload(lead: Lead) {
  const state = STATES.find((s) => s.code === lead.state);
  const base = {
    source: "asfraservices.com",
    received_at: new Date().toISOString(),
    language: lead.lang,
    state_code: lead.state,
    state_name: state?.name ?? lead.state,
  };

  if (lead.type === "quote") {
    const n = splitName(lead.name);
    return {
      ...base,
      lead_type: "cotizacion",
      lead_type_label: "Cotización web",
      full_name: lead.name.trim(),
      first_name: n.first,
      last_name: n.last,
      phone: normalizePhone(lead.phone),
      email: "",
      service_slug: lead.service,
      service_name: es.serviceList[lead.service].name,
      requested_service: GHL_REQUESTED_SERVICE[lead.service],
      agency_name: "",
      license_number: "",
      weekly_capacity: "",
    };
  }

  return {
    ...base,
    lead_type: "agencia",
    lead_type_label: "Registro de agencia",
    full_name: lead.agencyName.trim(),
    first_name: lead.agencyName.trim(),
    last_name: "",
    phone: normalizePhone(lead.whatsapp),
    email: lead.email.trim().toLowerCase(),
    service_slug: "",
    service_name: "",
    requested_service: "",
    agency_name: lead.agencyName.trim(),
    license_number: lead.license.trim(),
    weekly_capacity: String(lead.capacity),
  };
}

/**
 * Single place where form submissions leave the site: a JSON POST to LEAD_WEBHOOK_URL
 * (the GoHighLevel workflow's Inbound Webhook). Without it, development logs the lead and
 * production refuses it, so the visitor is sent to WhatsApp instead of a lead being silently lost.
 */
export async function submitLead(lead: Lead): Promise<SubmitResult> {
  const url = process.env.LEAD_WEBHOOK_URL;
  const payload = toCrmPayload(lead);

  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[lead] LEAD_WEBHOOK_URL not set; lead not delivered (dev only):", payload);
      return { ok: true };
    }
    console.error("[lead] LEAD_WEBHOOK_URL is not configured; lead rejected.");
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[lead] webhook responded", res.status);
      return { ok: false, reason: "delivery_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[lead] webhook error", err);
    return { ok: false, reason: "delivery_failed" };
  }
}
