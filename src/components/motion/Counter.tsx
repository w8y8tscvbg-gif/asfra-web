"use client";
import { useEffect, useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

/** Counts up to a real, fixed value when scrolled into view. The final value is server-rendered. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const obj = { n: 0 };
      el.textContent = "0";
      gsap.to(obj, {
        n: value,
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.n));
        },
      });
      return () => {
        el.textContent = String(value);
      };
    });
    return () => mm.revert();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
