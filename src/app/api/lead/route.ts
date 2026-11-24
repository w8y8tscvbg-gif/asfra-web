import { leadSchema } from "@/lib/leads";
import { submitLead } from "@/lib/submitLead";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success and drop it.
  if (body && typeof body === "object" && "website" in body && (body as { website?: string }).website) {
    return Response.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 422 });
  }

  const result = await submitLead(parsed.data);
  if (!result.ok) return Response.json({ ok: false, error: result.reason }, { status: 503 });
  return Response.json({ ok: true });
}
