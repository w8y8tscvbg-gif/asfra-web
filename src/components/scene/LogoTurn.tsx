"use client";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { gsap, MOTION_OK } from "@/lib/gsap";

/**
 * ASFRA's original logo file, shown as-is and turned in 3D space by the scroll (CSS perspective).
 * The image itself is never redrawn or altered: only the element holding it rotates.
 */
export function LogoTurn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        card,
        { rotateY: -95, rotateX: 16, y: 40 },
        {
          rotateY: 28,
          rotateX: -6,
          y: -12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom 20%", scrub: 0.6 },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className="mt-10 [perspective:900px]">
      <div className="relative size-32 [transform-style:preserve-3d] sm:size-44">
        <div aria-hidden="true" className="absolute inset-[-30%] rounded-full bg-[radial-gradient(closest-side,rgba(0,93,255,.45),transparent)] blur-xl" />
        <Logo className="relative size-full [backface-visibility:hidden]" sizes="176px" />
      </div>
    </div>
  );
}
