import { Counter } from "@/components/motion/Counter";
import { RevealText } from "@/components/motion/RevealText";
import { container } from "@/components/ui/styles";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { SERVICE_SLUGS, STATES } from "@/lib/site";
import { getUsMap } from "@/lib/usMap";
import { UsNetworkMap } from "./UsNetworkMap";

export function StatesSection({ t }: { t: Dictionary }) {
  const map = getUsMap();
  const counters = [
    { value: STATES.length, label: t.states.counters.states },
    { value: SERVICE_SLUGS.length, label: t.states.counters.services },
    { value: 2, label: t.states.counters.languages },
  ];
  return (
    <section id="estados" className="relative overflow-hidden border-y border-white/10 bg-ink py-24 sm:py-32">
      <div className={container}>
        <p className="eyebrow">{t.states.eyebrow}</p>
        <RevealText as="h2" className="mt-4 text-[2.6rem] leading-none sm:text-6xl lg:text-7xl">
          {t.states.title}
        </RevealText>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.6fr_1fr]">
          <UsNetworkMap data={map} label={t.hero.mapLabel} showLabels />
          <div>
            <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {counters.map((c) => (
                <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
                  <dt className="sr-only">{c.label}</dt>
                  <dd>
                    <Counter value={c.value} className="block font-display text-5xl font-bold leading-none text-royal-400 sm:text-7xl" />
                    <span className="mt-2 block text-sm text-white/70">{c.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <h3 className="sr-only">{t.states.listLabel}</h3>
        <ul className="mt-12 flex flex-wrap gap-2" aria-label={t.states.listLabel}>
          {STATES.map((s) => (
            <li key={s.code} className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/80">
              {s.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
