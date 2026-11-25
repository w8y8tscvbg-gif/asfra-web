import { Counter } from "@/components/motion/Counter";
import { RevealText } from "@/components/motion/RevealText";
import { StateTour } from "@/components/scene/StateTour";
import { container } from "@/components/ui/styles";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { SERVICE_SLUGS, STATES } from "@/lib/site";
import { getUsMap } from "@/lib/usMap";
import { UsNetworkMap } from "./UsNetworkMap";

/**
 * With the live 3D map (html.has-3d) this section is pinned for a few screens while the camera visits
 * each state; without it, it is a normal section with the flat map.
 */
export function StatesSection({ t }: { t: Dictionary }) {
  const map = getUsMap();
  const counters = [
    { value: STATES.length, label: t.states.counters.states },
    { value: SERVICE_SLUGS.length, label: t.states.counters.services },
    { value: 2, label: t.states.counters.languages },
  ];
  return (
    <section id="estados" data-cue="states" className="states-track relative border-y border-navy/10">
      <div className="states-stage relative overflow-clip py-24 sm:py-32">
        <div className={`${container} states-inner`}>
          <p className="eyebrow">{t.states.eyebrow}</p>
          <RevealText as="h2" className="mt-4 text-[2.6rem] leading-none sm:text-6xl lg:text-7xl">
            {t.states.title}
          </RevealText>

          <div className="states-grid mt-12 grid items-center gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div className="states-map relative">
              <div className="map-fallback">
                <UsNetworkMap data={map} label={t.hero.mapLabel} showLabels />
              </div>
              <StateTour names={STATES.map((s) => s.name)} codes={STATES.map((s) => s.code)} />
            </div>
            <div>
              <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                {counters.map((c) => (
                  <div key={c.label} className="rounded-2xl border border-navy/10 bg-white/55 p-4 backdrop-blur-md sm:p-6">
                    <dt className="sr-only">{c.label}</dt>
                    <dd>
                      <Counter value={c.value} className="block font-display text-5xl font-bold leading-none text-royal sm:text-7xl" />
                      <span className="mt-2 block text-sm text-navy/70">{c.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <h3 className="sr-only">{t.states.listLabel}</h3>
          <ul className="states-chips mt-12 flex flex-wrap gap-2" aria-label={t.states.listLabel}>
            {STATES.map((s) => (
              <li
                key={s.code}
                data-state-chip={s.code}
                className="rounded-full border border-navy/12 px-4 py-2 text-sm text-navy/80 transition-colors duration-300 data-[on=1]:border-royal data-[on=1]:bg-royal data-[on=1]:text-white"
              >
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
