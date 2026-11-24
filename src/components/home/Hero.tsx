import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { btn, container } from "@/components/ui/styles";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { getUsMap } from "@/lib/usMap";
import { UsNetworkMap } from "./UsNetworkMap";

export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const map = getUsMap();
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-36 sm:pt-44 lg:min-h-[100svh] lg:pb-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_60%_at_80%_10%,#0a2f87_0%,rgba(14,26,61,0)_60%),radial-gradient(60%_50%_at_10%_90%,rgba(0,93,255,.18)_0%,rgba(14,26,61,0)_70%)]"
      />
      <div className={`${container} grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6`}>
        <div className="relative z-10">
          <Reveal onMount delay={0.2} y={12}>
            <p className="eyebrow">{t.hero.eyebrow}</p>
          </Reveal>
          <RevealText
            as="h1"
            onMount
            delay={0.35}
            className="mt-5 text-[2.9rem] leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[5.6rem] xl:text-[6.4rem]"
          >
            {t.hero.title}
          </RevealText>
          <Reveal onMount delay={1} stagger={0.12} className="mt-6">
            <p className="max-w-md text-lg leading-relaxed text-white/75 sm:text-xl">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <Link href="#cotizar" className={`${btn.primary} w-full sm:w-auto`}>
                  {t.hero.ctaPrimary}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href={localePath(lang, "/agencias")} className={`${btn.light} w-full sm:w-auto`}>
                  {t.hero.ctaSecondary}
                </Link>
              </Magnetic>
            </div>
            <p className="mt-10 flex items-center gap-3 font-display text-sm font-medium text-royal-400">
              <span className="h-px w-10 bg-royal" aria-hidden />
              {t.brand.slogan}
            </p>
          </Reveal>
        </div>

        <div className="relative -mx-5 sm:mx-0 lg:-mr-16">
          <UsNetworkMap data={map} label={t.hero.mapLabel} play="mount" />
        </div>
      </div>
    </section>
  );
}
