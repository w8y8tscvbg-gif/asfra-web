"use client";
import { useEffect, useRef } from "react";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { gsap, MOTION_OK } from "@/lib/gsap";
import type { ServiceSlug } from "@/lib/site";

/**
 * The 6 services orbit the hero headline on a tilted 3D ring: the ones in front pass below the title,
 * larger and solid, the ones behind pass above it, smaller and faded. The ring stays behind the text so
 * the words always read on top. Scrolling spins it faster.
 * Decorative (the services are listed further down); hidden with reduced motion.
 */
export function ServiceOrbit({ items }: { items: { slug: ServiceSlug; name: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chips = Array.from(el.querySelectorAll<HTMLElement>(".orb"));
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      let angle = -Math.PI / 2;
      let boost = 0;
      let lastY = window.scrollY;
      let rx = 0;
      let ry = 0;
      let cx = 0;
      let cy = 0;
      // The ring is centred on the title's text (not its column) and passes just outside it.
      const text = el.parentElement?.querySelector<HTMLElement>(".ht-visual");
      const size = () => {
        const box = el.getBoundingClientRect();
        const t = text?.getBoundingClientRect() ?? box;
        const narrow = window.innerWidth < 640;
        const s = box.width / (el.offsetWidth || box.width || 1); // undo the hero's shrink transform, if any
        cx = (t.left + t.width / 2 - (box.left + box.width / 2)) / s;
        cy = (t.top + t.height / 2 - (box.top + box.height / 2)) / s;
        rx = Math.min(t.width / s / 2 + (narrow ? 18 : 70), window.innerWidth / 2 - 22);
        ry = t.height / s / 2 + (narrow ? 14 : 22);
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      gsap.fromTo(el, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.4, delay: 1.1, ease: "expo.out" });

      const tick = (_t: number, dt: number) => {
        const y = window.scrollY;
        const v = Math.abs(y - lastY) / Math.max(0.001, dt / 1000); // px per second
        lastY = y;
        if (y > window.innerHeight * 2) return;
        boost = Math.max(boost * 0.94, Math.min(3, v / 900));
        angle += (dt / 1000) * (0.22 + boost);
        chips.forEach((c, i) => {
          const a = angle + (i / chips.length) * Math.PI * 2;
          const depth = Math.sin(a); // +1 in front (below the title), -1 behind (above it)
          const k = (depth + 1) / 2;
          c.style.transform = `translate(-50%, -50%) translate(${cx + Math.cos(a) * rx}px, ${cy + depth * ry}px) scale(${0.72 + k * 0.38})`;
          c.style.opacity = String(0.3 + k * 0.7);
          c.style.filter = depth < -0.2 ? `blur(${(-depth - 0.2) * 2}px)` : "";
        });
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 motion-reduce:hidden">
      {items.map((it) => {
        const Icon = SERVICE_ICONS[it.slug];
        return (
          <span
            key={it.slug}
            className="orb absolute left-1/2 top-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-navy/10 bg-white/90 p-1.5 font-display text-[13px] font-medium tracking-normal text-navy shadow-[0_10px_30px_-12px_rgba(14,26,61,.35)] backdrop-blur sm:pr-4"
          >
            <span className="grid size-7 place-items-center rounded-full bg-royal text-white">
              <Icon className="size-4" strokeWidth={1.8} />
            </span>
            <span className="hidden sm:inline">{it.name}</span>
          </span>
        );
      })}
    </div>
  );
}
