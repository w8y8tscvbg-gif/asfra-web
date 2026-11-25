"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

const REACH = 170; // px around the button where it starts pulling toward the cursor
const RIPPLE_EVERY = 4200; // ms

/**
 * The hero's main call to action: it glows, leans toward the cursor from a distance, and sends
 * ripples across the 3D map (asfra:ripple) on load, every few seconds and when the cursor arrives.
 */
export function HeroCta({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const btn = el.firstElementChild as HTMLElement;
    const ripple = () => {
      const r = btn.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      window.dispatchEvent(new CustomEvent("asfra:ripple", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
    };

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const first = window.setTimeout(ripple, 2600);
      const timer = window.setInterval(() => !document.hidden && ripple(), RIPPLE_EVERY);
      btn.addEventListener("pointerenter", ripple);

      let off = () => {};
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          const reach = Math.max(r.width, r.height) / 2 + REACH;
          const k = d < reach ? 0.38 * (1 - d / reach) + 0.12 : 0;
          xTo(dx * k);
          yTo(dy * k);
          el.dataset.near = k > 0 ? "1" : "0";
        };
        window.addEventListener("pointermove", move, { passive: true });
        off = () => window.removeEventListener("pointermove", move);
      }
      return () => {
        window.clearTimeout(first);
        window.clearInterval(timer);
        btn.removeEventListener("pointerenter", ripple);
        off();
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <span ref={wrap} className="cta-glow group/cta relative inline-block w-full sm:w-auto">
      <Link href={href} className={className}>
        {children}
      </Link>
    </span>
  );
}
