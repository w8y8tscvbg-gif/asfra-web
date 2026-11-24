import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Audiences } from "@/components/home/Audiences";
import { Hero } from "@/components/home/Hero";
import { PinnedServices } from "@/components/home/PinnedServices";
import { QuoteSection } from "@/components/home/QuoteSection";
import { ServiceCards } from "@/components/home/ServiceCards";
import { StatesSection } from "@/components/home/StatesSection";
import { RevealText } from "@/components/motion/RevealText";
import { container } from "@/components/ui/styles";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { alternates } from "@/lib/seo";
import { SERVICE_SLUGS } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
    alternates: alternates(lang, "/"),
    openGraph: { title: t.meta.homeTitle, description: t.meta.homeDescription, url: localePath(lang, "/") },
  };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);

  const items = SERVICE_SLUGS.map((slug) => ({ slug, name: t.serviceList[slug].name, pinned: t.serviceList[slug].pinned }));
  const cards = SERVICE_SLUGS.map((slug) => ({
    slug,
    href: localePath(lang, `/servicios/${slug}`),
    name: t.serviceList[slug].name,
    short: t.serviceList[slug].short,
  }));

  return (
    <>
      <Hero lang={lang} t={t} />
      <PinnedServices items={items} eyebrow={t.pinned.eyebrow} progress={t.pinned.progress} />

      <section id="servicios" className="scroll-mt-28 py-24 sm:py-32">
        <div className={container}>
          <p className="eyebrow">{t.services.eyebrow}</p>
          <RevealText as="h2" className="mb-12 mt-4 max-w-3xl text-[2.6rem] leading-none sm:text-6xl">
            {t.services.title}
          </RevealText>
          <ServiceCards cards={cards} viewLabel={t.services.viewService} />
        </div>
      </section>

      <Audiences lang={lang} t={t} />
      <StatesSection t={t} />
      <QuoteSection lang={lang} t={t} />
    </>
  );
}
