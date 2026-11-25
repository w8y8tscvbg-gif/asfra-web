"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { gsap, MOTION_OK } from "@/lib/gsap";
import type { ServiceSlug } from "@/lib/site";

type Item = { slug: ServiceSlug; name: string; href: string };

const SPEED = 0.32; // rad/s of the idle spin
const LABEL_W = 260; // px, max width of a chip's name

/**
 * Hero centrepiece: ASFRA's original logo with the 6 services orbiting it on a tilted 3D ring. The chip
 * nearest the front is solid blue and shows its name; the rest show only their icon, smaller and fainter
 * behind. It spins on its own, faster while scrolling, and can be spun with a finger (horizontal drag);
 * tapping a chip opens that service. Without motion it is a plain list of the same links.
 */
export function ServiceRing({ items, label }: { items: Item[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chips = Array.from(el.querySelectorAll<HTMLElement>(".orb"));
    const labels = chips.map((c) => c.querySelector<HTMLElement>(".orb-name")!);
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      el.classList.add("ring-on");
      let angle = Math.PI / 2 - 0.35; // first service just past the front on load
      let rx = 0;
      let ry = 0;
      const size = () => {
        const w = el.clientWidth;
        rx = Math.min(w / 2 - 30, 300);
        ry = el.clientHeight * 0.33;
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      // Scroll spins it faster; a horizontal drag spins it by hand, with a little inertia.
      let lastY = window.scrollY;
      let boost = 0;
      let drag = false;
      let lastX = 0;
      let moved = 0;
      let fling = 0;
      const down = (e: PointerEvent) => {
        drag = true;
        lastX = e.clientX;
        moved = 0;
        fling = 0;
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        moved += Math.abs(dx);
        const da = (dx / Math.max(1, rx)) * 1.1;
        angle -= da;
        fling = -da;
      };
      const up = () => (drag = false);
      // A drag is not a tap: don't open the service under the finger.
      const click = (e: MouseEvent) => {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      el.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      el.addEventListener("click", click, true);

      gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.4, delay: 0.7, ease: "expo.out" });

      const tick = (_t: number, dtMs: number) => {
        const dt = Math.min(0.05, dtMs / 1000);
        const y = window.scrollY;
        const v = Math.abs(y - lastY) / Math.max(0.001, dt);
        lastY = y;
        if (y > window.innerHeight * 1.5) return; // off screen
        boost = Math.max(boost * 0.94, Math.min(2.5, v / 1000));
        if (!drag) {
          angle += dt * (SPEED + boost) + fling;
          fling *= 0.9;
        }
        let front = 0;
        let best = -2;
        chips.forEach((c, i) => {
          const a = angle + (i / chips.length) * Math.PI * 2;
          const depth = Math.sin(a); // +1 in front (low on screen), -1 behind (high)
          const k = (depth + 1) / 2;
          if (depth > best) {
            best = depth;
            front = i;
          }
          c.style.transform = `translate(-50%, -50%) translate(${Math.cos(a) * rx}px, ${depth * ry}px) scale(${0.6 + k * 0.5})`;
          c.style.opacity = String(0.35 + k * 0.65);
          c.style.zIndex = depth > 0 ? "3" : "1";
          c.style.filter = depth < -0.3 ? `blur(${(-depth - 0.3) * 2.2}px)` : "";
        });
        // Only the chip in front shows its name.
        chips.forEach((c, i) => {
          const on = i === front ? "1" : "0";
          if (c.dataset.front !== on) {
            c.dataset.front = on;
            labels[i].style.maxWidth = on === "1" ? `${LABEL_W}px` : "0px";
          }
        });
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        el.removeEventListener("pointerdown", down);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        el.removeEventListener("click", click, true);
        el.classList.remove("ring-on");
        chips.forEach((c, i) => {
          c.removeAttribute("style");
          labels[i].removeAttribute("style");
        });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className="svc-ring relative mx-auto w-full touch-pan-y select-none">
      <div className="ring-core">
        <div aria-hidden className="ring-halo absolute inset-[-45%] rounded-full bg-[radial-gradient(closest-side,rgba(0,93,255,.28),transparent)] blur-xl" />
        <Logo className="ring-logo relative size-full" sizes="(min-width: 1024px) 176px, 112px" />
      </div>
      <ul aria-label={label} className="ring-list">
        {items.map((it) => {
          const Icon = SERVICE_ICONS[it.slug];
          return (
            <li key={it.slug} className="orb">
              <Link href={it.href} draggable={false} className="orb-chip">
                <span className="orb-icon">
                  <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
                </span>
                <span className="orb-name">{it.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
