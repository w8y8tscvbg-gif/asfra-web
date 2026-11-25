"use client";
import { useEffect } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

/**
 * First scroll on the home page: the hero copy lifts away and the services ring opens up and fades,
 * clearing the (pinned) stage for the 3D map, which the engine brings in over the same stretch.
 * Works on [data-hero-text], [data-hero-ring] and .hero-glow inside .hero-track.
 */
export function HeroExit() {
  useEffect(() => {
    const track = document.querySelector<HTMLElement>(".hero-track");
    if (!track) return;
    const text = track.querySelectorAll<HTMLElement>("[data-hero-text]");
    const ring = track.querySelector<HTMLElement>("[data-hero-ring]");
    const glow = track.querySelector<HTMLElement>(".hero-glow");
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const tl = gsap.timeline({
        defaults: { ease: "power1.in" },
        scrollTrigger: { trigger: track, start: "top top", end: () => `+=${window.innerHeight * 0.5}`, scrub: 0.5, invalidateOnRefresh: true },
      });
      tl.to(text, { y: -70, opacity: 0, stagger: 0.04 }, 0);
      if (ring) tl.to(ring, { scale: 1.35, y: -30, opacity: 0 }, 0.05);
      if (glow) tl.to(glow, { opacity: 0 }, 0);
      return () => tl.kill();
    });
    return () => mm.revert();
  }, []);

  return null;
}
