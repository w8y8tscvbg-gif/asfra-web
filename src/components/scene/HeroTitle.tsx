"use client";
import { Fragment, useEffect, useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

const ROTATE_EVERY = 2600; // ms

function Chars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span key={i} className="hc inline-block will-change-transform">
          {c}
        </span>
      ))}
    </>
  );
}

/**
 * Hero headline. On load its letters drop in and bounce into place; the last word keeps changing
 * (negocio / agencia / familia / auto) with a light sweeping across it, and with a mouse the whole
 * title tilts in 3D toward it. Screen readers get the plain title.
 */
export function HeroTitle({ full, lead, words, className }: { full: string; lead: string; words: string[]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const leadWords = lead.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const visual = el.querySelector<HTMLElement>(".ht-visual")!;
    const rot = Array.from(el.querySelectorAll<HTMLElement>(".hrot-w"));

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set(el, { opacity: 1 });
      // Letters fall from above and bounce into place.
      const chars = [...el.querySelectorAll(".hw .hc"), ...rot[0].querySelectorAll(".hc")];
      gsap.from(chars, {
        y: () => -gsap.utils.random(70, 140),
        rotation: () => gsap.utils.random(-28, 28),
        opacity: 0,
        duration: 1.15,
        ease: "bounce.out",
        stagger: 0.028,
        delay: 0.25,
      });

      // The last word flips to the next one every few seconds.
      let cur = 0;
      const timer = window.setInterval(() => {
        if (document.hidden || rot.length < 2) return;
        const next = (cur + 1) % rot.length;
        gsap.to(rot[cur].querySelectorAll(".hc"), {
          yPercent: -100,
          rotationX: 90,
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
          stagger: 0.03,
        });
        gsap.fromTo(
          rot[next].querySelectorAll(".hc"),
          { yPercent: 100, rotationX: -90, opacity: 0 },
          { yPercent: 0, rotationX: 0, opacity: 1, duration: 0.7, ease: "back.out(2)", stagger: 0.035, delay: 0.25 },
        );
        cur = next;
      }, ROTATE_EVERY);

      // 3D tilt toward the mouse (fine pointers only).
      let off = () => {};
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.set(visual, { transformPerspective: 900, transformOrigin: "40% 50%" });
        const rx = gsap.quickTo(visual, "rotationX", { duration: 0.9, ease: "power3.out" });
        const ry = gsap.quickTo(visual, "rotationY", { duration: 0.9, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          ry(((e.clientX / window.innerWidth) * 2 - 1) * 9);
          rx(-((e.clientY / window.innerHeight) * 2 - 1) * 7);
        };
        window.addEventListener("pointermove", move, { passive: true });
        off = () => window.removeEventListener("pointermove", move);
      }

      return () => {
        window.clearInterval(timer);
        off();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <h1 ref={ref} className={className} data-reveal="">
      <span className="sr-only">{full}</span>
      <span aria-hidden="true" className="ht-visual inline-block">
        {leadWords.map((w, i) => (
          <Fragment key={i}>
            <span className="hw inline-block whitespace-nowrap">
              <Chars text={w} />
            </span>{" "}
          </Fragment>
        ))}
        <span className="hrot relative grid justify-items-center whitespace-nowrap text-royal [perspective:600px] lg:inline-grid lg:justify-items-start">
          {words.map((w) => (
            <span key={w} className="hrot-w col-start-1 row-start-1">
              <Chars text={w} />
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}
