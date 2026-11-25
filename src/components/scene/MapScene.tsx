"use client";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { Map3DData } from "@/lib/usMap";

/**
 * Fixed full-screen canvas behind the home page. Loads the 3D engine after the page is interactive.
 * If WebGL is missing, the user prefers reduced motion, or the device can't keep up, it removes itself
 * and the flat SVG maps (.map-fallback) stay visible.
 */
export function MapScene({ data }: { data: Map3DData }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

    let cancelled = false;
    let engine: import("./MapEngine").MapEngine | null = null;
    const html = document.documentElement;

    const fail = () => {
      engine?.dispose();
      engine = null;
      html.classList.remove("has-3d");
      if (ref.current) ref.current.style.display = "none";
    };

    const remeasure = () => engine?.measureAnchors();

    import("./MapEngine")
      .then(({ MapEngine }) => {
        if (cancelled || !ref.current) return;
        try {
          engine = new MapEngine(ref.current, data, fail);
          html.classList.add("has-3d");
          if (process.env.NODE_ENV !== "production") (window as unknown as { __asfraMap?: unknown }).__asfraMap = engine;
          ScrollTrigger.addEventListener("refresh", remeasure);
          requestAnimationFrame(() => ScrollTrigger.refresh());
        } catch {
          fail();
        }
      })
      .catch(fail);

    return () => {
      cancelled = true;
      ScrollTrigger.removeEventListener("refresh", remeasure);
      engine?.dispose();
      engine = null;
      html.classList.remove("has-3d");
    };
  }, [data]);

  return <canvas ref={ref} aria-hidden="true" className="scene-canvas pointer-events-none fixed inset-0 z-0 h-lvh w-screen" />;
}
