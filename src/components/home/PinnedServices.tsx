"use client";
import { useEffect, useRef } from "react";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { container } from "@/components/ui/styles";
import { fmt } from "@/lib/fmt";
import { gsap, MOTION_OK } from "@/lib/gsap";
import type { ServiceSlug } from "@/lib/site";

type Item = { slug: ServiceSlug; name: string; pinned: string };

export function PinnedServices({ items, eyebrow, progress }: { items: Item[]; eyebrow: string; progress: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const q = gsap.utils.selector(el);
      const phrases = q(".p-phrase");
      const icons = q(".p-icon");
      const marks = q(".p-mark");
      const counter = q(".p-count")[0] as HTMLElement | undefined;
      const n = items.length;

      gsap.set(phrases, { yPercent: 60, opacity: 0 });
      gsap.set(phrases[0], { yPercent: 0, opacity: 1 });
      gsap.set(icons, { opacity: 0 });
      gsap.set(icons[0], { opacity: 1 });
      gsap.set(marks, { width: 8, backgroundColor: "rgba(255,255,255,.45)" });
      gsap.set(marks[0], { width: 36, backgroundColor: "#fff" });

      const drawIcon = (i: number) =>
        gsap.fromTo(
          (icons[i] as Element).querySelectorAll("path,circle,rect,line,polyline,ellipse"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.6, ease: "power2.inOut", stagger: 0.05 },
        );

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 0.5 },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * (n - 1) * 0.75}`,
          pin: true,
          scrub: 0.8,
          snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut", delay: 0.05 },
          invalidateOnRefresh: true,
          onUpdate(self) {
            if (counter) counter.textContent = fmt(progress, { n: Math.min(n, Math.round(self.progress * (n - 1)) + 1) });
          },
        },
      });

      // First icon draws itself as the section arrives, before the scrubbed sequence starts.
      gsap.fromTo(
        (icons[0] as Element).querySelectorAll("path,circle,rect,line,polyline,ellipse"),
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1.2, ease: "power2.inOut", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 60%", once: true } },
      );
      for (let i = 1; i < n; i++) {
        const at = i;
        tl.to(phrases[i - 1], { yPercent: -60, opacity: 0 }, at)
          .fromTo(phrases[i], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1 }, at)
          .to(icons[i - 1], { opacity: 0, scale: 0.9, duration: 0.3 }, at)
          .set(icons[i], { opacity: 1, scale: 1 }, at + 0.1)
          .add(drawIcon(i), at + 0.1)
          .to(marks[i - 1], { width: 8, backgroundColor: "rgba(255,255,255,.45)" }, at)
          .to(marks[i], { width: 36, backgroundColor: "#fff" }, at);
      }
      tl.to({}, { duration: 0.3 });

      return () => tl.kill();
    });
    return () => mm.revert();
  }, [items.length, progress]);

  return (
    <section ref={root} aria-label={eyebrow} data-cue="pinned" className="relative motion-reduce:py-20">
      {/* Animated, pinned stage */}
      <div className="flex h-[100svh] flex-col justify-center gap-3 py-24 motion-reduce:hidden sm:gap-4">
        <div className={`${container} flex h-full max-h-[760px] flex-col gap-3 sm:gap-4`}>
          <div className="crosshair relative flex flex-[1.35] flex-col items-center justify-between overflow-hidden rounded-[28px] bg-royal px-6 py-8 text-center sm:py-10">
            <span className="ch tl" />
            <span className="ch tr" />
            <span className="ch bl" />
            <span className="ch br" />
            <p className="font-display text-[12px] font-medium uppercase tracking-[0.18em] text-white/85">{eyebrow}</p>
            <div className="relative my-5 grid w-full flex-1 place-items-center">
              {items.map((it, i) => (
                <p
                  key={it.slug}
                  className="p-phrase col-start-1 row-start-1 mx-auto max-w-3xl font-display text-[1.85rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
                  aria-hidden={i !== 0}
                >
                  {it.pinned}
                </p>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-2" aria-hidden>
                {items.map((it) => (
                  <span key={it.slug} className="p-mark block h-[5px] w-2 rounded-full bg-white/45" />
                ))}
              </div>
              <span className="p-count text-[12px] text-white/75" aria-live="off">
                {fmt(progress, { n: 1 })}
              </span>
            </div>
          </div>

          <div className="relative grid flex-1 place-items-center overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#101d48,#0b1535)]">
            {items.map((it) => {
              const Icon = SERVICE_ICONS[it.slug];
              return (
                <div key={it.slug} className="p-icon col-start-1 row-start-1 flex flex-col items-center gap-3 text-royal-400">
                  <Icon className="size-20 sm:size-28" strokeWidth={1.1} aria-hidden />
                  <span className="font-display text-sm font-medium uppercase tracking-[0.16em] text-white/70">{it.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reduced motion: plain list */}
      <div className={`${container} hidden motion-reduce:block`}>
        <p className="eyebrow">{eyebrow}</p>
        <ul className="mt-6 grid gap-3">
          {items.map((it) => {
            const Icon = SERVICE_ICONS[it.slug];
            return (
              <li key={it.slug} className="flex items-center gap-4 rounded-2xl bg-royal px-5 py-5 font-display text-xl font-bold">
                <Icon className="size-7 shrink-0" aria-hidden />
                {it.pinned}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
