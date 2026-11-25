"use client";
import { useEffect, useRef } from "react";
import { gsap, MOTION_OK, ScrollTrigger } from "@/lib/gsap";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * One blue line that runs down the page from the services to the quote form, drawn by the scroll:
 * its tip stays a little below the middle of the screen, lights a dot at each section and finally
 * turns into the quote card ([data-line-end]). Placed inside the relative wrapper it spans.
 */
export function ScrollLine() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const root = svg?.parentElement;
    if (!svg || !root) return;
    const line = svg.querySelector<SVGPathElement>(".sl-line")!;
    const glow = svg.querySelector<SVGPathElement>(".sl-glow")!;
    const head = svg.querySelector<SVGCircleElement>(".sl-head")!;
    const dotsG = svg.querySelector<SVGGElement>(".sl-dots")!;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      let total = 1;
      let straight = 0; // length of the vertical run
      let endY = 1;
      let dots: { y: number; el: SVGCircleElement }[] = [];

      const build = () => {
        const rr = root.getBoundingClientRect();
        const W = rr.width;
        const H = rr.height;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.style.height = `${H}px`;
        const card = document.querySelector<HTMLElement>("[data-line-end]")?.getBoundingClientRect();
        const desktop = W >= 1024;
        const pad = W >= 640 ? 32 : 20;
        const contentLeft = Math.max(pad, (W - 1280) / 2 + pad);
        const x0 = Math.max(7, contentLeft - 28);
        const cardTop = card ? card.top - rr.top : H - 40;
        const ex = card ? card.left - rr.left + (desktop ? 56 : 36) : x0;
        const level = cardTop - (desktop ? 56 : 22);
        const r = desktop ? 40 : 16;
        straight = Math.max(0, level - r);
        endY = cardTop;
        const d = [
          `M ${x0} 0`,
          `V ${straight}`,
          `Q ${x0} ${level} ${x0 + r} ${level}`,
          `H ${ex - r}`,
          `Q ${ex} ${level} ${ex} ${level + r}`,
          `V ${cardTop}`,
        ].join(" ");
        line.setAttribute("d", d);
        glow.setAttribute("d", d);
        total = line.getTotalLength();
        line.style.strokeDasharray = glow.style.strokeDasharray = `${total}`;

        dotsG.replaceChildren();
        dots = [];
        const ys = Array.from(root.querySelectorAll<HTMLElement>("[data-cue]")).map((el) => {
          const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
          return box.getBoundingClientRect().top - rr.top;
        });
        for (const y of ys) {
          if (y > straight) continue;
          const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          c.setAttribute("cx", String(x0));
          c.setAttribute("cy", String(Math.max(6, y)));
          c.setAttribute("r", "4");
          c.setAttribute("class", "sl-dot");
          dotsG.appendChild(c);
          dots.push({ y: Math.max(6, y), el: c });
        }
      };

      const update = () => {
        const rr = root.getBoundingClientRect();
        const tip = window.innerHeight * 0.62 - rr.top; // where the tip should be, in wrapper coordinates
        // Vertical run follows the tip 1:1, the turn into the card is drawn over the last stretch.
        const len =
          tip <= straight ? tip : straight + ((tip - straight) * (total - straight)) / Math.max(1, endY - straight);
        const l = clamp(len, 0, total);
        line.style.strokeDashoffset = glow.style.strokeDashoffset = `${total - l}`;
        const p = line.getPointAtLength(l);
        head.setAttribute("cx", String(p.x));
        head.setAttribute("cy", String(p.y));
        head.style.opacity = l > 0 && l < total ? "1" : "0";
        for (const dot of dots) dot.el.dataset.on = tip >= dot.y ? "1" : "0";
        svg.dataset.done = l >= total ? "1" : "0";
      };

      build();
      update();
      const st = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        refreshPriority: -1, // measure after the pinned sections above have added their scroll length
        onUpdate: update,
        onRefresh: () => {
          build();
          update();
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className="scroll-line pointer-events-none absolute left-0 top-0 z-[1] w-full overflow-visible motion-reduce:hidden"
      preserveAspectRatio="none"
    >
      <path className="sl-glow" fill="none" stroke="#4d8dff" strokeWidth="7" strokeOpacity="0.22" strokeLinecap="round" />
      <path className="sl-line" fill="none" stroke="#4d8dff" strokeWidth="1.6" strokeLinecap="round" />
      <g className="sl-dots" />
      <circle className="sl-head" r="4.5" fill="#fff" />
    </svg>
  );
}
