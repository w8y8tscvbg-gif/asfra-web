"use client";
import { useEffect, useState } from "react";

const R = 18;
const C = 2 * Math.PI * R;

type Detail = { e: number; lit: number; total: number; show: boolean };

/**
 * Small floating counter for the hero: shows how many states the scroll has connected so far.
 * Decorative (the map itself is decorative), only rendered while the 3D scene runs.
 */
export function ScrollConnect({ label, done }: { label: string; done: string }) {
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
      className={`needs-3d pointer-events-none fixed bottom-6 left-5 z-20 items-center gap-3 whitespace-nowrap rounded-full border border-navy/12 bg-white/80 py-1.5 shadow-[0_12px_30px_-18px_rgba(14,26,61,.4)] pl-1.5 pr-5 backdrop-blur-md transition-[opacity,translate] duration-500 ease-brand lg:bottom-8 lg:left-[72%] lg:-translate-x-1/2 ${
        s.show ? "opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <span className="relative grid size-11 shrink-0 place-items-center">
        <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
          <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(14,26,61,.12)" strokeWidth="2.5" />
          <circle
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke="#005dff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - Math.min(1, s.e * 1.08))}
          />
        </svg>
        {complete ? (
          <span className="size-2.5 rounded-full bg-royal shadow-[0_0_14px_3px_rgba(0,93,255,.45)]" />
        ) : (
          <span className="scroll-cue relative h-4 w-[9px] rounded-full border border-navy/60">
            <span className="absolute left-1/2 top-[3px] h-1 w-[2px] -translate-x-1/2 rounded-full bg-navy" />
          </span>
        )}
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">{complete ? done : label}</span>
        <span className="mt-0.5 block font-display text-[11px] tracking-[0.14em] text-navy/55">
          {s.lit}/{s.total}
        </span>
      </span>
    </div>
  );
}
