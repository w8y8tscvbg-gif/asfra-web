import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { HeroCta } from "@/components/scene/HeroCta";
import { HeroExit } from "@/components/scene/HeroExit";
import { HeroTitle } from "@/components/scene/HeroTitle";
import { ScrollConnect } from "@/components/scene/ScrollConnect";
import { ServiceRing } from "@/components/scene/ServiceRing";
import { btn, container } from "@/components/ui/styles";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { SERVICE_SLUGS } from "@/lib/site";

/**
 * Phone-first hero. The first screen holds only the title, the services ring around ASFRA's logo and
 * the quote button. With the live 3D map (html.has-3d) the stage stays pinned: the first scroll clears
 * the copy away and brings the map in, the rest connects the 13 states. Without 3D it is a plain
 * one-screen section.
 */
export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section data-cue="hero" className="hero-track relative">
      <div className="hero-stage relative isolate flex min-h-[100svh] flex-col justify-center overflow-clip pb-8 pt-28 sm:pt-32 lg:pb-12">
        <div
          aria-hidden
          className="hero-glow absolute inset-0 -z-10 bg-[radial-gradient(70%_45%_at_50%_58%,rgba(0,93,255,.10)_0%,rgba(255,255,255,0)_70%)] lg:bg-[radial-gradient(45%_60%_at_74%_50%,rgba(0,93,255,.10)_0%,rgba(255,255,255,0)_70%)]"
        />
        <div className={`${container} grid items-center lg:grid-cols-[1.05fr_1fr] lg:gap-x-10`}>
          <div data-hero-text className="text-center lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left">
            <p className="eyebrow mb-5 hidden lg:block">{t.hero.eyebrow}</p>
            <HeroTitle
              full={t.hero.title}
              lead={t.hero.titleLead}
              words={t.hero.titleWords}
              className="text-[2.7rem] leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-[5.2rem] xl:text-[6rem]"
            />
          </div>

          <div data-hero-ring className="mt-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <ServiceRing
              label={t.nav.services}
              items={SERVICE_SLUGS.map((s) => ({ slug: s, name: t.serviceList[s].name, href: localePath(lang, `/servicios/${s}`) }))}
            />
          </div>

          <div data-hero-text className="mt-4 flex flex-col items-center lg:col-start-1 lg:row-start-2 lg:mt-7 lg:items-start lg:self-start">
            <p className="hidden max-w-md text-lg leading-relaxed text-navy/75 sm:block sm:text-xl">{t.hero.subtitle}</p>
            <HeroCta href="#cotizar" className={`${btn.primary} w-full sm:mt-7 sm:w-auto`}>
              {t.hero.ctaPrimary}
              <ArrowUpRight className="size-4" aria-hidden />
            </HeroCta>
            <Link
              href={localePath(lang, "/agencias")}
              className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-navy/70 transition-colors hover:text-royal"
            >
              {t.hero.ctaSecondary}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
      <HeroExit />
      <ScrollConnect label={t.hero.connect} unit={t.states.counters.states} />
    </section>
  );
}
