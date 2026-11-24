"use client";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  (window as Window & { __motionReady?: boolean }).__motionReady = true;
}

export const EASE = "expo.out";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { DrawSVGPlugin, gsap, ScrollTrigger, SplitText };
