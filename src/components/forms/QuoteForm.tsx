"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { WhatsAppIcon } from "@/components/ui/icons";
import { btn } from "@/components/ui/styles";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { fmt } from "@/lib/fmt";
import { quoteSchema, type QuoteLead, type ValidationKey } from "@/lib/leads";
import { SERVICE_SLUGS, STATES, whatsappLink, type ServiceSlug } from "@/lib/site";
import { Field, Honeypot, inputCls, SelectWrap } from "./Field";

type Props = {
  lang: Locale;
  t: Pick<Dictionary, "quote" | "validation">;
  serviceNames: Record<ServiceSlug, string>;
  defaultService?: ServiceSlug;
  idPrefix?: string;
};

export function QuoteForm({ lang, t, serviceNames, defaultService, idPrefix = "q" }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sent, setSent] = useState<QuoteLead | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteLead>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      type: "quote",
      lang,
      name: "",
      phone: "",
      state: "" as QuoteLead["state"],
      service: (defaultService ?? "") as QuoteLead["service"],
      website: "",
    },
  });

  const msg = (k?: string) => (k ? t.validation[k as ValidationKey] ?? t.validation.required : undefined);
  const id = (n: string) => `${idPrefix}-${n}`;
  const aria = (n: keyof QuoteLead) =>
    errors[n] ? { "aria-invalid": true as const, "aria-describedby": `${id(n)}-error` } : {};

  const onSubmit = async (data: QuoteLead) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" && sent) {
    const stateName = STATES.find((s) => s.code === sent.state)?.name ?? sent.state;
    const text = fmt(t.quote.whatsappWithData, {
      name: sent.name,
      service: serviceNames[sent.service],
      state: stateName,
      phone: sent.phone,
    });
    return (
      <div role="status" className="py-2">
        <CheckCircle2 className="size-10 text-royal" aria-hidden />
        <p className="mt-4 font-display text-2xl font-bold leading-tight">{t.quote.success}</p>
        <a href={whatsappLink(text)} target="_blank" rel="noopener noreferrer" className={`${btn.ghost} mt-6`}>
          <WhatsAppIcon className="size-5 text-whatsapp" />
          {t.quote.sendByWhatsapp}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-4 sm:grid-cols-2">
      <Honeypot register={register("website")} />
      <Field id={id("name")} label={t.quote.name} error={msg(errors.name?.message)}>
        <input id={id("name")} autoComplete="name" className={inputCls} {...aria("name")} {...register("name")} />
      </Field>
      <Field id={id("phone")} label={t.quote.phone} error={msg(errors.phone?.message)}>
        <input id={id("phone")} type="tel" inputMode="tel" autoComplete="tel" className={inputCls} {...aria("phone")} {...register("phone")} />
      </Field>
      <Field id={id("state")} label={t.quote.state} error={msg(errors.state?.message)}>
        <SelectWrap>
          <select id={id("state")} className={`${inputCls} appearance-none pr-10`} {...aria("state")}
            {...register("state", {
              // Lights the chosen state on the home page's 3D map (no-op elsewhere).
              onChange: (e) => window.dispatchEvent(new CustomEvent("asfra:pick", { detail: e.target.value })),
            })}
          >
            <option value="" disabled className="text-navy">
              {t.quote.selectState}
            </option>
            {STATES.map((s) => (
              <option key={s.code} value={s.code} className="text-navy">
                {s.name}
              </option>
            ))}
          </select>
        </SelectWrap>
      </Field>
      <Field id={id("service")} label={t.quote.service} error={msg(errors.service?.message)}>
        <SelectWrap>
          <select id={id("service")} className={`${inputCls} appearance-none pr-10`} {...aria("service")} {...register("service")}>
            <option value="" disabled className="text-navy">
              {t.quote.selectService}
            </option>
            {SERVICE_SLUGS.map((s) => (
              <option key={s} value={s} className="text-navy">
                {serviceNames[s]}
              </option>
            ))}
          </select>
        </SelectWrap>
      </Field>

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className={`${btn.primary} w-full`}>
          {status === "sending" ? t.quote.sending : t.quote.submit}
        </button>
        {status === "error" ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {t.quote.error}{" "}
            <a href={whatsappLink(t.quote.whatsappText)} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">
              WhatsApp
            </a>
          </p>
        ) : null}
        <p className="mt-4 text-sm text-navy/60">
          {t.quote.preferWhatsapp}{" "}
          <a href={whatsappLink(t.quote.whatsappText)} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline decoration-whatsapp underline-offset-4">
            {t.quote.whatsappCta}
          </a>
        </p>
      </div>
    </form>
  );
}
