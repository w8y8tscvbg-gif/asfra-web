"use client";
import { Fragment, useEffect, useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const WHITE = [255, 255, 255];
const BLUE = [77, 141, 255];
const mix = (k: number) => `rgb(${WHITE.map((w, i) => Math.round(w + (BLUE[i] - w) * k)).join(",")})`;

/**
 * Hero headline: the words rise in one by one on load. While the hero scrolls (3D map running),
 * a blue light moves word by word with the states being connected and stays on the last word.
 */
export function HeroTitle({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ws = Array.from(el.querySelectorAll<HTMLElement>(".hw"));
    const n = ws.length;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set(el, { opacity: 1 });
      gsap.from(ws, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.09, delay: 0.3 });
    });

    const onEnergy = (ev: Event) => {
      const e = (ev as CustomEvent<{ e: number }>).detail.e;
      const pos = clamp01(e * 1.08) * (n - 1);
      const start = clamp01(e * 25); // nothing lights before the first scroll
      ws.forEach((w, i) => {
        const k = i === n - 1 ? clamp01(pos - (n - 2)) : clamp01(1 - Math.abs(pos - i)) * 0.9;
        w.style.color = mix(k * start);
      });
    };
    window.addEventListener("asfra:energy", onEnergy);
    return () => {
      window.removeEventListener("asfra:energy", onEnergy);
      mm.revert();
    };
  }, []);

  return (
    <h1 ref={ref} className={className} data-reveal="">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-top">
              <span className="hw inline-block">{w}</span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </h1>
  );
}
