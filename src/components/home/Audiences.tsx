import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { btn, container } from "@/components/ui/styles";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { SERVICE_SLUGS } from "@/lib/site";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4 border-t border-navy/10 py-4 text-[17px] last:border-b">
      <span className="size-3 shrink-0 rounded-[3px] bg-royal" aria-hidden />
      {children}
    </li>
  );
}

export function Audiences({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section data-cue="audiences" className="py-24 sm:py-32">
      <div className={`${container} grid gap-6 lg:grid-cols-2`}>
        <article className="rounded-[28px] border border-navy/10 bg-white/70 p-7 shadow-[0_30px_60px_-40px_rgba(14,26,61,.35)] backdrop-blur-xl sm:p-10">
          <p className="eyebrow">{t.audiences.you.eyebrow}</p>
          <RevealText as="h2" className="mt-4 text-[2.1rem] leading-[1.02] sm:text-5xl">
            {t.audiences.you.title}
          </RevealText>
          <Reveal as="ul" stagger={0.06} className="mt-8">
            {SERVICE_SLUGS.map((s) => (
              <Row key={s}>
                <Link href={localePath(lang, `/servicios/${s}`)} className="hover:text-royal">
                  {t.serviceList[s].name}
                </Link>
              </Row>
            ))}
          </Reveal>
          <Magnetic className="mt-8">
            <Link href="#cotizar" className={btn.primary}>
              {t.audiences.you.cta}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Magnetic>
        </article>

        <article className="relative overflow-hidden rounded-[28px] bg-royal p-7 text-white sm:p-10">
          <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
          <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-white/85">{t.audiences.agencies.eyebrow}</p>
          <RevealText as="h2" className="mt-4 text-[2.1rem] leading-[1.02] sm:text-5xl">
            {t.audiences.agencies.title}
          </RevealText>
          <p className="mt-5 text-lg text-white/85">{t.audiences.agencies.lead}</p>
          <Reveal as="ul" stagger={0.1} className="mt-8">
            {t.audiences.agencies.items.map((item) => (
              <li key={item} className="flex items-center justify-between border-t border-white/25 py-4 text-[17px] last:border-b">
                {item}
                <span className="grid size-7 place-items-center rounded-full bg-white text-royal">
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
              </li>
            ))}
          </Reveal>
          <Magnetic className="mt-8">
            <Link href={localePath(lang, "/agencias")} className={btn.light}>
              {t.audiences.agencies.cta}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Magnetic>
        </article>
      </div>
    </section>
  );
}
