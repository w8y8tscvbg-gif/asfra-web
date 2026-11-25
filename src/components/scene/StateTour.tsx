"use client";
import { useEffect, useState } from "react";

/**
 * Label for the states tour: while the 3D camera visits each state, shows its name in large type and
 * highlights its chip in the list below ([data-state-chip]). Decorative: the list itself is the content.
 */
export function StateTour({ names, codes }: { names: string[]; codes: string[] }) {
  const [i, setI] = useState(-1);

  useEffect(() => {
    const on = (ev: Event) => setI((ev as CustomEvent<number>).detail);
    window.addEventListener("asfra:tour", on);
    return () => window.removeEventListener("asfra:tour", on);
  }, []);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-state-chip]").forEach((el) => {
      el.dataset.on = el.dataset.stateChip === codes[i] ? "1" : "0";
    });
  }, [i, codes]);

  const total = String(names.length).padStart(2, "0");

  return (
    <div
      aria-hidden="true"
      className={`needs-3d pointer-events-none absolute left-0 top-0 flex-col transition-opacity duration-500 ${i >= 0 ? "opacity-100" : "opacity-0"}`}
    >
      <span className="font-display text-xs tracking-[0.16em] text-royal">
        {String(Math.max(0, i) + 1).padStart(2, "0")} / {total}
      </span>
      <span className="mt-1 block overflow-hidden pb-[0.1em]">
        <span key={i} className="tour-name block font-display text-4xl font-bold leading-none tracking-[-0.03em] sm:text-6xl">
          {names[Math.max(0, i)]}
        </span>
      </span>
    </div>
  );
}
