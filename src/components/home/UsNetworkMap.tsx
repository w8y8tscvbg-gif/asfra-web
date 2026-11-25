"use client";
import { useEffect, useId, useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";
import type { StateCode } from "@/lib/site";
import type { UsMapData } from "@/lib/usMap";

type Props = {
  data: UsMapData;
  label: string;
  /** "mount": plays on load (hero). "scroll": plays when scrolled into view. */
  play?: "mount" | "scroll";
  showLabels?: boolean;
  highlight?: StateCode | null;
  className?: string;
};

export function UsNetworkMap({ data, label, play = "scroll", showLabels = false, highlight = null, className }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const gid = useId().replace(/:/g, "");

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const q = gsap.utils.selector(svg);
      const tl = gsap.timeline({
        delay: play === "mount" ? 0.15 : 0,
        scrollTrigger: play === "scroll" ? { trigger: svg, start: "top 80%", once: true } : undefined,
      });
      tl.fromTo(q(".m-base"), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" })
        .fromTo(
          q(".m-state"),
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.09 },
          "-=0.7",
        )
        .fromTo(q(".m-link"), { opacity: 1, drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, ease: "power2.inOut", stagger: 0.09 }, "<0.15")
        .fromTo(
          q(".m-node"),
          { opacity: 0, scale: 0, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.09 },
          "<",
        );
      const labels = q(".m-label");
      if (labels.length) tl.fromTo(labels, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.04 }, "-=0.6");

      const rings = gsap.fromTo(
        q(".m-ring"),
        { scale: 0.6, opacity: 0.8, transformOrigin: "50% 50%" },
        { scale: 2.2, opacity: 0, duration: 2.4, ease: "power2.out", repeat: -1, stagger: { each: 0.35, repeat: -1 }, paused: true },
      );
      tl.add(() => {
        rings.play();
      });
      return () => {
        tl.kill();
        rings.kill();
      };
    });
    return () => mm.revert();
  }, [play]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${data.width} ${data.height}`}
      role="img"
      aria-label={label}
      className={`usmap h-auto w-full ${className ?? ""}`}
      data-animate=""
      data-highlight={highlight ?? undefined}
    >
      <defs>
        <linearGradient id={`lg-${gid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#4d8dff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#005dff" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <path className="m-base" d={data.base} stroke="rgba(14,26,61,.13)" strokeWidth={data.dot} strokeLinecap="round" fill="none" />

      {data.active.map((s) => (
        <path
          key={s.code}
          className="m-state transition-[stroke,opacity] duration-300"
          d={s.d}
          stroke={highlight && highlight !== s.code ? "#9db5e8" : "#005dff"}
          strokeOpacity={highlight === s.code ? 1 : undefined}
          strokeWidth={highlight === s.code ? data.dot + 1.4 : data.dot}
          strokeLinecap="round"
          fill="none"
        />
      ))}

      {data.links.map((d, i) => (
        <path key={i} className="m-link" d={d} stroke={`url(#lg-${gid})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      ))}

      {data.nodes.map((n) => (
        <g key={n.code}>
          <circle className="m-ring" cx={n.x} cy={n.y} r={7} fill="none" stroke="#4d8dff" strokeWidth={1.5} />
          <circle className="m-node" cx={n.x} cy={n.y} r={highlight === n.code ? 7 : 4.5} fill="#005dff" />
          {showLabels && (
            <text
              className="m-label"
              x={n.x}
              y={n.y - 13}
              textAnchor="middle"
              fill="#0e1a3d"
              fontSize={15}
              fontWeight={700}
              style={{ fontFamily: "var(--font-display)", paintOrder: "stroke", stroke: "#ffffff", strokeWidth: 4 }}
            >
              {n.code}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
