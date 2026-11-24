import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteSection } from "@/components/home/QuoteSection";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { container } from "@/components/ui/styles";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { alternates } from "@/lib/seo";
import { hasService, SERVICE_SLUGS } from "@/lib/site";

// Every valid slug is prerendered below; any other slug renders the 404. Navigations to an
// unknown slug may block, which is acceptable, so instant-navigation validation is turned off here.
export const instant = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => SERVICE_SLUGS.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/servicios/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !hasService(slug)) return {};
  const t = await getDictionary(lang);
  const s = t.serviceList[slug];
  const title = `${s.name} · ASFRA SERVICES`;
  return {
    title,
    description: `${s.description} ${t.hero.subtitle}`,
    alternates: alternates(lang, `/servicios/${slug}`),
    openGraph: { title, description: s.description, url: localePath(lang, `/servicios/${slug}`) },
  };
}

export default async function ServicePage({ params }: PageProps<"/[lang]/servicios/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !hasService(slug)) notFound();
  const t = await getDictionary(lang);
  const s = t.serviceList[slug];
  const Icon = SERVICE_ICONS[slug];
  const others = SERVICE_SLUGS.filter((o) => o !== slug);

  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-40 sm:pt-48">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_85%_0%,#0a2f87_0%,rgba(14,26,61,0)_65%)]" />
        <div className={container}>
          <Reveal onMount y={12}>
            <span className="grid size-16 place-items-center rounded-2xl bg-royal text-white">
              <Icon className="size-8" strokeWidth={1.6} aria-hidden />
            </span>
          </Reveal>
          <p className="eyebrow mt-8">{t.servicePage.eyebrow}</p>
          <RevealText as="h1" onMount delay={0.15} className="mt-4 max-w-4xl text-[3rem] leading-[0.95] sm:text-7xl lg:text-8xl">
            {s.name}
          </RevealText>
          <Reveal onMount delay={0.6}>
            <p className="mt-6 max-w-xl text-xl text-white/75">{s.description}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className={container}>
          <RevealText as="h2" className="text-4xl sm:text-5xl">
            {t.servicePage.howTitle}
          </RevealText>
          <Reveal as="ol" stagger={0.08} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.servicePage.steps.map((step, i) => (
              <li key={step.title} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6">
                <span className="font-display text-sm text-royal-400">0{i + 1}</span>
                <h3 className="mt-6 text-xl">{step.title}</h3>
                <p className="mt-2 text-[15px] text-white/65">{step.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <QuoteSection lang={lang} t={t} title={t.servicePage.quoteTitle} defaultService={slug} />

      <section className="border-t border-white/10 py-20">
        <div className={container}>
          <p className="eyebrow">{t.services.otherServices}</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((o) => {
              const OIcon = SERVICE_ICONS[o];
              return (
                <li key={o}>
                  <Link
                    href={localePath(lang, `/servicios/${o}`)}
                    className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-white/10 px-5 py-4 transition-colors hover:border-royal hover:bg-royal/10"
                  >
                    <span className="flex items-center gap-3">
                      <OIcon className="size-5 text-royal-400" aria-hidden />
                      {t.serviceList[o].name}
                    </span>
                    <ArrowUpRight className="size-4 text-white/50 group-hover:text-white" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
