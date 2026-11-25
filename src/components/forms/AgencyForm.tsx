"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { btn } from "@/components/ui/styles";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { fmt } from "@/lib/fmt";
import { agencySchema, type AgencyLead, type ValidationKey } from "@/lib/leads";
import { STATES, whatsappLink, type StateCode } from "@/lib/site";
import { Field, Honeypot, inputCls, SelectWrap } from "./Field";

type Props = {
  lang: Locale;
  t: Pick<Dictionary, "agencyForm" | "validation" | "quote">;
  onStateChange?: (s: StateCode | null) => void;
};

const STEP1 = ["agencyName", "state", "license"] as const;

/** Agency registration. On phones it is split into two steps; on larger screens all fields show at once. */
export function AgencyForm({ lang, t, onStateChange }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<AgencyLead>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      type: "agency",
      lang,
      agencyName: "",
      state: "" as AgencyLead["state"],
      license: "",
      whatsapp: "",
      email: "",
      website: "",
    },
  });

  const msg = (k?: string) => (k ? t.validation[k as ValidationKey] ?? t.validation.required : undefined);
  const id = (n: string) => `ag-${n}`;
  const aria = (n: keyof AgencyLead) =>
    errors[n] ? { "aria-invalid": true as const, "aria-describedby": `${id(n)}-error` } : {};

  const stateReg = register("state", {
    onChange: (e) => onStateChange?.((e.target.value || null) as StateCode | null),
  });

  const next = async () => {
    if (await trigger([...STEP1])) setStep(2);
  };

  const onInvalid = (errs: Partial<Record<keyof AgencyLead, unknown>>) => {
    if (STEP1.some((k) => k in errs)) setStep(1);
  };

  const onSubmit = async (data: AgencyLead) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="py-2">
        <CheckCircle2 className="size-10 text-royal" aria-hidden />
        <p className="mt-4 font-display text-2xl font-bold leading-tight">{t.agencyForm.success}</p>
      </div>
    );
  }

  const hideOnMobile = (group: 1 | 2) => (step !== group ? "max-md:hidden" : "");

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="relative">
      <Honeypot register={register("website")} />
      <p className="mb-5 text-sm text-navy/60 md:hidden" aria-live="polite">
        {fmt(t.agencyForm.step, { n: step })}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <fieldset className="contents">
          <Field id={id("agencyName")} label={t.agencyForm.agencyName} error={msg(errors.agencyName?.message)} className={hideOnMobile(1)}>
            <input id={id("agencyName")} autoComplete="organization" className={inputCls} {...aria("agencyName")} {...register("agencyName")} />
          </Field>
          <Field id={id("state")} label={t.agencyForm.state} error={msg(errors.state?.message)} className={hideOnMobile(1)}>
            <SelectWrap>
              <select id={id("state")} className={`${inputCls} appearance-none pr-10`} {...aria("state")} {...stateReg}>
                <option value="" disabled className="text-navy">
                  {t.agencyForm.selectState}
                </option>
                {STATES.map((s) => (
                  <option key={s.code} value={s.code} className="text-navy">
                    {s.name}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </Field>
          <Field id={id("license")} label={t.agencyForm.license} error={msg(errors.license?.message)} className={hideOnMobile(1)}>
            <input id={id("license")} className={inputCls} {...aria("license")} {...register("license")} />
          </Field>
        </fieldset>

        <fieldset className="contents">
          <Field id={id("whatsapp")} label={t.agencyForm.whatsapp} error={msg(errors.whatsapp?.message)} className={hideOnMobile(2)}>
            <input id={id("whatsapp")} type="tel" inputMode="tel" autoComplete="tel" className={inputCls} {...aria("whatsapp")} {...register("whatsapp")} />
          </Field>
          <Field id={id("email")} label={t.agencyForm.email} error={msg(errors.email?.message)} className={hideOnMobile(2)}>
            <input id={id("email")} type="email" inputMode="email" autoComplete="email" className={inputCls} {...aria("email")} {...register("email")} />
          </Field>
          <Field id={id("capacity")} label={t.agencyForm.capacity} error={msg(errors.capacity?.message)} className={`md:col-span-2 ${hideOnMobile(2)}`}>
            <input
              id={id("capacity")}
              type="number"
              inputMode="numeric"
              min={1}
              className={inputCls}
              {...aria("capacity")}
              {...register("capacity", { valueAsNumber: true })}
            />
          </Field>
        </fieldset>
      </div>

      <div className="mt-6 flex gap-3">
        {step === 1 ? (
          <button type="button" onClick={next} className={`${btn.primary} w-full md:hidden`}>
            {t.agencyForm.next}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : (
          <button type="button" onClick={() => setStep(1)} className={`${btn.ghost} md:hidden`} aria-label={t.agencyForm.back}>
            <ArrowLeft className="size-4" aria-hidden />
          </button>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className={`${btn.primary} flex-1 md:w-full ${step === 1 ? "max-md:hidden" : ""}`}
        >
          {status === "sending" ? t.agencyForm.sending : t.agencyForm.submit}
        </button>
      </div>

      {status === "error" ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {t.agencyForm.error}{" "}
          <a href={whatsappLink(t.quote.whatsappText)} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">
            WhatsApp
          </a>
        </p>
      ) : null}
    </form>
  );
}
