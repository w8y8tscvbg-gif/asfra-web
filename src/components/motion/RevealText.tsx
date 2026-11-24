"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, SplitText } from "@/lib/gsap";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  children: ReactNode;
  className?: string;
  /** Animate on mount instead of when scrolled into view. */
  onMount?: boolean;
  delay?: number;
  id?: string;
};

/** Reveals text line by line with a mask as it scrolls into view. */
export function RevealText({ as = "h2", children, className, onMount = false, delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          // Give each line mask room for descenders (g, y, p) so they aren't clipped.
          gsap.set(self.masks, { paddingBottom: "0.16em", marginBottom: "-0.16em" });
          gsap.set(el, { opacity: 1 });
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1,
            ease: "expo.out",
            stagger: 0.09,
            delay,
            scrollTrigger: onMount ? undefined : { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      return () => split.revert();
    });
    return () => mm.revert();
  }, [onMount, delay]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className} id={id} data-reveal="">
      {children}
    </Tag>
  );
}
