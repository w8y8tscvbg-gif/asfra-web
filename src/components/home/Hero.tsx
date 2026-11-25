import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Counter } from "@/components/motion/Counter";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { HeroCta } from "@/components/scene/HeroCta";
import { HeroShrink } from "@/components/scene/HeroShrink";
import { HeroTitle } from "@/components/scene/HeroTitle";
import { ScrollConnect } from "@/components/scene/ScrollConnect";
import { ServiceOrbit } from "@/components/scene/ServiceOrbit";
import { SloganTicker } from "@/components/scene/SloganTicker";
import { btn, container } from "@/components/ui/styles";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { SERVICE_SLUGS, STATES } from "@/lib/site";
import { getUsMap } from "@/lib/usMap";
import { UsNetworkMap } from "./UsNetworkMap";

/**
 * With the live 3D map running (html.has-3d) the hero gets extra scroll length: on desktop the stage
 * stays pinned (sticky) while the scroll connects the 13 states and the copy shrinks into the corner;
 * on phones the text scrolls away and the map takes the screen. Without 3D the hero is a normal
 * one-screen section.
 */
export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const map = getUsMap();
  const stats = [
    { value: STATES.length, label: t.states.counters.states },
    { value: SERVICE_SLUGS.length, label: t.states.counters.services },
  ];
  return (
    <section data-cue="hero" className="hero-track relative">
      <div className="hero-stage relative isolate overflow-clip pb-16 pt-36 sm:pt-44 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-24">
        <div
          aria-hidden
          className="hero-glow absolute inset-0 -z-10 transition-opacity duration-1000 bg-[radial-gradient(90%_60%_at_80%_10%,rgba(0,93,255,.10)_0%,rgba(255,255,255,0)_60%),radial-gradient(60%_50%_at_10%_90%,rgba(0,93,255,.08)_0%,rgba(255,255,255,0)_70%)]"
        />
        <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0 -z-10" />
        <div className={`${container} grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6`}>
          <div data-hero-copy className="relative z-10">
            <div data-hero-fade>
              <Reveal onMount delay={0.2} y={12}>
                <p className="eyebrow">{t.hero.eyebrow}</p>
              </Reveal>
            </div>
            <div className="relative mt-5">
              <ServiceOrbit items={SERVICE_SLUGS.map((s) => ({ slug: s, name: t.serviceList[s].name }))} />
              <HeroTitle
                full={t.hero.title}
                lead={t.hero.titleLead}
                words={t.hero.titleWords}
                className="relative z-[1] text-[2.9rem] leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[5.6rem] xl:text-[6.4rem]"
              />
            </div>
            <div data-hero-fade>
              <Reveal onMount delay={1} stagger={0.12} className="mt-6">
                <p className="max-w-md text-lg leading-relaxed text-navy/75 sm:text-xl">{t.hero.subtitle}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <HeroCta href="#cotizar" className={`${btn.primary} w-full sm:w-auto`}>
                    {t.hero.ctaPrimary}
                    <ArrowUpRight className="size-4" aria-hidden />
                  </HeroCta>
                  <Magnetic>
                    <Link href={localePath(lang, "/agencias")} className={`${btn.dark} w-full sm:w-auto`}>
                      {t.hero.ctaSecondary}
                    </Link>
                  </Magnetic>
                </div>
                <dl className="mt-8 flex items-end gap-8">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="flex items-baseline gap-2">
                        <Counter value={s.value} className="font-display text-4xl font-bold leading-none tracking-[-0.04em] text-royal" />
                        <span className="text-sm font-semibold text-navy/70">{s.label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-8 flex flex-wrap items-center gap-3 font-display text-sm font-medium text-royal">
                  <span className="h-px w-10 bg-royal" aria-hidden />
                  <span className="whitespace-nowrap">{t.brand.slogan}</span>
                  <SloganTicker items={SERVICE_SLUGS.map((s) => t.serviceList[s].name)} />
                </p>
              </Reveal>
            </div>
          </div>

          <div className="relative -mx-5 sm:mx-0 lg:-mr-16">
            {/* Flat map: shown until the live 3D map takes over (or instead of it on devices without WebGL). */}
            <div className="map-fallback">
              <UsNetworkMap data={map} label={t.hero.mapLabel} play="mount" />
            </div>
          </div>
        </div>
      </div>
      <HeroShrink />
      <ScrollConnect label={t.hero.connect} done={t.hero.connected} />
    </section>
  );
}
