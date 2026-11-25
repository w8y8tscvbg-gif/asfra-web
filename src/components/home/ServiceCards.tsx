"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { gsap, MOTION_OK } from "@/lib/gsap";
import type { ServiceSlug } from "@/lib/site";

type Card = { slug: ServiceSlug; href: string; name: string; short: string };

export function ServiceCards({ cards, viewLabel }: { cards: Card[]; viewLabel: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".spot"));

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".spot");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener("pointermove", onMove);

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(
        el.children,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 85%", once: true } },
      );
    });
    // Touch screens have no hover: sweep the glow across each card once as it enters.
    mm.add("(hover: none) and (prefers-reduced-motion: no-preference)", () => {
      items.forEach((card) => {
        gsap.fromTo(
          card,
          { "--x": "-20%", "--y": "0%", "--o": 1 },
          {
            "--x": "120%",
            "--y": "100%",
            "--o": 0,
            duration: 1.6,
            ease: "power2.inOut",
            scrollTrigger: { trigger: card, start: "top 80%", once: true },
          },
        );
      });
    });

    return () => {
      el.removeEventListener("pointermove", onMove);
      mm.revert();
    };
  }, []);

  return (
    <ul ref={ref} data-reveal="" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {cards.map((c, i) => {
        const Icon = SERVICE_ICONS[c.slug];
        return (
          <li key={c.slug}>
            <Link
              href={c.href}
              className="spot group flex h-full min-h-48 flex-col justify-between rounded-[22px] bg-deep/40 p-6 backdrop-blur-md transition-colors duration-300 hover:bg-deep/60 sm:min-h-60 sm:p-7"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-royal/15 text-royal-400">
                  <Icon className="size-6" strokeWidth={1.6} aria-hidden />
                </span>
                <span className="font-display text-sm text-white/40">0{i + 1}</span>
              </div>
              <div className="mt-10">
                <h3 className="text-2xl leading-tight">{c.name}</h3>
                <p className="mt-1.5 text-[15px] text-white/65">{c.short}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-royal-400">
                  {viewLabel}
                  <ArrowUpRight className="size-4 transition-transform duration-300 ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
