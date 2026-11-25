"use client";
import { useEffect } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

/**
 * Desktop, while the hero stage is pinned: the copy steps aside for the map. The text under the title
 * fades out and the title shrinks into the top-left corner, so the 3D map (which pushes in at the same
 * time) takes over the screen. Works on [data-hero-copy] and [data-hero-fade] inside the hero.
 */
export function HeroShrink() {
  useEffect(() => {
    const copy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const track = copy?.closest<HTMLElement>(".hero-track");
    if (!copy || !track) return;
    const fades = copy.querySelectorAll<HTMLElement>("[data-hero-fade]");
    const mm = gsap.matchMedia();
    mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
      });
      const SCALE = 0.58;
      // Lift the copy so the (scaled) title settles just under the header. Layout offsets ignore transforms
      // and scrolling, so this holds whenever ScrollTrigger refreshes.
      const stage = copy.closest<HTMLElement>(".hero-stage") ?? track;
      const offsetIn = (el: HTMLElement | null, ancestor: HTMLElement) => {
        let y = 0;
        while (el && el !== ancestor) {
          y += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        return y;
      };
      const lift = () => 118 - offsetIn(copy, stage) - (offsetIn(copy.querySelector("h1"), copy) * SCALE);
      tl.to(fades, { opacity: 0, y: -24, stagger: 0.05, duration: 0.35 }, 0).to(
        copy,
        {
          scale: SCALE,
          y: lift,
          duration: 0.7,
          ease: "power2.inOut",
        },
        0.1,
      );
      gsap.set(copy, { transformOrigin: "0% 0%" });
      return () => tl.kill();
    });
    return () => mm.revert();
  }, []);

  return null;
}
