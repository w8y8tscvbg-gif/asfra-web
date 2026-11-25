import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgencyRegister } from "@/components/agencies/AgencyRegister";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { btn, container } from "@/components/ui/styles";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { alternates } from "@/lib/seo";
import { getUsMap } from "@/lib/usMap";

export async function generateMetadata({ params }: PageProps<"/[lang]/agencias">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.meta.agenciesTitle,
    description: t.meta.agenciesDescription,
    alternates: alternates(lang, "/agencias"),
    openGraph: { title: t.meta.agenciesTitle, description: t.meta.agenciesDescription, url: localePath(lang, "/agencias") },
  };
}

export default async function AgenciesPage({ params }: PageProps<"/[lang]/agencias">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const map = getUsMap();

  return (
    <>
      <section className="relative isolate overflow-hidden pb-20 pt-40 sm:pt-48">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_15%_0%,rgba(0,93,255,.35)_0%,rgba(14,26,61,0)_65%)]" />
        <div className={container}>
          <Reveal onMount y={12}>
            <p className="eyebrow">{t.agenciesPage.eyebrow}</p>
          </Reveal>
          <RevealText as="h1" onMount delay={0.15} className="mt-5 max-w-5xl text-[2.9rem] leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
            {t.agenciesPage.title}
          </RevealText>
          <Reveal onMount delay={0.7} className="mt-7">
            <p className="max-w-xl text-xl text-navy/80">{t.agenciesPage.lead}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {t.audiences.agencies.items.map((i) => (
                <li key={i} className="inline-flex items-center gap-2 rounded-full bg-navy/[0.06] px-4 py-2 text-sm">
                  <Check className="size-4 text-royal" strokeWidth={3} aria-hidden />
                  {i}
                </li>
              ))}
            </ul>
            <Magnetic className="mt-9">
              <Link href="#registro" className={btn.primary}>
                {t.agenciesPage.cta}
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className={container}>
          <RevealText as="h2" className="text-4xl sm:text-5xl">
            {t.agenciesPage.stepsTitle}
          </RevealText>
          <Reveal
            as="ol"
            stagger={0.1}
            className="-mx-5 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0"
          >
            {t.agenciesPage.steps.map((s, i) => (
              <li key={s.title} className="w-[78%] shrink-0 snap-start rounded-[22px] border border-navy/10 bg-royal/[0.05] p-6 sm:w-auto">
                <span className="font-display text-sm font-medium text-royal">0{i + 1}</span>
                <h3 className="mt-8 text-2xl leading-tight">{s.title}</h3>
                <p className="mt-2 text-[15px] text-navy/70">{s.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="registro" className="scroll-mt-28 pb-32 pt-8 sm:pb-40">
        <div className={container}>
          <AgencyRegister
            lang={lang}
            t={{ agencyForm: t.agencyForm, validation: t.validation, quote: t.quote }}
            map={map}
            mapLabel={t.hero.mapLabel}
            mapTitle={t.agenciesPage.mapTitle}
          />
        </div>
      </section>
    </>
  );
}
