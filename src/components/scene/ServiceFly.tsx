"use client";
import { useEffect, useRef } from "react";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { SERVICE_SLUGS } from "@/lib/site";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Hero → services hand-off: the six service icons rise out of states on the 3D map and fly, one after
 * another, into the services panel below ("todo en un solo lugar"). Positions come from the engine
 * every frame while it happens; styles are set directly, no React renders.
 */
export function ServiceFly() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chips = Array.from(el.children) as HTMLElement[];
    let target: HTMLElement | null = null;

    const on = (ev: Event) => {
      const { f, pts } = (ev as CustomEvent<{ f: number; pts: Float32Array }>).detail;
      if (f <= 0 || f >= 1) {
        el.style.opacity = "0";
        return;
      }
      el.style.opacity = "1";
      target ??= document.querySelector<HTMLElement>("[data-fly-target]");
      const r = target?.getBoundingClientRect();
      const tx = r ? r.left + r.width / 2 : window.innerWidth / 2;
      const ty = r ? r.top + r.height / 2 : window.innerHeight;
      chips.forEach((c, k) => {
        const l = clamp01((f - k * 0.07) / 0.6);
        const e = ease(l);
        const sx = pts[k * 2];
        const sy = pts[k * 2 + 1];
        const x = sx + (tx - sx) * e;
        const y = sy + (ty - sy) * e - Math.sin(Math.PI * l) * window.innerHeight * 0.18;
        const s = 0.4 + Math.sin(Math.PI * Math.min(1, l * 1.3)) * 0.75 + (l > 0.75 ? -(l - 0.75) * 1.2 : 0);
        const o = clamp01(l / 0.12) * (1 - clamp01((l - 0.85) / 0.15));
        c.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${Math.max(0.2, s)})`;
        c.style.opacity = String(o);
      });
    };
    window.addEventListener("asfra:fly", on);
    return () => window.removeEventListener("asfra:fly", on);
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="needs-3d pointer-events-none fixed inset-0 z-20 opacity-0">
      {SERVICE_SLUGS.map((slug) => {
        const Icon = SERVICE_ICONS[slug];
        return (
          <span
            key={slug}
            className="absolute left-0 top-0 grid size-14 place-items-center rounded-full bg-royal text-white opacity-0 shadow-[0_0_40px_6px_rgba(0,93,255,.55)] will-change-transform"
          >
            <Icon className="size-7" strokeWidth={1.4} />
          </span>
        );
      })}
    </div>
  );
}
