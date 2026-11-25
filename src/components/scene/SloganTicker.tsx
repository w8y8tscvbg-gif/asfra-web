"use client";
import { useEffect, useState } from "react";

/**
 * Next to the slogan: the service name rolls to the next one as the hero scrolls.
 * Decorative (the services are listed right below), only shown while the 3D map runs.
 */
export function SloganTicker({ items }: { items: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const on = (ev: Event) => {
      const e = (ev as CustomEvent<{ e: number }>).detail.e;
      setI(Math.min(items.length - 1, Math.floor(Math.min(1, e * 1.08) * items.length)));
    };
    window.addEventListener("asfra:energy", on);
    return () => window.removeEventListener("asfra:energy", on);
  }, [items.length]);

  return (
    <span aria-hidden="true" className="needs-3d items-center gap-3">
      <span className="h-3 w-px bg-white/25" />
      <span className="relative inline-block h-[1.4em] overflow-hidden text-white">
        <span className="flex flex-col transition-transform duration-500 ease-brand" style={{ transform: `translateY(${-i * 1.4}em)` }}>
          {items.map((it) => (
            <span key={it} className="block h-[1.4em] whitespace-nowrap leading-[1.4em]">
              {it}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
