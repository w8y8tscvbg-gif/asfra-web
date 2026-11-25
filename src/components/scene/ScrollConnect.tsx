"use client";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

type Detail = { e: number; lit: number; total: number; show: boolean };

/**
 * Counter over the 3D map while the hero connects the states: a big "10 / 13 estados" under the header,
 * a progress line and a hint to keep scrolling. Decorative (the map itself is decorative), only rendered
 * while the 3D scene runs, and only once the map has come in.
 */
export function ScrollConnect({ label, unit }: { label: string; unit: string }) {
  const [s, setS] = useState<Detail>({ e: 0, lit: 1, total: 13, show: false });

  useEffect(() => {
    const on = (ev: Event) => setS((ev as CustomEvent<Detail>).detail);
    window.addEventListener("asfra:energy", on);
    return () => window.removeEventListener("asfra:energy", on);
  }, []);

  const complete = s.lit >= s.total;

  return (
    <div
      aria-hidden="true"
      className={`needs-3d pointer-events-none fixed inset-x-0 top-24 z-20 flex-col items-center text-center transition-[opacity,translate] duration-500 ease-brand sm:top-28 ${
        s.show ? "opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <span className="flex items-baseline gap-2 font-display font-bold leading-none tracking-[-0.04em]">
        <span className="text-6xl text-royal tabular-nums sm:text-7xl">{s.lit}</span>
        <span className="text-2xl text-navy/35">/ {s.total}</span>
        <span className="ml-1 text-xl tracking-[-0.02em] text-navy">{unit}</span>
      </span>
      <span className="mt-3 block h-[3px] w-40 overflow-hidden rounded-full bg-navy/10">
        <span
          className="block h-full origin-left rounded-full bg-royal transition-transform duration-300"
          style={{ transform: `scaleX(${Math.min(1, s.e * 1.08)})` }}
        />
      </span>
      <span className="mt-3 flex items-center gap-2 text-sm font-semibold text-navy/60">
        {complete ? (
          <Check className="size-5 text-royal" strokeWidth={3} />
        ) : (
          <>
            <span className="scroll-cue relative h-4 w-[9px] rounded-full border border-navy/50">
              <span className="absolute left-1/2 top-[3px] h-1 w-[2px] -translate-x-1/2 rounded-full bg-navy/70" />
            </span>
            {label}
          </>
        )}
      </span>
    </div>
  );
}
