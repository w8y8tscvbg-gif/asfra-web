import { QuoteForm } from "@/components/forms/QuoteForm";
import { RevealText } from "@/components/motion/RevealText";
import { LogoTurn } from "@/components/scene/LogoTurn";
import { container } from "@/components/ui/styles";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { SERVICE_SLUGS, type ServiceSlug } from "@/lib/site";

export function serviceNames(t: Dictionary) {
  return Object.fromEntries(SERVICE_SLUGS.map((s) => [s, t.serviceList[s].name])) as Record<ServiceSlug, string>;
}

export function QuoteSection({
  lang,
  t,
  title,
  defaultService,
  brand = false,
}: {
  lang: Locale;
  t: Dictionary;
  title?: string;
  defaultService?: ServiceSlug;
  /** Home page: show the logo turning in 3D next to the form. */
  brand?: boolean;
}) {
  return (
    <section id="cotizar" data-cue="quote" className="scroll-mt-28 py-24 pb-32 sm:py-32">
      <div className={`${container} grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16`}>
        <div>
          <p className="eyebrow">{t.quote.eyebrow}</p>
          <RevealText as="h2" className="mt-4 text-[2.6rem] leading-none sm:text-6xl">
            {title ?? t.quote.title}
          </RevealText>
          <p className="mt-5 max-w-sm text-lg text-navy/70">{t.quote.lead}</p>
          {brand ? <LogoTurn /> : null}
        </div>
        <div data-line-end className="rounded-[28px] border border-navy/10 bg-white/70 p-6 backdrop-blur-xl sm:p-9">
          <QuoteForm
            lang={lang}
            t={{ quote: t.quote, validation: t.validation }}
            serviceNames={serviceNames(t)}
            defaultService={defaultService}
          />
        </div>
      </div>
    </section>
  );
}
