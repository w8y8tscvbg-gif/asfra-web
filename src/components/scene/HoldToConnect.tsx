"use client";
import { useEffect, useState } from "react";

const R = 22;
const C = 2 * Math.PI * R;

/** "Hold to connect": charges the 3D map while pressed. Only shown when the 3D scene is running. */
export function HoldToConnect({ label, done }: { label: string; done: string }) {
  const [state, setState] = useState({ e: 0, lit: 0, total: 13 });

  useEffect(() => {
    const onEnergy = (ev: Event) => setState((ev as CustomEvent<{ e: number; lit: number; total: number }>).detail);
    window.addEventListener("asfra:energy", onEnergy);
    return () => window.removeEventListener("asfra:energy", onEnergy);
  }, []);

  const send = (held: boolean) => window.dispatchEvent(new CustomEvent("asfra:hold", { detail: held }));
  const complete = state.lit >= state.total;

  return (
    <button
      type="button"
      className="needs-3d group items-center gap-4 rounded-full border border-white/12 bg-navy/60 py-2 pl-2 pr-6 text-left backdrop-blur-md select-none [touch-action:none] [-webkit-touch-callout:none]"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        send(true);
      }}
      onPointerUp={() => send(false)}
      onPointerCancel={() => send(false)}
      onLostPointerCapture={() => send(false)}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          send(true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") send(false);
      }}
      onBlur={() => send(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="relative grid size-14 shrink-0 place-items-center">
        <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="3" />
          <circle
            cx="28"
            cy="28"
            r={R}
            fill="none"
            stroke="#4d8dff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - state.e)}
          />
        </svg>
        <span
          className="size-3 rounded-full bg-royal-400 shadow-[0_0_18px_4px_rgba(77,141,255,.7)] transition-transform duration-200 group-active:scale-150"
          aria-hidden="true"
        />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold">{complete ? done : label}</span>
        <span className="mt-0.5 block font-display text-xs tracking-[0.12em] text-white/55" aria-live="polite">
          {state.lit}/{state.total}
        </span>
      </span>
    </button>
  );
}
