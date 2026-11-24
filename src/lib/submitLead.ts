import "server-only";
import type { Lead } from "./leads";

export type SubmitResult = { ok: true } | { ok: false; reason: "not_configured" | "delivery_failed" };

/**
 * Single place where form submissions leave the site.
 *
 * DESTINATION PENDING: ASFRA has not chosen where leads should go yet (email, CRM or Google Sheets).
 * Set LEAD_WEBHOOK_URL to any endpoint that accepts a JSON POST (Zapier, Make, Google Apps Script,
 * a CRM webhook...). Without it, development logs the lead and production refuses it, so the visitor
 * is told to use WhatsApp instead of a lead being silently lost.
 */
export async function submitLead(lead: Lead): Promise<SubmitResult> {
  const url = process.env.LEAD_WEBHOOK_URL;
  const payload = { ...lead, website: undefined, receivedAt: new Date().toISOString(), source: "asfraservices.com" };

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
