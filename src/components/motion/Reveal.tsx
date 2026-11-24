"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Animate direct children one after another instead of the wrapper as a whole. */
  stagger?: number;
  delay?: number;
  y?: number;
  onMount?: boolean;
  as?: "div" | "ul" | "ol" | "section";
};

/** Fades content up when it scrolls into view. */
export function Reveal({ children, className, stagger, delay = 0, y = 24, onMount = false, as = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const targets = stagger ? Array.from(el.children) : [el];
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: stagger ?? 0,
          delay,
          scrollTrigger: onMount ? undefined : { trigger: el, start: "top 88%", once: true },
        },
      );
    });
    return () => mm.revert();
  }, [stagger, delay, y, onMount]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
