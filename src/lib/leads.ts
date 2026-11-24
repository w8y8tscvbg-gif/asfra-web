import { z } from "zod";
import { SERVICE_SLUGS, STATE_CODES } from "./site";

/** Error messages are keys into the `validation` dictionary. */
const phone = z
  .string()
  .trim()
  .min(1, "required")
  .regex(/^\+?[\d\s().-]{7,20}$/, "phone");

const honeypot = z.string().max(0).optional();
const lang = z.enum(["es", "en"]);

export const quoteSchema = z.object({
  type: z.literal("quote"),
  name: z.string().trim().min(2, "required").max(80, "required"),
  phone,
  state: z.enum(STATE_CODES, { error: "required" }),
  service: z.enum(SERVICE_SLUGS, { error: "required" }),
  website: honeypot,
  lang,
});

export const agencySchema = z.object({
  type: z.literal("agency"),
  agencyName: z.string().trim().min(2, "required").max(120, "required"),
  state: z.enum(STATE_CODES, { error: "required" }),
  license: z.string().trim().min(2, "required").max(40, "required"),
  whatsapp: phone,
  email: z.email({ error: "email" }),
  capacity: z.number({ error: "number" }).int("number").min(1, "number").max(10000, "number"),
  website: honeypot,
  lang,
});

export const leadSchema = z.discriminatedUnion("type", [quoteSchema, agencySchema]);

export type QuoteLead = z.infer<typeof quoteSchema>;
export type AgencyLead = z.infer<typeof agencySchema>;
export type Lead = z.infer<typeof leadSchema>;
export type ValidationKey = "required" | "phone" | "email" | "number";
