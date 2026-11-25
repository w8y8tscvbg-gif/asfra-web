"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

const REACH = 170; // px around the button where it starts pulling toward the cursor

/** The hero's main call to action: it glows and, with a mouse, leans toward the cursor from a distance. */
export function HeroCta({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`(hover: hover) and (pointer: fine) and ${MOTION_OK}`, () => {
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
      return () => window.removeEventListener("pointermove", move);
    });
    return () => mm.revert();
  }, []);

  return (
    <span ref={wrap} className="cta-glow relative inline-block w-full sm:w-auto">
      <Link href={href} className={className}>
        {children}
      </Link>
    </span>
  );
}
